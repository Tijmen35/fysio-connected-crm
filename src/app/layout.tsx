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
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    userProfile = data;
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
        <NewPatientModal />
        <CallOutcomeModal />
        <NoAnswerModal />
      </body>
    </html>
  );
}
