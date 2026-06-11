import { KanbanBoard } from "@/components/kanban/board";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Fetch tasks with associated patient data
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*, patient:patients(full_name, phone, email, location), pipeline:pipelines(name)");

  if (error) {
    console.error("Error fetching tasks:", error);
  }

  const { data: templates } = await supabase
    .from("templates")
    .select("pipeline_name, step_index, action_type, whatsapp_template, email_template");

  return <KanbanBoard initialTasks={tasks || []} templates={templates || []} />;
}
