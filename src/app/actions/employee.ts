"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createEmployee(formData: FormData) {
  const supabase = await createClient();

  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;

  if (!firstName || !lastName || !email) {
    return { success: false, error: "Alle velden zijn verplicht" };
  }

  const { data, error } = await supabase
    .from("employees")
    .insert([{ 
      first_name: firstName, 
      last_name: lastName, 
      email, 
      role 
    }])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/werknemers");
  return { success: true, employee: data };
}

export async function deleteEmployee(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/werknemers");
  return { success: true };
}
