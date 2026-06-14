"use server";

import { createClient } from "@/utils/supabase/server";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function inviteUser(email: string, role: "admin" | "fysiotherapeut" | "receptionist", fullName: string) {
  const supabase = await createClient();

  // Validate if caller is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in" };

  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const adminAuthClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: callerProfile, error: callerError } = await adminAuthClient.from("profiles").select("role").eq("id", user.id).single();
  
  if (callerProfile?.role !== "admin") {
    console.log("Invite failed. Caller profile:", callerProfile, "Error:", callerError);
    return { success: false, error: `Only admins can invite. Je huidige rol is: ${callerProfile?.role || 'onbekend'}` };
  }

  // Generate Invite Link from Supabase Admin (requires service role key in next.js, wait: createClient uses Anon key! We need service_role for this!)


  const { data, error } = await adminAuthClient.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`,
      data: {
        role,
        full_name: fullName
      }
    }
  });

  if (error) {
    console.error("Invite error:", error);
    return { success: false, error: error.message };
  }

  // Generate the PKCE confirm link
  const hashedToken = data.properties.hashed_token;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const inviteLink = `${siteUrl}/auth/confirm?token_hash=${hashedToken}&type=invite&next=/update-password`;

  try {
    // Send Email with Resend
    const { error: emailError } = await resend.emails.send({
      from: "Fysio Connected <noreply@dotbrand.nl>", // Moet uiteraard kloppen met het geconfigureerde domein in Resend
      to: email,
      subject: "Uitnodiging voor Fysio Connected CRM",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0f172a;">Je bent uitgenodigd!</h2>
          <p>Beste ${fullName},</p>
          <p>Je bent uitgenodigd om deel te nemen aan het Fysio Connected CRM met de rol: <strong>${role === 'admin' ? 'Beheerder' : role === 'receptionist' ? 'Receptionist' : 'Fysiotherapeut'}</strong>.</p>
          <p>Klik op de onderstaande knop om je wachtwoord in te stellen en je account te activeren. Je hebt hiervoor een Authenticator App (zoals Google Authenticator) nodig voor tweestapsverificatie.</p>
          <a href="${inviteLink}" style="display: inline-block; background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Wachtwoord Instellen</a>
          <p style="margin-top: 30px; font-size: 12px; color: #64748b;">Deze link is 24 uur geldig.</p>
        </div>
      `
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return { success: false, error: "E-mail kon niet worden verzonden (controleer of je domein in Resend geverifieerd is).", inviteLink };
    }
  } catch (resendError: any) {
    console.error("Resend catch error:", resendError);
    return { success: false, error: "Kon e-mail niet verzenden.", inviteLink };
  }

  revalidatePath("/werknemers");
  return { success: true, inviteLink };
}

export async function resetUserPassword(email: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in" };

  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const adminAuthClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: callerProfile } = await adminAuthClient.from("profiles").select("role").eq("id", user.id).single();
  if (callerProfile?.role !== "admin") return { success: false, error: "Only admins can reset passwords" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { data, error } = await adminAuthClient.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=/update-password`
    }
  });

  if (error) return { success: false, error: error.message };

  return { success: true, resetLink: data.properties.action_link };
}

export async function setTrustedDeviceCookie() {
  const { cookies } = await import("next/headers");
  // Set cookie for 30 days
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  (await cookies()).set("fysio_trusted_device_mfa", "true", {
    expires: new Date(Date.now() + thirtyDays),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  return { success: true };
}

export async function updateUserRole(userId: string, newRole: "admin" | "fysiotherapeut" | "receptionist") {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in" };

  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const adminAuthClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: callerProfile } = await adminAuthClient.from("profiles").select("role").eq("id", user.id).single();
  if (callerProfile?.role !== "admin") return { success: false, error: `Only admins can change roles. Je huidige rol is: ${callerProfile?.role || 'onbekend'}` };

  if (userId === user.id) return { success: false, error: "Je kunt je eigen rol niet wijzigen." };

  const { error } = await adminAuthClient.from("profiles").update({ role: newRole }).eq("id", userId);

  if (error) {
    console.error("Update role error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/werknemers");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in" };

  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const adminAuthClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: callerProfile } = await adminAuthClient.from("profiles").select("role").eq("id", user.id).single();
  if (callerProfile?.role !== "admin") return { success: false, error: "Only admins can delete users" };

  if (userId === user.id) return { success: false, error: "Je kunt jezelf niet verwijderen." };

  // Deleting from auth.users will cascade to public.profiles
  const { error } = await adminAuthClient.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Delete user error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/werknemers");
  revalidatePath("/werknemers");
  return { success: true };
}

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const adminAuthClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await adminAuthClient.from("profiles").select("*").eq("id", user.id).single();
  return data;
}
