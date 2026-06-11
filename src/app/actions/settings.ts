"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveTemplate(templateId: string, data: { custom_title?: string; whatsapp_template: string; email_template: string; variable_mapping?: Record<string, string> }) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("templates")
    .update({ 
      custom_title: data.custom_title,
      whatsapp_template: data.whatsapp_template,
      email_template: data.email_template,
      variable_mapping: data.variable_mapping || {}
    })
    .eq("id", templateId);
    
  if (error) {
    console.error("Failed to save template", error);
    return { success: false };
  }
  revalidatePath("/");
  return { success: true };
}

export async function changeTaskType(pipelineName: string, stepIndex: number, newTaskType: "call" | "send_card" | "manual_check", customTitle?: string) {
  const supabase = await createClient();

  // First, delete existing templates for this step
  await supabase
    .from("templates")
    .delete()
    .eq("pipeline_name", pipelineName)
    .eq("step_index", stepIndex);

  // Determine new outcomes based on the new task type
  let newOutcomes: string[] = [];
  if (newTaskType === "call") {
    newOutcomes = ["opgenomen", "niet_opgenomen", "ander_moment"];
  } else {
    newOutcomes = ["afgerond"];
  }

  // Insert the new outcome rows
  const newRows = newOutcomes.map(outcome => ({
    pipeline_name: pipelineName,
    step_index: stepIndex,
    action_type: outcome,
    task_type: newTaskType,
    custom_title: customTitle || null,
  }));

  const { error } = await supabase.from("templates").insert(newRows);

  if (error) {
    console.error("Failed to change task type", error);
    return { success: false };
  }

  revalidatePath("/");
  return { success: true };
}
