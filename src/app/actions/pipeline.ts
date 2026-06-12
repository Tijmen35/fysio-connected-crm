"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function updatePipelineStage(patientId: string, newStage: string) {
  const adminAuthClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await adminAuthClient
    .from("patients")
    .update({ pipeline_stage: newStage })
    .eq("id", patientId);

  if (error) {
    console.error("Error updating pipeline stage:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}
