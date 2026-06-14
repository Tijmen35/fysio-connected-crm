"use client";

import { useEffect, useState, useTransition } from "react";
import { getPatientDetails, updatePatient, deletePatient } from "@/app/actions/patient";
import { useModalStore } from "@/store/modalStore";

export function PatientProfile({ isOpen, patientId, onClose, onSaved }: { isOpen: boolean; patientId: string | null; onClose: () => void; onSaved?: () => void; }) {
  const [patient, setPatient] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const lastCompletedTaskId = useModalStore(state => state.lastCompletedTaskId);

  useEffect(() => {
    if (lastCompletedTaskId && tasks.some(t => t.id === lastCompletedTaskId)) {
      onSaved?.();
      useModalStore.getState().setLastCompletedTaskId(null);
    }
  }, [lastCompletedTaskId, tasks, onSaved]);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [klacht, setKlacht] = useState("");
  const [activePipelineTab, setActivePipelineTab] = useState<string | null>(null);

  useEffect(() => {
    if (tasks.length > 0 && !activePipelineTab) {
      const uniquePipelines = Array.from(new Set(tasks.map((t: any) => t.pipeline?.name).filter(Boolean))) as string[];
      if (uniquePipelines.length > 0) setActivePipelineTab(uniquePipelines[0]);
    }
  }, [tasks, activePipelineTab]);

  useEffect(() => {
    if (isOpen && patientId) {
      setIsLoading(true);
      getPatientDetails(patientId).then(res => {
        if (res.patient) {
          setPatient(res.patient);
          setName(res.patient.full_name || "");
          setPhone(res.patient.phone || "");
          setEmail(res.patient.email || "");
          setLocation(res.patient.location || "");
          setKlacht(res.patient.primary_complaint || "");
        }
        if (res.tasks) {
          setTasks(res.tasks);
        }
        setIsLoading(false);
      });
    } else if (isOpen && !patientId) {
      console.warn("PatientProfile is open but NO patientId was provided!");
    }
  }, [isOpen, patientId]);

  if (!isOpen) return null;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("location", location);
    formData.append("klacht", klacht);

    startTransition(async () => {
      const res = await updatePatient(patientId, formData);
      if (res.success) {
        onClose();
      } else {
        alert("Fout bij updaten: " + res.error);
      }
    });
  }

  function handleDelete() {
    if (!patientId) return;
    if (confirm("Weet je zeker dat je deze patiënt en al zijn taken wilt verwijderen? Dit kan niet ongedaan worden gemaakt.")) {
      startTransition(async () => {
        const res = await deletePatient(patientId);
        if (res.success) {
          onClose();
        } else {
          alert("Fout bij verwijderen: " + res.error);
        }
      });
    }
  }

  return (
    <>
      {/* Profile Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[55] transition-opacity" 
        onClick={onClose} 
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 z-[60] w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-slate-100 flex flex-col animate-in slide-in-from-right-full">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary-700 flex items-center justify-center font-bold text-lg">
              <i className="fa-solid fa-user"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {isLoading ? "Laden..." : patient?.full_name || "Patiënt"}
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Patiëntprofiel
                {patient?.source && (
                  <>
                    <span className="mx-1.5 opacity-50">&bull;</span>
                    <span className="text-slate-400">Bron: {patient.source}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isLoading && patient && (
              <button 
                onClick={handleDelete}
                disabled={isPending}
                className="text-red-400 hover:text-red-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 disabled:opacity-50"
                title="Patiënt verwijderen"
              >
                <i className="fa-solid fa-trash text-sm"></i>
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6">
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <i className="fa-solid fa-circle-notch fa-spin text-3xl text-slate-300"></i>
            </div>
          ) : (
            <>
              {tasks.length > 0 && tasks[0]?.pipeline?.description && tasks[0].status === "belvoorraad" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-clipboard-list"></i>
                    Belscript voor deze lijst
                  </h4>
                  <p className="text-sm text-amber-900 whitespace-pre-wrap">{tasks[0].pipeline.description}</p>
                </div>
              )}

              {/* Formulier */}
              <form id="patient-form" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Naam</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Telefoonnummer</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Locatie</label>
                    <select value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold">
                      <option value="">Selecteer locatie...</option>
                      <option value="Fysio Barendrecht">Fysio Barendrecht</option>
                      <option value="Fysio Rhoon">Fysio Rhoon</option>
                      <option value="Fysio Hoefslag">Fysio Hoefslag</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Hoofdklacht</label>
                    <select value={klacht} onChange={e => setKlacht(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold">
                      <option value="">Selecteer klacht...</option>
                      <option value="Rugklachten">Rugklachten</option>
                      <option value="Nek- en schouderklachten">Nek- en schouderklachten</option>
                      <option value="Knieklachten">Knieklachten</option>
                      <option value="Heupklachten">Heupklachten</option>
                      <option value="Sportblessure">Sportblessure</option>
                      <option value="Revalidatie na operatie">Revalidatie na operatie</option>
                      <option value="Anders">Anders</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gespreksnotities / Opmerkingen</label>
                  <textarea 
                    value={patient?.notes || ""} 
                    readOnly
                    rows={3}
                    placeholder="Notities via Call Outcome Modal..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-500 text-sm rounded-lg px-3 py-2 font-semibold resize-none focus:outline-none" 
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Notities worden aangepast via het uitkomst gesprek scherm.</p>
                </div>
              </form>

              {/* Tijdlijn */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Workflow Taken</h4>
                </div>
                
                {(() => {
                  if (tasks.length === 0) return <p className="text-xs text-slate-400">Geen taken gevonden.</p>;
                  
                  const uniquePipelines = Array.from(new Set(tasks.map((t: any) => {
                    if (typeof t.pipeline === 'string') return t.pipeline;
                    if (typeof t.pipeline === 'object' && t.pipeline) {
                      return Array.isArray(t.pipeline) ? t.pipeline[0]?.name : t.pipeline.name;
                    }
                    return t.pipeline_name;
                  }))) as (string | null | undefined)[];
                  
                  const validPipelines = uniquePipelines.filter(Boolean) as string[];
                  const hasNullPipeline = uniquePipelines.includes(null) || uniquePipelines.includes(undefined);
                  const pipelinesToRender = validPipelines.length > 0 ? validPipelines : [];
                  if (hasNullPipeline) pipelinesToRender.push("Overig");
                  if (pipelinesToRender.length === 0) pipelinesToRender.push("Geen traject");

                  const currentTab = activePipelineTab || pipelinesToRender[0];

                  return (
                    <div className="space-y-4">
                      {/* Tab Bar */}
                      {pipelinesToRender.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {pipelinesToRender.map(pipelineName => (
                            <button
                              key={pipelineName}
                              type="button"
                              onClick={() => setActivePipelineTab(pipelineName)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                currentTab === pipelineName 
                                  ? "bg-slate-800 text-white shadow-sm" 
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                            >
                              {pipelineName}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Active Pipeline Timeline */}
                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <div className="relative space-y-6 border-l-2 border-slate-200 ml-2 pb-2">
                          {(() => {
                            const pipelineTasks = currentTab === "Overig" || currentTab === "Geen traject"
                              ? tasks.filter((t: any) => {
                                  const pname = typeof t.pipeline === 'object' ? (Array.isArray(t.pipeline) ? t.pipeline[0]?.name : t.pipeline?.name) : t.pipeline_name;
                                  return !pname;
                                })
                              : tasks.filter((t: any) => {
                                  const pname = typeof t.pipeline === 'object' ? (Array.isArray(t.pipeline) ? t.pipeline[0]?.name : t.pipeline?.name) : t.pipeline_name;
                                  return pname === currentTab;
                                });
                            
                            const PIPELINE_FLOWS: Record<string, string[]> = {
                              "Leadopvolging": ["Belpoging 1 (Nieuw)", "Belpoging 2", "Belpoging 3 (Laatste poging)"],
                              "No-shows & Zieken": ["Nieuwe afspraak inplannen", "Herinnering sturen"],
                              "Nazorg (Uitbehandeld)": ["Welkomstmail nazorg", "3 Maanden check", "12 Maanden check"],
                              "FysioFit Conversie": ["Doelcheck + FysioFit aanbieden", "Proefles inplannen"]
                            };
        
                            const flow = PIPELINE_FLOWS[currentTab] || [];
                            const completedTitles = pipelineTasks.map((t: any) => t.title.split(" (Gepland")[0]);
                            const hasDeviation = pipelineTasks.some((t: any) => t.title === "Terugbellen" || t.status === "closed" && t.outcome_note && (t.outcome_note.includes('afspraak') || t.outcome_note.includes('afwijzing') || t.outcome_note.includes('geen_interesse')));
                            const upcomingSteps = hasDeviation ? [] : flow.filter(step => !completedTitles.some((t: string) => t.includes(step)));

                            return (
                              <>
                                {upcomingSteps.map((step, idx) => (
                                  <div key={`future-${idx}`} className="relative pl-6">
                                    <div className="absolute -left-[15px] bg-slate-50 w-7 h-7 flex items-center justify-center rounded-full">
                                      <div className="w-3 h-3 bg-slate-200 rounded-full border-2 border-white shadow-sm"></div>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500">{step}</p>
                                    <p className="text-[10px] text-slate-400">Toekomstige stap</p>
                                  </div>
                                ))}

                                {pipelineTasks.map((task: any) => {
                                  const isCompleted = task.status === "Afgerond" || task.status === "closed";
                                  const displayDate = isCompleted 
                                    ? task.updated_at || task.created_at 
                                    : task.scheduled_for || task.created_at;

                                  return (
                                    <div key={task.id} className="relative pl-6">
                                      <div className="absolute -left-[15px] bg-white w-7 h-7 flex items-center justify-center rounded-full">
                                        {isCompleted ? (
                                          <div className="bg-emerald-50 w-6 h-6 flex items-center justify-center rounded-full">
                                            <i className="fa-solid fa-check text-emerald-500 text-[10px]"></i>
                                          </div>
                                        ) : (
                                          <div className="w-3 h-3 bg-primary rounded-full border-2 border-white shadow-sm"></div>
                                        )}
                                      </div>
                                      <p className={`text-xs font-bold ${isCompleted ? "text-slate-500" : "text-slate-800"}`}>
                                        {task.title}
                                      </p>
                                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                        {isCompleted ? "Voltooid op" : "Gepland voor"} {new Date(displayDate).toLocaleDateString("nl-NL")}
                                        {!isCompleted && task.status === "later" && task.scheduled_for && (
                                          <span className="ml-1 text-primary">
                                            om {new Date(task.scheduled_for).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                                          </span>
                                        )}
                                      </p>
                                      {task.outcome_note && (
                                        <div className="mt-2 bg-white border border-slate-100 p-2.5 rounded-lg text-xs text-slate-600 italic">
                                          "{task.outcome_note}"
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex gap-3">
            <button 
              className="flex-1 py-2.5 text-sm font-bold rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
              onClick={onClose}
            >
              Sluiten
            </button>
            <button 
              type="submit"
              form="patient-form"
              disabled={isPending || isLoading || !patient}
              className="flex-1 py-2.5 text-sm font-bold rounded-xl text-slate-900 bg-primary hover:bg-primary-light transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isPending ? "Bezig..." : "Gegevens Opslaan"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
