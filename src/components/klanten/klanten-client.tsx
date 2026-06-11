"use client";

import { useModalStore } from "@/store/modalStore";
import { PatientProfile } from "@/components/kanban/patient-profile";
import { useState } from "react";

export function KlantenClient({ patients }: { patients: any[] }) {
  const { openNewPatientModal } = useModalStore();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Patiëntenbestand</h3>
            <p className="text-xs text-slate-500">Volledig overzicht van uw geregistreerde cliënten.</p>
          </div>
          <button 
            onClick={openNewPatientModal}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-900 bg-primary hover:bg-primary-light transition-all shadow-md active:scale-95"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>Nieuwe Patiënt</span>
          </button>
        </div>
        
        <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-card flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <i className="fa-solid fa-magnifying-glass text-xs"></i>
            </span>
            <input type="text" placeholder="Zoek op naam, e-mail of medewerker..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-400">
                <tr>
                  <th className="px-6 py-4">Patiënt Naam</th>
                  <th className="px-6 py-4">Telefoon</th>
                  <th className="px-6 py-4">Locatie</th>
                  <th className="px-6 py-4">Actieve Trajecten</th>
                  <th className="px-6 py-4 text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Geen patiënten gevonden.
                    </td>
                  </tr>
                ) : (
                  patients.map(patient => {
                    // Extract unique pipeline names
                    const uniquePipelines = Array.from(new Set(
                      (patient.tasks || [])
                        .map((t: any) => t.pipelines?.name)
                        .filter(Boolean)
                    )) as string[];

                    return (
                      <tr 
                        key={patient.id} 
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                        onClick={() => setSelectedPatientId(patient.id)}
                      >
                        <td className="px-6 py-4 font-bold text-slate-800">{patient.full_name}</td>
                        <td className="px-6 py-4 font-semibold">{patient.phone}</td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold">
                            {patient.location || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {uniquePipelines.length === 0 && <span className="text-slate-400 text-xs">-</span>}
                            {uniquePipelines.map(plName => (
                              <span key={plName} className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                plName.toLowerCase() === "leadopvolging" ? "bg-amber-100 text-amber-700" :
                                plName.toLowerCase().includes("no-show") ? "bg-red-100 text-red-700" :
                                plName.toLowerCase().includes("nazorg") ? "bg-emerald-100 text-emerald-700" :
                                "bg-blue-100 text-blue-700"
                              }`}>
                                {plName}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary shadow-sm flex items-center justify-center transition-colors"
                              onClick={(e) => { e.stopPropagation(); setSelectedPatientId(patient.id); }}
                              title="Bewerken"
                            >
                              <i className="fa-solid fa-pen text-xs"></i>
                            </button>
                            <button 
                              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 shadow-sm flex items-center justify-center transition-colors"
                              onClick={async (e) => { 
                                e.stopPropagation(); 
                                if(confirm("Zeker weten dat je deze patiënt wilt verwijderen?")) {
                                  // deletePatient should be imported, but we can just use the server action directly or reload
                                  const { deletePatient } = await import("@/app/actions/patient");
                                  await deletePatient(patient.id);
                                  window.location.reload();
                                }
                              }}
                              title="Verwijderen"
                            >
                              <i className="fa-solid fa-trash-can text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PatientProfile 
        isOpen={!!selectedPatientId} 
        patientId={selectedPatientId} 
        onClose={() => setSelectedPatientId(null)} 
      />
    </div>
  );
}
