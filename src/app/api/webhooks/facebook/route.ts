import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Meta Webhook Verification
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }
  return new NextResponse("Bad Request", { status: 400 });
}

export async function POST(request: Request) {
  try {
    const rawText = await request.text();
    let body: any = {};
    try {
      body = JSON.parse(rawText);
    } catch (e) {
      console.error("Invalid JSON from Meta Webhook");
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (body.object === "page") {
      // Iterate over each entry
      for (const entry of body.entry || []) {
        // Iterate over each change
        for (const change of entry.changes || []) {
          if (change.field === "leadgen") {
            const formId = change.value.form_id;
            const leadgenId = change.value.leadgen_id;

            // 1. Fetch webhook config for this form_id
            const { data: config, error: configError } = await supabaseAdmin
              .from("webhook_configs")
              .select("*")
              .eq("provider", "facebook")
              .eq("name", formId) // name is used as form_id
              .eq("is_active", true)
              .single();

            if (configError || !config) {
              console.log("No active webhook config found for Form ID:", formId);
              continue; // Skip this lead, not mapped
            }

            // 2. Fetch actual lead data from Graph API
            const ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;
            if (!ACCESS_TOKEN) {
              console.error("META_PAGE_ACCESS_TOKEN is not configured.");
              continue;
            }

            const graphRes = await fetch(`https://graph.facebook.com/v19.0/${leadgenId}?access_token=${ACCESS_TOKEN}`);
            if (!graphRes.ok) {
              const err = await graphRes.text();
              console.error("Error fetching lead from Graph API:", err);
              continue;
            }

            const leadData = await graphRes.json();
            
            // Convert Meta's field_data array into a flat dictionary
            const flatData: Record<string, string> = {};
            for (const field of leadData.field_data || []) {
              if (field.values && field.values.length > 0) {
                flatData[field.name.toLowerCase()] = field.values[0];
              }
            }

            // 3. Map fields based on configuration
            const mapping = config.field_mapping || {};
            const extractField = (crmField: string) => {
              const fbFieldName = mapping[crmField];
              if (!fbFieldName) return null;
              return flatData[fbFieldName.toLowerCase()] || null;
            };

            const patientData = {
              full_name: extractField("full_name") || "Onbekende Facebook Lead",
              phone: extractField("phone") || "0000000000",
              email: extractField("email"),
              location: mapping._static_location || extractField("location"),
              primary_complaint: extractField("primary_complaint"),
              source: `Facebook Lead Ads (Form: ${formId})`
            };

            // 4. Upsert patient
            let patientId;
            let existingQuery = supabaseAdmin.from("patients").select("id");
            if (patientData.email && patientData.phone && patientData.phone !== "0000000000") {
              existingQuery = existingQuery.or(`email.eq."${patientData.email}",phone.eq."${patientData.phone}"`);
            } else if (patientData.email) {
              existingQuery = existingQuery.eq("email", patientData.email);
            } else if (patientData.phone && patientData.phone !== "0000000000") {
              existingQuery = existingQuery.eq("phone", patientData.phone);
            } else {
              existingQuery = existingQuery.eq("id", "00000000-0000-0000-0000-000000000000");
            }

            const { data: existingPatients } = await existingQuery;

            if (existingPatients && existingPatients.length > 0) {
              patientId = existingPatients[0].id;
              await supabaseAdmin.from("patients").update(patientData).eq("id", patientId);
            } else {
              const { data: newPatient, error: insertError } = await supabaseAdmin
                .from("patients")
                .insert(patientData)
                .select("id")
                .single();
                
              if (insertError) {
                console.error("Error creating patient:", insertError);
                continue;
              }
              patientId = newPatient.id;
            }

            // 5. Create first task
            if (config.pipeline_id) {
              const { error: taskError } = await supabaseAdmin.from("tasks").insert({
                patient_id: patientId,
                pipeline_id: config.pipeline_id,
                title: "Nieuwe Facebook lead opvolgen",
                status: "belvoorraad"
              });
              if (taskError) console.error("Error creating task:", taskError);
            }
          }
        }
      }
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Not a page event" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
