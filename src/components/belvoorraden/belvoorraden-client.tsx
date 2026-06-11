"use client";

import { useState, useTransition, useRef } from "react";
import { importBelvoorraad } from "@/app/actions/belvoorraad";
import { PatientProfile } from "@/components/kanban/patient-profile";

export function BelvoorradenClient({ initialTasks, pipelines }: { initialTasks: any[], pipelines: any[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Calling Mode State
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [callingMode, setCallingMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // CSV Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [listTag, setListTag] = useState("");
  const [belscript, setBelscript] = useState("");

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvText(event.target?.result as string);
    };
    reader.readAsText(file);
  }

  function downloadExampleCsv() {
    const csvContent = "Naam,Telefoonnummer,E-mail,Locatie\nJan Jansen,0612345678,jan@voorbeeld.nl,Fysio Barendrecht\nPieter Post,0687654321,pieter@voorbeeld.nl,Fysio Rhoon";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "voorbeeld_bellijst.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function submitImport() {
    if (!listTag) return alert("Vul a.u.b. een label in (bijv. 'Steunzolen')");
    startTransition(async () => {
      const res = await importBelvoorraad(csvText, listTag, belscript);
      if (res.success) {
        alert(`Succesvol ${res.count} contacten geïmporteerd!`);
        setIsImportModalOpen(false);
        setCsvText("");
        setListTag("");
        setBelscript("");
        window.location.reload(); 
      } else {
        alert("Fout bij importeren: " + res.error);
      }
    });
  }


  function startCalling() {
    if (tasks.length === 0) return alert("Geen contacten in de belvoorraad!");
    setCallingMode(true);
    setCurrentIndex(0);
    setSelectedPatientId(tasks[0].patient_id);
  }

  function handleProfileClosed() {
    // If we're in calling mode and they closed it without finishing? We stay where we are but close modal.
    setSelectedPatientId(null);
    setCallingMode(false);
  }

  function handleProfileSaved() {
    if (!callingMode) {
      setSelectedPatientId(null);
      return;
    }
    
    // Auto-next logic
    const nextIndex = currentIndex + 1;
    if (nextIndex < tasks.length) {
      // Delay slightly so user sees the save happened before jumping
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setSelectedPatientId(tasks[nextIndex].patient_id);
      }, 500);
    } else {
      alert("Je bent aan het einde van de belvoorraad!");
      setSelectedPatientId(null);
      setCallingMode(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Belvoorraden</h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">Beheer en bel koude leads of prospect lijsten weg</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <i className="fa-solid fa-file-csv text-emerald-600"></i>
            Lijst Importeren
          </button>
          <button 
            onClick={startCalling}
            disabled={tasks.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-light text-slate-900 text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <i className="fa-solid fa-headset"></i>
            Start Bellen
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Naam</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Telefoonnummer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Pipeline</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Toegevoegd op</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl text-slate-300 mb-2">
                        <i className="fa-solid fa-folder-open"></i>
                      </div>
                      <p className="font-semibold text-slate-600">Geen contacten in de belvoorraad</p>
                      <p className="text-sm">Importeer een Excel of CSV bestand om te beginnen.</p>
                      <button onClick={() => setIsImportModalOpen(true)} className="mt-4 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm">
                        Lijst Importeren
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                tasks.map((task, idx) => (
                  <tr 
                    key={task.id} 
                    className={`transition-colors cursor-pointer ${callingMode && currentIndex === idx ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-slate-50'}`}
                    onClick={() => {
                      setSelectedPatientId(task.patient_id);
                      setCallingMode(false);
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                          {task.patient?.full_name?.charAt(0) || '?'}
                        </div>
                        <span className="font-bold text-slate-800">{task.patient?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {task.patient?.phone || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold">
                        {task.pipeline?.name || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(task.created_at).toLocaleDateString("nl-NL")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="w-8 h-8 rounded-full text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                        <i className="fa-solid fa-phone"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-lg">Contacten Importeren</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-sm text-slate-500">
                Upload een CSV of tekstbestand met contacten. Verwacht formaat per regel: <br/>
                <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 mt-2 inline-block">Naam, Telefoonnummer, E-mail, Locatie</code>
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">1. Voorbeeld CSV (Optioneel)</label>
                  <button onClick={downloadExampleCsv} className="text-xs font-bold text-primary hover:text-primary-light">
                    <i className="fa-solid fa-download mr-1"></i> Download Voorbeeld
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">2. Label / Titel van deze lijst</label>
                  <input 
                    type="text" 
                    value={listTag}
                    onChange={(e) => setListTag(e.target.value)}
                    placeholder="Bijv. 'Steunzolen Q3' of 'No-shows Augustus'"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2.5 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">3. Belscript koppelen (Optioneel)</label>
                  <textarea 
                    value={belscript}
                    onChange={(e) => setBelscript(e.target.value)}
                    placeholder="Wat moet de medewerker zeggen als de patiënt opneemt? Dit script verschijnt automatisch bovenaan het scherm tijdens het bellen."
                    className="w-full h-24 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2.5"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">4. Upload CSV of Excel bestand</label>
                  <input 
                    type="file" 
                    accept=".csv,.txt" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary-700 hover:file:bg-primary/20 cursor-pointer"
                  />
                  {csvText && <p className="text-xs text-emerald-600 font-bold mt-2"><i className="fa-solid fa-check"></i> Bestand geselecteerd en klaar voor import</p>}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Annuleren
              </button>
              <button 
                onClick={submitImport}
                disabled={isPending || !csvText}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-light text-slate-900 font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {isPending ? "Bezig..." : "Importeer Data"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Profile / Calling Mode */}
      <PatientProfile 
        isOpen={!!selectedPatientId} 
        patientId={selectedPatientId} 
        onClose={handleProfileClosed}
        onSaved={handleProfileSaved} 
      />
    </div>
  );
}
