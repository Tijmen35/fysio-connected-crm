export const dynamic = "force-dynamic";

import { KanbanBoard } from "@/components/kanban/board";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const adminAuthClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch tasks with associated patient data
  const { data: tasks, error } = await adminAuthClient
    .from("tasks")
    .select("*, patient:patients(full_name, phone, email, location), pipeline:pipelines(name)");

  if (error) {
    console.error("Error fetching tasks:", error);
  }

  const { data: bellijstContacts } = await supabase
    .from("bellijst_contacts")
    .select("id, list_name, status");

  const { data: templates } = await supabase
    .from("templates")
    .select("pipeline_name, step_index, action_type, whatsapp_template, email_template, custom_title");

  const { data: { user } } = await supabase.auth.getUser();
  let userName = "Collega";
  if (user) {
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
    const adminAuthClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await adminAuthClient.from("profiles").select("full_name").eq("id", user.id).single();
    if (data?.full_name) {
      userName = data.full_name.split(' ')[0];
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 h-[calc(100vh-4rem)]">
      <KanbanBoard 
        initialTasks={tasks || []} 
        templates={templates || []} 
        userName={userName} 
        bellijsten={bellijstContacts || []}
      />
    </div>
  );
}
