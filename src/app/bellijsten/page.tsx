export const dynamic = "force-dynamic";

import { BellijstenClient } from "@/components/bellijsten/bellijsten-client";
import { createClient } from "@/utils/supabase/server";

export default async function BellijstenPage() {
  const supabase = await createClient();
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const adminAuthClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Haal alle pipelines op
  const { data: pipelines } = await supabase.from("pipelines").select("*");

  // Haal alle bellijst taken op inclusief patiënt data
  const { data: tasks, error } = await adminAuthClient
    .from("tasks")
    .select("*, patient:patients(full_name, phone, email, location), pipeline:pipelines(name, description)")
    .or("title.ilike.Lijst:%,title.eq.Koude acquisitie bellen")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bellijsten:", error);
  }

  return <BellijstenClient initialTasks={tasks || []} pipelines={pipelines || []} />;
}
