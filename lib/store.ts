"use client";

import { create } from "zustand";
import { mockPatients } from "@/lib/mockData";
import { persistPatient } from "@/lib/persistence";

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
  updatePatient: (patientId, updates) => {
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id === patientId ? { ...p, ...updates } : p
      ),
    }));
    // Persist after state update
    const updated = useConsultationStore.getState().patients.find((p) => p.id === patientId);
    if (updated) persistPatient(updated);
  },
  initializePatients: (isDemo: boolean, userId: string) => {
    if (isDemo) {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const h = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600_000).toISOString();

      // Inject today's consultations into mock patients for metrics
      const todayConsultations: Consultation[] = [
        {
          id: "demo-cons-today-1",
          patientId: "patient-bruno-ferreira",
          date: today,
          reason: "Retorno — controle de hipertensão",
          duration: 12,
          transcription: [],
          soap: { s: "Paciente refere melhora dos picos pressóricos.", o: "PA 132/84 mmHg, FC 76 bpm.", a: "HAS com controle adequado.", p: "Manter medicação atual, retorno em 3 meses." },
          confirmedCids: [{ code: "I10", name: "Hipertensão essencial", confidence: 0.95, sourceQuote: "controle de pressão", confirmed: true }],
          detectedItems: [],
          documents: [],
        },
        {
          id: "demo-cons-today-2",
          patientId: "patient-ana-clara-ribeiro",
          date: today,
          reason: "Consulta de rotina",
          duration: 15,
          transcription: [],
          soap: { s: "Paciente sem queixas ativas, refere bem-estar geral.", o: "Exame físico sem alterações.", a: "Saúde preservada, sem comorbidades.", p: "Manter acompanhamento anual." },
          confirmedCids: [],
          detectedItems: [],
          documents: [],
        },
        {
          id: "demo-cons-today-3",
          patientId: "patient-cintia-souza",
          date: today,
          reason: "Diabetes — retorno",
          duration: 9,
          transcription: [],
          soap: { s: "Paciente refere controle glicêmico adequado com dieta.", o: "Glicemia de jejum 102 mg/dL, HbA1c 6.2%.", a: "DM2 compensado.", p: "Manter metformina 850mg 2x/dia, solicitar nova HbA1c em 3 meses." },
          confirmedCids: [{ code: "E11", name: "Diabetes mellitus tipo 2", confidence: 0.92, sourceQuote: "controle glicêmico", confirmed: true }],
          detectedItems: [],
          documents: [],
        },
      ];

      const patientsWithToday = mockPatients.map((p) => {
        const todayForPatient = todayConsultations.filter((c) => c.patientId === p.id);
        return todayForPatient.length > 0
          ? { ...p, consultations: [...p.consultations, ...todayForPatient] }
          : p;
      });

      const demoActivity: ActivityEntry[] = [
        { id: "demo-act-1", type: "prontuario_generated", patientName: "Bruno Ferreira", timestamp: h(0.5) },
        { id: "demo-act-2", type: "consultation_saved", patientName: "Bruno Ferreira", timestamp: h(0.6) },
        { id: "demo-act-3", type: "consultation_started", patientName: "Bruno Ferreira", timestamp: h(1) },
        { id: "demo-act-4", type: "prontuario_generated", patientName: "Ana Clara Ribeiro", timestamp: h(2.5) },
        { id: "demo-act-5", type: "consultation_saved", patientName: "Ana Clara Ribeiro", timestamp: h(2.6) },
        { id: "demo-act-6", type: "consultation_started", patientName: "Ana Clara Ribeiro", timestamp: h(3) },
        { id: "demo-act-7", type: "prontuario_generated", patientName: "Cíntia Souza", timestamp: h(4) },
        { id: "demo-act-8", type: "consultation_started", patientName: "Cíntia Souza", timestamp: h(4.5) },
        { id: "demo-act-9", type: "patient_created", patientName: "Elaine Prado", timestamp: h(6) },
        { id: "demo-act-10", type: "consultation_started", patientName: "Rodrigo Mendes", timestamp: h(8) },
      ];

      set({ patients: patientsWithToday, activityLog: demoActivity, initialized: true, initializedForUser: userId });
    } else {
      set({ patients: [], activityLog: [], initialized: true, initializedForUser: userId });
    }
  },
  createPatientFromDraft: () => {
    let createdId: string | null = null;
    set((state) => {
      const name = state.newPatientDraft.name.trim();
      const rawDate = state.newPatientDraft.dateOfBirth.trim();
      if (!name || !rawDate) return state;

      // Convert dd/mm/aaaa → YYYY-MM-DD for internal storage
      const parts = rawDate.split("/");
      const dateOfBirth =
        parts.length === 3 && parts[0].length === 2 && parts[1].length === 2
          ? `${parts[2]}-${parts[1]}-${parts[0]}`
          : rawDate;

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
    // Persist new patient
    if (createdId) {
      const created = useConsultationStore.getState().patients.find((p) => p.id === createdId);
      if (created) persistPatient(created);
    }
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
        { ...entry, id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: new Date().toISOString() },
        ...state.activityLog,
      ].slice(0, 20), // keep last 20
    })),
  saveConsultationToPatient: (consultation) => {
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
    });
    // Persist the patient that was updated
    const updated = useConsultationStore.getState().patients.find(
      (p) => p.id === consultation.patientId
    );
    if (updated) persistPatient(updated);
  },
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
