import { create } from "zustand";

interface ModalState {
  isNewPatientModalOpen: boolean;
  openNewPatientModal: () => void;
  closeNewPatientModal: () => void;

  activeTaskId: string | null;
  activePatientName: string | null;
  activePreviewText?: string | null;
  lastCompletedTaskId: string | null;

  isCallOutcomeModalOpen: boolean;
  openCallOutcomeModal: (taskId: string, patientName: string) => void;
  closeCallOutcomeModal: () => void;

  isNoAnswerModalOpen: boolean;
  openNoAnswerModal: (taskId: string, patientName: string, previewText?: string) => void;
  closeNoAnswerModal: () => void;
  setLastCompletedTaskId: (taskId: string | null) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isNewPatientModalOpen: false,
  openNewPatientModal: () => set({ isNewPatientModalOpen: true }),
  closeNewPatientModal: () => set({ isNewPatientModalOpen: false }),

  activeTaskId: null,
  activePatientName: null,
  activePreviewText: null,
  lastCompletedTaskId: null,

  isCallOutcomeModalOpen: false,
  openCallOutcomeModal: (taskId, patientName) => set({ isCallOutcomeModalOpen: true, activeTaskId: taskId, activePatientName: patientName }),
  closeCallOutcomeModal: () => set({ isCallOutcomeModalOpen: false, activeTaskId: null, activePatientName: null }),

  isNoAnswerModalOpen: false,
  openNoAnswerModal: (taskId, patientName, previewText) => set({ isNoAnswerModalOpen: true, activeTaskId: taskId, activePatientName: patientName, activePreviewText: previewText }),
  closeNoAnswerModal: () => set({ isNoAnswerModalOpen: false, activeTaskId: null, activePatientName: null, activePreviewText: null }),
  setLastCompletedTaskId: (taskId) => set({ lastCompletedTaskId: taskId }),
}));
