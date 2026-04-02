"use client";

import { Calendar, ExternalLink, RefreshCw } from "lucide-react";
import { useCalendar } from "@/hooks/useCalendar";
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

/* Skeleton rows while loading */
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
}: {
  appointment: CalendarAppointment;
  index: number;
}) {
  const today = isToday(appointment.startTime);

  return (
    <div
      className="animate-fade-up flex items-center gap-3 py-2.5"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Colored dot */}
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          today ? "bg-hiro-green" : "bg-hiro-amber"
        }`}
      />

      {/* Time */}
      <span className="w-12 shrink-0 text-sm font-medium tabular-nums text-hiro-text">
        {formatTime(appointment.startTime)}
      </span>

      {/* Title */}
      <span className="min-w-0 flex-1 truncate text-sm text-hiro-muted">
        {appointment.title}
      </span>
    </div>
  );
}

/* ─── Disconnected state ─────────────────────────────────────────────────── */

function DisconnectedView({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-hiro-green/10">
        <Calendar className="h-5 w-5 text-hiro-green" strokeWidth={1.75} />
      </div>

      <p className="text-sm leading-relaxed text-hiro-muted">
        Conecte seu calendário para visualizar suas próximas consultas aqui
      </p>

      <button
        type="button"
        onClick={onConnect}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-5 py-2.5 text-[13px] font-medium text-hiro-text transition-all duration-200 hover:bg-white hover:-translate-y-px hover:shadow-md active:translate-y-0 active:scale-[0.98]"
      >
        <GoogleIcon className="h-4 w-4" />
        Conectar ao Google Calendar
      </button>

      <p className="mt-3 text-[11px] text-hiro-muted/60">
        Em breve: Outlook, Apple Calendar
      </p>
    </div>
  );
}

/* ─── Connected state ────────────────────────────────────────────────────── */

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
          {/* Today */}
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

          {/* Upcoming */}
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
    error,
    connectCalendar,
    disconnectCalendar,
    refreshAppointments,
  } = useCalendar();

  // Initial loading
  if (isConnected === null && isLoading) {
    return (
      <section className="glass-card rounded-2xl p-6">
        <LoadingSkeleton />
      </section>
    );
  }

  return (
    <section className="glass-card rounded-2xl p-6">
      {error && !isConnected ? (
        <ErrorView message={error} onRetry={refreshAppointments} />
      ) : isConnected ? (
        <ConnectedView
          appointments={appointments}
          isLoading={isLoading}
          onDisconnect={disconnectCalendar}
          onRefresh={refreshAppointments}
        />
      ) : (
        <DisconnectedView onConnect={connectCalendar} />
      )}
    </section>
  );
}
