"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AnimatedDots } from "@/components/ui/animated-dots";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-[14px] text-white/90 placeholder:text-white/28 outline-none transition-all duration-200 focus:border-white/22 focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]";

const labelClass =
  "block text-[11px] font-semibold uppercase tracking-widest text-white/35 mb-1.5";

export default function NovaSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem");
      return;
    }
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/login");
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
            <h1 className="mb-6 font-serif text-xl font-normal text-white/85">
              Nova senha
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className={labelClass}>
                  Nova senha
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className={inputClass}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="confirm" className={labelClass}>
                  Confirmar senha
                </label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={inputClass}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              {error && (
                <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-[13px] text-red-300/90">
                  {error}
                </p>
              )}

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
                {loading ? "Salvando…" : "Salvar nova senha"}
              </button>
            </form>
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
