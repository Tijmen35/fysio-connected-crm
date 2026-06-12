import { createClient } from "@/utils/supabase/server";
import PipelineBoard from "@/components/kanban/pipeline-board";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export default async function LeadopvolgingPage() {
  const adminAuthClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch the Leadopvolging pipeline ID
  const { data: pipeline } = await adminAuthClient
    .from("pipelines")
    .select("id")
    .eq("name", "Leadopvolging")
    .single();

  let patients = [];
  if (pipeline?.id) {
    const { data } = await adminAuthClient
      .from("patients")
      .select("*")
      .eq("active_pipeline_id", pipeline.id);
    patients = data || [];
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Leadopvolging Pipeline</h3>
            <p className="text-xs text-slate-500">Sleep leads tussen de kolommen of gebruik de actieknoppen in het dashboard.</p>
          </div>
        </div>
        
        <PipelineBoard initialPatients={patients} pipelineId={pipeline?.id || ""} />
        
      </div>
    </div>
  );
}
