"use client";

import { create } from "zustand";
import type { CidCode, Consultation, DetectedItem, TranscriptionLine } from "@/lib/types";

type IntakeMode = "existing" | "new";

interface NewPatientDraft {
  name: string;
  dateOfBirth: string;
  sex: "M" | "F" | "Other";
  height?: number;
  weight?: number;
  phone?: string;
  condition?: string;
}

interface ConsultationState {
  intakeMode: IntakeMode;
  selectedPatientId: string | null;
  consultationReason: string;
  activeConsultationId: string | null;
  isRecording: boolean;
  recordingSeconds: number;
  liveTranscription: TranscriptionLine[];
  suggestedCids: CidCode[];
  detectedItems: DetectedItem[];
  generatedSoap: Consultation["soap"] | null;
  newPatientDraft: NewPatientDraft;
  setIntakeMode: (mode: IntakeMode) => void;
  selectPatient: (patientId: string) => void;
  setConsultationReason: (reason: string) => void;
  setNewPatientDraft: (draft: Partial<NewPatientDraft>) => void;
  setActiveConsultation: (consultationId: string | null) => void;
  startRecording: () => void;
  stopRecording: () => void;
  tickRecording: () => void;
  addTranscriptionLine: (line: TranscriptionLine) => void;
  setSuggestedCids: (cids: CidCode[]) => void;
  setDetectedItems: (items: DetectedItem[]) => void;
  setGeneratedSoap: (soap: Consultation["soap"]) => void;
  resetConsultation: () => void;
}

const initialState = {
  intakeMode: "existing" as IntakeMode,
  selectedPatientId: null,
  consultationReason: "",
  activeConsultationId: null,
  isRecording: false,
  recordingSeconds: 0,
  liveTranscription: [],
  suggestedCids: [],
  detectedItems: [],
  generatedSoap: null,
  newPatientDraft: {
    name: "",
    dateOfBirth: "",
    sex: "Other" as const,
  },
};

export const useConsultationStore = create<ConsultationState>((set) => ({
  ...initialState,
  setIntakeMode: (mode) => set({ intakeMode: mode }),
  selectPatient: (patientId) => set({ selectedPatientId: patientId }),
  setConsultationReason: (reason) => set({ consultationReason: reason }),
  setNewPatientDraft: (draft) =>
    set((state) => ({ newPatientDraft: { ...state.newPatientDraft, ...draft } })),
  setActiveConsultation: (consultationId) =>
    set({ activeConsultationId: consultationId }),
  startRecording: () => set({ isRecording: true }),
  stopRecording: () => set({ isRecording: false }),
  tickRecording: () =>
    set((state) => ({ recordingSeconds: state.isRecording ? state.recordingSeconds + 1 : state.recordingSeconds })),
  addTranscriptionLine: (line) =>
    set((state) => ({ liveTranscription: [...state.liveTranscription, line] })),
  setSuggestedCids: (cids) => set({ suggestedCids: cids }),
  setDetectedItems: (items) => set({ detectedItems: items }),
  setGeneratedSoap: (soap) => set({ generatedSoap: soap }),
  resetConsultation: () => set({ ...initialState }),
}));
