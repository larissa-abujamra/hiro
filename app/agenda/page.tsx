"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Plus,
  User,
  X,
} from "lucide-react";
import { CardHiro } from "@/components/ui/CardHiro";
import { ButtonHiro } from "@/components/ui/ButtonHiro";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface Appointment {
  id: string;
  patient_name: string;
  patient_phone?: string;
  patient_id?: string;
  datetime: string;
  duration_minutes: number;
  type: string;
  insurance?: string;
  status: string;
  notes?: string;
}

const TYPE_LABELS: Record<string, string> = {
  first_visit: "Primeira consulta",
  follow_up: "Retorno",
  routine: "Rotina",
  urgent: "Urgência",
  exam_review: "Revisão de exames",
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  scheduled: { label: "Agendado", bg: "bg-black/[0.06]", text: "text-hiro-muted" },
  confirmed: { label: "Confirmado", bg: "bg-[#E6F1FB]", text: "text-[#185FA5]" },
  in_progress: { label: "Em andamento", bg: "bg-[#FAEEDA]", text: "text-[#854F0B]" },
  completed: { label: "Concluído", bg: "bg-[#D6E8DC]", text: "text-[#0F6E56]" },
  cancelled: { label: "Cancelado", bg: "bg-[#FAECE7]", text: "text-[#993C1D]" },
  no_show: { label: "Não compareceu", bg: "bg-hiro-red/10", text: "text-hiro-red" },
};

const INSURANCE_OPTIONS = [
  "Particular", "Unimed", "Bradesco Saúde", "SulAmérica", "Amil",
  "NotreDame Intermédica", "Hapvida", "Porto Seguro", "Outro",
];

const inputClass =
  "glass-card-input w-full rounded-xl px-3 py-2.5 text-[13px] text-hiro-text outline-none focus:ring-2 focus:ring-hiro-green/30";

const labelClass =
  "block text-[11px] font-semibold uppercase tracking-wide text-hiro-muted mb-1";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDateHeader(d: Date) {
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function getWeekDays(current: Date): Date[] {
  const start = new Date(current);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/* ─── Appointment Card ───────────────────────────────────────────────────── */

function AppointmentCard({ appt, onSelect }: { appt: Appointment; onSelect: () => void }) {
  const status = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.scheduled;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-start gap-3 rounded-xl border border-black/[0.06] bg-white/50 p-3 text-left transition-all duration-150 hover:-translate-y-px hover:shadow-md active:scale-[0.99]"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-hiro-green/10">
        <User className="h-4 w-4 text-hiro-green" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-hiro-text">{appt.patient_name}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-hiro-muted">
          <span className="tabular-nums">{formatTime(appt.datetime)}</span>
          <span>·</span>
          <span>{appt.duration_minutes} min</span>
          {appt.type && <><span>·</span><span>{TYPE_LABELS[appt.type] ?? appt.type}</span></>}
        </div>
      </div>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${status.bg} ${status.text}`}>
        {status.label}
      </span>
    </button>
  );
}

/* ─── Modal ──────────────────────────────────────────────────────────────── */

function AppointmentModal({
  isOpen, onClose, onSave, initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  initial?: Appointment | null;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patient_name: "", patient_phone: "",
    date: "", // dd/mm/aaaa
    time: "08:00", // HH:MM
    duration_minutes: "30", type: "first_visit", insurance: "", notes: "", status: "scheduled",
  });

  useEffect(() => {
    if (initial) {
      const d = new Date(initial.datetime);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const mins = String(Math.round(d.getMinutes() / 15) * 15).padStart(2, "0");
      setForm({
        patient_name: initial.patient_name,
        patient_phone: initial.patient_phone ?? "",
        date: `${day}/${month}/${year}`,
        time: `${hours}:${mins === "60" ? "00" : mins}`,
        duration_minutes: String(initial.duration_minutes),
        type: initial.type, insurance: initial.insurance ?? "",
        notes: initial.notes ?? "", status: initial.status,
      });
    } else if (isOpen) {
      const now = new Date();
      now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, "0");
      const snappedMins = String(Math.ceil(now.getMinutes() / 15) * 15 % 60).padStart(2, "0");
      setForm({ patient_name: "", patient_phone: "", date: `${day}/${month}/${year}`, time: `${hours}:${snappedMins}`, duration_minutes: "30", type: "first_visit", insurance: "", notes: "", status: "scheduled" });
    }
  }, [initial, isOpen]);

  if (!isOpen) return null;

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
    console.log("[Agenda] Submit — date:", form.date, "time:", form.time, "datetime:", datetime, "name:", form.patient_name);
    if (!form.patient_name.trim() || !datetime) {
      console.error("[Agenda] Submit blocked — missing name or invalid date");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        patient_name: form.patient_name.trim(),
        patient_phone: form.patient_phone || null,
        datetime,
        duration_minutes: Number(form.duration_minutes),
        type: form.type, insurance: form.insurance || null,
        notes: form.notes || null, status: form.status,
      });
    } catch (err) {
      console.error("[Agenda] Save error:", err);
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-black/[0.08] bg-[#f0ede6] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl font-normal text-hiro-text">
            {initial ? "Editar Agendamento" : "Novo Agendamento"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-hiro-muted hover:bg-black/[0.04]">
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className={labelClass}>Paciente *</label>
            <input className={inputClass} placeholder="Nome do paciente" required value={form.patient_name} onChange={(e) => setForm((f) => ({ ...f, patient_name: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input className={inputClass} placeholder="(00) 00000-0000" value={form.patient_phone} onChange={(e) => setForm((f) => ({ ...f, patient_phone: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Data *</label>
              <input
                type="text"
                inputMode="numeric"
                className={inputClass}
                placeholder="dd/mm/aaaa"
                maxLength={10}
                required
                value={form.date}
                onChange={(e) => {
                  let v = e.target.value.replace(/[^\d/]/g, "");
                  const digits = v.replace(/\//g, "");
                  if (digits.length >= 3 && !v.includes("/")) {
                    v = digits.slice(0, 2) + "/" + digits.slice(2);
                  }
                  if (digits.length >= 5 && v.split("/").length < 3) {
                    const p = v.split("/");
                    v = p[0] + "/" + (p[1]?.slice(0, 2) ?? "") + "/" + (p[1]?.slice(2) ?? "") + (p[2] ?? "");
                  }
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
          {initial && (
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
        </div>

        <div className="mt-5 flex gap-3">
          <ButtonHiro type="submit" className="flex-1" disabled={saving || !form.patient_name.trim()}>
            {saving ? "Salvando..." : initial ? "Salvar" : "Agendar"}
          </ButtonHiro>
          <ButtonHiro variant="secondary" type="button" onClick={onClose} className="px-6">Cancelar</ButtonHiro>
        </div>
      </form>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function AgendaPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week">("week");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Appointment | null>(null);

  const weekDays = getWeekDays(currentDate);
  const today = new Date();

  const fetchAppointments = useCallback(async () => {
    const from = new Date(weekDays[0]);
    from.setHours(0, 0, 0, 0);
    const to = new Date(weekDays[6]);
    to.setHours(23, 59, 59, 999);
    try {
      const res = await fetch(`/api/appointments?from=${from.toISOString()}&to=${to.toISOString()}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments ?? []);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, [weekDays[0].getTime(), weekDays[6].getTime()]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  async function handleSave(data: Record<string, unknown>) {
    const url = selected ? `/api/appointments/${selected.id}` : "/api/appointments";
    const method = selected ? "PUT" : "POST";
    console.log("[Agenda] Saving to:", method, url, data);
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const result = await res.json().catch(() => ({}));
    console.log("[Agenda] Save result:", res.status, result);
    if (!res.ok) {
      console.error("[Agenda] Save failed:", result);
    }
    setModalOpen(false);
    setSelected(null);
    fetchAppointments();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    setSelected(null);
    fetchAppointments();
  }

  function handleStartConsultation(appt: Appointment) {
    fetch(`/api/appointments/${appt.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in_progress" }),
    });
    router.push(`/consulta/nova?appointmentId=${appt.id}`);
  }

  function navigate(dir: number) {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + dir * (view === "week" ? 7 : 1));
    setCurrentDate(next);
  }

  const getDay = (day: Date) =>
    appointments
      .filter((a) => isSameDay(new Date(a.datetime), day))
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-hiro-text">Agenda</h1>
          <p className="mt-1 text-[13px] text-hiro-muted">
            {getDay(today).length} {getDay(today).length === 1 ? "consulta" : "consultas"} hoje
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-full border border-black/[0.08] bg-white/50 p-0.5">
            {(["week", "day"] as const).map((v) => (
              <button key={v} type="button" onClick={() => setView(v)}
                className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${view === v ? "bg-hiro-active text-white" : "text-hiro-muted"}`}
              >{v === "week" ? "Semana" : "Dia"}</button>
            ))}
          </div>
          <ButtonHiro onClick={() => { setSelected(null); setModalOpen(true); }} className="inline-flex items-center gap-1.5 px-5">
            <Plus className="h-4 w-4" strokeWidth={2} /> Novo Agendamento
          </ButtonHiro>
        </div>
      </div>

      {/* Nav */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate(-1)} className="rounded-full p-2 text-hiro-muted hover:bg-black/[0.04]">
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button type="button" onClick={() => setCurrentDate(new Date())} className="rounded-full border border-black/[0.08] px-4 py-1.5 text-[12px] font-medium text-hiro-muted hover:bg-black/[0.04]">
            Hoje
          </button>
          <button type="button" onClick={() => navigate(1)} className="rounded-full p-2 text-hiro-muted hover:bg-black/[0.04]">
            <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
        <p className="text-[14px] font-medium text-hiro-text capitalize">
          {view === "day"
            ? formatDateHeader(currentDate)
            : `${weekDays[0].toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} — ${weekDays[6].toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}`}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-hiro-green" />
        </div>
      ) : view === "day" ? (
        <CardHiro className="rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-hiro-green" strokeWidth={1.75} />
            <h2 className="text-[14px] font-medium text-hiro-text capitalize">{formatDateHeader(currentDate)}</h2>
          </div>
          {getDay(currentDate).length === 0 ? (
            <p className="py-8 text-center text-[13px] text-hiro-muted">Nenhum agendamento para este dia.</p>
          ) : (
            <div className="space-y-2">
              {getDay(currentDate).map((a) => (
                <AppointmentCard key={a.id} appt={a} onSelect={() => setSelected(a)} />
              ))}
            </div>
          )}
        </CardHiro>
      ) : (
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dayAppts = getDay(day);
            const isToday = isSameDay(day, today);
            return (
              <div key={day.toISOString()} className="min-w-0">
                <div className={`mb-2 text-center ${isToday ? "text-hiro-green" : "text-hiro-muted"}`}>
                  <p className="text-[11px] font-medium uppercase">{day.toLocaleDateString("pt-BR", { weekday: "short" })}</p>
                  <p className={`font-serif text-[18px] tabular-nums ${isToday ? "font-medium" : "font-normal"}`}>{day.getDate()}</p>
                </div>
                <div className="space-y-1.5">
                  {dayAppts.map((a) => {
                    const st = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.scheduled;
                    return (
                      <button key={a.id} type="button" onClick={() => setSelected(a)}
                        className="w-full rounded-lg border border-black/[0.06] bg-white/50 px-2 py-1.5 text-left transition-colors hover:bg-white/80"
                      >
                        <p className="truncate text-[11px] font-medium text-hiro-text">{a.patient_name}</p>
                        <div className="flex items-center gap-1 text-[10px] text-hiro-muted">
                          <Clock className="h-2.5 w-2.5" strokeWidth={2} />
                          <span className="tabular-nums">{formatTime(a.datetime)}</span>
                        </div>
                        <span className={`mt-0.5 inline-block rounded px-1 py-0.5 text-[9px] font-medium ${st.bg} ${st.text}`}>{st.label}</span>
                      </button>
                    );
                  })}
                  {dayAppts.length === 0 && <p className="py-2 text-center text-[10px] text-hiro-muted/40">—</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected appointment detail */}
      {selected && !modalOpen && (
        <CardHiro className="mt-4 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-lg text-hiro-text">{selected.patient_name}</h3>
              <p className="text-[12px] text-hiro-muted">
                {formatTime(selected.datetime)} · {selected.duration_minutes} min
                {selected.insurance && ` · ${selected.insurance}`}
                {selected.type && ` · ${TYPE_LABELS[selected.type] ?? selected.type}`}
              </p>
            </div>
            <button type="button" onClick={() => setSelected(null)} className="text-hiro-muted hover:text-hiro-text">
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          {selected.notes && <p className="mt-2 text-[13px] text-hiro-muted">{selected.notes}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonHiro onClick={() => handleStartConsultation(selected)} className="text-[12px] px-4 py-2">
              Iniciar Consulta
            </ButtonHiro>
            <ButtonHiro variant="secondary" onClick={() => setModalOpen(true)} className="text-[12px] px-4 py-2">
              Editar
            </ButtonHiro>
            <ButtonHiro variant="danger" onClick={() => handleDelete(selected.id)} className="text-[12px] px-4 py-2">
              Remover
            </ButtonHiro>
          </div>
        </CardHiro>
      )}

      <AppointmentModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelected(null); }} onSave={handleSave} initial={selected} />
    </div>
  );
}
