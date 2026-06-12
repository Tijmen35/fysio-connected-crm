"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { formatDutchPhoneNumber } from "@/utils/format";

export async function createPatient(formData: FormData) {
  const supabase = await createClient();

  const rawPhone = formData.get("phone") as string;
  const newPatient = {
    full_name: formData.get("name") as string,
    phone: formatDutchPhoneNumber(rawPhone),
    email: formData.get("email") as string,
    location: formData.get("location") as string,
    primary_complaint: formData.get("klacht") as string,
  };
  const pipelineKey = formData.get("pipeline_radio") as string;

  const { data: existingPatients, error: searchError } = await supabase
    .from("patients")
    .select("id")
    .or(`phone.eq."${newPatient.phone}"${newPatient.email ? `,email.eq."${newPatient.email}"` : ""}`);

  let patientId = "";

  if (existingPatients && existingPatients.length > 0) {
    patientId = existingPatients[0].id;
    // Optionally update the existing patient with new data
    await supabase.from("patients").update(newPatient).eq("id", patientId);
  } else {
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .insert(newPatient)
      .select()
      .single();

    if (patientError || !patient) {
      console.error("Error creating patient:", patientError);
      return { error: "Failed to create patient: " + (patientError?.message || "Unknown error") };
    }
    patientId = patient.id;
  }

  // Determine action title
  let actionTitle = "";
  let pipelineName = "";
  if (pipelineKey === "leadopvolging") { actionTitle = "Belpoging 1 (Nieuw)"; pipelineName = "Leadopvolging"; }
  if (pipelineKey === "noshows") { actionTitle = "Nieuwe afspraak inplannen"; pipelineName = "No-shows & Zieken"; }
  if (pipelineKey === "nazorg") { actionTitle = "Welkomstmail nazorg"; pipelineName = "Nazorg (Uitbehandeld)"; }
  if (pipelineKey === "fysiofit") { actionTitle = "Doelcheck + FysioFit aanbieden"; pipelineName = "FysioFit Conversie"; }

  // Get pipeline ID bypassing any potential RLS issues
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const adminAuthClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: pipeline, error: pipelineError } = await adminAuthClient
    .from("pipelines")
    .select("id")
    .eq("name", pipelineName)
    .single();

  if (pipelineError) {
    console.error("Pipeline fetch error:", pipelineError);
  }

  const { error: taskError } = await adminAuthClient.from("tasks").insert({
    patient_id: patientId,
    pipeline_id: pipeline?.id || null,
    status: "vandaag",
    title: actionTitle,
    step_index: 1,
  });

  if (taskError) {
    console.error("Error creating task:", taskError);
  }

  if (pipeline?.id) {
    await adminAuthClient.from("patients").update({
      active_pipeline_id: pipeline.id,
      pipeline_stage: "Nieuwe lead"
    }).eq("id", patientId);
  }

  revalidatePath("/");
  return { success: true, patientId };
}

export async function getPatientDetails(patientId: string) {
  console.log("getPatientDetails called with:", patientId);
  if (!patientId) return { error: "No patientId provided" };

  const supabase = await createClient();
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .single();

  if (patientError) {
    console.error("Error fetching patient:", patientError);
    return { error: patientError.message };
  }

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*, pipeline:pipelines(name)")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError);
    return { error: tasksError.message };
  }

  return { patient, tasks };
}

export async function updatePatient(patientId: string, formData: FormData) {
  const supabase = await createClient();
  const rawPhone = formData.get("phone") as string;
  const updates = {
    full_name: formData.get("name") as string,
    phone: formatDutchPhoneNumber(rawPhone),
    email: formData.get("email") as string,
    location: formData.get("location") as string,
    primary_complaint: formData.get("klacht") as string,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("patients").update(updates).eq("id", patientId);

  if (error) {
    console.error("Error updating patient:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function deletePatient(patientId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("patients").delete().eq("id", patientId);
  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}
