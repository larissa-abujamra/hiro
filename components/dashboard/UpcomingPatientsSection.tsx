"use client";

import { useRouter } from "next/navigation";

export type UpcomingPatient = {
  id: string;
  name: string;
  initials: string;
  age: number;
  reason: string;
  time: string;
  status: "confirmed" | "waiting" | "cancelled";
  avatarColor: { bg: string; text: string };
};

const statusConfig = {
  confirmed: { label: "Confirmado", bg: "#D6E8DC", color: "#2D5C3F" },
  waiting: { label: "Aguardando", bg: "#FAEEDA", color: "#854F0B" },
  cancelled: { label: "Cancelado", bg: "#E8E4DC", color: "#6B7A6D" },
} as const;

function PatientRow({ patient, index }: { patient: UpcomingPatient; index: number }) {
  const router = useRouter();
  const badge = statusConfig[patient.status];

  return (
    <button
      type="button"
      onClick={() => router.push(`/pacientes/${patient.id}`)}
      className="animate-fade-up -mx-2 flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-3 text-left transition-all duration-150 hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hiro-active/35 focus-visible:ring-offset-2 focus-visible:ring-offset-hiro-card"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
        style={{
          backgroundColor: patient.avatarColor.bg,
          color: patient.avatarColor.text,
        }}
      >
        {patient.initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-hiro-text">{patient.name}</p>
        <p className="truncate text-sm text-hiro-muted">
          {patient.age} anos · {patient.reason}
        </p>
      </div>

      <span className="shrink-0 tabular-nums text-sm text-hiro-text">{patient.time}</span>

      <span
        className="hidden shrink-0 rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex"
        style={{ backgroundColor: badge.bg, color: badge.color }}
      >
        {badge.label}
      </span>
    </button>
  );
}

export function UpcomingPatientsSection({ patients }: { patients: UpcomingPatient[] }) {
  const router = useRouter();
  const list = patients;

  return (
    <section className="mt-6 rounded-2xl bg-hiro-card p-6 hiro-shadow-card">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-serif text-2xl font-normal tracking-tight text-hiro-text">
          Próximos pacientes
        </h2>
        <p className="text-sm text-hiro-muted">{list.length} agendados hoje</p>
      </div>

      {list.length === 0 ? (
        <p className="py-6 text-center text-sm text-hiro-muted">
          Nenhuma consulta agendada para hoje.
        </p>
      ) : (
        <>
          <div className="divide-y divide-black/[0.06]">
            {list.map((patient, index) => (
              <PatientRow key={patient.id} patient={patient} index={index} />
            ))}
          </div>

          <button
            type="button"
            onClick={() => router.push("/agenda")}
            className="mt-4 w-full rounded-full bg-hiro-text py-2.5 text-[13px] font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hiro-active/40 focus-visible:ring-offset-2 focus-visible:ring-offset-hiro-card"
          >
            Visualizar agenda completa
          </button>
        </>
      )}
    </section>
  );
}
