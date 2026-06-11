import { BelvoorradenClient } from "@/components/belvoorraden/belvoorraden-client";
import { createClient } from "@/utils/supabase/server";

export default async function BelvoorradenPage() {
  const supabase = await createClient();

  // Haal alle pipelines op
  const { data: pipelines } = await supabase.from("pipelines").select("*");

  // Haal alle belvoorraad taken op inclusief patiënt data
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*, patient:patients(full_name, phone, email, location), pipeline:pipelines(name)")
    .eq("status", "belvoorraad")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching belvoorraden:", error);
  }

  return <BelvoorradenClient initialTasks={tasks || []} pipelines={pipelines || []} />;
}
