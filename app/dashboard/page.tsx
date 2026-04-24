import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CurrentPatientCard } from "@/components/dashboard/CurrentPatientCard";
import { DayTimeline } from "@/components/dashboard/DayTimeline";
import { MetricsFooter } from "@/components/dashboard/MetricsFooter";
import type { Appointment } from "@/components/agenda/AppointmentModal";

const ACTIVE_STATUSES = new Set(["scheduled", "confirmed"]);
const FINISHED_STATUSES = new Set(["completed", "cancelled", "no_show"]);

async function loadDashboardData() {
  const cookieStore = await cookies();
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(c) { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );
  const admin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll() {} } }
  );

  const { data: { user } } = await auth.auth.getUser();
  if (!user) {
    return { user: null, sexo: "O", appointments: [] as Appointment[] };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("sexo")
    .eq("id", user.id)
    .single();

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { data: appts } = await admin
    .from("appointments")
    .select("*")
    .eq("user_id", user.id)
    .gte("datetime", start.toISOString())
    .lt("datetime", end.toISOString())
    .order("datetime", { ascending: true });

  return {
    user,
    sexo: (profile?.sexo as string | null) ?? (user.user_metadata?.sexo as string | undefined) ?? "O",
    appointments: (appts ?? []) as Appointment[],
  };
}

export default async function DashboardPage() {
  const { user, sexo, appointments } = await loadDashboardData();
  const serverName = (user?.user_metadata?.full_name as string | undefined) ?? "";

  const now = new Date();
  const inProgress = appointments.find((a) => a.status === "in_progress") ?? null;
  const upcoming = appointments
    .filter((a) => ACTIVE_STATUSES.has(a.status) && new Date(a.datetime) >= now)
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  const current = inProgress ?? upcoming[0] ?? null;
  const restOfDay = inProgress ? upcoming : upcoming.slice(1);

  const allFinished =
    appointments.length > 0 &&
    appointments.every((a) => FINISHED_STATUSES.has(a.status));

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <main className="mx-auto flex w-full max-w-6xl flex-col px-4 py-4 md:px-6 md:py-6">
        <DashboardHeader serverName={serverName} serverSexo={sexo} />

        {appointments.length === 0 && (
          <section className="mt-8 rounded-2xl border border-dashed border-black/[0.1] bg-white/40 p-8 text-center">
            <p className="font-serif text-xl text-hiro-text">
              Nenhuma consulta agendada para hoje.
            </p>
            <p className="mt-1 text-[13px] text-hiro-muted">
              Bom momento para colocar a agenda em dia.
            </p>
            <Link
              href="/agenda"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#2d5a47] px-5 py-2.5 text-[13px] font-medium text-[#f5f0e8]"
            >
              Agendar paciente
            </Link>
          </section>
        )}

        {appointments.length > 0 && allFinished && (
          <section className="mt-8 rounded-2xl border border-black/[0.06] bg-white/60 p-8 text-center">
            <p className="font-serif text-xl text-hiro-text">
              Todas as consultas de hoje foram concluídas.
            </p>
            <p className="mt-1 text-[13px] text-hiro-muted">
              {appointments.length} {appointments.length === 1 ? "atendimento" : "atendimentos"} finalizados.
            </p>
            <Link
              href="/agenda"
              className="mt-5 inline-flex items-center justify-center rounded-lg border border-black/[0.12] bg-white px-5 py-2.5 text-[13px] font-medium text-hiro-text"
            >
              Ver resumo do dia
            </Link>
          </section>
        )}

        {current && <CurrentPatientCard appointment={current} />}

        {current && <DayTimeline appointments={restOfDay} />}

        <MetricsFooter appointments={appointments} />
      </main>
    </div>
  );
}
