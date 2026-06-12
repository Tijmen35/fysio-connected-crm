"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getWebhookConfigs(provider: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("webhook_configs")
    .select("*, pipeline:pipelines(name)")
    .eq("provider", provider)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching webhooks:", error);
    return [];
  }
  return data;
}

export async function createWebhookConfig(data: {
  provider: string;
  name: string;
  pipeline_id: string;
  field_mapping: Record<string, string>;
}) {
  const supabase = await createClient();
  
  const { data: newConfig, error } = await supabase
    .from("webhook_configs")
    .insert([
      {
        provider: data.provider,
        name: data.name,
        pipeline_id: data.pipeline_id,
        field_mapping: data.field_mapping,
        is_active: true
      }
    ])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/integraties");
  return { success: true, data: newConfig };
}

export async function deleteWebhookConfig(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("webhook_configs").delete().eq("id", id);
  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath("/integraties");
  return { success: true };
}

export async function updateWebhookConfig(id: string, data: {
  name: string;
  pipeline_id: string;
  field_mapping: Record<string, string>;
}) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("webhook_configs")
    .update({
      name: data.name,
      pipeline_id: data.pipeline_id,
      field_mapping: data.field_mapping
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/integraties");
  return { success: true };
}
