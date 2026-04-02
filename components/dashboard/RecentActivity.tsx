"use client";

import { FileText, Mic, UserPlus, Save } from "lucide-react";
import { iconCircleGlassOnLightCard } from "@/lib/iconCircleGlassStyles";
import { useConsultationStore, type ActivityEntry } from "@/lib/store";

const CONFIG: Record<
  ActivityEntry["type"],
  { icon: typeof Mic; label: string; color: string }
> = {
  consultation_started: {
    icon: Mic,
    label: "Consulta iniciada",
    color: "text-hiro-active",
  },
  prontuario_generated: {
    icon: FileText,
    label: "Prontuário gerado",
    color: "text-hiro-active",
  },
  consultation_saved: {
    icon: Save,
    label: "Consulta salva",
    color: "text-[#854F0B]",
  },
  patient_created: {
    icon: UserPlus,
    label: "Paciente cadastrado",
    color: "text-hiro-green",
  },
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);

  if (diffMin < 1) return "Agora mesmo";
  if (diffMin < 60) return `Há ${diffMin} min`;
  if (diffHr < 24) {
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActivityRow({ entry, index }: { entry: ActivityEntry; index: number }) {
  const cfg = CONFIG[entry.type];
  const Icon = cfg.icon;

  return (
    <li
      className="animate-fade-up flex gap-3 py-3"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.color}`}
        style={iconCircleGlassOnLightCard}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-medium leading-snug text-hiro-text">
          {cfg.label} — {entry.patientName}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-hiro-muted">
          {formatTimestamp(entry.timestamp)}
        </p>
      </div>
    </li>
  );
}

export function RecentActivity() {
  const activityLog = useConsultationStore((s) => s.activityLog);
  const recent = activityLog.slice(0, 5);

  return (
    <div>
      <h3 className="font-serif text-2xl font-normal tracking-tight text-hiro-text">
        Última atividade
      </h3>
      {recent.length === 0 ? (
        <p className="py-6 text-center text-sm text-hiro-muted">
          Nenhuma atividade recente. Inicie uma consulta para começar.
        </p>
      ) : (
        <ul
          className="mt-4 divide-y divide-black/[0.06]"
          aria-label="Atividades recentes"
        >
          {recent.map((entry, i) => (
            <ActivityRow key={entry.id} entry={entry} index={i} />
          ))}
        </ul>
      )}
    </div>
  );
}
