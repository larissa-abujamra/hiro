import type { Consultation } from "@/lib/types";

interface ConsultationHistoryProps {
  consultations: Consultation[];
}

export function ConsultationHistory({ consultations }: ConsultationHistoryProps) {
  return (
    <section className="rounded-2xl bg-white/50 p-4">
      <p className="text-sm font-medium text-hiro-text">Historico de consultas</p>
      <ul className="mt-3 space-y-2">
        {consultations.map((consultation) => (
          <li key={consultation.id} className="text-sm text-hiro-text">
            {consultation.date} - {consultation.reason}
          </li>
        ))}
      </ul>
    </section>
  );
}
