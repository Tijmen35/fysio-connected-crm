"use client";

import { useState, useTransition } from "react";
import { useModalStore } from "@/store/modalStore";
import { createPatient } from "@/app/actions/patient";

export function NewPatientModal() {
  const { isNewPatientModalOpen, closeNewPatientModal } = useModalStore();
  const [pipeline, setPipeline] = useState("leadopvolging");
  const [klacht, setKlacht] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isNewPatientModalOpen) return null;

  async function handleSubmit(formData: FormData) {
    formData.append("pipeline", pipeline);
    startTransition(async () => {
      const result = await createPatient(formData);
      if (result.success) {
        closeNewPatientModal();
        // Here we could add a toast notification
      } else {
        alert("Fout bij opslaan");
      }
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[75] transition-opacity"
        onClick={closeNewPatientModal}
      ></div>

      {/* Modal */}
      <form action={handleSubmit} className="fixed inset-y-0 right-0 z-[80] w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-slate-100 flex flex-col translate-x-0">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary-700 flex items-center justify-center font-bold text-lg">
              <i className="fa-solid fa-user-plus"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Nieuwe Patiënt</h3>
              <p className="text-xs text-slate-500 font-semibold">Start workflow & pijplijn</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeNewPatientModal}
            className="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Patiënt Gegevens</h4>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500">Volledige Naam</label>
              <input
                type="text"
                name="name"
                placeholder="Naam patiënt"
                required
                className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500">
                Telefoonnummer <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="06 12345678"
                required
                className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500">E-mailadres</label>
              <input
                type="email"
                name="email"
                placeholder="naam@email.nl"
                className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500">Locatie</label>
                <select name="location" className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold">
                  <option value="Fysio Barendrecht">Fysio Barendrecht</option>
                  <option value="Fysio Rhoon">Fysio Rhoon</option>
                  <option value="Fysio Hoefslag">Fysio Hoefslag</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500">Behandelaar</label>
                <select name="assigned_to" className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2">
                  <option value="Chris (Fysio)">Chris (Fysio)</option>
                  <option value="Sanne (Fysio)">Sanne (Fysio)</option>
                  <option value="Emma (Fysio)">Emma (Fysio)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500">Primaire Klacht</label>
              <select
                name="klacht"
                className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold"
                value={klacht}
                onChange={(e) => setKlacht(e.target.value)}
              >
                <option value="" disabled>Selecteer een klacht...</option>
                <option value="Rugklachten">Rugklachten</option>
                <option value="Nek- en schouderklachten">Nek- en schouderklachten</option>
                <option value="Knieklachten">Knieklachten</option>
                <option value="Heupklachten">Heupklachten</option>
                <option value="Sportblessure">Sportblessure</option>
                <option value="Revalidatie na operatie">Revalidatie na operatie</option>
                <option value="Anders">Anders, namelijk...</option>
              </select>
            </div>

            {klacht === "Anders" && (
              <div className="space-y-1.5">
                <input
                  type="text"
                  name="klacht"
                  placeholder="Specificeer de klacht..."
                  className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary px-3 py-2 font-semibold"
                />
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Kies Workflow Pijplijn</h4>
            <div className="space-y-2">
              <label className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${pipeline === 'leadopvolging' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input
                  type="radio"
                  name="pipeline_radio"
                  value="leadopvolging"
                  checked={pipeline === "leadopvolging"}
                  onChange={(e) => setPipeline(e.target.value)}
                  className="mt-1 text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <span className="text-sm font-bold text-slate-700 block">Leadopvolging</span>
                  <span className="text-[10px] text-slate-500">Start 5 belmomenten (Dag 1,2,3,10,14)</span>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${pipeline === 'noshows' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input
                  type="radio"
                  name="pipeline_radio"
                  value="noshows"
                  checked={pipeline === "noshows"}
                  onChange={(e) => setPipeline(e.target.value)}
                  className="mt-1 text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <span className="text-sm font-bold text-slate-700 block">No-shows & Zieken</span>
                  <span className="text-[10px] text-slate-500">Plan over 7 dagen een nieuwe afspraak in.</span>
                </div>
              </label>

              {pipeline === "noshows" && (
                <div className="pl-8 pr-3 pb-3">
                  <input
                    type="text"
                    name="pipeline_context"
                    placeholder="Specificeer reden afwezigheid..."
                    className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-primary focus:border-primary px-3 py-2"
                  />
                </div>
              )}

              <label className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${pipeline === 'nazorg' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input
                  type="radio"
                  name="pipeline_radio"
                  value="nazorg"
                  checked={pipeline === "nazorg"}
                  onChange={(e) => setPipeline(e.target.value)}
                  className="mt-1 text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <span className="text-sm font-bold text-slate-700 block">Nazorg (Uitbehandeld)</span>
                  <span className="text-[10px] text-slate-500">Mails (dag 5), kaartje (week 2), checks (3m, 12m)</span>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${pipeline === 'fysiofit' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input
                  type="radio"
                  name="pipeline_radio"
                  value="fysiofit"
                  checked={pipeline === "fysiofit"}
                  onChange={(e) => setPipeline(e.target.value)}
                  className="mt-1 text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <span className="text-sm font-bold text-slate-700 block">Nazorg (Gezondheidsdoel + FysioFit)</span>
                  <span className="text-[10px] text-slate-500">Inclusief up-sell telefoontje voor FysioFit</span>
                </div>
              </label>

              {pipeline === "fysiofit" && (
                <div className="pl-8 pr-3 pb-3">
                  <input
                    type="text"
                    name="pipeline_context"
                    placeholder="Specificeer gezondheidsdoel..."
                    className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-primary focus:border-primary px-3 py-2"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <button
            type="button"
            className="flex-1 py-2.5 text-sm font-bold rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
            onClick={closeNewPatientModal}
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-2.5 text-sm font-bold rounded-xl text-slate-900 bg-primary hover:bg-primary-light transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isPending ? "Bezig..." : "Start Workflow"}
          </button>
        </div>
      </form>
    </>
  );
}
