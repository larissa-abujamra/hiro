export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  sex: "M" | "F" | "Other";
  height?: number;
  weight?: number;
  phone?: string;
  cpf?: string;
  conditions?: string[];
  medications: Medication[];
  cids: CidEntry[];
  consultations: Consultation[];
  exams: Exam[];
  metrics: PatientMetrics[];
  trackedMetrics?: TrackedMetric[];
  savedExams?: SavedExam[];
}

export interface Consultation {
  id: string;
  patientId: string;
  date: string;
  reason: string;
  duration: number;
  transcription: TranscriptionLine[];
  soap: { s: string; o: string; a: string; p: string };
  confirmedCids: CidCode[];
  detectedItems: DetectedItem[];
  documents: GeneratedDocument[];
}

export interface TranscriptionLine {
  speaker: "doctor" | "patient";
  text: string;
  timestamp: number;
  isFinal: boolean;
}

export interface DetectedItem {
  id: string;
  type: "prescription" | "exam" | "return" | "certificate" | "referral";
  text: string;
  sourceQuote: string;
  details: Record<string, unknown>;
}

export interface CidCode {
  code: string;
  name: string;
  confidence: number;
  sourceQuote: string;
  confirmed: boolean;
}

/** Sugestões CID-10 em tempo real durante a consulta (confiança 0–1 no UI). */
export interface CidSuggestion {
  code: string;
  name: string;
  confidence: number;
  sourceQuote: string;
  confirmed: boolean;
}

export interface PatientMetrics {
  date: string;
  systolic?: number;
  diastolic?: number;
  weight?: number;
  glucose?: number;
}

export interface SavedExamResult {
  name: string;
  value: string;
  unit: string;
  reference?: string;
  status?: "normal" | "alto" | "baixo";
}

export interface SavedExam {
  id: string;
  name: string;
  examDate: string | null;
  uploadDate: string;
  type: string;
  summary: string;
  results: SavedExamResult[];
}

export interface TrackedMetricEntry {
  value: number;
  date: string;
  examId?: string;
}

export interface TrackedMetric {
  name: string;
  unit: string;
  referenceRange?: string;
  history: TrackedMetricEntry[];
}

export interface GeneratedDocument {
  type: "prescription" | "exam-request" | "tiss" | "certificate" | "referral";
  status: "ready" | "pending";
  content: string;
}

export interface Medication {
  name: string;
  dose: string;
  status: "active" | "suspended" | "completed";
}

export interface CidEntry {
  code: string;
  name: string;
  firstSeen: string;
  lastSeen: string;
}

export interface Exam {
  id: string;
  fileName: string;
  date: string;
  type: "lab" | "imaging" | "report" | "other";
  url?: string;
}
