"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, FileText, Upload, User, UserPlus, Users, X } from "lucide-react";
import { ButtonHiro } from "@/components/ui/ButtonHiro";
import { formatDateBR } from "@/lib/formatDate";
import { PatientSearch, type PatientSearchResult } from "@/components/patients/PatientSearch";
import { useConsultationStore } from "@/lib/store";
import type { Patient } from "@/lib/types";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface Appointment {
  id: string;
  patient_name: string;
  patient_phone?: string;
  patient_cpf?: string;
  patient_dob?: string;
  patient_sex?: string;
  patient_id?: string;
  datetime: string;
  duration_minutes: number;
  type: string;
  insurance?: string;
  status: string;
  notes?: string;
  attached_exams?: AttachedExam[];
}

interface AttachedExam {
  name: string;
  type: string;
  size: number;
  data: string; // base64
  uploadedAt: string;
}

type PatientMode = "new" | "existing" | null;

const TYPE_LABELS: Record<string, string> = {
  first_visit: "Primeira consulta",
  follow_up: "Retorno",
  routine: "Rotina",
  urgent: "Urgência",
  exam_review: "Revisão de exames",
};

const STATUS_CONFIG: Record<string, { label: string }> = {
  scheduled: { label: "Agendado" },
  confirmed: { label: "Confirmado" },
  in_progress: { label: "Em andamento" },
  completed: { label: "Concluído" },
  cancelled: { label: "Cancelado" },
  no_show: { label: "Não compareceu" },
};

const INSURANCE_OPTIONS = [
  "Particular", "Unimed", "Bradesco Saúde", "SulAmérica", "Amil",
  "NotreDame Intermédica", "Hapvida", "Porto Seguro", "Outro",
];

const inputClass =
  "glass-card-input w-full rounded-xl px-3 py-2.5 text-[13px] text-hiro-text outline-none focus:ring-2 focus:ring-hiro-green/30";

const labelClass =
  "block text-[11px] font-semibold uppercase tracking-wide text-hiro-muted mb-1";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB (base64 adds ~33%)

/* ─── Helpers ────────────────────────────────────────────────────────────── */

// Convert dd/mm/aaaa (form input) → YYYY-MM-DD (DB)
function brToISO(br: string | undefined): string | null {
  if (!br) return null;
  if (br.includes("-")) return br;
  const parts = br.split("/");
  if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2) return null;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  initial?: Appointment | null;
}

export function AppointmentModal({ isOpen, onClose, onSave, initial }: AppointmentModalProps) {
  const [saving, setSaving] = useState(false);
  const [patientMode, setPatientMode] = useState<PatientMode>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [form, setForm] = useState({
    patient_name: "", patient_phone: "",
    patient_cpf: "", patient_dob: "", patient_sex: "",
    date: "", time: "08:00",
    duration_minutes: "30", type: "first_visit",
    insurance: "", notes: "", status: "scheduled",
  });
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Init form from initial or defaults
  useEffect(() => {
    if (initial) {
      const d = new Date(initial.datetime);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const mins = String(Math.round(d.getMinutes() / 15) * 15 % 60).padStart(2, "0");
      setForm({
        patient_name: initial.patient_name,
        patient_phone: initial.patient_phone ?? "",
        patient_cpf: initial.patient_cpf ?? "",
        patient_dob: initial.patient_dob ? formatDateBR(initial.patient_dob) : "",
        patient_sex: initial.patient_sex ?? "",
        date: `${day}/${month}/${year}`, time: `${hours}:${mins}`,
        duration_minutes: String(initial.duration_minutes),
        type: initial.type, insurance: initial.insurance ?? "",
        notes: initial.notes ?? "", status: initial.status,
      });
      // Editing an existing appointment — treat as "existing patient" path
      // so the form skips the mode picker and goes straight to the full form.
      setPatientMode("existing");
      setSelectedPatient(
        initial.patient_id
          ? {
              id: initial.patient_id,
              name: initial.patient_name,
              phone: initial.patient_phone,
              dateOfBirth: initial.patient_dob,
              sex: initial.patient_sex,
            }
          : null,
      );
      setFiles([]);
    } else if (isOpen) {
      const now = new Date();
      now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      setForm({
        patient_name: "", patient_phone: "", patient_cpf: "",
        patient_dob: "", patient_sex: "",
        date: `${day}/${month}/${year}`, time: `${hours}:${mins}`,
        duration_minutes: "30", type: "first_visit",
        insurance: "", notes: "", status: "scheduled",
      });
      setPatientMode(null);
      setSelectedPatient(null);
      setFiles([]);
    }
  }, [initial, isOpen]);

  // Handle picking an existing patient from PatientSearch
  function handleSelectExistingPatient(patient: PatientSearchResult) {
    setSelectedPatient(patient);
    setForm((f) => ({
      ...f,
      patient_name: patient.name,
      patient_phone: patient.phone ?? "",
      patient_dob: patient.dateOfBirth ? formatDateBR(patient.dateOfBirth) : "",
      patient_sex: patient.sex ?? "",
    }));
  }

  function resetPatientSelection() {
    setSelectedPatient(null);
    setPatientMode(null);
    setForm((f) => ({
      ...f,
      patient_name: "",
      patient_phone: "",
      patient_cpf: "",
      patient_dob: "",
      patient_sex: "",
    }));
  }

  // File handling
  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const valid = Array.from(fileList).filter(
      (f) => ["application/pdf", "image/jpeg", "image/png"].includes(f.type) && f.size <= MAX_FILE_SIZE
    );
    setFiles((prev) => [...prev, ...valid]);
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Build datetime
  function buildDatetime(): string | null {
    const parts = form.date.split("/");
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts;
    const [hh, min] = form.time.split(":");
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const datetime = buildDatetime();
    if (!form.patient_name.trim() || !datetime) return;

    setSaving(true);
    try {
      // If new patient, create it first so we can attach patient_id to the appointment
      let patientId: string | null = selectedPatient?.id ?? initial?.patient_id ?? null;

      if (!initial && patientMode === "new" && !patientId) {
        const dobISO = brToISO(form.patient_dob);
        const cpfDigits = form.patient_cpf.replace(/\D/g, "");
        const res = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.patient_name.trim(),
            phone: form.patient_phone || null,
            cpf: cpfDigits || null,
            date_of_birth: dobISO,
            sex: form.patient_sex || null,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("[AppointmentModal] Failed to create patient:", err);
          setSaving(false);
          return;
        }
        const created = await res.json();
        patientId = created.id ?? null;

        // Push the new patient into the store so other screens
        // (dashboard, nova-consulta) reflect it without a reload.
        if (created?.id) {
          const newPatient: Patient = {
            id: created.id,
            name: created.name,
            dateOfBirth: created.date_of_birth ?? "",
            sex:
              created.sex === "M" || created.sex === "F"
                ? created.sex
                : "Other",
            phone: created.phone ?? undefined,
            cpf: created.cpf ?? undefined,
            medications: [],
            cids: [],
            consultations: [],
            exams: [],
            metrics: [],
          };
          useConsultationStore.setState((state) => ({
            patients: [newPatient, ...state.patients],
          }));
        }
      }

      // Convert files to base64
      const attachedExams = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
          data: await fileToBase64(f),
          uploadedAt: new Date().toISOString(),
        }))
      );

      await onSave({
        patient_name: form.patient_name.trim(),
        patient_phone: form.patient_phone || null,
        patient_cpf: form.patient_cpf.replace(/\D/g, "") || null,
        patient_dob: brToISO(form.patient_dob),
        patient_sex: form.patient_sex || null,
        patient_id: patientId,
        datetime,
        duration_minutes: Number(form.duration_minutes),
        type: form.type,
        insurance: form.insurance || null,
        notes: form.notes || null,
        status: form.status,
        ...(attachedExams.length > 0 ? { attached_exams: attachedExams } : {}),
      });
    } catch (err) {
      console.error("[Agenda] Save error:", err);
    }
    setSaving(false);
  }

  if (!isOpen) return null;

  // ─── Derived view state ────────────────────────────────────────────────
  const isEditing = Boolean(initial);
  const showModePicker = !isEditing && patientMode === null;
  const showSearch = !isEditing && patientMode === "existing" && !selectedPatient;
  const showFullForm =
    isEditing || patientMode === "new" || (patientMode === "existing" && !!selectedPatient);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-black/[0.08] bg-[#f0ede6] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl font-normal text-hiro-text">
            {isEditing ? "Editar Agendamento" : "Novo Agendamento"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-hiro-muted hover:bg-black/[0.04]">
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* ─── Mode picker ─────────────────────────────────────────────── */}
        {showModePicker && (
          <div className="space-y-4">
            <h3 className="text-[14px] font-medium text-hiro-text">
              Para quem é esta consulta?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPatientMode("new")}
                className="flex flex-col items-start gap-2 rounded-xl border-2 border-black/[0.08] bg-white/40 p-5 text-left transition-all hover:border-hiro-green/50 hover:bg-hiro-green/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-hiro-green/10">
                  <UserPlus className="h-5 w-5 text-hiro-green" strokeWidth={1.75} />
                </div>
                <p className="text-[13px] font-medium text-hiro-text">Novo paciente</p>
                <p className="text-[11px] text-hiro-muted">Cadastrar dados do paciente</p>
              </button>
              <button
                type="button"
                onClick={() => setPatientMode("existing")}
                className="flex flex-col items-start gap-2 rounded-xl border-2 border-black/[0.08] bg-white/40 p-5 text-left transition-all hover:border-hiro-green/50 hover:bg-hiro-green/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-hiro-green/10">
                  <Users className="h-5 w-5 text-hiro-green" strokeWidth={1.75} />
                </div>
                <p className="text-[13px] font-medium text-hiro-text">Paciente existente</p>
                <p className="text-[11px] text-hiro-muted">Buscar paciente cadastrado</p>
              </button>
            </div>
          </div>
        )}

        {/* ─── Search existing ─────────────────────────────────────────── */}
        {showSearch && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setPatientMode(null)}
              className="inline-flex items-center gap-1.5 text-[12px] text-hiro-muted hover:text-hiro-text"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              Voltar
            </button>
            <h3 className="text-[14px] font-medium text-hiro-text">
              Buscar paciente
            </h3>
            <PatientSearch onSelect={handleSelectExistingPatient} />
          </div>
        )}

        {/* ─── Full form (new patient or selected existing) ────────────── */}
        {showFullForm && (
          <div className="space-y-3">
            {/* Back button when creating */}
            {!isEditing && patientMode === "new" && (
              <button
                type="button"
                onClick={() => {
                  setPatientMode(null);
                  setForm((f) => ({
                    ...f,
                    patient_name: "",
                    patient_phone: "",
                    patient_cpf: "",
                    patient_dob: "",
                    patient_sex: "",
                  }));
                }}
                className="inline-flex items-center gap-1.5 text-[12px] text-hiro-muted hover:text-hiro-text"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
                Voltar
              </button>
            )}

            {/* Selected existing patient summary */}
            {!isEditing && patientMode === "existing" && selectedPatient && (
              <div className="flex items-center justify-between rounded-xl border border-hiro-green/20 bg-hiro-green/5 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-hiro-green">
                    <User className="h-4 w-4 text-white" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-hiro-text">
                      {selectedPatient.name}
                    </p>
                    <p className="text-[11px] text-hiro-muted">
                      {selectedPatient.phone || "Sem telefone"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetPatientSelection}
                  className="text-[11px] font-medium text-hiro-green hover:underline"
                >
                  Trocar paciente
                </button>
              </div>
            )}

            {/* Patient fields — editable when new or editing existing appointment */}
            {(isEditing || patientMode === "new") && (
              <>
                <div>
                  <label className={labelClass}>Paciente *</label>
                  <input
                    className={inputClass}
                    placeholder="Nome completo"
                    required
                    value={form.patient_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, patient_name: e.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>CPF</label>
                    <input
                      className={inputClass}
                      placeholder="000.000.000-00"
                      inputMode="numeric"
                      maxLength={14}
                      value={form.patient_cpf}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "");
                        if (v.length > 11) v = v.slice(0, 11);
                        if (v.length > 9) v = v.slice(0, 3) + "." + v.slice(3, 6) + "." + v.slice(6, 9) + "-" + v.slice(9);
                        else if (v.length > 6) v = v.slice(0, 3) + "." + v.slice(3, 6) + "." + v.slice(6);
                        else if (v.length > 3) v = v.slice(0, 3) + "." + v.slice(3);
                        setForm((f) => ({ ...f, patient_cpf: v }));
                      }}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Data de nascimento</label>
                    <input
                      className={inputClass}
                      placeholder="dd/mm/aaaa"
                      inputMode="numeric"
                      maxLength={10}
                      value={form.patient_dob}
                      onChange={(e) => {
                        let v = e.target.value.replace(/[^\d/]/g, "");
                        const digits = v.replace(/\//g, "");
                        if (digits.length >= 3 && !v.includes("/")) v = digits.slice(0, 2) + "/" + digits.slice(2);
                        if (digits.length >= 5 && v.split("/").length < 3) { const p = v.split("/"); v = p[0] + "/" + (p[1]?.slice(0, 2) ?? "") + "/" + (p[1]?.slice(2) ?? "") + (p[2] ?? ""); }
                        if (v.length > 10) v = v.slice(0, 10);
                        setForm((f) => ({ ...f, patient_dob: v }));
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Telefone</label>
                    <input
                      className={inputClass}
                      placeholder="(00) 00000-0000"
                      value={form.patient_phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, patient_phone: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Sexo</label>
                    <select
                      className={inputClass}
                      value={form.patient_sex}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, patient_sex: e.target.value }))
                      }
                    >
                      <option value="">Selecione</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="Other">Outro</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Appointment fields */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Data *</label>
                <input type="text" inputMode="numeric" className={inputClass} placeholder="dd/mm/aaaa" maxLength={10} required value={form.date}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^\d/]/g, "");
                    const digits = v.replace(/\//g, "");
                    if (digits.length >= 3 && !v.includes("/")) v = digits.slice(0, 2) + "/" + digits.slice(2);
                    if (digits.length >= 5 && v.split("/").length < 3) { const p = v.split("/"); v = p[0] + "/" + (p[1]?.slice(0, 2) ?? "") + "/" + (p[1]?.slice(2) ?? "") + (p[2] ?? ""); }
                    if (v.length > 10) v = v.slice(0, 10);
                    setForm((f) => ({ ...f, date: v }));
                  }}
                />
              </div>
              <div>
                <label className={labelClass}>Hora *</label>
                <select className={inputClass} value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}>
                  {Array.from({ length: 24 * 4 }, (_, i) => {
                    const h = String(Math.floor(i / 4)).padStart(2, "0");
                    const m = String((i % 4) * 15).padStart(2, "0");
                    return <option key={i} value={`${h}:${m}`}>{h}:{m}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className={labelClass}>Duração</label>
                <select className={inputClass} value={form.duration_minutes} onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}>
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Tipo</label>
                <select className={inputClass} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Convênio</label>
                <select className={inputClass} value={form.insurance} onChange={(e) => setForm((f) => ({ ...f, insurance: e.target.value }))}>
                  <option value="">Selecione</option>
                  {INSURANCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {isEditing && (
              <div>
                <label className={labelClass}>Status</label>
                <select className={inputClass} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className={labelClass}>Observações</label>
              <textarea className={`${inputClass} resize-none`} rows={2} placeholder="Anotações..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>

            {/* Exam upload */}
            <div>
              <label className={labelClass}>Exames (opcional)</label>
              <p className="text-[10px] text-hiro-muted/60 mb-2">Anexe exames que o paciente enviou antes da consulta</p>
              <div
                className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-black/10 py-4 transition-colors hover:border-hiro-green/30 hover:bg-black/[0.01]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-5 w-5 text-hiro-muted/40" />
                <p className="text-[11px] text-hiro-muted">Arraste ou clique</p>
                <p className="text-[10px] text-hiro-muted/50">PDF, JPG, PNG (máx. 5MB)</p>
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={(e) => addFiles(e.target.files)} />
              </div>
              {files.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-black/[0.06] bg-white/40 px-2.5 py-1.5">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-hiro-muted" strokeWidth={1.75} />
                      <span className="min-w-0 flex-1 truncate text-[11px] text-hiro-text">{f.name}</span>
                      <span className="text-[10px] text-hiro-muted/50">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                      <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="text-hiro-muted/30 hover:text-hiro-red">
                        <X className="h-3 w-3" strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Footer buttons ──────────────────────────────────────────── */}
        <div className="mt-5 flex gap-3">
          {showFullForm && (
            <ButtonHiro type="submit" className="flex-1" disabled={saving || !form.patient_name.trim()}>
              {saving ? "Salvando..." : isEditing ? "Salvar" : "Agendar"}
            </ButtonHiro>
          )}
          <ButtonHiro
            variant="secondary"
            type="button"
            onClick={onClose}
            className={showFullForm ? "px-6" : "w-full"}
          >
            Cancelar
          </ButtonHiro>
        </div>
      </form>
    </div>
  );
}
