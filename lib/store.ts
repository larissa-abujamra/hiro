"use client";

import { create } from "zustand";
import { mockPatients } from "@/lib/mockData";
import type {
  CidCode,
  Consultation,
  DetectedItem,
  Patient,
  TranscriptionLine,
} from "@/lib/types";

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

interface SavedSummaryEntry {
  consultationId: string;
  patientId: string;
  savedAt: string;
  soap: Consultation["soap"];
}

interface ConsultationState {
  patients: Patient[];
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
  savedSummaries: SavedSummaryEntry[];
  newPatientDraft: NewPatientDraft;
  setIntakeMode: (mode: IntakeMode) => void;
  selectPatient: (patientId: string) => void;
  setConsultationReason: (reason: string) => void;
  setNewPatientDraft: (draft: Partial<NewPatientDraft>) => void;
  createPatientFromDraft: () => string | null;
  setActiveConsultation: (consultationId: string | null) => void;
  startRecording: () => void;
  stopRecording: () => void;
  tickRecording: () => void;
  addTranscriptionLine: (line: TranscriptionLine) => void;
  setTranscriptionLines: (lines: TranscriptionLine[]) => void;
  setSuggestedCids: (cids: CidCode[]) => void;
  setDetectedItems: (items: DetectedItem[]) => void;
  setGeneratedSoap: (soap: Consultation["soap"]) => void;
  saveSummary: (entry: SavedSummaryEntry) => void;
  saveConsultationToPatient: (consultation: Consultation) => void;
  resetConsultation: () => void;
}

const initialState = {
  patients: mockPatients,
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
  savedSummaries: [],
  newPatientDraft: {
    name: "",
    dateOfBirth: "",
    sex: "Other" as const,
  },
};

export const useConsultationStore = create<ConsultationState>((set) => ({
  ...initialState,
  createPatientFromDraft: () => {
    let createdId: string | null = null;
    set((state) => {
      const name = state.newPatientDraft.name.trim();
      const dateOfBirth = state.newPatientDraft.dateOfBirth.trim();
      if (!name || !dateOfBirth) return state;

      createdId = `patient-${Date.now()}`;
      const patient: Patient = {
        id: createdId,
        name,
        dateOfBirth,
        sex: state.newPatientDraft.sex,
        height: state.newPatientDraft.height,
        weight: state.newPatientDraft.weight,
        phone: state.newPatientDraft.phone,
        conditions: state.newPatientDraft.condition
          ? [state.newPatientDraft.condition]
          : [],
        medications: [],
        cids: [],
        consultations: [],
        exams: [],
        metrics: [],
      };
      return {
        patients: [patient, ...state.patients],
      };
    });
    return createdId;
  },
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
  setTranscriptionLines: (lines) => set({ liveTranscription: lines }),
  setSuggestedCids: (cids) => set({ suggestedCids: cids }),
  setDetectedItems: (items) => set({ detectedItems: items }),
  setGeneratedSoap: (soap) => set({ generatedSoap: soap }),
  saveSummary: (entry) =>
    set((state) => ({
      savedSummaries: [
        ...state.savedSummaries.filter(
          (item) => item.consultationId !== entry.consultationId,
        ),
        entry,
      ],
    })),
  saveConsultationToPatient: (consultation) =>
    set((state) => {
      const patients = state.patients.map((patient) => {
        if (patient.id !== consultation.patientId) return patient;
        const existingIndex = patient.consultations.findIndex(
          (item) => item.id === consultation.id,
        );
        const consultations =
          existingIndex >= 0
            ? patient.consultations.map((item, index) =>
                index === existingIndex ? consultation : item,
              )
            : [...patient.consultations, consultation];
        return {
          ...patient,
          consultations,
          cids: [
            ...patient.cids,
            ...consultation.confirmedCids
              .filter((cid) => !patient.cids.some((existing) => existing.code === cid.code))
              .map((cid) => ({
                code: cid.code,
                name: cid.name,
                firstSeen: consultation.date,
                lastSeen: consultation.date,
              })),
          ],
        };
      });
      return { patients };
    }),
  resetConsultation: () =>
    set((state) => ({
      ...state,
      intakeMode: "existing",
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
        sex: "Other",
      },
    })),
}));
