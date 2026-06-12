import { IntegratiesClient } from "@/components/integraties/integraties-client";
import { getWebhookConfigs } from "@/app/actions/integrations";
import { getPipelines } from "@/app/actions/pipeline";

export default async function IntegratiesPage() {
  const webflowConfigs = await getWebhookConfigs("webflow");
  const pipelinesRes = await getPipelines();
  const pipelines = pipelinesRes.success ? pipelinesRes.data : [];

  return <IntegratiesClient webflowConfigs={webflowConfigs} pipelines={pipelines} />;
}
