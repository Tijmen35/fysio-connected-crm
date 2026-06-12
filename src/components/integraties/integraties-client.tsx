"use client";

import { useState, useTransition } from "react";
import { createWebhookConfig, deleteWebhookConfig, updateWebhookConfig } from "@/app/actions/integrations";

const INTEGRATIONS = [
  {
    id: "webflow",
    name: "Webflow Forms",
    description: "Koppel formulieren van je Webflow website direct aan dit CRM.",
    icon: "fa-solid fa-earth-americas",
    color: "text-blue-500",
    bg: "bg-blue-50",
    status: "active"
  },
  {
    id: "facebook",
    name: "Facebook Lead Ads",
    description: "Ontvang leads uit Facebook en Instagram advertenties realtime.",
    icon: "fa-brands fa-meta",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    status: "active"
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Stuur geautomatiseerde nieuwsbrieven en nazorg-mails.",
    icon: "fa-brands fa-mailchimp",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    status: "coming_soon"
  }
];

export function IntegratiesClient({ webhookConfigs = [], pipelines = [] }: { webhookConfigs?: any[], pipelines?: any[] }) {
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Create Webhook state
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<{
    name: string;
    pipeline_id: string;
    field_mapping: {
      full_name: string;
      phone: string;
      email: string;
      location: string;
      primary_complaint: string;
      _static_location?: string;
    }
  }>({
    name: "",
    pipeline_id: pipelines.length > 0 ? pipelines[0].id : "",
    field_mapping: {
      full_name: "name",
      phone: "phone",
      email: "email",
      location: "",
      primary_complaint: "",
      _static_location: ""
    }
  });

  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/${selectedIntegration?.id}` : '';

  function handleCopy(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleCreate() {
    startTransition(async () => {
      let res;
      if (editingId) {
        res = await updateWebhookConfig(editingId, {
          name: formData.name,
          pipeline_id: formData.pipeline_id,
          field_mapping: formData.field_mapping as any
        });
      } else {
        res = await createWebhookConfig({
          provider: selectedIntegration.id,
          name: formData.name,
          pipeline_id: formData.pipeline_id,
          field_mapping: formData.field_mapping as any
        });
      }

      if (res.success) {
        setIsCreating(false);
        setEditingId(null);
        setFormData({
          name: "",
          pipeline_id: pipelines.length > 0 ? pipelines[0].id : "",
          field_mapping: { full_name: "name", phone: "phone", email: "email", location: "", primary_complaint: "", _static_location: "" }
        });
      } else {
        alert("Fout bij opslaan: " + res.error);
      }
    });
  }

  function handleEdit(config: any) {
    setFormData({
      name: config.name,
      pipeline_id: config.pipeline_id || (pipelines.length > 0 ? pipelines[0].id : ""),
      field_mapping: {
        full_name: config.field_mapping?.full_name || "",
        phone: config.field_mapping?.phone || "",
        email: config.field_mapping?.email || "",
        location: config.field_mapping?.location || "",
        primary_complaint: config.field_mapping?.primary_complaint || "",
        _static_location: config.field_mapping?._static_location || ""
      }
    });
    setEditingId(config.id);
    setIsCreating(true);
  }

  function handleDelete(id: string) {
    if (confirm("Weet je zeker dat je deze koppeling wilt verwijderen?")) {
      startTransition(async () => {
        await deleteWebhookConfig(id);
      });
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 h-[calc(100vh-4rem)]">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Integraties & Webhooks</h2>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          Koppel externe software aan Fysio Connected voor een naadloze datastroom.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INTEGRATIONS.map((integration) => (
          <div key={integration.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card flex flex-col relative overflow-hidden group">
            {integration.status === "coming_soon" && (
              <div className="absolute top-4 right-4 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                Binnenkort
              </div>
            )}
            
            <div className={`w-12 h-12 rounded-xl ${integration.bg} ${integration.color} flex items-center justify-center text-2xl mb-4`}>
              <i className={integration.icon}></i>
            </div>
            
            <h3 className="font-bold text-slate-900 mb-2">{integration.name}</h3>
            <p className="text-sm text-slate-500 mb-6 flex-1">{integration.description}</p>
            
            <button 
              onClick={() => setSelectedIntegration(integration)}
              disabled={integration.status === "coming_soon"}
              className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                integration.status === "coming_soon" 
                  ? "bg-slate-50 text-slate-400 cursor-not-allowed" 
                  : "bg-primary/10 text-primary-800 hover:bg-primary hover:text-slate-900"
              }`}
            >
              {integration.status === "coming_soon" ? "Nog niet beschikbaar" : "Instellingen & Webhook"}
            </button>
          </div>
        ))}
      </div>

      {/* Webhook Modal for Webflow & Facebook */}
      {selectedIntegration && (selectedIntegration.id === "webflow" || selectedIntegration.id === "facebook") && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${selectedIntegration.bg} ${selectedIntegration.color} flex items-center justify-center`}>
                  <i className={selectedIntegration.icon}></i>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{selectedIntegration.name} Instellingen</h3>
              </div>
              <button onClick={() => {
                setSelectedIntegration(null);
                setIsCreating(false);
                setEditingId(null);
              }} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {!isCreating ? (
                <>
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-800">Actieve Koppelingen</h4>
                    <button 
                      onClick={() => {
                        setFormData({
                          name: "",
                          pipeline_id: pipelines.length > 0 ? pipelines[0].id : "",
                          field_mapping: { full_name: "name", phone: "phone", email: "email", location: "", primary_complaint: "", _static_location: "" }
                        });
                        setEditingId(null);
                        setIsCreating(true);
                      }}
                      className="px-4 py-2 bg-primary hover:bg-primary-light text-slate-900 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
                    >
                      <i className="fa-solid fa-plus"></i> Nieuwe Koppeling
                    </button>
                  </div>

                  {webhookConfigs.filter(c => c.provider === selectedIntegration.id).length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-sm text-slate-500">Er zijn nog geen {selectedIntegration.name} koppelingen.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {webhookConfigs.filter(c => c.provider === selectedIntegration.id).map(config => {
                        const url = typeof window !== 'undefined' ? 
                          (selectedIntegration.id === 'facebook' ? `${window.location.origin}/api/webhooks/facebook` : `${window.location.origin}/api/webhooks/${selectedIntegration.id}/${config.id}`) : '';
                        return (
                          <div key={config.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-bold text-slate-800">{config.name}</h5>
                                <p className="text-xs text-slate-500 mt-0.5">Pijplijn: {config.pipeline?.name}</p>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleEdit(config)}
                                  disabled={isPending}
                                  className="text-slate-400 hover:text-slate-600 p-1"
                                  title="Bewerken"
                                >
                                  <i className="fa-solid fa-pen"></i>
                                </button>
                                <button 
                                  onClick={() => handleDelete(config.id)}
                                  disabled={isPending}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Verwijderen"
                                >
                                  <i className="fa-regular fa-trash-can"></i>
                                </button>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 overflow-x-auto">
                                <code className="text-[10px] text-slate-700 whitespace-nowrap select-all">{url}</code>
                              </div>
                              <button 
                                onClick={() => handleCopy(url, config.id)}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition-colors"
                              >
                                {copiedId === config.id ? 'Gekopieerd' : 'Kopieer URL'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                    {editingId ? "Koppeling Bewerken" : "Nieuwe Koppeling Aanmaken"}
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {selectedIntegration?.id === "facebook" ? "Facebook Form ID (verplicht)" : "Naam van formulier/website"}
                      </label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder={selectedIntegration?.id === "facebook" ? "bijv. 1234567890" : "bijv. Knieklachten Formulier"}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Koppel aan pijplijn</label>
                      <select
                        value={formData.pipeline_id}
                        onChange={(e) => setFormData({...formData, pipeline_id: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                      >
                        {pipelines.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <h5 className="font-bold text-slate-800 text-sm mb-3">
                        {selectedIntegration?.id === "facebook" ? "Field Mapping (Meta Veldnamen)" : "Field Mapping (Webflow Veldnamen)"}
                      </h5>
                      <p className="text-xs text-slate-500 mb-4">
                        {selectedIntegration?.id === "facebook" 
                          ? "Vul de exacte veldnamen in zoals ze in je Facebook Lead Formulier staan (bijv. 'full_name' of 'phone_number')." 
                          : "Vul hier de exacte veldnamen in zoals ze vanuit Webflow worden verstuurd (bijv. 'Name-3')."}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Naam (Verplicht)</label>
                          <input 
                            type="text" 
                            value={formData.field_mapping.full_name}
                            onChange={(e) => setFormData({...formData, field_mapping: {...formData.field_mapping, full_name: e.target.value}})}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            placeholder="name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Telefoon (Verplicht)</label>
                          <input 
                            type="text" 
                            value={formData.field_mapping.phone}
                            onChange={(e) => setFormData({...formData, field_mapping: {...formData.field_mapping, phone: e.target.value}})}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            placeholder="phone"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
                          <input 
                            type="text" 
                            value={formData.field_mapping.email}
                            onChange={(e) => setFormData({...formData, field_mapping: {...formData.field_mapping, email: e.target.value}})}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            placeholder="email"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Vaste Locatie</label>
                          <select 
                            value={formData.field_mapping._static_location || ""}
                            onChange={(e) => setFormData({...formData, field_mapping: {...formData.field_mapping, _static_location: e.target.value}})}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                          >
                            <option value="">Geen vaste locatie...</option>
                            <option value="Fysio Barendrecht">Fysio Barendrecht</option>
                            <option value="Fysio Rhoon">Fysio Rhoon</option>
                            <option value="Fysio Hoefslag">Fysio Hoefslag</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Primaire Klacht</label>
                          <input 
                            type="text" 
                            value={formData.field_mapping.primary_complaint}
                            onChange={(e) => setFormData({...formData, field_mapping: {...formData.field_mapping, primary_complaint: e.target.value}})}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            placeholder="complaint"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <button 
                      onClick={() => {
                        setIsCreating(false);
                        setEditingId(null);
                      }}
                      className="px-4 py-2 text-slate-500 font-bold text-sm"
                    >
                      Annuleren
                    </button>
                    <button 
                      onClick={handleCreate}
                      disabled={isPending || !formData.name}
                      className="px-6 py-2 bg-primary hover:bg-primary-light text-slate-900 font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
                    >
                      {isPending ? 'Opslaan...' : (editingId ? 'Wijzigingen Opslaan' : 'Opslaan & Genereer URL')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {selectedIntegration && selectedIntegration.id !== "webflow" && selectedIntegration.id !== "facebook" && (
         <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
           {/* Fallback for other integrations if they ever get active */}
           <div className="bg-white rounded-2xl shadow-2xl p-6">
             Instellingen voor {selectedIntegration.name} komen binnenkort.
             <button onClick={() => setSelectedIntegration(null)} className="block mt-4 text-primary font-bold">Sluiten</button>
           </div>
         </div>
      )}
    </div>
  );
}
