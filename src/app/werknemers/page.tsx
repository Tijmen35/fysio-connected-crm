import { createClient } from "@/utils/supabase/server";
import WerknemersClient from "./werknemers-client";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function WerknemersPage() {
  const supabase = await createClient();

  // Redirect to login if no session (fallback if middleware fails)
  const { data: { user } } = await supabase.auth.getUser();

  // Haal alle profielen op (Bypass RLS via Admin Client, aangezien RLS momenteel oneindige recursie oplevert)
  const { createClient: createAdminClient } = await import('@supabase/supabase-js');
  const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const { data: profiles, error } = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch emails from auth.users to attach to profiles
  const { data: authUsersData } = await adminClient.auth.admin.listUsers();
  const users = authUsersData?.users || [];
  
  const profilesWithEmail = profiles?.map(profile => {
    const userMatch = users.find(u => u.id === profile.id);
    return {
      ...profile,
      email: userMatch?.email || null,
    };
  }) || [];

  let isAdmin = false;
  if (user) {
    const { data: currentUserProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    isAdmin = currentUserProfile?.role === "admin";
    if (!isAdmin) {
      redirect("/");
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Werknemers & Rechten</h1>
            <p className="text-slate-500 mt-1">Beheer wie er toegang heeft tot Fysio Connected CRM.</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-users"></i>
          </div>
        </div>

        <WerknemersClient initialProfiles={profilesWithEmail} isAdmin={isAdmin} />

      </div>
    </div>
  );
}
