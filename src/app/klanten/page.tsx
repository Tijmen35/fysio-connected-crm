import { createClient } from "@/utils/supabase/server";
import { KlantenClient } from "@/components/klanten/klanten-client";

export default async function KlantenPage() {
  const supabase = await createClient();
  
  const { data: patients, error } = await supabase
    .from("patients")
    .select(`
      *,
      tasks (
        pipelines (
          name
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching patients:", error);
  }

  return <KlantenClient patients={patients || []} />;
}
