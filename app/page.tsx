"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Calendar,
  Clock,
  EyeOff,
  FileText,
  Lock,
  Mic,
  Percent,
  Pill,
  Server,
  Shield,
  Sparkles,
  Trophy,
} from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Navbar ─────────────────────────────────────────────────────────────── */

function Navbar({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
      style={{
        background: "rgba(14, 22, 16, 0.7)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <span className="font-serif text-2xl font-normal tracking-tight text-white/90">
          hiro.
        </span>

        <div className="hidden items-center gap-8 md:flex">
          {[
            { label: "Como Funciona", id: "como-funciona" },
            { label: "Integrações", id: "integracoes" },
            { label: "Segurança", id: "seguranca" },
          ].map(({ label, id }) => (
            <button
              key={id}
              type="button"
              onClick={() => onScrollTo(id)}
              className="text-[13px] text-white/50 transition-colors hover:text-white/90"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-[13px] font-medium text-white/60 transition-colors hover:text-white md:inline"
          >
            Entrar
          </Link>
          <a
            href="https://calendly.com/abujamra-usc/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white/90 px-5 py-2 text-[13px] font-medium text-[#0e1610] transition-all duration-200 hover:bg-white hover:-translate-y-px hover:shadow-lg"
          >
            Agendar Demonstração
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */

function HeroSection({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  return (
    <section className="relative overflow-hidden pt-24">
      <ContainerScroll
        titleComponent={
          <div className="mb-8 flex flex-col items-center text-center md:mb-12">
            <h1 className="font-serif text-5xl font-normal leading-[1.1] tracking-tight text-white/95 md:text-7xl">
              Foque no paciente.
              <br />
              <span className="italic text-[#7cc49e]">
                A gente cuida do prontuário.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/50 md:text-lg">
              O Hiro usa inteligência artificial para transcrever suas consultas e
              gerar prontuários SOAP completos — em segundos.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://calendly.com/abujamra-usc/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#2d5c3f] px-8 py-3.5 text-[14px] font-medium text-white transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_32px_rgba(45,92,63,0.4)]"
              >
                Agendar Demonstração
              </a>
              <button
                type="button"
                onClick={() => onScrollTo("como-funciona")}
                className="text-[14px] font-medium text-white/50 underline-offset-4 transition-colors hover:text-white/80 hover:underline"
              >
                Ver como funciona
              </button>
            </div>
          </div>
        }
      >
        {/* Placeholder "screenshot" inside the tablet */}
        <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-[#1a2e20] to-[#0e1610] p-6 md:p-10">
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2d5c3f]/50 ring-1 ring-white/10">
              <Mic className="h-7 w-7 text-[#7cc49e]" strokeWidth={1.5} />
            </div>
            <p className="font-serif text-2xl text-white/70 md:text-3xl">
              Hiro Dashboard
            </p>
            <p className="text-sm text-white/30">
              Transcrição em tempo real com IA
            </p>
            <div className="mt-4 grid w-full max-w-md grid-cols-3 gap-3">
              {["7 consultas", "100% documentadas", "11 min média"].map((t) => (
                <div
                  key={t}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-3"
                >
                  <p className="text-[11px] text-white/40">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ContainerScroll>
    </section>
  );
}

/* ─── O Problema ─────────────────────────────────────────────────────────── */

function ProblemSection() {
  const stats = [
    { icon: Clock, value: "16 min", label: "Tempo médio documentando cada consulta" },
    { icon: Percent, value: "40%", label: "Do dia em tarefas administrativas" },
    { icon: Trophy, value: "#1", label: "Causa de burnout entre médicos" },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <FadeIn className="text-center">
          <h2 className="font-serif text-3xl font-normal leading-tight tracking-tight text-white/90 md:text-5xl">
            Médicos gastam até 2 horas
            <br className="hidden md:block" /> por dia em documentação.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/40 md:text-lg">
            Tempo que poderia ser dedicado ao que realmente importa: seus pacientes.
          </p>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {stats.map(({ icon: Icon, value, label }, i) => (
            <FadeIn key={value} delay={i * 0.1}>
              <div
                className="rounded-2xl border border-white/[0.08] p-8 text-center"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(24px)",
                }}
              >
                <Icon className="mx-auto mb-4 h-6 w-6 text-[#7cc49e]" strokeWidth={1.5} />
                <p className="font-serif text-4xl font-normal tracking-tight text-white/90 md:text-5xl">
                  {value}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/45">{label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Como Funciona ──────────────────────────────────────────────────────── */

function HowItWorksSection() {
  const steps = [
    {
      icon: Mic,
      title: "Grave a consulta",
      desc: "Inicie a gravação enquanto atende seu paciente normalmente.",
    },
    {
      icon: Sparkles,
      title: "A IA transcreve",
      desc: "Transcrição em tempo real com extração automática de informações clínicas.",
    },
    {
      icon: FileText,
      title: "Prontuário pronto",
      desc: "Receba o SOAP estruturado com um clique.",
    },
  ];

  return (
    <section id="como-funciona" className="py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <FadeIn className="text-center">
          <h2 className="font-serif text-3xl font-normal tracking-tight text-white/90 md:text-5xl">
            Simples. Rápido. Preciso.
          </h2>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <FadeIn key={title} delay={i * 0.1}>
              <div
                className="group rounded-2xl border border-white/[0.08] p-8 transition-colors hover:border-white/[0.15]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(24px)",
                }}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2d5c3f]/40 ring-1 ring-white/10 transition-colors group-hover:bg-[#2d5c3f]/60">
                  <Icon className="h-6 w-6 text-[#7cc49e]" strokeWidth={1.5} />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30">
                  Passo {i + 1}
                </p>
                <h3 className="mt-1 font-serif text-xl text-white/85">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Integrações ────────────────────────────────────────────────────────── */

function IntegrationsSection() {
  const integrations = [
    {
      icon: Pill,
      name: "Memed",
      desc: "Prescrições digitais integradas",
    },
    {
      icon: Calendar,
      name: "Google Calendar",
      desc: "Sincronize sua agenda automaticamente",
    },
    {
      icon: Sparkles,
      name: "Em breve",
      desc: "Integração com principais PEPs do Brasil",
      muted: true,
    },
  ];

  return (
    <section id="integracoes" className="py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <FadeIn className="text-center">
          <h2 className="font-serif text-3xl font-normal tracking-tight text-white/90 md:text-5xl">
            Conectado ao seu fluxo de trabalho
          </h2>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {integrations.map(({ icon: Icon, name, desc, muted }, i) => (
            <FadeIn key={name} delay={i * 0.1}>
              <div
                className={`rounded-2xl border p-8 ${
                  muted
                    ? "border-dashed border-white/[0.08]"
                    : "border-white/[0.08]"
                }`}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(24px)",
                }}
              >
                <Icon
                  className={`mb-4 h-6 w-6 ${
                    muted ? "text-white/25" : "text-[#7cc49e]"
                  }`}
                  strokeWidth={1.5}
                />
                <h3
                  className={`font-serif text-xl ${
                    muted ? "text-white/40" : "text-white/85"
                  }`}
                >
                  {name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Segurança ──────────────────────────────────────────────────────────── */

function SecuritySection() {
  const items = [
    { icon: Lock, text: "Criptografia de ponta a ponta" },
    { icon: Shield, text: "Em conformidade com a LGPD" },
    { icon: Server, text: "Dados armazenados em servidores seguros" },
    { icon: EyeOff, text: "Nunca compartilhamos informações com terceiros" },
  ];

  return (
    <section id="seguranca" className="py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <FadeIn className="text-center">
          <h2 className="font-serif text-3xl font-normal tracking-tight text-white/90 md:text-5xl">
            Seus dados protegidos. Sempre.
          </h2>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {items.map(({ icon: Icon, text }, i) => (
            <FadeIn key={text} delay={i * 0.08}>
              <div
                className="flex items-start gap-4 rounded-2xl border border-white/[0.08] p-6"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(24px)",
                }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2d5c3f]/40 ring-1 ring-white/10">
                  <Icon className="h-5 w-5 text-[#7cc49e]" strokeWidth={1.5} />
                </div>
                <p className="pt-2 text-sm leading-relaxed text-white/60">{text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Final ──────────────────────────────────────────────────────────── */

function CTASection() {
  return (
    <section className="py-24 md:py-32">
      <FadeIn>
        <div
          className="mx-auto max-w-4xl rounded-3xl border border-white/[0.08] px-8 py-16 text-center md:px-16 md:py-20"
          style={{
            background:
              "linear-gradient(160deg, rgba(26, 58, 40, 0.7) 0%, rgba(14, 30, 20, 0.8) 100%)",
            backdropFilter: "blur(32px)",
          }}
        >
          <h2 className="font-serif text-3xl font-normal tracking-tight text-white/90 md:text-5xl">
            Pronto para transformar
            <br /> sua rotina?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/45 md:text-lg">
            Agende uma demonstração gratuita e veja o Hiro em ação.
          </p>
          <a
            href="https://calendly.com/abujamra-usc/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-white/90 px-10 py-4 text-[15px] font-medium text-[#0e1610] transition-all duration-200 hover:bg-white hover:-translate-y-px hover:shadow-[0_8px_32px_rgba(255,255,255,0.15)]"
          >
            Agendar Demonstração
          </a>
          <p className="mt-4 text-[13px] text-white/30">
            Sem compromisso. Leva apenas 15 minutos.
          </p>
        </div>
      </FadeIn>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 md:flex-row md:justify-between md:px-8">
        <span className="font-serif text-xl text-white/60">hiro.</span>

        <div className="flex flex-wrap items-center justify-center gap-6 text-[13px] text-white/35">
          <a href="mailto:contato@hiro.med.br" className="transition-colors hover:text-white/60">
            Contato
          </a>
          <span className="hidden h-3 w-px bg-white/15 md:block" />
          <a href="#" className="transition-colors hover:text-white/60">
            Termos de Uso
          </a>
          <span className="hidden h-3 w-px bg-white/15 md:block" />
          <a href="#" className="transition-colors hover:text-white/60">
            Política de Privacidade
          </a>
        </div>

        <div className="text-center text-[12px] text-white/25 md:text-right">
          <p>Feito no Brasil</p>
          <p className="mt-0.5">2026 Hiro. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #0e1610 0%, #0a110c 50%, #0e1610 100%)" }}
    >
      <Navbar onScrollTo={scrollTo} />
      <HeroSection onScrollTo={scrollTo} />
      <ProblemSection />
      <HowItWorksSection />
      <IntegrationsSection />
      <SecuritySection />
      <CTASection />
      <Footer />
    </div>
  );
}
