"use client";

import { useModalStore } from "@/store/modalStore";

export function Topbar({ userProfile }: { userProfile?: any }) {
  const { openNewPatientModal } = useModalStore();

  const userName = userProfile?.full_name?.split(' ')[0] || "Gebruiker";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Hamburger Menu Button */}
        <button className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors">
          <i className="fa-solid fa-bars text-xl"></i>
        </button>
        {/* Page title context */}
        <h2 className="text-xl font-bold text-slate-900 hidden md:block">Dashboard</h2>
      </div>

      {/* Right side user utility */}
      <div className="flex items-center gap-4">
        {/* Nieuwe patient button */}
        <button 
          onClick={openNewPatientModal}
          className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary-light text-slate-900 font-bold px-4 py-2 rounded-xl transition-colors shadow-sm text-sm"
        >
          <i className="fa-solid fa-plus"></i>
          Nieuwe Patiënt
        </button>

        {/* Global Search */}
        <div className="relative max-w-xs w-48 md:w-64 hidden sm:block">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <i className="fa-solid fa-magnifying-glass text-xs"></i>
          </span>
          <input
            type="text"
            placeholder="Zoeken..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all relative">
            <i className="fa-regular fa-bell text-lg"></i>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 rounded-xl transition-colors">
            <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-200 flex items-center justify-center font-bold text-slate-700">{initial}</div>
            <span className="text-sm font-semibold text-slate-700 hidden md:block">{userName}</span>
            <i className="fa-solid fa-chevron-down text-slate-400 text-xs hidden md:block"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
