import type { Patient } from "@/lib/types";

interface PatientContextProps {
  patient: Patient;
}

export function PatientContext({ patient }: PatientContextProps) {
  return (
    <section className="rounded-2xl bg-white/50 p-4">
      <p className="text-sm font-medium text-hiro-text">{patient.name}</p>
      <p className="mt-1 text-xs text-hiro-muted">
        Condicoes: {(patient.conditions ?? []).join(", ")}
      </p>
    </section>
  );
}
