import Link from "next/link";
import { Calendar, FileText, Mic, Users } from "lucide-react";
import { iconCircleGlassOnLightCard } from "@/lib/iconCircleGlassStyles";
import { DailyMetricsCard } from "@/components/dashboard/DailyMetricsCard";
import { CalendarWidget } from "@/components/calendar/CalendarWidget";
import { createClient } from "@/lib/supabase/server";

function buildGreeting(fullName: string, sexo: string): { verb: string; title: string; firstName: string } {
  const firstName = fullName.trim().split(" ")[0] ?? fullName;
  if (sexo === "M") return { verb: "Bem-vindo", title: "Dr.", firstName };
  if (sexo === "F") return { verb: "Bem-vinda", title: "Dra.", firstName };
  return { verb: "Bem-vindo(a)", title: "Dr(a).", firstName };
}

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const meta = user?.user_metadata ?? {};
  const fullName: string = meta.full_name ?? "";
  const sexo: string = meta.sexo ?? "O";
  const { verb, title, firstName } = buildGreeting(fullName, sexo);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 md:px-6 md:py-6">
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

      <DailyMetricsCard />

      <div className="mt-6 grid grid-cols-1 items-start gap-5 overflow-visible md:grid-cols-2">
        <div className="min-w-0">
          <CalendarWidget />
        </div>

        <section className="glass-card min-w-0 overflow-visible rounded-2xl p-6">
          <h2 className="font-serif text-2xl font-normal tracking-tight text-hiro-text">
            Ações rápidas
          </h2>

          <div className="mt-4 flex flex-col gap-3 overflow-visible">
            <Link
              href="/consulta/nova"
              prefetch={false}
              className="flex w-full items-center gap-3 rounded-xl bg-hiro-green p-4 text-left text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-hiro-card"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Mic className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block font-medium">Nova consulta</span>
                <span className="mt-0.5 block text-sm text-white/85">
                  Iniciar gravação com paciente
                </span>
              </span>
            </Link>

            <Link
              href="/pacientes"
              className="flex w-full items-center gap-3 rounded-xl border border-black/[0.08] p-4 text-left text-hiro-text transition-all duration-150 hover:bg-black/[0.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hiro-active/35 focus-visible:ring-offset-2 focus-visible:ring-offset-hiro-card"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/[0.05]">
                <Users className="h-5 w-5 text-hiro-green" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block font-medium">Lista de pacientes</span>
                <span className="mt-0.5 block text-sm text-hiro-muted">
                  Ver histórico e perfis
                </span>
              </span>
            </Link>
          </div>

          <div
            className="my-6 border-t border-black/[0.07]"
            role="separator"
            aria-hidden
          />

          <div>
            <h3 className="font-serif text-2xl font-normal tracking-tight text-hiro-text">
              Última atividade
            </h3>
            <ul
              className="mt-4 divide-y divide-black/[0.06]"
              aria-label="Registos recentes"
            >
              <li className="flex gap-3 py-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-hiro-active"
                  style={iconCircleGlassOnLightCard}
                >
                  <FileText className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-medium leading-snug text-hiro-text">
                    Prontuário de Bruno Ferreira
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-hiro-muted">
                    Gerado às 14h12
                  </p>
                </div>
              </li>
              <li className="flex gap-3 py-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#854F0B]"
                  style={iconCircleGlassOnLightCard}
                >
                  <Calendar className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-medium leading-snug text-hiro-text">
                    Cíntia Souza
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-hiro-muted">
                    Retorno confirmado · 12 abr
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
