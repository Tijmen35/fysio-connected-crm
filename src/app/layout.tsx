import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/app-layout";
import { NewPatientModal } from "@/components/modals/new-patient-modal";
import { CallOutcomeModal } from "@/components/modals/call-outcome-modal";
import { NoAnswerModal } from "@/components/modals/no-answer-modal";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Fysio Connected CRM",
  description: "Premium patiëntenbeheer, sales pipeline en takenbeheer.",
};

import { createClient } from "@/utils/supabase/server";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userProfile = null;
  let fysiotherapeuten: { id: string; full_name: string }[] = [];

  if (user) {
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
    const adminAuthClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    userProfile = profile;

    const { data: fysios } = await adminAuthClient
      .from("profiles")
      .select("id, full_name")
      .eq("role", "fysiotherapeut");
    
    if (fysios) fysiotherapeuten = fysios;
  }

  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-slate-50 text-slate-900`} suppressHydrationWarning>
        <AppLayout userProfile={userProfile}>
          {children}
        </AppLayout>
        <NewPatientModal fysiotherapeuten={fysiotherapeuten} currentUserProfile={userProfile} />
        <CallOutcomeModal />
        <NoAnswerModal />
      </body>
    </html>
  );
}
