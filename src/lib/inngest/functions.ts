import { inngest } from "./client";
import { supabase } from "@/lib/supabase";

// 1. Leadopvolging Pipeline
// Geen gehoor -> Wacht 3 uur -> Verplaats naar 'Vandaag-Middag'
export const processLeadNoAnswer = inngest.createFunction(
  { id: "process-lead-no-answer", triggers: [{ event: "pipeline/lead.no_answer" }] },
  async ({ event, step }) => {
    const { patientId, taskId } = event.data;

    // Wait for 3 hours (we use minutes here for demo/testing purposes, e.g. '3h')
    await step.sleep("wait-3-hours", "3h");

    // Update the task status in Supabase
    await step.run("update-task-status", async () => {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "Vandaag-Middag" })
        .eq("id", taskId);
        
      if (error) throw new Error(error.message);
      return { success: true };
    });

    // We could also send a WhatsApp message here via API
  }
);

// 2. No-shows & Zieken Pipeline
// Ziek/No-show gemeld -> Wacht 7 dagen -> Plan nieuwe opvolgtaak in
export const processNoShow = inngest.createFunction(
  { id: "process-no-show", triggers: [{ event: "pipeline/noshow.reported" }] },
  async ({ event, step }) => {
    const { patientId } = event.data;

    await step.sleep("wait-7-days", "7d");

    await step.run("create-followup-task", async () => {
      const { error } = await supabase.from("tasks").insert({
        patient_id: patientId,
        title: "Opvolging No-show (7 dagen later)",
        status: "Vandaag",
        // pipeline_id will be mapped correctly in reality
      });

      if (error) throw new Error(error.message);
      return { success: true };
    });
  }
);

// 3. Nazorg (Uitbehandeld)
// Patiënt uitbehandeld -> Wacht 3 maanden -> Taak aanmaken
export const processAftercare = inngest.createFunction(
  { id: "process-aftercare", triggers: [{ event: "pipeline/aftercare.started" }] },
  async ({ event, step }) => {
    const { patientId } = event.data;

    // Wacht 3 maanden
    await step.sleep("wait-3-months", "90d");

    await step.run("create-3-month-check", async () => {
      const { error } = await supabase.from("tasks").insert({
        patient_id: patientId,
        title: "3 Maanden check (Nazorg)",
        status: "Vandaag",
      });
      if (error) throw new Error(error.message);
      return { success: true };
    });

    // Wacht nog eens 9 maanden (totaal 12 maanden)
    await step.sleep("wait-9-months-more", "275d");

    await step.run("create-12-month-check", async () => {
      const { error } = await supabase.from("tasks").insert({
        patient_id: patientId,
        title: "12 Maanden check (Nazorg)",
        status: "Vandaag",
      });
      if (error) throw new Error(error.message);
      return { success: true };
    });
  }
);
