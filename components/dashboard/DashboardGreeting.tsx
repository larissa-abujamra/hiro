"use client";

import { useEffect, useState } from "react";
import { useDoctorStore } from "@/lib/doctorStore";

type Sexo = "M" | "F" | string;

function getTitle(sexo: Sexo) {
  if (sexo === "M") return "Dr.";
  if (sexo === "F") return "Dra.";
  return "Dr(a).";
}

function getTimeGreeting(sexo: Sexo): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return sexo === "M" ? "Bom dia" : sexo === "F" ? "Bom dia" : "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

function getSubGreeting(sexo: Sexo): string {
  const options = [
    "Como posso ajudar hoje?",
    sexo === "M" ? "Pronto para mais um dia?" : sexo === "F" ? "Pronta para mais um dia?" : "Pronto(a) para mais um dia?",
    "Sua agenda está aqui.",
    "Vamos começar?",
    "",
  ];
  // Use day-of-year as seed so it's stable within a day but changes daily
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return options[dayOfYear % options.length];
}

interface DashboardGreetingProps {
  serverName: string;
  serverSexo: string;
}

export function DashboardGreeting({ serverName, serverSexo }: DashboardGreetingProps) {
  const [hydrated, setHydrated] = useState(false);
  const doctorProfile = useDoctorStore((s) => s.profile);

  useEffect(() => setHydrated(true), []);

  const sexo = hydrated && (doctorProfile.sexo === "M" || doctorProfile.sexo === "F")
    ? doctorProfile.sexo
    : serverSexo;

  const fullName = hydrated && doctorProfile.nome
    ? `${doctorProfile.nome} ${doctorProfile.sobrenome}`.trim()
    : serverName;

  const firstName = fullName.trim().split(" ")[0] || "";
  const title = getTitle(sexo);

  // Only compute time-based greeting after hydration to avoid mismatch
  const timeGreeting = hydrated ? getTimeGreeting(sexo) : "Olá";
  const subGreeting = hydrated ? getSubGreeting(sexo) : "";

  return (
    <header className="mb-8">
      <h1 className="font-serif text-4xl font-normal tracking-tight text-balance text-hiro-text">
        {timeGreeting},{" "}
        <span className="italic text-hiro-green">
          {firstName ? `${title} ${firstName}.` : "médico(a)."}
        </span>
      </h1>
      {subGreeting && (
        <p className="mt-1.5 text-[14px] text-hiro-muted">{subGreeting}</p>
      )}
      <p className="mt-1 text-sm leading-relaxed text-hiro-muted/60" suppressHydrationWarning>
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
