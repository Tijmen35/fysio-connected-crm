"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { WORKFLOWS, calculateNextScheduledDate } from "@/lib/workflows";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";

export async function advanceWorkflow(taskId: string, outcome: string, scheduleDate?: string) { require("fs").appendFileSync("advance_log.txt", "\n--- START advanceWorkflow --- \nTaskID: " + taskId + " \nOutcome: " + outcome + "\n");
  const supabase = await createClient();

  // Get the existing task
  const { data: existingTask } = await supabase
    .from("tasks")
    .select("*, pipeline:pipelines(name), patient:patients(full_name, phone)")
    .eq("id", taskId)
    .single();

  if (!existingTask) return { success: false, error: "Task not found" };

  require("fs").appendFileSync("advance_log.txt", "\npipelineName: " + (existingTask.pipeline?.name || "MISSING") + " | Step: " + currentStepIndex + "\n"); const pipelineName = existingTask.pipeline?.name;
  const currentStepIndex = existingTask.step_index || 1; // 1-based in DB

  // Mark current task as done
  await supabase
    .from("tasks")
    .update({ 
      status: "closed"
    })
    .eq("id", taskId);

  if (!pipelineName || !WORKFLOWS[pipelineName]) {
    // If no workflow definition exists for this pipeline, just complete the task
    revalidatePath("/");
    return { success: true };
  }

  const flow = WORKFLOWS[pipelineName];

  if (outcome === "afspraak") {
    // Afspraak gemaakt -> Deal Gewonnen. Stop flow.
    // We could update a patient status field here, but for now we just stop scheduling next steps.
  } else if (outcome === "afwijzing" || outcome === "geen_interesse") {
    // Geen interesse -> Deal Verloren. Stop flow.
  } else if ((outcome === "terugbellen" || outcome === "ander_moment") && scheduleDate) {
    // Reschedule the CURRENT step for another moment, outside the standard trajectory
    const dateObj = new Date(scheduleDate);
    const timeString = dateObj.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    
    await supabase.from("tasks").insert({
      patient_id: existingTask.patient_id,
      pipeline_id: existingTask.pipeline_id, // Keep in pipeline to show in timeline
      title: "Terugbellen",
      description: `Bellen om ${timeString}`,
      status: "later", // UI will use scheduled_for
      scheduled_for: dateObj.toISOString(),
      step_index: null
    });
  } else if (outcome === "niet_opgenomen" || outcome === "kaartje_verstuurd" || outcome === "afgerond") {
    // Advance to next step in the flow
    
    // Check if we need to send a WhatsApp template for THIS step
    // Templates use 1-based step_index, matching the task's step_index
    const { data: stepTemplate } = await supabase
      .from("templates")
      .select("whatsapp_template, email_template, variable_mapping")
      .eq("pipeline_name", pipelineName)
      .eq("step_index", currentStepIndex)
      .eq("action_type", outcome)
      .single();

    require("fs").appendFileSync("advance_log.txt", "\nstepTemplate: " + JSON.stringify(stepTemplate) + "\nPhone: " + existingTask.patient?.phone + "\n"); if (stepTemplate?.whatsapp_template if (stepTemplate?.whatsapp_template && existingTask.patient?.phone)if (stepTemplate?.whatsapp_template && existingTask.patient?.phone) existingTask.patient?.phone) {
      require("fs").appendFileSync("error_log.txt", "\n[task.ts] Sending WhatsApp: " + stepTemplate.whatsapp_template + "\n"); console.log("[task.ts] Sending WhatsApp:", stepTemplate.whatsapp_template, "to", existingTask.patient.phone);
      const res = await sendWhatsAppTemplate(existingTask.patient.phone, stepTemplate.whatsapp_template, existingTask.patient, stepTemplate.variable_mapping || {});
      console.log("[task.ts] WhatsApp result:", res);
    } else {
      console.log("[task.ts] Skipping WhatsApp. stepTemplate:", stepTemplate, "phone:", existingTask.patient?.phone);
    }

    // flow array is 0-based. If currentStepIndex is 1, the next step is at index 1.
    if (currentStepIndex < flow.length) {
      const nextStep = flow[currentStepIndex];
      const scheduledDate = calculateNextScheduledDate(nextStep.delayHours);
      
      await supabase.from("tasks").insert({
        patient_id: existingTask.patient_id,
        pipeline_id: existingTask.pipeline_id,
        title: nextStep.title,
        status: "open", // Fallback for Kanban, will be filtered dynamically by scheduled_for
        scheduled_for: scheduledDate.toISOString(),
        step_index: currentStepIndex + 1
      });
    } else {
      // Flow has reached the end and they didn't pick up
      // e.g. "Systeem sluit de deal direct automatisch af als 'Verloren – Geen reactie na 14 dagen'"
      // This is handled automatically by simply not scheduling a new task.
    }
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateTaskDescription(taskId: string, description: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ description })
    .eq("id", taskId);
    
  if (error) {
    console.error("Failed to update description", error);
    return { success: false };
  }
  revalidatePath("/");
  return { success: true };
}
