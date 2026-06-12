"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { formatDutchPhoneNumber } from "@/utils/format";

export async function importBellijst(csvText: string, listTag: string, belscript?: string) {
  const supabase = await createClient();

  // Simple CSV parser
  const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return { error: "Bestand is leeg" };

  const contactsToInsert = [];
  
  let startIndex = 0;
  if (lines[0].toLowerCase().includes("naam") || lines[0].toLowerCase().includes("name")) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const parts = lines[i].split(/[;,]/).map(p => p.trim());
    const name = parts[0] || `Lead ${i}`;
    const rawPhone = parts[1] || "";
    const email = parts[2] || "";
    const location = parts[3] || "";

    if (!name) continue;

    contactsToInsert.push({
      full_name: name,
      phone: formatDutchPhoneNumber(rawPhone),
      email,
      location,
      created_at: new Date().toISOString()
    });
  }

  if (contactsToInsert.length === 0) return { error: "Geen geldige contacten gevonden in bestand" };

  // Create a new Pipeline to represent this list if it has a script, or just to group them
  let pipelineId = null;
  if (listTag) {
    const { data: pipeline, error: plError } = await supabase
      .from("pipelines")
      .insert({
        name: listTag,
        description: belscript || "Belvoorraad Lijst"
      })
      .select("id")
      .single();
    
    if (pipeline) {
      pipelineId = pipeline.id;
    }
  }

  // Deduplicate and insert
  const patientIds: string[] = [];
  
  for (const contact of contactsToInsert) {
    const { data: existing } = await supabase
      .from("patients")
      .select("id")
      .or(`phone.eq."${contact.phone}"${contact.email ? `,email.eq."${contact.email}"` : ""}`);
      
    if (existing && existing.length > 0) {
      patientIds.push(existing[0].id);
      await supabase.from("patients").update(contact).eq("id", existing[0].id);
    } else {
      const { data: newPatient } = await supabase
        .from("patients")
        .insert(contact)
        .select("id")
        .single();
      if (newPatient) patientIds.push(newPatient.id);
    }
  }

  // Insert belvoorraad tasks for each patient
  const tasksToInsert = patientIds.map(id => ({
    patient_id: id,
    pipeline_id: pipelineId,
    title: listTag ? `Lijst: ${listTag}` : "Koude acquisitie bellen",
    status: "belvoorraad",
    created_at: new Date().toISOString()
  }));

  if (tasksToInsert.length > 0) {
    const { error: tasksError } = await supabase
      .from("tasks")
      .insert(tasksToInsert);

    if (tasksError) return { error: "Fout bij opslaan taken: " + tasksError.message };
  }

  revalidatePath("/bellijsten");
  revalidatePath("/");
  
  return { success: true, count: patientIds.length };
}

export async function updatePipelineScript(pipelineId: string, description: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("pipelines")
    .update({ description })
    .eq("id", pipelineId);

  if (error) {
    console.error("Fout bij updaten belscript:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/bellijsten");
  revalidatePath("/");
  
  return { success: true };
}
