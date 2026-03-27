"use client";

import Link from "next/link";
import { AvatarInitials } from "@/components/ui/AvatarInitials";
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { useConsultationStore } from "@/lib/store";

export function PatientsDashboard() {
  const patients = useConsultationStore((state) => state.patients);

  return (
    <section className="mt-6 grid gap-4">
      {patients.map((patient) => (
        <CardHiro key={patient.id} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AvatarInitials name={patient.name} />
            <div>
              <p className="font-medium text-hiro-text">{patient.name}</p>
              <p className="text-xs text-hiro-muted">
                {patient.consultations.length} consultas • {patient.medications.length} medicações
              </p>
            </div>
          </div>
          <div className="text-right">
            <OverlineLabel>Perfil</OverlineLabel>
            <Link href={`/pacientes/${patient.id}`} className="block text-sm underline">
              Ver paciente
            </Link>
          </div>
        </CardHiro>
      ))}
    </section>
  );
}
