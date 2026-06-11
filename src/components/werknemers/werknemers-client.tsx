"use client";

import { useState, useTransition } from "react";
import { createEmployee, deleteEmployee } from "@/app/actions/employee";

export function WerknemersClient({ initialEmployees }: { initialEmployees: any[] }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Weet je zeker dat je deze medewerker wilt verwijderen?")) return;
    
    startTransition(async () => {
      const res = await deleteEmployee(id);
      if (res.success) {
        setEmployees(prev => prev.filter(e => e.id !== id));
      } else {
        alert("Fout bij verwijderen: " + res.error);
      }
    });
  }

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const res = await createEmployee(formData);
      if (res.success && res.employee) {
        setEmployees([res.employee, ...employees]);
        setIsModalOpen(false);
      } else {
        alert("Fout bij toevoegen: " + res.error);
      }
    });
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Werknemers & Rechten</h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">Beheer de accounts en toegangsrechten van uw team.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-light text-slate-900 text-sm font-bold rounded-xl transition-all shadow-md active:scale-95"
        >
          <i className="fa-solid fa-user-plus"></i>
          Nieuwe Medewerker
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Naam</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Aangemaakt</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Nog geen werknemers gevonden.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold uppercase">
                          {emp.first_name.charAt(0)}{emp.last_name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800">{emp.first_name} {emp.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                      {emp.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold capitalize">
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(emp.created_at).toLocaleDateString("nl-NL")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(emp.id)}
                        disabled={isPending}
                        className="w-8 h-8 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-lg">Nieuwe Medewerker</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <form action={handleCreate}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Voornaam</label>
                    <input 
                      type="text" 
                      name="first_name"
                      required
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Achternaam</label>
                    <input 
                      type="text" 
                      name="last_name"
                      required
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">E-mailadres</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Rol / Functie</label>
                  <select 
                    name="role"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold"
                  >
                    <option value="fysio">Fysiotherapeut</option>
                    <option value="balie">Baliemedewerker</option>
                    <option value="admin">Beheerder</option>
                  </select>
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Annuleren
                </button>
                <button 
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-light text-slate-900 font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {isPending ? "Bezig..." : "Toevoegen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
