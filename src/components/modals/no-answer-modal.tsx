"use client";

import { useModalStore } from "@/store/modalStore";
import { useTransition } from "react";
import { advanceWorkflow } from "@/app/actions/task";

export function NoAnswerModal() {
  const { isNoAnswerModalOpen, closeNoAnswerModal, activeTaskId, activePatientName, activePreviewText } = useModalStore();
  const [isPending, startTransition] = useTransition();

  if (!isNoAnswerModalOpen) return null;

  function handleSend() {
    if (!activeTaskId) return;
    startTransition(async () => {
      const result = await advanceWorkflow(activeTaskId, "niet_opgenomen");
      if (result.success) {
        useModalStore.getState().setLastCompletedTaskId(activeTaskId);
        closeNoAnswerModal();
      } else {
        alert("Fout bij opslaan");
      }
    });
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[65]"
        onClick={closeNoAnswerModal}
      ></div>

      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[70] w-full max-w-sm">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto text-2xl mb-2">
            <i className="fa-solid fa-paper-plane"></i>
          </div>
          <h3 className="font-bold text-slate-900 text-xl">WhatsApp versturen?</h3>
          <p className="text-sm text-slate-500">
            {activePatientName} nam niet op. Er wordt nu automatisch een WhatsApp verstuurd om een afspraak te plannen en de taak schuift door.
          </p>
          
          {activePreviewText && (
            <div className="bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-200 text-sm italic shadow-sm text-left">
              "{activePreviewText}"
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button 
              onClick={closeNoAnswerModal}
              className="flex-1 py-2.5 text-sm font-bold rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Annuleren
            </button>
            <button 
              onClick={handleSend}
              disabled={isPending}
              className="flex-1 py-2.5 text-sm font-bold rounded-xl text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isPending ? "Bezig..." : "Versturen"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
