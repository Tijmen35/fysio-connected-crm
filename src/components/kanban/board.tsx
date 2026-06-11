"use client";

import { useState, useTransition } from "react";
import { PatientProfile } from "./patient-profile";

import { useModalStore } from "@/store/modalStore";

function TaskCard({ task, templates = [], onClick }: { task: any, templates?: any[], onClick: () => void }) {
  const [isPending, startTransition] = useTransition();
  const patientName = task.patient?.full_name || task.patient?.name || task.patientName;
  const pipelineName = task.pipeline?.name || task.pipeline;
  const { openCallOutcomeModal, openNoAnswerModal } = useModalStore();

  // Find custom title if defined
  const stepTemplate = templates.find(
    (t: any) => t.pipeline_name === pipelineName && t.step_index === task.step_index
  );
  const displayTitle = stepTemplate?.custom_title || task.title || task.action;

  return (
    <div
      className="bg-white p-3 rounded-xl shadow-card border border-slate-100 hover:border-primary-300 transition-all cursor-grab active:cursor-grabbing group relative"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
          pipelineName === "Leadopvolging" || pipelineName === "leadopvolging" ? "bg-amber-100 text-amber-700" :
          pipelineName === "No-shows & Zieken" || pipelineName === "noshows" ? "bg-red-100 text-red-700" :
          pipelineName === "Nazorg (Uitbehandeld)" || pipelineName === "nazorg" ? "bg-emerald-100 text-emerald-700" :
          "bg-blue-100 text-blue-700"
        }`}>
          {pipelineName}
        </span>
      </div>
      <h4 className="font-bold text-slate-800 text-sm">{patientName}</h4>
      
      {task.patient?.primary_complaint && (
        <p className="text-[10px] text-slate-600 font-bold mb-1 mt-0.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
          <i className="fa-solid fa-notes-medical text-primary mr-1"></i> {task.patient.primary_complaint}
        </p>
      )}

      {task.patient?.phone && (
        <p className="text-[10px] text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
          <i className="fa-solid fa-phone text-[9px] opacity-70"></i> {task.patient.phone}
        </p>
      )}

      {task.patient?.location && (
        <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mb-1">
          <i className="fa-solid fa-location-dot text-[9px]"></i> {task.patient.location}
        </p>
      )}

      <div className="text-[10px] text-slate-500 font-semibold mb-3 mt-2 flex flex-col gap-1">
        <div className="flex items-start gap-1.5 opacity-70">
          <i className="fa-solid fa-align-left mt-0.5"></i>
          <span>{displayTitle}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400" title="Datum toegevoegd">
          <i className="fa-regular fa-calendar text-[10px]"></i>
          <span>
            {new Date(task.patient?.created_at || task.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
          {(task.assigned_to || task.avatarInitials || "S")[0]}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-t border-slate-100 pt-2 mt-2">
        {stepTemplate?.task_type === 'send_card' || stepTemplate?.task_type === 'manual_check' ? (
          <button 
            disabled={isPending}
            className="flex-1 min-w-[50px] py-1.5 px-1 rounded bg-blue-50 hover:bg-blue-100 text-[10px] font-bold text-blue-700 transition-colors text-center flex items-center justify-center gap-1 border border-blue-200 disabled:opacity-50"
            onClick={async (e) => { 
              e.stopPropagation(); 
              startTransition(async () => {
                const { advanceWorkflow } = await import("@/app/actions/task");
                await advanceWorkflow(task.id, "afgerond");
              });
            }}
          >
            <i className={`fa-solid ${stepTemplate.task_type === 'send_card' ? 'fa-envelope-open-text' : 'fa-check-double'} text-[10px]`}></i>
            <span className="hidden sm:inline">Afgerond</span>
          </button>
        ) : (
          <>
            <button 
              disabled={isPending}
              className="flex-1 min-w-[50px] py-1.5 px-1 rounded bg-orange-50 hover:bg-orange-100 text-[10px] font-bold text-orange-700 transition-colors text-center flex items-center justify-center gap-1 border border-orange-200 disabled:opacity-50"
              onClick={async (e) => { 
                e.stopPropagation(); 
                
                // Check if there is a template
                const stepIndex = task.step_index || 0;
                const hasTemplate = templates.some(
                  (t: any) => t.pipeline_name === pipelineName && t.step_index === (stepIndex + 1) && t.action_type === "niet_opgenomen" && (t.whatsapp_template || t.email_template)
                );

                if (hasTemplate) {
                  openNoAnswerModal(task.id, patientName);
                } else {
                  // Directly advance without modal
                  startTransition(async () => {
                    const { advanceWorkflow } = await import("@/app/actions/task");
                    await advanceWorkflow(task.id, "niet_opgenomen");
                  });
                }
              }}
            >
              <i className="fa-solid fa-phone-slash text-[10px]"></i>
              <span className="hidden sm:inline">Niet opgenomen</span>
            </button>
            <button 
              className="flex-1 min-w-[50px] py-1.5 px-1 rounded bg-emerald-50 hover:bg-emerald-100 text-[10px] font-bold text-emerald-700 transition-colors text-center flex items-center justify-center gap-1 border border-emerald-200"
              onClick={(e) => { 
                e.stopPropagation(); 
                openCallOutcomeModal(task.id, patientName);
              }}
            >
              <i className="fa-solid fa-phone-volume text-[10px]"></i>
              <span className="hidden sm:inline">Opgenomen</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ initialTasks = [], templates = [] }: { initialTasks?: any[], templates?: any[] }) {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  
  const endOfTomorrow = new Date(now);
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
  endOfTomorrow.setHours(23, 59, 59, 999);

  const activeTasks = initialTasks.filter(t => t.status === "open" || t.status === "vandaag" || t.status === "morgen" || t.status === "later" || t.status === "overmorgen");

  const vandaagOchtend = activeTasks.filter(t => {
    if (!t.scheduled_for) return t.status === "vandaag";
    const dt = new Date(t.scheduled_for);
    return dt <= now && dt.getHours() < 13;
  });

  const vandaagMiddag = activeTasks.filter(t => {
    if (!t.scheduled_for) return false;
    const dt = new Date(t.scheduled_for);
    return dt <= now && dt.getHours() >= 13;
  });

  const morgen = activeTasks.filter(t => {
    if (!t.scheduled_for) return t.status === "morgen" || t.status === "Morgen";
    const dt = new Date(t.scheduled_for);
    return dt > now && dt <= endOfTomorrow;
  });

  const overmorgen = activeTasks.filter(t => {
    if (!t.scheduled_for) return t.status === "overmorgen" || t.status === "Overmorgen";
    const dt = new Date(t.scheduled_for);
    return dt > endOfTomorrow;
  });
  
  const belvoorraad = initialTasks.filter(t => t.status === "belvoorraad");

  const TASKS = {
    vandaagOchtend,
    vandaagMiddag,
    morgen,
    overmorgen,
    belvoorraad
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 relative h-[calc(100vh-4rem)]">
        <div className="space-y-6">
          
          {/* Welkom banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-premium">
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
            <div className="relative z-10 space-y-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                Goedemiddag
              </span>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                Welkom terug bij Fysio Connected, <span>Sanne</span>!
              </h3>
              <p className="text-slate-300 text-sm md:text-base max-w-xl">
                Er staan vandaag <span className="text-primary font-bold">4 openstaande taken</span> en <span className="text-primary font-bold">2 ongelezen berichten</span> op uw aandacht te wachten.
              </p>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taken Vandaag</p>
                <h4 className="text-3xl font-bold text-slate-800">3</h4>
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <i className="fa-regular fa-clock"></i> Deadline voor 17:00
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center text-xl">
                <i className="fa-solid fa-list-check"></i>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Belvoorraad</p>
                <h4 className="text-3xl font-bold text-slate-800">2</h4>
                <span className="text-xs text-primary font-semibold flex items-center gap-1">
                  <i className="fa-solid fa-phone"></i> Cold calling pool
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl">
                <i className="fa-solid fa-headset"></i>
              </div>
            </div>
          </div>

          {/* Kanban Board (Werkdag Overzicht) */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Werkdag Overzicht</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              
              {/* Column 1: Vandaag (Ochtend & Middag) */}
              <div className="space-y-4">
                {/* Vandaag Ochtend */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 min-w-[200px] space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Vandaag (Ochtend)
                    </span>
                    <span className="bg-slate-200/60 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
                      {TASKS.vandaagOchtend.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {TASKS.vandaagOchtend.map(task => <TaskCard key={task.id} task={task} templates={templates} onClick={() => setSelectedPatientId(task.patient_id || task.patientId)} />)}
                  </div>
                </div>

                {/* Vandaag Middag */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 min-w-[200px] space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Vandaag (Middag)
                    </span>
                    <span className="bg-slate-200/60 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
                      {TASKS.vandaagMiddag.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {TASKS.vandaagMiddag.map(task => <TaskCard key={task.id} task={task} templates={templates} onClick={() => setSelectedPatientId(task.patient_id || task.patientId)} />)}
                  </div>
                </div>
              </div>

              {/* Column 2: Morgen */}
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 min-w-[200px] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-xs text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Morgen
                  </span>
                  <span className="bg-slate-200/60 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
                    {TASKS.morgen.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {TASKS.morgen.map(task => <TaskCard key={task.id} task={task} templates={templates} onClick={() => setSelectedPatientId(task.patient_id || task.patientId)} />)}
                </div>
              </div>

              {/* Column 3: Overmorgen */}
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 min-w-[200px] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-xs text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Overmorgen
                  </span>
                  <span className="bg-slate-200/60 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
                    {TASKS.overmorgen.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {TASKS.overmorgen.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-24 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                      <span className="text-xs font-semibold">Geen taken</span>
                    </div>
                  )}
                  {TASKS.overmorgen.map(task => <TaskCard key={task.id} task={task} templates={templates} onClick={() => setSelectedPatientId(task.patient_id || task.patientId)} />)}
                </div>
              </div>

              {/* Column 4: Belvoorraad */}
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 min-w-[200px] space-y-4 flex flex-col">
                <div className="flex flex-col gap-3 border-b border-slate-200 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      Belvoorraad
                    </span>
                    <span className="bg-slate-200/60 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
                      {TASKS.belvoorraad.length}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Belteller</span>
                      <span>0 / {TASKS.belvoorraad.length} afgerond</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                    <i className="fa-solid fa-file-excel text-emerald-600"></i> Importeer Excel
                  </button>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {TASKS.belvoorraad.map(task => <TaskCard key={task.id} task={task} onClick={() => setSelectedPatientId(task.patient_id || task.patientId)} />)}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
      
      <PatientProfile 
        isOpen={!!selectedPatientId} 
        patientId={selectedPatientId}
        onClose={() => setSelectedPatientId(null)} 
      />
    </>
  );
}
