"use client";

import { useState, useTransition, useRef, useMemo } from "react";
import { importBellijst } from "@/app/actions/bellijst";
import { PatientProfile } from "@/components/kanban/patient-profile";

export function BellijstenClient({ initialTasks, pipelines }: { initialTasks: any[], pipelines: any[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Navigation State
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);

  // Calling Mode State
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [callingMode, setCallingMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // CSV Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [listTag, setListTag] = useState("");
  const [belscript, setBelscript] = useState("");

  // Script Edit State
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [editScriptText, setEditScriptText] = useState("");

  // Groepeer taken op pipeline_id
  const pipelineGroups = useMemo(() => {
    const groups: Record<string, { pipeline: any, tasks: any[], total: number, called: number }> = {};
    
    tasks.forEach(t => {
      if (!t.pipeline_id) return;
      
      if (!groups[t.pipeline_id]) {
        groups[t.pipeline_id] = {
          pipeline: t.pipeline,
          tasks: [],
          total: 0,
          called: 0
        };
      }
      
      groups[t.pipeline_id].tasks.push(t);
      groups[t.pipeline_id].total += 1;
      if (t.status !== "belvoorraad") {
        groups[t.pipeline_id].called += 1;
      }
    });

    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [tasks]);

  const activePipelineGroup = selectedPipelineId 
    ? pipelineGroups.find(g => g.pipeline?.id === selectedPipelineId || g.tasks[0]?.pipeline_id === selectedPipelineId)
    : null;

  // Taken van de geselecteerde lijst (sorteer: nog bellen bovenaan)
  const activeTasks = useMemo(() => {
    if (!activePipelineGroup) return [];
    return [...activePipelineGroup.tasks].sort((a, b) => {
      if (a.status === 'belvoorraad' && b.status !== 'belvoorraad') return -1;
      if (a.status !== 'belvoorraad' && b.status === 'belvoorraad') return 1;
      return 0;
    });
  }, [activePipelineGroup]);

  const uncalledTasks = activeTasks.filter(t => t.status === "belvoorraad");

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
      const res = await importBellijst(csvText, listTag, belscript);
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
    if (uncalledTasks.length === 0) return alert("Geen overgebleven contacten in deze lijst!");
    setCallingMode(true);
    setCurrentIndex(0);
    setSelectedPatientId(uncalledTasks[0].patient_id);
  }

  function handleProfileClosed() {
    setSelectedPatientId(null);
    setCallingMode(false);
  }

  function handleProfileSaved() {
    if (!callingMode) {
      setSelectedPatientId(null);
      return;
    }
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < uncalledTasks.length) {
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setSelectedPatientId(uncalledTasks[nextIndex].patient_id);
      }, 500);
    } else {
      alert("Je bent aan het einde van de bellijst!");
      setSelectedPatientId(null);
      setCallingMode(false);
      // Eventueel een refresh triggeren om stats bij te werken?
      window.location.reload();
    }
  }

  async function savePipelineScript() {
    if (!activePipelineGroup?.pipeline?.id) return;
    startTransition(async () => {
      const { updatePipelineScript } = await import("@/app/actions/bellijst");
      const res = await updatePipelineScript(activePipelineGroup.pipeline.id, editScriptText);
      if (res.success) {
        // Update local state temporarily to reflect change without hard reload if possible
        if (activePipelineGroup.pipeline) {
          activePipelineGroup.pipeline.description = editScriptText;
        }
        setIsEditingScript(false);
      } else {
        alert("Fout bij opslaan: " + res.error);
      }
    });
  }

  // ==== WEERGAVE OVERZICHT ====
  if (!selectedPipelineId) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 h-[calc(100vh-4rem)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Bellijsten Overzicht</h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">Beheer al je actieve bellijsten en volg de voortgang</p>
          </div>
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-light text-slate-900 text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95"
          >
            <i className="fa-solid fa-plus"></i>
            Nieuwe Lijst Importeren
          </button>
        </div>

        {pipelineGroups.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl text-slate-300 mb-4">
              <i className="fa-solid fa-folder-open"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Nog geen bellijsten</h3>
            <p className="text-slate-500 max-w-sm mb-6">Importeer een CSV of Excel bestand om je eerste bellijst aan te maken.</p>
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="px-6 py-2 bg-primary hover:bg-primary-light text-slate-900 text-sm font-bold rounded-xl shadow-sm"
            >
              Lijst Importeren
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pipelineGroups.map((group) => {
              const progressPct = group.total > 0 ? Math.round((group.called / group.total) * 100) : 0;
              const pipelineName = typeof group.pipeline === 'object' && group.pipeline !== null 
                                     ? group.pipeline.name 
                                     : "Onbekende Lijst";
              const pipelineId = group.tasks[0].pipeline_id;

              return (
                <div 
                  key={pipelineId}
                  onClick={() => setSelectedPipelineId(pipelineId)}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary-700 flex items-center justify-center text-lg">
                      <i className="fa-solid fa-list-check"></i>
                    </div>
                    {progressPct === 100 && (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded uppercase">Afgewerkt</span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">
                    {pipelineName}
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 font-medium">
                    {group.called} van {group.total} gebeld
                  </p>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-500 ${progressPct === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>{progressPct}% Voltooid</span>
                    <span>{group.total - group.called} te gaan</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CSV Import Modal */}
        {isImportModalOpen && <ImportModal />}
      </div>
    );
  }

  // ==== WEERGAVE LIJST DETAIL ====
  const pipelineName = typeof activePipelineGroup?.pipeline === 'object' && activePipelineGroup?.pipeline !== null 
                         ? activePipelineGroup?.pipeline?.name 
                         : "Bellijst";

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <button 
          onClick={() => {
            setSelectedPipelineId(null);
            setCallingMode(false);
          }}
          className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-colors mb-4"
        >
          <i className="fa-solid fa-arrow-left"></i> Terug naar overzicht
        </button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{pipelineName}</h2>
              <span className="bg-primary/20 text-primary-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                {activePipelineGroup?.total} personen
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Voortgang: {activePipelineGroup?.called} gebeld / {activePipelineGroup?.total} totaal
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={startCalling}
              disabled={uncalledTasks.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-light text-slate-900 text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <i className="fa-solid fa-headset"></i>
              Start Bellen ({uncalledTasks.length})
            </button>
          </div>
        </div>
      </div>

      {/* Script Section */}
      <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-scroll text-primary"></i> Belscript
          </h3>
          {!isEditingScript ? (
            <button 
              onClick={() => {
                setEditScriptText(activePipelineGroup?.pipeline?.description || "");
                setIsEditingScript(true);
              }}
              className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-pen"></i> Bewerk script
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditingScript(false)}
                disabled={isPending}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors px-3 py-1.5 rounded-lg border border-slate-200"
              >
                Annuleren
              </button>
              <button 
                onClick={savePipelineScript}
                disabled={isPending}
                className="text-xs font-bold text-slate-900 bg-primary hover:bg-primary-light transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                {isPending ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>} Opslaan
              </button>
            </div>
          )}
        </div>
        
        {isEditingScript ? (
          <textarea
            value={editScriptText}
            onChange={(e) => setEditScriptText(e.target.value)}
            className="w-full h-32 p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
            placeholder="Typ hier het belscript voor deze lijst..."
          />
        ) : (
          <div className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            {activePipelineGroup?.pipeline?.description || <span className="italic text-slate-400">Geen script ingesteld voor deze lijst. Klik op 'Bewerk script' om er een toe te voegen.</span>}
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Naam</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Telefoonnummer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Toegevoegd op</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Lege lijst.</td>
                </tr>
              ) : (
                activeTasks.map((task, idx) => {
                  const isCalled = task.status !== "belvoorraad";
                  const uncalledIdx = uncalledTasks.findIndex(t => t.id === task.id);
                  const isCurrentCalling = callingMode && uncalledIdx === currentIndex && !isCalled;

                  return (
                    <tr 
                      key={task.id} 
                      className={`transition-colors ${isCalled ? 'bg-slate-50/50 opacity-70' : 'cursor-pointer hover:bg-slate-50'} ${isCurrentCalling ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                      onClick={() => {
                        if (!isCalled) {
                          setSelectedPatientId(task.patient_id);
                          setCallingMode(false);
                        }
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isCalled ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                            {task.patient?.full_name?.charAt(0) || '?'}
                          </div>
                          <span className={`font-bold ${isCalled ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-800'}`}>
                            {task.patient?.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">
                        {task.patient?.phone || "-"}
                      </td>
                      <td className="px-6 py-4">
                        {isCalled ? (
                          <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-emerald-100 uppercase">
                            <i className="fa-solid fa-check mr-1"></i> Gebeld
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-amber-100 uppercase">
                            Nog bellen
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                        {new Date(task.created_at).toLocaleDateString("nl-NL")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isCalled && (
                          <button 
                            className="w-8 h-8 rounded-full text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPatientId(task.patient_id);
                              setCallingMode(false);
                            }}
                          >
                            <i className="fa-solid fa-phone"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PatientProfile 
        isOpen={!!selectedPatientId} 
        patientId={selectedPatientId} 
        onClose={handleProfileClosed}
        onSaved={handleProfileSaved} 
      />

      {isImportModalOpen && <ImportModal />}
    </div>
  );

  // Helper component for modal
  function ImportModal() {
    return (
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-lg">Nieuwe Bellijst Importeren</h3>
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
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">2. Naam van deze lijst</label>
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
    );
  }
}
