"use client";

import { useState, useTransition } from "react";
import { inviteUser, updateUserRole, deleteUser } from "@/app/actions/auth";

export default function WerknemersClient({ initialProfiles, isAdmin }: { initialProfiles: any[], isAdmin: boolean }) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleInvite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const fullName = formData.get("full_name") as string;
    const role = formData.get("role") as "admin" | "therapist";

    setError("");

    startTransition(async () => {
      const res = await inviteUser(email, role, fullName);
      if (res.success) {
        setIsInviteModalOpen(false);
        alert(`Uitnodiging is succesvol verstuurd naar ${email}!`);
      } else {
        setError(res.error || "Er is een onbekende fout opgetreden.");
      }
    });
  };

  const handleRoleChange = (userId: string, newRole: "admin" | "therapist") => {
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole);
      if (!res.success) alert(res.error);
    });
  };

  const handleDelete = (userId: string, name: string) => {
    if (confirm(`Weet je zeker dat je ${name} de toegang wilt ontzeggen en wilt verwijderen?`)) {
      startTransition(async () => {
        const res = await deleteUser(userId);
        if (!res.success) alert(res.error);
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-700">Actieve Werknemers</h2>
          {isAdmin && (
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-600 transition-colors shadow-sm flex items-center gap-2"
            >
              <i className="fa-solid fa-user-plus"></i> Uitnodigen
            </button>
          )}
        </div>
        
        <div className="divide-y divide-slate-100">
          {initialProfiles.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <p>Nog geen profielen gevonden. (Vergeet niet de database migratie uit te voeren!)</p>
            </div>
          )}
          {initialProfiles.map(profile => (
            <div key={profile.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-lg font-bold">
                  {profile.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{profile.full_name || "Onbekende Gebruiker"}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {profile.role === 'admin' ? 'Beheerder' : 'Behandelaar'}
                    </span>
                    <span className="text-xs text-slate-400">Toegevoegd op {profile.created_at.split('T')[0]}</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <select 
                    value={profile.role}
                    onChange={(e) => handleRoleChange(profile.id, e.target.value as any)}
                    disabled={isPending}
                    className="text-sm border border-slate-200 rounded-lg p-2 focus:ring-primary focus:border-primary text-slate-700 bg-white disabled:opacity-50"
                  >
                    <option value="therapist">Behandelaar</option>
                    <option value="admin">Beheerder</option>
                  </select>
                  <button 
                    onClick={() => handleDelete(profile.id, profile.full_name)}
                    disabled={isPending}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Gebruiker verwijderen"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isInviteModalOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" onClick={() => !isPending && setIsInviteModalOpen(false)}></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md p-6">
            <h3 className="font-bold text-xl text-slate-900 mb-2">Nieuwe werknemer uitnodigen</h3>
            <p className="text-slate-500 text-sm mb-6">Stuur een e-mail uitnodiging (via Resend) om veilig een wachtwoord en 2FA in te stellen.</p>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm font-bold border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Volledige Naam</label>
                <input 
                  type="text" 
                  name="full_name"
                  required
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-primary focus:border-primary"
                  placeholder="bijv. Jeroen van Vliet"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">E-mailadres</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-primary focus:border-primary"
                  placeholder="jeroen@praktijk.nl"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Rechten (Rol)</label>
                <select 
                  name="role"
                  required
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-primary focus:border-primary"
                >
                  <option value="therapist">Behandelaar (Alleen CRM gebruiken)</option>
                  <option value="admin">Beheerder (Toegang tot instellingen & werknemers)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsInviteModalOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Annuleren
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {isPending ? <i className="fa-solid fa-spinner fa-spin"></i> : "Uitnodiging Versturen"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
