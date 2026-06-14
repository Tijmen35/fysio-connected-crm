import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function PipelinesLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: profile } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role === "fysiotherapeut") {
      redirect("/klanten");
    }
  } else {
    redirect("/login");
  }

  return <>{children}</>;
}
