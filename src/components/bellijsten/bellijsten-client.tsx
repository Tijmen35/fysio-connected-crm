"use client";

import { useState, useTransition, useRef, useMemo } from "react";
import { importBellijst, updateBellijstContactStatus, updateBellijstContactAttempts, deleteBellijstList } from "@/app/actions/bellijst";

export function BellijstenClient({ initialContacts }: { initialContacts: any[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedList, setSelectedList] = useState<string | null>(null);

  const [callingMode, setCallingMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [listTag, setListTag] = useState("");
  const [belscript, setBelscript] = useState("");

  const listGroups = useMemo(() => {
    const groups: Record<string, { name: string, contacts: any[], total: number, called: number, script: string }> = {};
    
    contacts.forEach(c => {
      if (!groups[c.list_name]) {
        groups[c.list_name] = {
          name: c.list_name,
          contacts: [],
          total: 0,
          called: 0,
          script: c.notes || ""
        };
      }
      
      groups[c.list_name].contacts.push(c);
      groups[c.list_name].total += 1;
      
      const isFinished = c.status === "geen_interesse" || c.status === "afspraak_gemaakt" || c.status === "niet_opgenomen_definitief";
      if (isFinished) {
        groups[c.list_name].called += 1;
      }
    });

    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [contacts]);

  const activeGroup = selectedList ? listGroups.find(g => g.name === selectedList) : null;

  const activeContacts = useMemo(() => {
    if (!activeGroup) return [];
    return [...activeGroup.contacts].sort((a, b) => {
      const aFinished = a.status === "geen_interesse" || a.status === "afspraak_gemaakt" || a.status === "niet_opgenomen_definitief";
      const bFinished = b.status === "geen_interesse" || b.status === "afspraak_gemaakt" || b.status === "niet_opgenomen_definitief";
      if (!aFinished && bFinished) return -1;
      if (aFinished && !bFinished) return 1;
      return 0;
    });
  }, [activeGroup]);

  const uncalledContacts = activeContacts.filter(c => c.status !== "geen_interesse" && c.status !== "afspraak_gemaakt" && c.status !== "niet_opgenomen_definitief");

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setCsvText(event.target?.result as string);
    reader.readAsText(file);
  }

  function downloadExampleCsv() {
    const csvContent = "Naam,Telefoonnummer,E-mail,Locatie\nJan Jansen,0612345678,jan@voorbeeld.nl,Fysio Barendrecht\nPieter Post,0687654321,pieter@voorbeeld.nl,Fysio Rhoon";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "voorbeeld_bellijst.csv");
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
        window.location.reload(); 
      } else {
        alert("Fout bij importeren: " + res.error);
      }
    });
  }

  function handleDeleteList() {
    if (!selectedList) return;
    if (window.confirm("Weet je zeker dat je deze hele lijst (en alle contacten erin) wilt verwijderen? Dit kan niet ongedaan worden gemaakt.")) {
      startTransition(async () => {
        const res = await deleteBellijstList(selectedList);
        if (res.success) {
          setSelectedList(null);
          window.location.reload();
        } else {
          alert("Fout bij verwijderen: " + res.error);
        }
      });
    }
  }

  function startCalling() {
    if (uncalledContacts.length === 0) return alert("Geen overgebleven contacten in deze lijst!");
    setCallingMode(true);
    setCurrentIndex(0);
  }

  function nextContact() {
    const nextIdx = currentIndex + 1;
    if (nextIdx < uncalledContacts.length) {
      setCurrentIndex(nextIdx);
    } else {
      alert("Je bent aan het einde van de bellijst!");
      setCallingMode(false);
      window.location.reload();
    }
  }

  async function handleNietOpgenomen(id: string, currentAttempts: number) {
    const newAttempts = currentAttempts + 1;
    const newStatus = newAttempts >= 2 ? "niet_opgenomen_definitief" : "open";
    
    // Optimistic UI
    setContacts(prev => prev.map(c => c.id === id ? { ...c, attempts: newAttempts, status: newStatus } : c));
    nextContact();

    startTransition(async () => {
      await updateBellijstContactAttempts(id, newAttempts, newStatus);
    });
  }

  async function handleStatusUpdate(id: string, newStatus: string) {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    nextContact();

    startTransition(async () => {
      await updateBellijstContactStatus(id, newStatus);
    });
  }

  if (!selectedList) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 h-[calc(100vh-4rem)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Bellijsten Overzicht</h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">Beheer al je actieve bellijsten gescheiden van je patiënten database</p>
          </div>
          <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-light text-slate-900 text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95">
            <i className="fa-solid fa-plus"></i> Nieuwe Lijst Importeren
          </button>
        </div>

        {listGroups.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl text-slate-300 mb-4">
              <i className="fa-solid fa-folder-open"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Nog geen bellijsten</h3>
            <p className="text-slate-500 max-w-sm mb-6">Importeer een CSV of Excel bestand om je eerste bellijst aan te maken.</p>
            <button onClick={() => setIsImportModalOpen(true)} className="px-6 py-2 bg-primary hover:bg-primary-light text-slate-900 text-sm font-bold rounded-xl shadow-sm">Lijst Importeren</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listGroups.map((group) => {
              const progressPct = group.total > 0 ? Math.round((group.called / group.total) * 100) : 0;
              return (
                <div key={group.name} onClick={() => setSelectedList(group.name)} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary-700 flex items-center justify-center text-lg">
                      <i className="fa-solid fa-list-check"></i>
                    </div>
                    {progressPct === 100 && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded uppercase">Afgewerkt</span>}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">{group.name}</h3>
                  <p className="text-sm text-slate-500 mb-6 font-medium">{group.called} van {group.total} afgerond</p>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                    <div className={`h-2.5 rounded-full transition-all duration-500 ${progressPct === 100 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${progressPct}%` }}></div>
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

        {isImportModalOpen && <ImportModal />}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <button onClick={() => { setSelectedList(null); setCallingMode(false); }} className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-colors mb-4">
          <i className="fa-solid fa-arrow-left"></i> Terug naar overzicht
        </button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{activeGroup?.name}</h2>
              <span className="bg-primary/20 text-primary-800 text-xs font-bold px-2.5 py-1 rounded-lg">{activeGroup?.total} personen</span>
            </div>
            <p className="text-sm font-semibold text-slate-500 mt-1">Voortgang: {activeGroup?.called} afgerond / {activeGroup?.total} totaal</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleDeleteList} disabled={isPending} className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-all shadow-sm">
               <i className="fa-solid fa-trash"></i> Verwijder Lijst
            </button>
            <button onClick={startCalling} disabled={uncalledContacts.length === 0} className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-light text-slate-900 text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50">
              <i className="fa-solid fa-headset"></i> Start Bellen ({uncalledContacts.length})
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3"><i className="fa-solid fa-scroll text-primary"></i> Belscript</h3>
        <div className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          {activeGroup?.script || <span className="italic text-slate-400">Geen script ingesteld voor deze lijst.</span>}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Naam</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Telefoonnummer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Pogingen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeContacts.map((c) => {
                const isFinished = c.status === "geen_interesse" || c.status === "afspraak_gemaakt" || c.status === "niet_opgenomen_definitief";
                const uncalledIdx = uncalledContacts.findIndex(x => x.id === c.id);
                const isCurrentCalling = callingMode && uncalledIdx === currentIndex && !isFinished;

                return (
                  <tr key={c.id} className={`transition-colors ${isFinished ? 'bg-slate-50/50 opacity-70' : 'hover:bg-slate-50'} ${isCurrentCalling ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}>
                    <td className="px-6 py-4 font-bold text-slate-800">{c.name}</td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{c.phone || "-"}</td>
                    <td className="px-6 py-4">
                      {isFinished ? (
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase ${
                          c.status === 'afspraak_gemaakt' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          c.status === 'geen_interesse' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {c.status.replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-200 uppercase">
                          Nog bellen
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-400">{c.attempts} / 2</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {callingMode && uncalledContacts[currentIndex] && (
        <CallingModal contact={uncalledContacts[currentIndex]} />
      )}
      {isImportModalOpen && <ImportModal />}
    </div>
  );

  function CallingModal({ contact }: { contact: any }) {
    const [showOpgenomenOptions, setShowOpgenomenOptions] = useState(false);

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
          <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Beltaak ({currentIndex + 1} van {uncalledContacts.length})</span>
              <h2 className="text-2xl font-bold">{contact.name}</h2>
            </div>
            <button onClick={() => setCallingMode(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="p-8 flex-1 flex flex-col gap-6">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-primary/20 text-primary-700 rounded-full flex items-center justify-center text-2xl">
                <i className="fa-solid fa-phone-volume"></i>
              </div>
              <p className="text-3xl font-black text-slate-800 tracking-tight">{contact.phone || "Geen nummer"}</p>
              {contact.email && <p className="text-sm font-semibold text-slate-500"><i className="fa-regular fa-envelope"></i> {contact.email}</p>}
            </div>

            <div className="flex flex-col gap-3">
              {!showOpgenomenOptions ? (
                <>
                  <button 
                    onClick={() => setShowOpgenomenOptions(true)}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-2xl shadow-sm transition-all"
                  >
                    <i className="fa-solid fa-check mr-2"></i> Opgenomen
                  </button>
                  <button 
                    onClick={() => handleNietOpgenomen(contact.id, contact.attempts)}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-2xl shadow-sm transition-all"
                  >
                    <i className="fa-solid fa-phone-slash mr-2"></i> Niet Opgenomen (Poging {contact.attempts + 1})
                  </button>
                </>
              ) : (
                <div className="animate-in slide-in-from-right-4">
                  <p className="text-center font-bold text-slate-500 mb-4 uppercase tracking-wider text-xs">Resultaat van het gesprek</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleStatusUpdate(contact.id, "afspraak_gemaakt")}
                      className="py-6 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-2xl shadow-sm transition-all flex flex-col items-center gap-2"
                    >
                      <i className="fa-solid fa-calendar-check text-2xl"></i> Afspraak Gemaakt
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(contact.id, "geen_interesse")}
                      className="py-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-2xl shadow-sm transition-all flex flex-col items-center gap-2"
                    >
                      <i className="fa-solid fa-user-xmark text-2xl"></i> Geen Interesse
                    </button>
                  </div>
                  <button 
                    onClick={() => setShowOpgenomenOptions(false)}
                    className="w-full mt-4 py-3 text-slate-400 hover:text-slate-600 font-bold text-sm"
                  >
                    <i className="fa-solid fa-arrow-left"></i> Terug
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              Upload een CSV met <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 mt-2 inline-block">Naam, Telefoon, E-mail, Locatie</code>. Deze komen in de geïsoleerde wachtkamer.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">1. Voorbeeld CSV</label>
                <button onClick={downloadExampleCsv} className="text-xs font-bold text-primary hover:text-primary-light">Download Voorbeeld</button>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">2. Lijst Naam</label>
                <input type="text" value={listTag} onChange={(e) => setListTag(e.target.value)} placeholder="Bijv. 'Steunzolen Q3'" className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2.5 font-semibold"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">3. Belscript</label>
                <textarea value={belscript} onChange={(e) => setBelscript(e.target.value)} className="w-full h-24 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2.5"></textarea>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">4. Upload Bestand</label>
                <input type="file" accept=".csv,.txt" ref={fileInputRef} onChange={handleFileUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary-700 cursor-pointer"/>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
            <button onClick={() => setIsImportModalOpen(false)} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">Annuleren</button>
            <button onClick={submitImport} disabled={isPending || !csvText} className="flex-1 py-2.5 bg-primary hover:bg-primary-light text-slate-900 font-bold rounded-xl disabled:opacity-50 transition-colors">Importeer {csvText ? "Nu" : "..."}</button>
          </div>
        </div>
      </div>
    );
  }
}
