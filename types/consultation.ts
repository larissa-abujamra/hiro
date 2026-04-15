export interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;

  // Timing
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;

  // Content
  chief_complaint?: string;
  transcription?: string;

  // SOAP
  subjetivo?: string;
  objetivo?: string;
  avaliacao?: string;
  plano?: string;
  soap?: {
    subjetivo?: string;
    objetivo?: string;
    avaliacao?: string;
    plano?: string;
  };

  // Metadata
  status: "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at?: string;

  // Joined data (quando fazemos select com join)
  patient?: {
    id: string;
    name: string;
  };
}

export interface CreateConsultationInput {
  patient_id: string;
  appointment_id?: string;
  chief_complaint?: string;
}

export interface UpdateConsultationInput {
  transcription?: string;
  subjetivo?: string;
  objetivo?: string;
  avaliacao?: string;
  plano?: string;
  soap?: object;
  status?: "in_progress" | "completed" | "cancelled";
  ended_at?: string;
  duration_minutes?: number;
}
