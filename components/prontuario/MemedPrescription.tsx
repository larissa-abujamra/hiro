"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Pill } from "lucide-react";
import { ButtonHiro } from "@/components/ui/ButtonHiro";
import { useDoctorStore } from "@/lib/doctorStore";
import type { DetectedItem } from "@/lib/types";

// ─── Memed global types ───────────────────────────────────────────────────────

declare global {
  interface Window {
    MdHub?: {
      command: {
        send(module: string, command: string, data?: unknown): void;
      };
      event: {
        add(event: string, callback: (data: unknown) => void): void;
        remove(event: string, callback: (data: unknown) => void): void;
      };
    };
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MemedPrescriptionProps {
  /** Campo "Plano" (P) do prontuário SOAP — usado como referência visual. */
  planText: string;
  /** Itens detectados na fala com type === "prescription". */
  prescriptionItems: DetectedItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MEMED_SCRIPT_ID = "memed-sinapse-script";
const MEMED_SCRIPT_SRC =
  "https://integrations.memed.com.br/modulos/plataforma.sinapse-prescricao/build/sinapse-prescricao.min.js";
const HIRO_PRIMARY = "#0F6E56";

function removeMemedScript() {
  document.getElementById(MEMED_SCRIPT_ID)?.remove();
  // Remove the Memed modal container that the script injects
  document.getElementById("memed-prescricao")?.remove();
  document.getElementById("memed-root")?.remove();
  delete window.MdHub;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MemedPrescription({
  planText,
  prescriptionItems,
}: MemedPrescriptionProps) {
  const [phase, setPhase] = useState<"idle" | "loading" | "ready" | "saved" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const profile = useDoctorStore((s) => s.profile);
  const isProfileComplete = useDoctorStore((s) => s.isProfileComplete)();

  useEffect(() => setMounted(true), []);

  // Clean up Memed script and DOM artifacts on unmount
  useEffect(() => removeMemedScript, []);

  const openModal = useCallback(() => {
    window.MdHub?.command.send("plataforma.prescricao", "openModal");
  }, []);

  const loadAndOpen = useCallback(async () => {
    setPhase("loading");
    setErrorMsg(null);

    try {
      // 1. Fetch doctor token from our secure backend, sending profile data
      const res = await fetch("/api/memed/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          external_id: `hiro-${profile.cpf || "medico"}`,
          nome: profile.nome,
          sobrenome: profile.sobrenome,
          cpf: profile.cpf,
          crm: profile.crm,
          uf: profile.uf,
          data_nascimento: profile.data_nascimento,
          sexo: profile.sexo,
          email: profile.email,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Erro ${res.status} ao obter token Memed`);
      }

      const { token } = (await res.json()) as { token: string };
      tokenRef.current = token;

      // 2. Remove any previous Memed script before reloading
      removeMemedScript();

      // 3. Inject Memed script with the doctor token
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.id = MEMED_SCRIPT_ID;
        script.src = MEMED_SCRIPT_SRC;
        script.setAttribute("data-token", token);
        script.setAttribute("data-color", HIRO_PRIMARY);

        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Não foi possível carregar o módulo Memed"));

        document.body.appendChild(script);
      });

      // 4. Wait for MdHub to be available (the script may initialise async)
      await waitForMdHub();

      // 5. Listen for prescription save event
      window.MdHub!.event.add("prescricaoSalva", () => {
        setPhase("saved");
      });

      setPhase("ready");

      // 6. Auto-open the prescription modal
      openModal();
    } catch (err) {
      console.error("Memed load error:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Erro ao carregar módulo Memed",
      );
      setPhase("error");
    }
  }, [openModal]);

  const handleClick = () => {
    if (phase === "ready" || phase === "saved") {
      openModal();
    } else {
      void loadAndOpen();
    }
  };

  // Derive medication keywords from detectedItems + plan text for display
  const medicationHints = prescriptionItems.map((item) => item.text);

  if (!mounted) {
    return <div className="h-10 animate-pulse rounded-full bg-black/[0.06]" />;
  }

  if (!isProfileComplete) {
    return (
      <div className="rounded-xl border border-hiro-amber/40 bg-[#FAEEDA]/50 px-4 py-3 text-[13px] text-hiro-text">
        Complete seu{" "}
        <a href="/perfil" className="font-medium text-hiro-green underline underline-offset-2">
          perfil médico
        </a>{" "}
        para habilitar a prescrição digital (CRM, CPF e data de nascimento são obrigatórios).
      </div>
    );
  }

  // TODO: Reativar quando Memed estiver estável (atualmente retornando 503)
  return (
    <div className="flex flex-col gap-3">
      <ButtonHiro
        type="button"
        disabled
        variant="secondary"
        className="inline-flex w-full items-center justify-center gap-2 opacity-60"
      >
        <Pill className="h-4 w-4" aria-hidden />
        Prescrição Digital — Em breve
      </ButtonHiro>
      <p className="text-center text-[11px] text-hiro-muted">
        Integração com Memed em manutenção. Disponível em breve.
      </p>
    </div>
  );
}

// ─── Utility: poll until MdHub is available on window ─────────────────────────

function waitForMdHub(timeoutMs = 8000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.MdHub) {
      resolve();
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if (window.MdHub) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error("Memed (MdHub) não inicializou a tempo"));
      }
    }, 100);
  });
}
