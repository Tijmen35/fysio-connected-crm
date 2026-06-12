import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// We use the service role key to bypass RLS in the webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: configId } = await params;
    
    // Read raw text first to avoid JSON parse errors
    const rawText = await request.text();
    
    let body: any = {};
    try {
      body = JSON.parse(rawText);
    } catch (e) {
      // If it's not JSON, maybe it's URL encoded
      const urlParams = new URLSearchParams(rawText);
      body = Object.fromEntries(urlParams.entries());
    }

    // DEBUG LOGGING
    await supabaseAdmin.from("patients").insert({
      full_name: "WEBHOOK RAW LOG",
      phone: "0000000000",
      email: "log@webhook.com",
      source: rawText.substring(0, 255) // Save raw text to see exactly what we got
    });

    // 1. Fetch webhook config
    const { data: config, error: configError } = await supabaseAdmin
      .from("webhook_configs")
      .select("*")
      .eq("id", configId)
      .eq("is_active", true)
      .single();

    if (configError || !config) {
      console.error("Webhook config not found or inactive:", configId);
      return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
    }

    // 2. Map fields based on configuration
    const mapping = config.field_mapping || {};
    
    // Lowercase all keys in body and body.data for case-insensitive matching
    const lowerBody: Record<string, any> = {};
    if (body) {
      for (const [k, v] of Object.entries(body)) {
        lowerBody[k.toLowerCase()] = v;
      }
      if (body.data && typeof body.data === 'object') {
        for (const [k, v] of Object.entries(body.data)) {
          lowerBody[k.toLowerCase()] = v;
        }
      }
    }

    const extractField = (crmField: string) => {
      const webflowFieldName = mapping[crmField];
      if (!webflowFieldName) return null;
      return lowerBody[webflowFieldName.toLowerCase()] || null;
    };

    const patientData = {
      full_name: extractField("full_name") || "Onbekende Lead",
      phone: extractField("phone") || "0000000000", // Fallback required for NOT NULL constraint
      email: extractField("email"),
      location: mapping._static_location || extractField("location"),
      primary_complaint: extractField("primary_complaint"),
      source: `Webflow formulier (${config.name})`
    };

    // 3. Upsert or insert patient
    let patientId;
    
    // Simple check: see if a patient with this email or phone exists
    let existingQuery = supabaseAdmin.from("patients").select("id");
    if (patientData.email && patientData.phone) {
      existingQuery = existingQuery.or(`email.eq."${patientData.email}",phone.eq."${patientData.phone}"`);
    } else if (patientData.email) {
      existingQuery = existingQuery.eq("email", patientData.email);
    } else if (patientData.phone) {
      existingQuery = existingQuery.eq("phone", patientData.phone);
    } else {
      // If we have neither email nor phone, we can't accurately match. We'll just create a new one.
      existingQuery = existingQuery.eq("id", "00000000-0000-0000-0000-000000000000"); // matches nothing
    }

    const { data: existingPatients } = await existingQuery;

    if (existingPatients && existingPatients.length > 0) {
      // Update existing patient
      patientId = existingPatients[0].id;
      await supabaseAdmin.from("patients").update(patientData).eq("id", patientId);
    } else {
      // Insert new patient
      const { data: newPatient, error: insertError } = await supabaseAdmin
        .from("patients")
        .insert(patientData)
        .select("id")
        .single();
        
      if (insertError) {
        console.error("Error creating patient:", insertError);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
      patientId = newPatient.id;
    }

    // 4. Create first task in the correct pipeline
    if (config.pipeline_id) {
      const { error: taskError } = await supabaseAdmin.from("tasks").insert({
        patient_id: patientId,
        pipeline_id: config.pipeline_id,
        title: "Nieuwe lead opvolgen",
        status: "belvoorraad" // So it appears correctly in kanban
      });
      if (taskError) {
        console.error("Error creating task:", taskError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
