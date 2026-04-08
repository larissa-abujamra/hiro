"use client";

import { useState } from "react";
import { Calendar, ExternalLink, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCalendar } from "@/hooks/useCalendar";
import { TimePicker } from "@/components/ui/time-picker";
import type { CalendarAppointment } from "@/types/calendar";

/* Simple inline Google "G" logo */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 py-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="h-4 w-12 rounded bg-black/[0.06]" />
          <div className="h-4 flex-1 rounded bg-black/[0.06]" />
        </div>
      ))}
    </div>
  );
}

function AppointmentRow({
  appointment,
  index,
  onRemove,
}: {
  appointment: CalendarAppointment;
  index: number;
  onRemove?: () => void;
}) {
  const today = isToday(appointment.startTime);

  return (
    <div
      className="animate-fade-up flex items-center gap-3 py-2.5"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          today ? "bg-hiro-green" : "bg-hiro-amber"
        }`}
      />
      <span className="w-12 shrink-0 text-sm font-medium tabular-nums text-hiro-text">
        {formatTime(appointment.startTime)}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-hiro-muted">
        {appointment.title}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-full p-1 text-hiro-muted/40 transition-colors hover:bg-black/[0.04] hover:text-hiro-red"
          title="Remover"
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}

/* ─── Add appointment form ───────────────────────────────────────────────── */

function AddAppointmentForm({
  onAdd,
}: {
  onAdd: (name: string, time: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [time, setTime] = useState("08:00");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);

    // Build ISO timestamp for today at the given time
    const now = new Date();
    const [hours, minutes] = time.split(":");
    const scheduled = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      Number(hours),
      Number(minutes)
    );

    try {
      await onAdd(name.trim(), scheduled.toISOString());
      setName("");
      setTime("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <TimePicker
          value={time}
          onChange={setTime}
          disabled={saving}
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Nome do paciente"
          className="glass-card-input min-w-0 flex-1 rounded-xl px-3 py-2.5 text-[13px] text-hiro-text outline-none placeholder:text-hiro-muted/40 focus:ring-2 focus:ring-hiro-green/30"
        />
      </div>
      {error && (
        <p className="text-[11px] text-hiro-red">{error}</p>
      )}
      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="w-full rounded-full bg-hiro-text py-2 text-[13px] font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "Adicionando…" : "Adicionar consulta"}
      </button>
    </form>
  );
}

/* ─── Disconnected — choose between Google or manual ─────────────────────── */

function DisconnectedView({
  onConnect,
  onManual,
}: {
  onConnect: () => void;
  onManual: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-hiro-green/10">
        <Calendar className="h-5 w-5 text-hiro-green" strokeWidth={1.75} />
      </div>

      <p className="text-sm leading-relaxed text-hiro-muted">
        Visualize suas próximas consultas aqui
      </p>

      <div className="mt-4 flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={onConnect}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white/80 px-5 py-2.5 text-[13px] font-medium text-hiro-text transition-all duration-200 hover:bg-white hover:-translate-y-px hover:shadow-md active:translate-y-0 active:scale-[0.98]"
        >
          <GoogleIcon className="h-4 w-4" />
          Conectar ao Google Calendar
        </button>
        <button
          type="button"
          onClick={onManual}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-black/10 bg-transparent px-5 py-2.5 text-[13px] font-medium text-hiro-muted transition-all duration-200 hover:bg-black/[0.03] active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Adicionar consultas manualmente
        </button>
      </div>

      <p className="mt-3 text-[11px] text-hiro-muted/60">
        Em breve: Outlook, Apple Calendar
      </p>
    </div>
  );
}

/* ─── Manual appointments view ───────────────────────────────────────────── */

function ManualView({
  appointments,
  isLoading,
  onAdd,
  onRemove,
  onSwitchToGoogle,
}: {
  appointments: CalendarAppointment[];
  isLoading: boolean;
  onAdd: (name: string, time: string) => Promise<void>;
  onRemove: (id: string) => void;
  onSwitchToGoogle: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const todayAppts = appointments.filter((a) => isToday(a.startTime));

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-hiro-green" strokeWidth={1.75} />
          <h3 className="text-sm font-semibold text-hiro-text">
            Consultas do Dia
          </h3>
        </div>
        <span className="text-[11px] text-hiro-muted">
          {todayAppts.length} {todayAppts.length === 1 ? "agendada" : "agendadas"}
        </span>
      </div>

      {isLoading && appointments.length === 0 ? (
        <LoadingSkeleton />
      ) : appointments.length === 0 && !showForm ? (
        <p className="py-4 text-center text-sm text-hiro-muted">
          Nenhuma consulta adicionada
        </p>
      ) : (
        <div className="divide-y divide-black/[0.05]">
          {appointments.map((a, i) => (
            <AppointmentRow
              key={a.id}
              appointment={a}
              index={i}
              onRemove={() => onRemove(a.id)}
            />
          ))}
        </div>
      )}

      {showForm ? (
        <AddAppointmentForm
          onAdd={async (name, time) => {
            await onAdd(name, time);
            setShowForm(false);
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-black/15 py-2 text-[12px] font-medium text-hiro-muted transition-colors hover:border-hiro-green/40 hover:text-hiro-green"
        >
          <Plus className="h-3 w-3" strokeWidth={2} />
          Adicionar consulta
        </button>
      )}

      <button
        type="button"
        onClick={onSwitchToGoogle}
        className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-hiro-muted/60 transition-colors hover:text-hiro-green"
      >
        <GoogleIcon className="h-3 w-3" />
        Conectar ao Google Calendar
      </button>
    </>
  );
}

/* ─── Google connected view ──────────────────────────────────────────────── */

function ConnectedView({
  appointments,
  isLoading,
  onDisconnect,
  onRefresh,
}: {
  appointments: CalendarAppointment[];
  isLoading: boolean;
  onDisconnect: () => void;
  onRefresh: () => void;
}) {
  const todayAppts = appointments.filter((a) => isToday(a.startTime));
  const upcomingAppts = appointments.filter((a) => !isToday(a.startTime));

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-hiro-green" strokeWidth={1.75} />
          <h3 className="text-sm font-semibold text-hiro-text">
            Próximas Consultas
          </h3>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="rounded-full p-1.5 text-hiro-muted transition-colors hover:bg-black/[0.04] hover:text-hiro-text disabled:opacity-40"
          title="Atualizar"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            strokeWidth={1.75}
          />
        </button>
      </div>

      {isLoading && appointments.length === 0 ? (
        <LoadingSkeleton />
      ) : appointments.length === 0 ? (
        <p className="py-6 text-center text-sm text-hiro-muted">
          Nenhuma consulta agendada para hoje
        </p>
      ) : (
        <>
          {todayAppts.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">
                Hoje
              </p>
              <div className="divide-y divide-black/[0.05]">
                {todayAppts.map((a, i) => (
                  <AppointmentRow key={a.id} appointment={a} index={i} />
                ))}
              </div>
            </div>
          )}

          {upcomingAppts.length > 0 && (
            <div className={todayAppts.length > 0 ? "mt-4" : ""}>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">
                Próximos dias
              </p>
              <div className="divide-y divide-black/[0.05]">
                {upcomingAppts.map((a, i) => (
                  <AppointmentRow
                    key={a.id}
                    appointment={a}
                    index={i + todayAppts.length}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-4 flex items-center justify-between">
        <a
          href="https://calendar.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-hiro-muted/60 transition-colors hover:text-hiro-green"
        >
          Ver agenda completa
          <ExternalLink className="h-2.5 w-2.5" strokeWidth={2} />
        </a>
        <button
          type="button"
          onClick={onDisconnect}
          className="text-[11px] text-hiro-muted/60 transition-colors hover:text-hiro-red"
        >
          Desconectar
        </button>
      </div>
    </>
  );
}

/* ─── Error state ────────────────────────────────────────────────────────── */

function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <p className="text-sm text-hiro-red">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 text-[13px] font-medium text-hiro-green underline-offset-2 hover:underline"
      >
        Tentar novamente
      </button>
    </div>
  );
}

/* ─── Main widget ────────────────────────────────────────────────────────── */

export function CalendarWidget() {
  const {
    isConnected,
    isLoading,
    appointments,
    manualAppointments,
    hasManual,
    error,
    connectCalendar,
    disconnectCalendar,
    addManualAppointment,
    removeManualAppointment,
    refreshAppointments,
  } = useCalendar();

  const [showManual, setShowManual] = useState(false);

  // Initial loading
  if (isConnected === null && isLoading) {
    return (
      <section className="glass-card rounded-2xl p-6">
        <LoadingSkeleton />
      </section>
    );
  }

  // Determine which view to show
  const showGoogleConnected = isConnected === true;
  const showManualView = showManual || (!showGoogleConnected && hasManual);
  const showDisconnected = !showGoogleConnected && !showManualView;

  return (
    <section className="glass-card rounded-2xl p-6">
      {error && !isConnected && !hasManual ? (
        <ErrorView message={error} onRetry={refreshAppointments} />
      ) : showGoogleConnected ? (
        <ConnectedView
          appointments={appointments}
          isLoading={isLoading}
          onDisconnect={disconnectCalendar}
          onRefresh={refreshAppointments}
        />
      ) : showManualView ? (
        <ManualView
          appointments={manualAppointments}
          isLoading={isLoading}
          onAdd={addManualAppointment}
          onRemove={removeManualAppointment}
          onSwitchToGoogle={connectCalendar}
        />
      ) : showDisconnected ? (
        <DisconnectedView
          onConnect={connectCalendar}
          onManual={() => setShowManual(true)}
        />
      ) : null}
    </section>
  );
}
