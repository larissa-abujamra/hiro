"use client";

import { useEffect, useState } from "react";
import { useDoctorStore } from "@/lib/doctorStore";

function buildGreeting(fullName: string, sexo: string) {
  const firstName = fullName.trim().split(" ")[0] ?? fullName;
  if (sexo === "M") return { verb: "Bem-vindo", title: "Dr.", firstName };
  if (sexo === "F") return { verb: "Bem-vinda", title: "Dra.", firstName };
  return { verb: "Bem-vindo(a)", title: "Dr(a).", firstName };
}

interface DashboardGreetingProps {
  /** full_name from Supabase user_metadata */
  serverName: string;
  /** sexo from Supabase user_metadata or profiles table */
  serverSexo: string;
}

export function DashboardGreeting({ serverName, serverSexo }: DashboardGreetingProps) {
  const [hydrated, setHydrated] = useState(false);
  const doctorProfile = useDoctorStore((s) => s.profile);

  useEffect(() => setHydrated(true), []);

  // Priority: doctor profile (localStorage) > profiles table > user_metadata > fallback
  const sexo = hydrated && (doctorProfile.sexo === "M" || doctorProfile.sexo === "F")
    ? doctorProfile.sexo
    : serverSexo;

  const fullName = hydrated && doctorProfile.nome
    ? `${doctorProfile.nome} ${doctorProfile.sobrenome}`.trim()
    : serverName;

  const { verb, title, firstName } = buildGreeting(fullName, sexo);

  return (
    <header className="mb-8">
      <h1 className="font-serif text-4xl font-normal tracking-tight text-balance text-hiro-text">
        {verb},{" "}
        <span className="italic text-hiro-green">
          {firstName ? `${title} ${firstName}.` : "médico(a)."}
        </span>
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-hiro-muted">
        {new Date().toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
    </header>
  );
}
