"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AvatarInitials } from "@/components/ui/AvatarInitials";
import { CardHiro } from "@/components/ui/CardHiro";
import { useConsultationStore } from "@/lib/store";

export function PatientsDashboard() {
  const patients = useConsultationStore((state) => state.patients);
  const [countsByPatient, setCountsByPatient] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/consultations?limit=999");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data)) return;
        const counts: Record<string, number> = {};
        for (const c of data) {
          const pid = c.patient_id as string;
          counts[pid] = (counts[pid] ?? 0) + 1;
        }
        setCountsByPatient(counts);
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="mt-6 grid gap-4">
      {patients.map((patient, index) => (
        <Link
          key={patient.id}
          href={`/pacientes/${patient.id}`}
          className="animate-fade-up block transition-transform duration-150 active:scale-[0.995]"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <CardHiro className="flex cursor-pointer items-center justify-between gap-3 transition-all duration-150 ease-out hover:-translate-y-px hover:bg-black/[0.02]">
            <div className="flex items-center gap-3">
              <AvatarInitials name={patient.name} />
              <div>
                <p className="font-medium text-hiro-text">{patient.name}</p>
                <p className="text-xs tabular-nums text-hiro-muted">
                  {countsByPatient[patient.id] ?? 0} consultas · {patient.medications.length} medicações
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="link-arrow ml-auto inline-flex text-sm font-medium text-hiro-green">
                <span>Ver paciente</span>
                <span aria-hidden>→</span>
              </p>
            </div>
          </CardHiro>
        </Link>
      ))}
    </section>
  );
}
