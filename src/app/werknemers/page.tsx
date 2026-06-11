import { WerknemersClient } from "@/components/werknemers/werknemers-client";
import { createClient } from "@/utils/supabase/server";

export default async function WerknemersPage() {
  const supabase = await createClient();

  const { data: employees, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching employees:", error);
  }

  return <WerknemersClient initialEmployees={employees || []} />;
}
