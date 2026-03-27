import Link from "next/link";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import type { Consultation } from "@/lib/types";

interface ConsultationHistoryProps {
  consultations: Consultation[];
  patientId: string;
}

export function ConsultationHistory({
  consultations,
  patientId,
}: ConsultationHistoryProps) {
  return (
    <section className="rounded-2xl border border-black/7 bg-hiro-card p-4">
      <OverlineLabel>Histórico de consultas</OverlineLabel>
      <ul className="mt-3 space-y-2">
        {[...consultations].reverse().map((consultation) => (
          <li
            key={consultation.id}
            className="rounded-xl border border-black/10 bg-white/55 p-3 text-sm text-hiro-text"
          >
            <p className="font-medium">
              {consultation.date} • {consultation.reason}
            </p>
            <p className="text-xs text-hiro-muted">
              CID principal: {consultation.confirmedCids[0]?.code ?? "—"} • Médico:
              responsável
            </p>
            <Link
              href={`/consulta/${consultation.id}/resumo?patient=${patientId}`}
              className="mt-1 inline-block text-xs underline"
            >
              Ver prontuário completo
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
