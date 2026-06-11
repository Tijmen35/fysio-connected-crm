import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { NewPatientModal } from "@/components/modals/new-patient-modal";
import { CallOutcomeModal } from "@/components/modals/call-outcome-modal";
import { NoAnswerModal } from "@/components/modals/no-answer-modal";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Fysio Connected CRM",
  description: "Premium patiëntenbeheer, sales pipeline en takenbeheer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-slate-50 text-slate-900`} suppressHydrationWarning>
        <div className="flex h-screen bg-slate-100/50">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
          </div>
        </div>
        <NewPatientModal />
        <CallOutcomeModal />
        <NoAnswerModal />
      </body>
    </html>
  );
}
