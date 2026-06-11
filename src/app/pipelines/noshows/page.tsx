export default function NoShowsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">No-shows & Zieken Opvolging</h3>
          <p className="text-xs text-slate-500">Volg cliënten op die hun afspraak hebben gemist of wegens ziekte hebben geannuleerd.</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden min-h-[400px] flex items-center justify-center text-slate-400">
          No-shows content komt hier
        </div>
      </div>
    </div>
  );
}
