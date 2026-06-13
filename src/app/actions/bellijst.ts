"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { formatDutchPhoneNumber } from "@/utils/format";

export async function importBellijst(csvText: string, listTag: string, belscript?: string) {
  const supabase = await createClient();

  const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return { error: "Bestand is leeg" };

  const contactsToInsert = [];
  
  let startIndex = 0;
  if (lines[0].toLowerCase().includes("naam") || lines[0].toLowerCase().includes("name")) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const parts = lines[i].split(/[;,]/).map(p => p.trim());
    const name = parts[0] || `Lead ${i}`;
    const rawPhone = parts[1] || "";
    const email = parts[2] || "";
    const location = parts[3] || "";

    if (!name) continue;

    contactsToInsert.push({
      name: name,
      phone: formatDutchPhoneNumber(rawPhone),
      email,
      location,
      list_name: listTag,
      status: 'open',
      attempts: 0,
      notes: belscript || ""
    });
  }

  if (contactsToInsert.length === 0) return { error: "Geen geldige contacten gevonden in bestand" };

  const { error } = await supabase
    .from("bellijst_contacts")
    .insert(contactsToInsert);

  if (error) {
    console.error("Error inserting bellijst contacts:", error);
    return { error: error.message };
  }

  revalidatePath("/bellijsten");
  return { success: true, count: contactsToInsert.length };
}

export async function updateBellijstContactStatus(id: string, newStatus: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("bellijst_contacts")
    .update({ status: newStatus })
    .eq("id", id);
    
  if (error) {
    console.error("Error updating contact:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/bellijsten");
  return { success: true };
}

export async function updateBellijstContactAttempts(id: string, attempts: number, newStatus: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("bellijst_contacts")
    .update({ attempts, status: newStatus })
    .eq("id", id);
    
  if (error) {
    console.error("Error updating contact attempts:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/bellijsten");
  return { success: true };
}

export async function deleteBellijstList(listName: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("bellijst_contacts")
    .delete()
    .eq("list_name", listName);
    
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/bellijsten");
  return { success: true };
}
