"use client";

import { motion } from "framer-motion";
import { CheckCircle, Mic, Sparkles } from "lucide-react";

interface CompletedStepProps {
  userName: string;
}

export function CompletedStep({ userName }: CompletedStepProps) {
  const firstName = userName.split(" ")[0] || "Doutor(a)";

  const steps = [
    { icon: <span className="font-bold text-hiro-green">1</span>, title: "Inicie uma consulta", desc: 'Clique em "Nova Consulta" e selecione o paciente' },
    { icon: <Mic className="h-5 w-5 text-hiro-green" strokeWidth={1.75} />, title: "Grave a conversa", desc: "Pressione gravar e converse normalmente com o paciente" },
    { icon: <Sparkles className="h-5 w-5 text-hiro-green" strokeWidth={1.75} />, title: "Gere o prontuário", desc: "Com um clique, o hiro gera o prontuário no seu estilo" },
  ];

  return (
    <div className="space-y-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-hiro-green"
      >
        <CheckCircle className="h-10 w-10 text-white" strokeWidth={1.5} />
      </motion.div>

      <div>
        <h2 className="font-serif text-3xl text-hiro-text">
          Tudo pronto, Dr(a). {firstName}!
        </h2>
        <p className="mt-2 text-[15px] text-hiro-muted leading-relaxed">
          Seu hiro está configurado e pronto para te ajudar nas consultas.
        </p>
      </div>

      <div className="space-y-4 text-left">
        <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">
          Como funciona
        </p>
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.2 }}
            className="flex items-start gap-4 rounded-xl border border-black/[0.06] bg-white/60 p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hiro-green/10">
              {step.icon}
            </div>
            <div>
              <p className="font-medium text-hiro-text">{step.title}</p>
              <p className="text-[13px] text-hiro-muted">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
