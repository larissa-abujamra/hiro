"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Calendar,
  ClipboardList,
  FileText,
  Globe,
  Mic,
  Pill,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Mic,
  FileText,
  Pill,
  Calendar,
  Users,
  ClipboardList,
  Shield,
  Globe,
};

interface Feature {
  title: string;
  subtitle: string;
  icon: string;
}

const features: Feature[] = [
  { title: "Transcrição em tempo real", subtitle: "Fale normalmente, o hiro escuta", icon: "Mic" },
  { title: "Prontuário SOAP automático", subtitle: "Gerado com um clique", icon: "FileText" },
  { title: "Prescrições digitais", subtitle: "Integração com Memed", icon: "Pill" },
  { title: "Agenda sincronizada", subtitle: "Google Calendar conectado", icon: "Calendar" },
  { title: "Histórico de pacientes", subtitle: "Todas as consultas organizadas", icon: "Users" },
  { title: "Dados complementares", subtitle: "Digite peso, altura, PA durante a consulta", icon: "ClipboardList" },
  { title: "Segurança LGPD", subtitle: "Seus dados sempre protegidos", icon: "Shield" },
  { title: "Funciona no navegador", subtitle: "Sem instalar nada", icon: "Globe" },
];

/* Duplicate the list so the loop is seamless */
const doubled = [...features, ...features];

function FeatureRow({ feature }: { feature: Feature }) {
  const Icon = ICONS[feature.icon] ?? Globe;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.04] px-5 py-4 transition-colors hover:bg-white/[0.07]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2d5a47]/50 ring-1 ring-white/[0.08]">
        <Icon className="h-5 w-5 text-[#7fb69a]" strokeWidth={1.5} />
      </div>
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-[#f5f5f0]">{feature.title}</p>
        <p className="text-[12px] text-white/40">{feature.subtitle}</p>
      </div>
    </div>
  );
}

export function FeaturesScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="relative bg-[#0f1a13] py-24 md:py-32" ref={ref}>
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute right-[15%] top-[20%] h-[500px] w-[500px]"
          style={{ background: "radial-gradient(circle, rgba(45,90,71,0.18) 0%, transparent 60%)" }}
        />
        <div
          className="absolute left-[5%] bottom-[10%] h-[400px] w-[400px]"
          style={{ background: "radial-gradient(circle, rgba(201,169,98,0.06) 0%, transparent 55%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">

          {/* Left — scrolling card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="relative overflow-hidden rounded-3xl border border-white/[0.08] p-1"
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(32px)",
                height: "420px",
              }}
            >
              {/* Top fade mask */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16"
                style={{ background: "linear-gradient(to bottom, #0f1a13 0%, transparent 100%)" }}
              />
              {/* Bottom fade mask */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16"
                style={{ background: "linear-gradient(to top, #0f1a13 0%, transparent 100%)" }}
              />

              {/* Scrolling content */}
              <div className="flex h-full flex-col">
                <motion.div
                  className="flex flex-col gap-3 px-4 py-4"
                  animate={{ y: [0, -(features.length * 76)] }}
                  transition={{
                    y: {
                      duration: 16,
                      repeat: Infinity,
                      ease: "linear",
                    },
                  }}
                >
                  {doubled.map((feature, i) => (
                    <FeatureRow key={`${feature.icon}-${i}`} feature={feature} />
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right — content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col"
          >
            <span className="inline-flex w-fit rounded-full border border-[#c9a962]/25 bg-[#c9a962]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#c9a962]">
              Funcionalidades
            </span>

            <h2 className="mt-5 font-serif text-4xl font-normal leading-tight tracking-tight text-[#f5f5f0] md:text-5xl">
              Tudo que você precisa para documentar melhor
            </h2>

            <p className="mt-4 max-w-md text-base leading-relaxed text-white/40 md:text-lg">
              O hiro combina transcrição por voz, inteligência artificial e
              integrações inteligentes para transformar a forma como você
              documenta suas consultas.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {["IA Avançada", "Integrações", "Fácil de usar"].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[12px] font-medium text-white/55"
                >
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
