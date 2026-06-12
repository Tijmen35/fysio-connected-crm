"use client";

import { useModalStore } from "@/store/modalStore";
import { useState, useTransition } from "react";
import { advanceWorkflow } from "@/app/actions/task";
import { useRouter } from "next/navigation";

export function CallOutcomeModal() {
  const { isCallOutcomeModalOpen, closeCallOutcomeModal, activeTaskId, activePatientName } = useModalStore();
  const [outcome, setOutcome] = useState("afspraak");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isCallOutcomeModalOpen) return null;

  function handleSubmit(formData: FormData) {
    if (!activeTaskId) return;
    const rawDate = formData.get("scheduleDate") as string | undefined;
    const rawTime = formData.get("scheduleTime") as string | undefined;
    const notes = formData.get("notes") as string | undefined;
    const lostReason = formData.get("lostReason") as string | undefined;
    
    let combinedDateTime: string | undefined = undefined;
    if (rawDate && rawTime) {
      combinedDateTime = new Date(`${rawDate}T${rawTime}`).toISOString();
    }

    startTransition(async () => {
      const result = await advanceWorkflow(activeTaskId, outcome, combinedDateTime, notes, lostReason);
      if (result.success) {
        useModalStore.getState().setLastCompletedTaskId(activeTaskId);
        closeCallOutcomeModal();
        router.refresh();
      } else {
        alert("Fout bij opslaan");
      }
    });
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[65]"
        onClick={closeCallOutcomeModal}
      ></div>

      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[70] w-full max-w-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-lg">Uitkomst Gesprek</h3>
          <button onClick={closeCallOutcomeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        <form action={handleSubmit} className="p-6">
          <p className="text-sm text-slate-500 mb-4">
            Wat was de uitkomst van het gesprek met <strong className="text-slate-700">{activePatientName}</strong>?
          </p>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input 
                type="radio" 
                name="call-outcome" 
                value="afspraak"
                checked={outcome === "afspraak"}
                onChange={() => setOutcome("afspraak")}
                className="text-primary focus:ring-primary h-4 w-4" 
              />
              <span className="text-sm font-bold text-slate-700">Afspraak ingepland</span>
            </label>
            <label className="flex flex-col gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="call-outcome" 
                  value="afwijzing"
                  checked={outcome === "afwijzing"}
                  onChange={() => setOutcome("afwijzing")}
                  className="text-primary focus:ring-primary h-4 w-4" 
                />
                <span className="text-sm font-bold text-slate-700">Afwijzing / Geen interesse</span>
              </div>
              
              {outcome === "afwijzing" && (
                <div className="pl-7 pr-1 pb-1 animate-in slide-in-from-top-2 fade-in duration-200">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Reden</label>
                  <select 
                    name="lostReason"
                    required={outcome === "afwijzing"}
                    className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold shadow-sm"
                  >
                    <option value="">Selecteer een reden...</option>
                    <option value="Al elders onder behandeling">Al elders onder behandeling</option>
                    <option value="Geen interesse">Geen interesse</option>
                    <option value="Geen tijd">Geen tijd</option>
                    <option value="Geen contact te krijgen">Geen contact te krijgen</option>
                  </select>
                </div>
              )}
            </label>
            <label className="flex flex-col gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="call-outcome" 
                  value="terugbellen"
                  checked={outcome === "terugbellen"}
                  onChange={() => setOutcome("terugbellen")}
                  className="text-primary focus:ring-primary h-4 w-4" 
                />
                <span className="text-sm font-bold text-slate-700">Later terugbellen</span>
              </div>
              
              {outcome === "terugbellen" && (
                <div className="pl-7 pr-1 pb-1 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Datum</label>
                      <input 
                        type="date" 
                        name="scheduleDate"
                        required={outcome === "terugbellen"}
                        className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold shadow-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Tijd</label>
                      <select 
                        name="scheduleTime"
                        required={outcome === "terugbellen"}
                        className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold shadow-sm"
                      >
                        {Array.from({ length: 11 * 4 }).map((_, i) => {
                          const hour = 8 + Math.floor(i / 4);
                          const minute = (i % 4) * 15;
                          const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                          return <option key={timeStr} value={timeStr}>{timeStr}</option>;
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </label>
          </div>
          
          <div className="mt-4">
            <label className="text-xs font-bold text-slate-700 mb-1 block">Gespreksnotitie</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Schrijf hier eventuele opmerkingen of details over het gesprek..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:bg-white focus:ring-primary focus:border-primary px-3 py-2 placeholder-slate-400 resize-none shadow-inner"
            ></textarea>
          </div>

          <button 
            type="submit"
            disabled={isPending}
            className="w-full mt-6 py-2.5 bg-primary hover:bg-primary-light text-slate-900 font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isPending ? "Bezig..." : "Opslaan"}
          </button>
        </form>
      </div>
    </>
  );
}
