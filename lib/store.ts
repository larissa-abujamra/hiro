"use client";

import { create } from "zustand";
import type { CidCode, Consultation, DetectedItem, TranscriptionLine } from "@/lib/types";

interface ConsultationState {
  selectedPatientId: string | null;
  activeConsultationId: string | null;
  isRecording: boolean;
  liveTranscription: TranscriptionLine[];
  suggestedCids: CidCode[];
  detectedItems: DetectedItem[];
  generatedSoap: Consultation["soap"] | null;
  selectPatient: (patientId: string) => void;
  setActiveConsultation: (consultationId: string | null) => void;
  startRecording: () => void;
  stopRecording: () => void;
  addTranscriptionLine: (line: TranscriptionLine) => void;
  setSuggestedCids: (cids: CidCode[]) => void;
  setDetectedItems: (items: DetectedItem[]) => void;
  setGeneratedSoap: (soap: Consultation["soap"]) => void;
  resetConsultation: () => void;
}

const initialState = {
  selectedPatientId: null,
  activeConsultationId: null,
  isRecording: false,
  liveTranscription: [],
  suggestedCids: [],
  detectedItems: [],
  generatedSoap: null,
};

export const useConsultationStore = create<ConsultationState>((set) => ({
  ...initialState,
  selectPatient: (patientId) => set({ selectedPatientId: patientId }),
  setActiveConsultation: (consultationId) =>
    set({ activeConsultationId: consultationId }),
  startRecording: () => set({ isRecording: true }),
  stopRecording: () => set({ isRecording: false }),
  addTranscriptionLine: (line) =>
    set((state) => ({ liveTranscription: [...state.liveTranscription, line] })),
  setSuggestedCids: (cids) => set({ suggestedCids: cids }),
  setDetectedItems: (items) => set({ detectedItems: items }),
  setGeneratedSoap: (soap) => set({ generatedSoap: soap }),
  resetConsultation: () => set({ ...initialState }),
}));
