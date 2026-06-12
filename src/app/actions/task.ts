"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { WORKFLOWS, calculateNextScheduledDate } from "@/lib/workflows";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";

import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function advanceWorkflow(taskId: string, outcome: string, scheduleDate?: string, notes?: string, lostReason?: string) {

  const adminAuthClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const supabase = adminAuthClient;

  // Get the existing task
  const { data: existingTask, error: taskErr } = await supabase
    .from("tasks")
    .select("*, patient:patients(*), pipeline:pipelines(name)")
    .eq("id", taskId)
    .single();

  if (taskErr || !existingTask) {
    return { success: false, error: "Task not found" };
  }

  const pipelineName = existingTask.pipeline?.name;
  const currentStepIndex = existingTask.step_index || 1; // 1-based in DB


  // Mark current task as done
  await supabase
    .from("tasks")
    .update({ status: "closed" })
    .eq("id", taskId);

  // Update patient pipeline_stage, notes, lost_reason
  let pipelineStage = "In contact";
  if (outcome === "afspraak") pipelineStage = "Gewonnen";
  if (outcome === "afwijzing" || outcome === "geen_interesse") pipelineStage = "Verloren";
  
  const isContactOutcome = ["afspraak", "afwijzing", "geen_interesse", "terugbellen", "ander_moment"].includes(outcome);

  const updateData: any = {};
  if (isContactOutcome) updateData.pipeline_stage = pipelineStage;
  if (notes) updateData.notes = notes;
  if (lostReason) updateData.lost_reason = lostReason;

  if (Object.keys(updateData).length > 0) {
    await supabase.from("patients").update(updateData).eq("id", existingTask.patient_id);
  }

  if (!pipelineName || !WORKFLOWS[pipelineName]) {
    revalidatePath("/");
    return { success: true };
  }

  const flow = WORKFLOWS[pipelineName];

  if (outcome === "afspraak") {
    // Flow stops
  } else if (outcome === "afwijzing" || outcome === "geen_interesse") {
    // Flow stops
  } else if ((outcome === "terugbellen" || outcome === "ander_moment") && scheduleDate) {
    const dateObj = new Date(scheduleDate);
    const timeString = dateObj.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    
    await supabase.from("tasks").insert({
      patient_id: existingTask.patient_id,
      pipeline_id: existingTask.pipeline_id,
      title: "Terugbellen",
      description: `Bellen om ${timeString}`,
      status: "later",
      scheduled_for: dateObj.toISOString(),
      step_index: null
    });
  } else if (outcome === "niet_opgenomen" || outcome === "kaartje_verstuurd" || outcome === "afgerond") {
    
    const { data: stepTemplate, error: tplErr } = await supabase
      .from("templates")
      .select("whatsapp_template, email_template, variable_mapping")
      .eq("pipeline_name", pipelineName)
      .eq("step_index", currentStepIndex)
      .eq("action_type", outcome)
      .single();


    if (stepTemplate?.whatsapp_template && existingTask.patient?.phone) {
      try {
        const res = await sendWhatsAppTemplate(existingTask.patient.phone, stepTemplate.whatsapp_template, existingTask.patient, stepTemplate.variable_mapping || {});
      } catch(waErr) {
      }
    } else {
    }

    if (currentStepIndex < flow.length) {
      const nextStep = flow[currentStepIndex];
      const scheduledDate = calculateNextScheduledDate(nextStep.delayHours);
      
      const { error: insErr } = await supabase.from("tasks").insert({
        patient_id: existingTask.patient_id,
        pipeline_id: existingTask.pipeline_id,
        title: nextStep.title,
        status: "open",
        scheduled_for: scheduledDate.toISOString(),
        step_index: currentStepIndex + 1
      });
    } else {
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
