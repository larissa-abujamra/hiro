"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  EyeOff,
  FileText,
  Lock,
  Mic,
  Pill,
  Server,
  Shield,
  Sparkles,
} from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { DitheringShader } from "@/components/ui/dithering-shader";
import { FeaturesScroll } from "@/components/ui/features-scroll";

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
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ScaleIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Animated count-up number */
function AnimatedNumber({
  value,
  suffix = "",
  prefix = "",
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [inView, motionVal, value]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

/* ─── Navbar ─────────────────────────────────────────────────────────────── */

function Navbar({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
      style={{
        background: "rgba(14, 22, 16, 0.75)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
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

        <div className="flex items-center gap-6">
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
            Agendar Demo
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero — dark ────────────────────────────────────────────────────────── */

function HeroSection({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  return (
    <section className="relative overflow-hidden bg-[#0f1a13] pt-24">
      {/* Subtle organic radial accents */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute left-[-10%] top-[10%] h-[700px] w-[700px]"
          style={{ background: "radial-gradient(circle, rgba(45,90,60,0.25) 0%, transparent 65%)" }}
        />
        <div
          className="absolute right-[-8%] top-[30%] h-[500px] w-[500px]"
          style={{ background: "radial-gradient(circle, rgba(201,169,98,0.1) 0%, transparent 60%)" }}
        />
      </div>

      <ContainerScroll
        titleComponent={
          <div className="mb-8 flex flex-col items-center text-center md:mb-12">
            <h1 className="font-serif text-4xl font-normal leading-[1.1] tracking-tight text-white/95 md:text-6xl lg:text-[4.5rem]">
              Foque no paciente.
              <br />
              <span className="italic font-light text-[#7fb69a]">
                O <em className="font-semibold">Hiro</em> cuida do prontuário.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/45 md:text-lg">
              O Hiro usa inteligência artificial para transcrever suas consultas e
              gerar prontuários SOAP completos — em segundos.
            </p>
          </div>
        }
      >
        <img
          src="/dashboard-preview.png"
          alt="Dashboard do Hiro mostrando métricas, agenda e ações rápidas"
          className="w-full"
          draggable={false}
        />
      </ContainerScroll>

      {/* CTAs below the tablet */}
      <div className="flex flex-wrap items-center justify-center gap-4 pb-20 md:pb-28">
        <a
          href="https://calendly.com/abujamra-usc/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-full bg-[#2d5a47] px-8 py-3.5 text-[14px] font-medium text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#367a5a] hover:shadow-[0_8px_32px_rgba(45,92,63,0.45)]"
        >
          Agendar Demonstração
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
        </a>
        <button
          type="button"
          onClick={() => onScrollTo("como-funciona")}
          className="text-[14px] font-medium text-white/45 underline-offset-4 transition-colors hover:text-white/80 hover:underline"
        >
          Ver como funciona
        </button>
      </div>
    </section>
  );
}

/* ─── O Problema — light ─────────────────────────────────────────────────── */

function ProblemSection() {
  const stats = [
    { numValue: 16, suffix: " min", label: <>Tempo médio documentando<br />cada consulta</> },
    { numValue: 40, suffix: "%", label: "Do dia em tarefas administrativas" },
    { staticValue: "#1", label: "Causa de burnout entre médicos" },
  ];

  return (
    <section className="relative bg-[#f5f0e8] py-24 md:py-36">
      {/* Subtle organic pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden>
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q45 15 30 30 Q15 45 30 55' fill='none' stroke='%231a3a2f' stroke-width='0.5'/%3E%3C/svg%3E\")",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-5 md:px-8">
        <FadeIn className="text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#c9a962]">
            O problema
          </p>
          <h2 className="mt-3 font-serif text-4xl font-normal leading-tight tracking-tight text-[#1a1a1a] md:text-[3.2rem]">
            Médicos gastam até 2 horas
            <br className="hidden md:block" /> por dia em documentação.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#1a1a1a]/50 md:text-lg">
            Tempo que poderia ser dedicado ao que realmente importa: seus
            pacientes.
          </p>
        </FadeIn>

        {/* Editorial numbers with vertical dividers */}
        <div className="mt-20 grid grid-cols-1 gap-12 text-center md:mt-24 md:grid-cols-3 md:gap-0">
          {stats.map(({ numValue, suffix, staticValue, label }, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div className={`${i > 0 ? "md:border-l md:border-[#d4c9b8]" : ""} md:px-8 flex flex-col items-center justify-center`}>
                <p className="whitespace-nowrap font-serif text-5xl font-medium tracking-tight text-[#1a1a1a] md:text-6xl lg:text-7xl">
                  {staticValue ? (
                    staticValue
                  ) : (
                    <AnimatedNumber value={numValue!} suffix={suffix ?? ""} />
                  )}
                </p>
                <p className="mx-auto mt-4 text-sm leading-relaxed text-[#1a1a1a]/45 md:text-base">
                  {label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Como Funciona — dark ───────────────────────────────────────────────── */

function HowItWorksSection() {
  const steps = [
    {
      icon: Mic,
      title: "Grave a consulta",
      desc: "Inicie a gravação enquanto atende seu paciente normalmente. Sem mudanças no seu fluxo.",
    },
    {
      icon: Sparkles,
      title: "A IA transcreve",
      desc: "Transcrição em tempo real com extração automática de informações clínicas relevantes.",
    },
    {
      icon: FileText,
      title: "Prontuário pronto",
      desc: "Receba o SOAP estruturado, revise e exporte. Tudo com um clique.",
    },
  ];

  return (
    <section id="como-funciona" className="relative bg-[#0f1a13] py-28 md:py-36">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(ellipse, rgba(45,90,71,0.2) 0%, transparent 65%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-5 md:px-8">
        <FadeIn className="text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#c9a962]">
            Como funciona
          </p>
          <h2 className="mt-3 font-serif text-4xl font-normal tracking-tight text-[#f5f5f0] md:text-6xl">
            Simples. Rápido. Preciso.
          </h2>
        </FadeIn>

        {/* Timeline layout */}
        <div className="relative mt-16">
          {/* Connecting line — desktop only */}
          <div className="absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-transparent via-[#2d5a47]/50 to-transparent md:block" />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <ScaleIn key={title} delay={i * 0.15}>
                <div className="group relative flex flex-col items-center text-center">
                  {/* Step number circle */}
                  <div className="relative z-10 mb-6 flex h-[104px] w-[104px] items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-[#2d5a47]/20 transition-colors group-hover:bg-[#2d5a47]/35" />
                    <div className="absolute inset-3 rounded-full bg-[#0f1a13] ring-1 ring-[#2d5a47]/40" />
                    <Icon className="relative h-8 w-8 text-[#7fb69a]" strokeWidth={1.5} />
                  </div>

                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c9a962]">
                    Passo {i + 1}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl text-[#f5f5f0]">{title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/40">{desc}</p>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}

/* ─── Integrações — light ────────────────────────────────────────────────── */

function IntegrationsSection() {
  const integrations = [
    {
      icon: Pill,
      name: "Memed",
      desc: "Prescrições digitais integradas diretamente no fluxo da consulta.",
      color: "#2d5a47",
    },
    {
      icon: Calendar,
      name: "Google Calendar",
      desc: "Sincronize sua agenda automaticamente e veja próximas consultas no dashboard.",
      color: "#1a73e8",
    },
    {
      icon: Sparkles,
      name: "Em breve",
      desc: "Integração com iClinic, MV SOUL, Tasy, Pixeon e outros PEPs do Brasil.",
      color: "#999",
      muted: true,
    },
  ];

  return (
    <section id="integracoes" className="relative bg-[#faf8f5] py-24 md:py-32">
      <div className="relative mx-auto max-w-5xl px-5 md:px-8">
        <FadeIn className="text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#2d5a47]">
            Integrações
          </p>
          <h2 className="mt-3 font-serif text-4xl font-normal tracking-tight text-[#1a1a1a] md:text-[3.2rem]">
            Conectado ao seu fluxo de trabalho
          </h2>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {integrations.map(({ icon: Icon, name, desc, color, muted }, i) => (
            <FadeIn key={name} delay={i * 0.12} className="h-full">
              <div
                className={`group flex h-full flex-col rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] ${
                  muted
                    ? "border-dashed border-[#1a1a1a]/10 bg-white/40"
                    : "border-[#1a1a1a]/[0.06] bg-white/70"
                }`}
                style={{ backdropFilter: "blur(12px)" }}
              >
                <div
                  className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: `${color}12` }}
                >
                  <Icon
                    className="h-7 w-7"
                    style={{ color: muted ? "#bbb" : color }}
                    strokeWidth={1.5}
                  />
                </div>
                <h3
                  className={`font-serif text-2xl ${
                    muted ? "text-[#1a1a1a]/35" : "text-[#1a1a1a]"
                  }`}
                >
                  {name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#1a1a1a]/45">{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

    </section>
  );
}

/* ─── Segurança — dark ───────────────────────────────────────────────────── */

function SecuritySection() {
  const items = [
    { icon: Lock, title: "Criptografia", text: "Dados protegidos com criptografia de ponta a ponta em trânsito e em repouso." },
    { icon: Shield, title: "LGPD", text: "Em total conformidade com a Lei Geral de Proteção de Dados brasileira." },
    { icon: Server, title: "Infraestrutura", text: "Servidores seguros com redundância e backups automáticos." },
    { icon: EyeOff, title: "Privacidade", text: "Seus dados nunca são compartilhados, vendidos ou usados para treinar modelos." },
  ];

  return (
    <section id="seguranca" className="relative bg-[#0f1a13] py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute right-[10%] top-[20%] h-[500px] w-[500px]"
          style={{ background: "radial-gradient(circle, rgba(201,169,98,0.08) 0%, transparent 60%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-5 md:px-8">
        <FadeIn className="md:text-left">
          <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#c9a962]">
            Segurança
          </p>
          <h2 className="mt-3 max-w-lg font-serif text-4xl font-normal tracking-tight text-[#f5f5f0] md:text-6xl">
            Seus dados protegidos. Sempre.
          </h2>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {items.map(({ icon: Icon, title, text }, i) => (
            <FadeIn key={title} delay={i * 0.1}>
              <div className="group flex h-full gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-7 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.06]">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2d5a47]/25 ring-1 ring-white/[0.08] transition-colors group-hover:bg-[#2d5a47]/40">
                  <Icon className="h-6 w-6 text-[#7fb69a]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#f5f5f0]">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/40">{text}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Final — deep green gradient ────────────────────────────────────── */

function CTASection() {
  return (
    <section
      className="relative overflow-hidden py-20 md:py-24"
      style={{ background: "linear-gradient(180deg, #1a3a2f 0%, #0f2419 100%)" }}
    >
      {/* Ambient glow behind text */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div
          className="absolute left-1/2 top-[30%] h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(ellipse, rgba(127,182,154,0.1) 0%, transparent 55%)" }}
        />
      </div>

      <FadeIn className="relative z-10">
        <div className="mx-auto max-w-3xl px-6 text-center md:px-8">
          <h2 className="font-serif text-4xl font-normal tracking-tight text-[#f5f5f0] md:text-6xl">
            Pronto para transformar
            <br /> sua rotina?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-white/40">
            Agende uma demonstração gratuita e veja o Hiro em ação.
          </p>
          <a
            href="https://calendly.com/abujamra-usc/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-white/90 px-10 py-4 text-[15px] font-semibold text-[#0e1610] transition-all duration-200 hover:bg-white hover:-translate-y-px hover:shadow-[0_8px_40px_rgba(255,255,255,0.15)]"
          >
            Agendar Demonstração
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </a>
          <p className="mt-5 text-[13px] text-white/25">
            Sem compromisso. Leva apenas 15 minutos.
          </p>
        </div>
      </FadeIn>

      {/* Large sphere — overlaps with text, rising from the bottom */}
      <div className="pointer-events-none absolute bottom-[-900px] left-1/2 z-0 hidden -translate-x-1/2 opacity-30 md:block" aria-hidden>
        <DitheringShader
          shape="sphere"
          type="8x8"
          colorBack="transparent"
          colorFront="#7fb69a"
          pxSize={2}
          speed={0.5}
          width={1200}
          height={1200}
        />
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-[#0a1108] py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 md:flex-row md:justify-between md:px-8">
        <span className="font-serif text-xl text-white/50">hiro.</span>

        <div className="flex flex-wrap items-center justify-center gap-6 text-[13px] text-white/30">
          <a href="mailto:contato@hiro.med.br" className="transition-colors hover:text-white/60">
            Contato
          </a>
          <span className="hidden h-3 w-px bg-white/10 md:block" />
          <a href="#" className="transition-colors hover:text-white/60">
            Termos de Uso
          </a>
          <span className="hidden h-3 w-px bg-white/10 md:block" />
          <a href="#" className="transition-colors hover:text-white/60">
            Política de Privacidade
          </a>
        </div>

        <div className="text-center text-[12px] text-white/20 md:text-right">
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
    <div className="min-h-screen">
      <Navbar onScrollTo={scrollTo} />
      <HeroSection onScrollTo={scrollTo} />
      <ProblemSection />
      <HowItWorksSection />
      <div className="bg-[#0f1a13] px-5 md:px-8">
        <div className="mx-auto max-w-3xl border-t border-white/[0.06]" />
      </div>
      <FeaturesScroll />
      <IntegrationsSection />
      <SecuritySection />
      <CTASection />
      <Footer />
    </div>
  );
}
