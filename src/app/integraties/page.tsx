import { IntegratiesClient } from "@/components/integraties/integraties-client";
import { getWebhookConfigs } from "@/app/actions/integrations";
import { getPipelines } from "@/app/actions/pipeline";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function IntegratiesPage() {
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

  const allConfigs = await getWebhookConfigs(); // Remove "webflow" filter if possible, or we will just modify getWebhookConfigs
  const pipelinesRes = await getPipelines();
  const pipelines = pipelinesRes.success ? pipelinesRes.data : [];

  return <IntegratiesClient webhookConfigs={allConfigs} pipelines={pipelines} />;
}
