"use client";

import { useState } from "react";

const INTEGRATIONS = [
  {
    id: "webflow",
    name: "Webflow Forms",
    description: "Koppel formulieren van je Webflow website direct aan dit CRM.",
    icon: "fa-brands fa-webflow",
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
    id: "intramed",
    name: "Intramed",
    description: "Synchroniseer patiëntgegevens en afspraken met het EPD.",
    icon: "fa-solid fa-notes-medical",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    status: "coming_soon"
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

export function IntegratiesClient() {
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const webhookUrl = `https://fysioconnected.nl/api/webhook/${selectedIntegration?.id}`;

  function handleCopy() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      {/* Webhook Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${selectedIntegration.bg} ${selectedIntegration.color} flex items-center justify-center`}>
                  <i className={selectedIntegration.icon}></i>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{selectedIntegration.name} Instellingen</h3>
              </div>
              <button onClick={() => setSelectedIntegration(null)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Webhook URL</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Kopieer deze unieke URL en plak deze in de webhook-instellingen van {selectedIntegration.name} of in je Zapier/Make flow.
                </p>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto">
                    <code className="text-xs text-slate-700 whitespace-nowrap select-all">{webhookUrl}</code>
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="h-[42px] px-4 bg-primary hover:bg-primary-light text-slate-900 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shrink-0"
                  >
                    {copied ? <><i className="fa-solid fa-check"></i> Gekopieerd</> : <><i className="fa-regular fa-copy"></i> Kopieer</>}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-circle-info"></i> Documentatie
                </h4>
                <p className="text-xs text-blue-900/80">
                  Zorg ervoor dat de payload in JSON formaat wordt verzonden met op zijn minst de velden <code>full_name</code> en <code>phone</code>. Optioneel kun je <code>email</code> en <code>location</code> meesturen.
                </p>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button 
                onClick={() => setSelectedIntegration(null)}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
