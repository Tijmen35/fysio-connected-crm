export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import { BellijstenClient } from "@/components/bellijsten/bellijsten-client";

export default async function BellijstenPage() {
  const supabase = await createClient();
  
  // Haal alle bellijst contacten op uit de geïsoleerde tabel
  const { data: contacts, error } = await supabase
    .from("bellijst_contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bellijsten:", error);
  }

  return <BellijstenClient initialContacts={contacts || []} />;
}
