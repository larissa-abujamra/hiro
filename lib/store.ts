"use client";

import { create } from "zustand";
import { mockPatients } from "@/lib/mockData";

const DEMO_EMAIL = "admin@hiro.com";
import type {
  CidSuggestion,
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

export interface ActivityEntry {
  id: string;
  type: "consultation_started" | "prontuario_generated" | "consultation_saved" | "patient_created";
  patientName: string;
  timestamp: string; // ISO string
}

export { DEMO_EMAIL };

interface ConsultationState {
  patients: Patient[];
  initialized: boolean;
  initializedForUser: string | null;
  activityLog: ActivityEntry[];
  intakeMode: IntakeMode;
  selectedPatientId: string | null;
  consultationReason: string;
  activeConsultationId: string | null;
  isRecording: boolean;
  recordingSeconds: number;
  liveTranscription: TranscriptionLine[];
  cidSuggestions: CidSuggestion[];
  detectedItems: DetectedItem[];
  generatedSoap: Consultation["soap"] | null;
  patientSummary: string;
  flags: string[];
  savedSummaries: SavedSummaryEntry[];
  newPatientDraft: NewPatientDraft;
  updatePatient: (patientId: string, updates: Partial<Patient>) => void;
  initializePatients: (isDemo: boolean, userId: string) => void;
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
  setCidSuggestions: (suggestions: CidSuggestion[]) => void;
  setDetectedItems: (items: DetectedItem[]) => void;
  addDetectedItem: (item: DetectedItem) => void;
  setGeneratedSoap: (soap: Consultation["soap"]) => void;
  setPatientSummary: (summary: string) => void;
  setFlags: (flags: string[]) => void;
  saveSummary: (entry: SavedSummaryEntry) => void;
  saveConsultationToPatient: (consultation: Consultation) => void;
  addActivity: (entry: Omit<ActivityEntry, "id" | "timestamp">) => void;
  resetConsultation: () => void;
}

const initialState = {
  patients: [] as Patient[],
  initialized: false,
  initializedForUser: null as string | null,
  activityLog: [] as ActivityEntry[],
  intakeMode: "existing" as IntakeMode,
  selectedPatientId: null,
  consultationReason: "",
  activeConsultationId: null,
  isRecording: false,
  recordingSeconds: 0,
  liveTranscription: [],
  cidSuggestions: [],
  detectedItems: [],
  generatedSoap: null,
  patientSummary: "",
  flags: [],
  savedSummaries: [],
  newPatientDraft: {
    name: "",
    dateOfBirth: "",
    sex: "Other" as const,
  },
};

export const useConsultationStore = create<ConsultationState>((set) => ({
  ...initialState,
  updatePatient: (patientId, updates) =>
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id === patientId ? { ...p, ...updates } : p
      ),
    })),
  initializePatients: (isDemo: boolean, userId: string) =>
    set({ patients: isDemo ? mockPatients : [], initialized: true, initializedForUser: userId }),
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
  setCidSuggestions: (suggestions) => set({ cidSuggestions: suggestions }),
  setDetectedItems: (items) => set({ detectedItems: items }),
  addDetectedItem: (item) =>
    set((state) => {
      const duplicate = state.detectedItems.some(
        (d) => d.type === item.type && d.sourceQuote === item.sourceQuote,
      );
      if (duplicate) return state;
      return { detectedItems: [...state.detectedItems, item] };
    }),
  setGeneratedSoap: (soap) => set({ generatedSoap: soap }),
  setPatientSummary: (summary) => set({ patientSummary: summary }),
  setFlags: (flags) => set({ flags }),
  saveSummary: (entry) =>
    set((state) => ({
      savedSummaries: [
        ...state.savedSummaries.filter(
          (item) => item.consultationId !== entry.consultationId,
        ),
        entry,
      ],
    })),
  addActivity: (entry) =>
    set((state) => ({
      activityLog: [
        { ...entry, id: `act-${Date.now()}`, timestamp: new Date().toISOString() },
        ...state.activityLog,
      ].slice(0, 20), // keep last 20
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
      cidSuggestions: [],
      detectedItems: [],
      generatedSoap: null,
      patientSummary: "",
      flags: [],
      newPatientDraft: {
        name: "",
        dateOfBirth: "",
        sex: "Other",
      },
    })),
}));
