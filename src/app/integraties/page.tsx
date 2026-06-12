import { IntegratiesClient } from "@/components/integraties/integraties-client";
import { getWebhookConfigs } from "@/app/actions/integrations";
import { getPipelines } from "@/app/actions/pipeline";

export default async function IntegratiesPage() {
  const allConfigs = await getWebhookConfigs(); // Remove "webflow" filter if possible, or we will just modify getWebhookConfigs
  const pipelinesRes = await getPipelines();
  const pipelines = pipelinesRes.success ? pipelinesRes.data : [];

  return <IntegratiesClient webhookConfigs={allConfigs} pipelines={pipelines} />;
}
