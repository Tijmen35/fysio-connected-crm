"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar({ userProfile }: { userProfile?: any }) {
  const pathname = usePathname();

  // Haal naam op of gebruik fallback
  const userName = userProfile?.full_name || "Gebruiker";
  const userRole = userProfile?.role === "admin" ? "Beheerder" : "Behandelaar";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 flex flex-col justify-between transform -translate-x-full lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out">
      <div>
        {/* Brand logo header */}
        <div className="py-5 flex flex-col gap-3 px-6 bg-slate-950/40 border-b border-slate-800/60">
          <div className="w-full h-10 bg-primary/20 rounded-md flex items-center justify-center text-primary font-bold">FC Logo</div>
          <span className="text-[10px] text-primary font-bold uppercase tracking-widest text-center mt-2">
            CRM Portaal
          </span>
        </div>

        {/* Navigation menu */}
        <nav className="p-4 space-y-1.5 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <Link 
            href="/" 
            className={`nav-item group flex items-center gap-3.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
              pathname === "/" ? "bg-primary text-slate-900 shadow-glow" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <i className="fa-solid fa-chart-line text-lg w-5"></i>
            <span>Dashboard</span>
          </Link>
          <Link 
            href="/klanten" 
            className={`nav-item group flex items-center gap-3.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
              pathname === "/klanten" ? "bg-primary text-slate-900 shadow-glow" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <i className="fa-solid fa-user-group text-lg w-5"></i>
            <span>Patiënten</span>
          </Link>
          <Link 
            href="/bellijsten" 
            className={`nav-item group flex items-center gap-3.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
              pathname === "/bellijsten" ? "bg-primary text-slate-900 shadow-glow" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <i className="fa-solid fa-phone-volume text-lg w-5"></i>
            <span>Bellijsten</span>
          </Link>
          <Link 
            href="/werknemers" 
            className={`nav-item group flex items-center gap-3.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
              pathname === "/werknemers" ? "bg-primary text-slate-900 shadow-glow" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <i className="fa-solid fa-users text-lg w-5"></i>
            <span>Werknemers</span>
          </Link>
          <Link 
            href="/integraties" 
            className={`nav-item group flex items-center gap-3.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
              pathname === "/integraties" ? "bg-primary text-slate-900 shadow-glow" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <i className="fa-solid fa-plug text-lg w-5"></i>
            <span>Integraties</span>
          </Link>
          <Link 
            href="/instellingen" 
            className={`nav-item group flex items-center gap-3.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
              pathname === "/instellingen" ? "bg-primary text-slate-900 shadow-glow" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <i className="fa-solid fa-code-branch w-5"></i>
            <span>Workflows</span>
          </Link>


          {/* Pipelines Section */}
          <div className="pt-4 pb-1 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Pipelines
          </div>

          <Link 
            href="/pipelines/leadopvolging" 
            className={`nav-item group flex items-center gap-3 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
              pathname === "/pipelines/leadopvolging" ? "bg-primary text-slate-900 shadow-glow" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <i className="fa-solid fa-filter text-base w-4"></i>
            <span>Leadopvolging</span>
          </Link>
          <Link 
            href="/pipelines/noshows" 
            className={`nav-item group flex items-center gap-3 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
              pathname === "/pipelines/noshows" ? "bg-primary text-slate-900 shadow-glow" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <i className="fa-solid fa-user-slash text-base w-4"></i>
            <span>No-shows & Zieken</span>
          </Link>
          <Link 
            href="/pipelines/nazorg" 
            className={`nav-item group flex items-center gap-3 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
              pathname === "/pipelines/nazorg" ? "bg-primary text-slate-900 shadow-glow" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <i className="fa-solid fa-comment-medical text-base w-4"></i>
            <span>Nazorg (Uitbehandeld)</span>
          </Link>
          <Link 
            href="/pipelines/fysiofit" 
            className={`nav-item group flex items-center gap-3 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
              pathname === "/pipelines/fysiofit" ? "bg-primary text-slate-900 shadow-glow" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <i className="fa-solid fa-dumbbell text-base w-4"></i>
            <span>Nazorg (Doel + FysioFit)</span>
          </Link>
        </nav>
      </div>

      {/* Sidebar Footer User Panel */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-white">{initial}</div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userRole}</p>
          </div>
        </div>
        <button 
          onClick={async () => {
            const { createClient } = await import('@/utils/supabase/client');
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = '/login';
          }}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          <span>Uitloggen</span>
        </button>
      </div>
    </aside>
  );
}
