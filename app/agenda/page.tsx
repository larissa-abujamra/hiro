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
import { AppointmentModal, type Appointment } from "@/components/agenda/AppointmentModal";

/* ─── Types ──────────────────────────────────────────────────────────────── */

// Appointment type imported from AppointmentModal

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
