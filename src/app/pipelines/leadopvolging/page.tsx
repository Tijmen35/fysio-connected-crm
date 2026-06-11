export default function LeadopvolgingPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Leadopvolging Pipeline</h3>
            <p className="text-xs text-slate-500">Sleep leads tussen de kolommen of gebruik de actieknoppen.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4 items-start min-h-[400px]">
          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 min-w-[250px] space-y-4">
             <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-sm text-slate-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    Nieuwe Lead
                </span>
             </div>
             <div className="text-center text-xs text-slate-400 py-10">Geen leads</div>
          </div>
          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 min-w-[250px] space-y-4">
             <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-sm text-slate-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    Contact Gehad
                </span>
             </div>
             <div className="text-center text-xs text-slate-400 py-10">Geen leads</div>
          </div>
          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 min-w-[250px] space-y-4">
             <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-sm text-slate-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    Intake Gepland
                </span>
             </div>
             <div className="text-center text-xs text-slate-400 py-10">Geen leads</div>
          </div>
          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 min-w-[250px] space-y-4 opacity-70">
             <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-sm text-slate-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Patiënt Gewonnen
                </span>
             </div>
             <div className="text-center text-xs text-slate-400 py-10">Geen leads</div>
          </div>
        </div>
      </div>
    </div>
  );
}
