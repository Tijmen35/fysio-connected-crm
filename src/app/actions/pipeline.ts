"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function updatePipelineStage(patientId: string, newStage: string, lostReason?: string) {
  const adminAuthClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const updateData: any = { pipeline_stage: newStage };
  if (lostReason) {
    updateData.lost_reason = lostReason;
  }

  const { error } = await adminAuthClient
    .from("patients")
    .update(updateData)
    .eq("id", patientId);

  if (error) {
    console.error("Error updating pipeline stage:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/");
  return { success: true };
}

export async function getPipelines() {
  const adminAuthClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data, error } = await adminAuthClient.from("pipelines").select("*").order("name");
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data };
}
