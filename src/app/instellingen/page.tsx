import { createClient } from "@/utils/supabase/server";
import { InstellingenClient } from "@/components/instellingen/instellingen-client";
import { getWhatsAppTemplates } from "@/lib/whatsapp";

export default async function InstellingenPage() {
  const supabase = await createClient();
  
  const { data: templates, error } = await supabase
    .from("templates")
    .select("*")
    .order("pipeline_name", { ascending: true })
    .order("step_index", { ascending: true });

  if (error) {
    console.error("Error fetching templates:", error);
  }

  const waTemplates = await getWhatsAppTemplates();

  return <InstellingenClient initialTemplates={templates || []} waTemplates={waTemplates} />;
}
