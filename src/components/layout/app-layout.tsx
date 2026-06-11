"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function AppLayout({ children, userProfile: initialProfile }: { children: React.ReactNode, userProfile?: any }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(initialProfile);
  
  useEffect(() => {
    async function fetchUser() {
      const { getCurrentUserProfile } = await import("@/app/actions/auth");
      const data = await getCurrentUserProfile();
      if (data) {
        setProfile(data);
      }
    }
    if (!profile) fetchUser();
  }, [profile]);
  
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/update-password') || pathname.startsWith('/mfa');

  if (isAuthRoute) {
    return <main>{children}</main>;
  }

  return (
    <div className="flex h-screen bg-slate-100/50">
      <Sidebar userProfile={profile} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar userProfile={profile} />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
