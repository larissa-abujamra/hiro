"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AnimatedDots } from "@/components/ui/animated-dots";
import { isValidEmail } from "@/lib/validation";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-[14px] text-white/90 placeholder:text-white/28 outline-none transition-all duration-200 focus:border-white/22 focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]";

const labelClass =
  "block text-[11px] font-semibold uppercase tracking-widest text-white/35 mb-1.5";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setEmailError("Email inválido");
      return;
    }
    setEmailError(null);
    setLoading(true);

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/recuperar-senha/nova`,
    });

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="relative min-h-screen w-full" style={{ background: "#0d1a12" }}>
      <div className="absolute inset-0 z-0">
        <AnimatedDots
          colors={[[45, 90, 71], [127, 182, 154]]}
          dotSize={3}
          speed={1}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(6, 14, 9, 0.6) 100%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <span className="font-serif text-4xl font-normal tracking-tight text-white/90">
              hiro.
            </span>
          </div>

          <div
            className="rounded-3xl border border-white/10 p-8"
            style={{
              background: "rgba(255, 255, 255, 0.07)",
              backdropFilter: "blur(48px) saturate(180%)",
              WebkitBackdropFilter: "blur(48px) saturate(180%)",
              boxShadow:
                "inset 0 1.5px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.2), 0 32px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)",
            }}
          >
            {sent ? (
              <div className="text-center">
                <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/8 border border-white/12">
                  <svg
                    className="h-6 w-6 text-white/70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <h1 className="font-serif text-xl font-normal text-white/88">
                  Verifique seu e-mail
                </h1>
                <p className="mt-2 text-[13px] text-white/45 leading-relaxed">
                  Se este e-mail estiver cadastrado, você receberá um link para
                  redefinir sua senha.
                </p>
              </div>
            ) : (
              <>
                <h1 className="mb-6 font-serif text-xl font-normal text-white/85">
                  Recuperar senha
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className={labelClass}>
                      E-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      className={inputClass}
                      placeholder="voce@clinica.com.br"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                    />
                    {emailError && (
                      <p className="mt-1 text-[12px] text-red-300/90">{emailError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 w-full rounded-2xl py-3 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: "rgba(255, 255, 255, 0.92)",
                      color: "#0d1a12",
                      boxShadow: "0 2px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.9)",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.background = "rgba(255,255,255,1)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,1)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.92)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.9)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {loading ? "Enviando…" : "Enviar link de recuperação"}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="mt-5 text-center text-[13px] text-white/32">
            <Link
              href="/login"
              className="font-medium text-white/62 underline-offset-2 transition-colors hover:text-white/90 hover:underline"
            >
              Voltar para login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
