import { createClient } from "@/utils/supabase/server";
import { InstellingenClient } from "@/components/instellingen/instellingen-client";
import { getWhatsAppTemplates } from "@/lib/whatsapp";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InstellingenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: profile } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      redirect("/");
    }
  } else {
    redirect("/login");
  }

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
