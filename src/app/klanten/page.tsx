export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import { KlantenClient } from "@/components/klanten/klanten-client";

export default async function KlantenPage() {
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const adminAuthClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data: patients, error } = await adminAuthClient
    .from("patients")
    .select(`
      *,
      tasks (
        status,
        pipelines (
          name
        )
      )
    `)
    .order("created_at", { ascending: false });

  const { data: fysiotherapeuten } = await adminAuthClient
    .from("profiles")
    .select("id, full_name")
    .eq("role", "fysiotherapeut");

  if (error) {
    console.error("Error fetching patients:", error);
  }

  // Hide patients who ONLY have "belvoorraad" tasks
  const visiblePatients = patients?.filter(p => {
    if (!p.tasks || p.tasks.length === 0) return true;
    const hasOnlyBelvoorraad = p.tasks.every((t: any) => t.status === "belvoorraad");
    return !hasOnlyBelvoorraad;
  }) || [];

  return <KlantenClient patients={visiblePatients} fysiotherapeuten={fysiotherapeuten || []} />;
}
