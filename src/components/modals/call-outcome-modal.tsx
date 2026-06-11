"use client";

import { useModalStore } from "@/store/modalStore";
import { useState, useTransition } from "react";
import { advanceWorkflow } from "@/app/actions/task";

export function CallOutcomeModal() {
  const { isCallOutcomeModalOpen, closeCallOutcomeModal, activeTaskId, activePatientName } = useModalStore();
  const [outcome, setOutcome] = useState("afspraak");
  const [isPending, startTransition] = useTransition();

  if (!isCallOutcomeModalOpen) return null;

  function handleSubmit(formData: FormData) {
    if (!activeTaskId) return;
    const scheduleDate = formData.get("scheduleDate") as string | undefined;

    startTransition(async () => {
      const result = await advanceWorkflow(activeTaskId, outcome, scheduleDate);
      if (result.success) {
        useModalStore.getState().setLastCompletedTaskId(activeTaskId);
        closeCallOutcomeModal();
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
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input 
                type="radio" 
                name="call-outcome" 
                value="afwijzing"
                checked={outcome === "afwijzing"}
                onChange={() => setOutcome("afwijzing")}
                className="text-primary focus:ring-primary h-4 w-4" 
              />
              <span className="text-sm font-bold text-slate-700">Afwijzing / Geen interesse</span>
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
                <div className="pl-7 pr-1 pb-1 space-y-1.5 animate-in slide-in-from-top-2 fade-in duration-200">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kies datum & tijd</label>
                  <input 
                    type="datetime-local" 
                    name="scheduleDate"
                    required={outcome === "terugbellen"}
                    className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold shadow-sm"
                  />
                </div>
              )}
            </label>
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
