"use client";

import { useState, useTransition } from "react";
import { saveTemplate, changeTaskType } from "@/app/actions/settings";
import { WORKFLOWS } from "@/lib/workflows";

export function InstellingenClient({ initialTemplates, waTemplates = [] }: { initialTemplates: any[], waTemplates?: any[] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  
  // Modals
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [editingStep, setEditingStep] = useState<any | null>(null);
  
  const [selectedWaTemplateName, setSelectedWaTemplateName] = useState<string>("");
  const [variableMapping, setVariableMapping] = useState<Record<string, string>>({});

  const [expandedPipelines, setExpandedPipelines] = useState<Record<string, boolean>>({});

  const [isPending, startTransition] = useTransition();

  // Group templates by pipeline
  const pipelines = [...new Set(templates.map(t => t.pipeline_name))];

  function getPipelineColor(name: string) {
    const lower = name.toLowerCase();
    if (lower.includes("lead")) return "bg-amber-100 text-amber-700 border-amber-200";
    if (lower.includes("show") || lower.includes("ziek")) return "bg-red-100 text-red-700 border-red-200";
    if (lower.includes("nazorg")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Instellingen</h1>
            <p className="text-slate-500 mt-1">Beheer de automatische WhatsApp en E-mail templates per traject.</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-sliders"></i>
          </div>
        </div>

        {pipelines.map(pipeline => {
          const pipelineTemplates = templates.filter(t => t.pipeline_name === pipeline);
          const flow = WORKFLOWS[pipeline as keyof typeof WORKFLOWS] || [];
          
          const steps = [...new Set(pipelineTemplates.map(t => t.step_index))].sort();

          return (
            <div key={pipeline as string} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <button 
                onClick={() => setExpandedPipelines(prev => ({ ...prev, [pipeline as string]: !prev[pipeline as string] }))}
                className="w-full px-6 py-5 border-b border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 flex justify-between items-center transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 ${expandedPipelines[pipeline as string] ? 'rotate-180 bg-slate-200 text-slate-600' : 'bg-white text-slate-400 border border-slate-200 shadow-sm'}`}>
                    <i className="fa-solid fa-chevron-down text-sm"></i>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${getPipelineColor(pipeline as string)}`}>
                    {pipeline as string}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">{steps.length} stappen</span>
              </button>

              {expandedPipelines[pipeline as string] && (
                <div className="divide-y divide-slate-100 animate-in slide-in-from-top-2 fade-in duration-200">
                  {steps.map(stepIndex => {
                    const stepTemplates = pipelineTemplates.filter(t => t.step_index === stepIndex);
                  const firstTpl = stepTemplates[0];
                  const taskType = firstTpl.task_type || "call";
                  const customTitle = firstTpl.custom_title;
                  const stepTitle = flow[(stepIndex as number) - 1]?.title || `Stap ${stepIndex}`;

                  return (
                    <div key={stepIndex as number} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <span className="bg-slate-200 text-slate-700 font-bold text-xs px-2 py-1 rounded">
                            {customTitle || stepTitle}
                          </span>
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            {taskType === 'call' ? <><i className="fa-solid fa-phone"></i> Beltaak</> : 
                             taskType === 'send_card' ? <><i className="fa-solid fa-envelope-open-text"></i> Kaartje Sturen</> : 
                             <><i className="fa-solid fa-check-double"></i> Handmatige Check</>}
                          </span>
                        </div>
                        <button 
                          onClick={() => setEditingStep({ pipeline_name: pipeline, step_index: stepIndex, custom_title: customTitle || "", task_type: taskType })}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-primary-300 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          <i className="fa-solid fa-pen mr-1"></i> Bewerk Stap
                        </button>
                      </div>

                      <div className="space-y-3 pl-4 border-l-2 border-slate-100">
                        {stepTemplates.filter(t => t.action_type === 'niet_opgenomen' || t.action_type === 'afgerond').map(template => (
                          <div key={template.id} className="flex justify-between items-start bg-white p-4 rounded-xl border border-slate-100">
                            <div className="space-y-3 max-w-xl">
                              <span className="font-bold text-slate-700 uppercase text-xs tracking-wider block">
                                Uitkomst: {template.action_type.replace('_', ' ')}
                              </span>
                              
                              {template.whatsapp_template && (
                                <div className="bg-emerald-50 text-emerald-900 p-3 rounded-lg border border-emerald-100 text-sm flex gap-3">
                                  <i className="fa-brands fa-whatsapp text-emerald-500 mt-0.5"></i>
                                  <span>{template.whatsapp_template}</span>
                                </div>
                              )}
                              {template.email_template && (
                                <div className="bg-blue-50 text-blue-900 p-3 rounded-lg border border-blue-100 text-sm flex gap-3">
                                  <i className="fa-regular fa-envelope text-blue-500 mt-0.5"></i>
                                  <span>{template.email_template}</span>
                                </div>
                              )}
                              {(!template.whatsapp_template && !template.email_template) && (
                                <p className="text-xs text-slate-400 italic">Geen automatische actie ingesteld.</p>
                              )}
                            </div>
                            <button 
                              onClick={() => {
                                setEditingTemplate(template);
                                setSelectedWaTemplateName(template.whatsapp_template || "");
                                setVariableMapping(template.variable_mapping || {});
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                            >
                              Template instellen
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          );
        })}

      </div>

      {/* Step Edit Modal (Name & Type) */}
      {editingStep && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" onClick={() => !isPending && setEditingStep(null)}></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-lg p-6">
            <h3 className="font-bold text-xl text-slate-900 mb-2">Stap Bewerken</h3>
            <p className="text-slate-500 text-sm mb-6">{editingStep.pipeline_name} - Stap {editingStep.step_index}</p>
            
            <form action={(formData) => {
              const newType = formData.get("task_type") as "call" | "send_card" | "manual_check";
              const newTitle = formData.get("custom_title") as string;
              
              const isTypeChanged = newType !== editingStep.task_type;
              if (isTypeChanged) {
                const confirmChange = window.confirm("Let op: Als je het taaktype wijzigt, worden de huidige uitkomsten en templates voor deze stap gereset. Weet je het zeker?");
                if (!confirmChange) return;
              }

              startTransition(async () => {
                const res = await changeTaskType(editingStep.pipeline_name, editingStep.step_index, newType, newTitle);
                if (res.success) {
                  window.location.reload(); // Quick refresh to get new templates array from server
                }
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-pen text-slate-400"></i> Naam van deze taak
                </label>
                <input 
                  name="custom_title"
                  defaultValue={editingStep.custom_title}
                  placeholder={`Bijv. Stap ${editingStep.step_index}`}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-primary focus:border-primary bg-white text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-list-check text-slate-400"></i> Soort Taak
                </label>
                <select 
                  name="task_type"
                  defaultValue={editingStep.task_type}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-primary focus:border-primary bg-white text-slate-700"
                >
                  <option value="call">Beltaak (Niet opgenomen)</option>
                  <option value="send_card">Kaartje sturen (Afgerond)</option>
                  <option value="manual_check">Handmatige Check (Afgerond)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Let op: type wijzigen verwijdert huidige ingestelde templates voor deze stap.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingStep(null)}
                  disabled={isPending}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Annuleren
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending ? <i className="fa-solid fa-spinner fa-spin"></i> : "Opslaan"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Template Edit Modal (Whatsapp/Email) */}
      {editingTemplate && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" onClick={() => setEditingTemplate(null)}></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-lg p-6">
            <h3 className="font-bold text-xl text-slate-900 mb-2">Actie Instellen</h3>
            <p className="text-slate-500 text-sm mb-6">Uitkomst: {editingTemplate.action_type.replace('_', ' ')}</p>
            
            <form action={async (formData) => {
              const res = await saveTemplate(editingTemplate.id, {
                custom_title: editingTemplate.custom_title, // Keep existing title
                whatsapp_template: selectedWaTemplateName,
                email_template: formData.get("email") as string,
                variable_mapping: variableMapping
              });
              if (res.success) {
                setTemplates(templates.map(t => t.id === editingTemplate.id ? { 
                  ...t, 
                  whatsapp_template: selectedWaTemplateName, 
                  email_template: formData.get("email"),
                  variable_mapping: variableMapping
                } : t));
                setEditingTemplate(null);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <i className="fa-brands fa-whatsapp text-emerald-500"></i> WhatsApp Template (Meta)
                </label>
                <select 
                  name="whatsapp"
                  value={selectedWaTemplateName}
                  onChange={(e) => {
                    setSelectedWaTemplateName(e.target.value);
                    setVariableMapping({});
                  }}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-primary focus:border-primary bg-white text-slate-700"
                >
                  <option value="">Geen WhatsApp versturen</option>
                  {waTemplates.map(t => (
                    <option key={t.name} value={t.name}>{t.name} ({t.language})</option>
                  ))}
                </select>
              </div>

              {selectedWaTemplateName && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  {waTemplates.find(t => t.name === selectedWaTemplateName)?.components.filter((c: any) => c.type === "BODY").map((c: any, i: number) => (
                    <div key={i} className="bg-emerald-50 text-emerald-900 p-3 rounded-lg border border-emerald-200 text-sm italic shadow-sm">
                      "{c.text}"
                    </div>
                  ))}
                  
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase">Variabelen koppelen</h4>
                  {waTemplates.find(t => t.name === selectedWaTemplateName)?.components.map((c: any) => {
                    if (c.type === "BODY") {
                      const text = c.text;
                      const variableMatches = [...text.matchAll(/\{\{([^}]+)\}\}/g)];
                      
                      if (variableMatches.length > 0) {
                        return variableMatches.map((match, i) => {
                          const varName = match[1];
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-sm font-bold text-slate-700 w-24">{'{{' + varName + '}}'}</span>
                              <i className="fa-solid fa-arrow-right text-slate-300"></i>
                              <select 
                                required
                                value={variableMapping[varName] || ""}
                                onChange={(e) => setVariableMapping({...variableMapping, [varName]: e.target.value})}
                                className="flex-1 text-sm border border-slate-200 rounded p-1.5"
                              >
                                <option value="">Selecteer patiëntveld...</option>
                                <option value="first_name">Voornaam</option>
                                <option value="full_name">Volledige Naam</option>
                                <option value="phone">Telefoonnummer</option>
                                <option value="email">E-mailadres</option>
                                <option value="location">Locatie (Vestiging)</option>
                                <option value="therapist_id">Naam Behandelaar</option>
                              </select>
                            </div>
                          );
                        });
                      }
                    }
                    return null;
                  })}
                  {!waTemplates.find(t => t.name === selectedWaTemplateName)?.components.some((c: any) => c.text?.match(/\{\{([^}]+)\}\}/)) && (
                    <p className="text-xs text-slate-400 italic">Deze template bevat geen variabelen.</p>
                  )}
                </div>
              </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuleren
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Opslaan
                </button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
}
