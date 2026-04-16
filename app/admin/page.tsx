"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, FileText, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAILS = ["lariafoliveira@gmail.com", "brunoqgiangrande@gmail.com"];

interface Profile {
  id: string;
  full_name: string;
  email: string;
  especialidade: string;
  crm: string;
  uf: string;
  created_at: string;
  last_sign_in: string | null;
}

interface RecentConsultation {
  id: string;
  doctor_name: string;
  patient_name: string;
  created_at: string;
}

interface Stats {
  totalDoctors: number;
  totalConsultations: number;
  activeToday: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hiro-green/10">
          <Icon className="h-5 w-5 text-hiro-green" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-hiro-muted">
            {label}
          </p>
          <p className="font-serif text-3xl font-normal tabular-nums tracking-tight text-hiro-text">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [consultations, setConsultations] = useState<RecentConsultation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
        router.replace("/dashboard");
        return;
      }
      setAuthorized(true);
    });
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar dados");
        return res.json();
      })
      .then((data) => {
        setStats(data.stats);
        setProfiles(data.profiles);
        setConsultations(data.recentConsultations);
      })
      .catch((err) => setError(err.message));
  }, [authorized]);

  if (authorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-hiro-muted">Verificando acesso…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-normal tracking-tight text-hiro-text">
          Admin
        </h1>
        <p className="mt-1 text-sm text-hiro-muted">
          Painel administrativo do hiro
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-hiro-red/30 bg-hiro-red/10 px-4 py-3 text-sm text-hiro-red">
          {error}
        </div>
      )}

      {/* Stats cards */}
      {stats && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Médicos cadastrados" value={stats.totalDoctors} icon={Users} />
          <StatCard label="Prontuários gerados" value={stats.totalConsultations} icon={FileText} />
          <StatCard label="Ativos hoje" value={stats.activeToday} icon={Activity} />
        </div>
      )}

      {/* Users table */}
      <section className="glass-card mb-8 overflow-hidden rounded-2xl">
        <div className="border-b border-black/[0.06] px-6 py-4">
          <h2 className="font-serif text-2xl font-normal tracking-tight text-hiro-text">
            Usuários
          </h2>
          <p className="mt-0.5 text-[12px] text-hiro-muted">
            {profiles.length} {profiles.length === 1 ? "médico cadastrado" : "médicos cadastrados"}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-black/[0.06] text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Especialidade</th>
                <th className="px-6 py-3">CRM/UF</th>
                <th className="px-6 py-3">Cadastro</th>
                <th className="px-6 py-3">Último acesso</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-hiro-muted">
                    Nenhum usuário cadastrado
                  </td>
                </tr>
              ) : (
                profiles.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-black/[0.04] transition-colors hover:bg-black/[0.02]"
                  >
                    <td className="whitespace-nowrap px-6 py-3 font-medium text-hiro-text">
                      {p.full_name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-hiro-muted">
                      {p.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-hiro-muted">
                      {p.especialidade}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-hiro-muted">
                      {p.crm !== "—" ? `${p.crm}/${p.uf}` : "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 tabular-nums text-hiro-muted">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 tabular-nums text-hiro-muted">
                      {formatDateTime(p.last_sign_in)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent consultations table */}
      <section className="glass-card overflow-hidden rounded-2xl">
        <div className="border-b border-black/[0.06] px-6 py-4">
          <h2 className="font-serif text-2xl font-normal tracking-tight text-hiro-text">
            Prontuários recentes
          </h2>
          <p className="mt-0.5 text-[12px] text-hiro-muted">
            Últimos 10 prontuários gerados
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-black/[0.06] text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">
                <th className="px-6 py-3">Médico</th>
                <th className="px-6 py-3">Paciente</th>
                <th className="px-6 py-3">Data/Hora</th>
              </tr>
            </thead>
            <tbody>
              {consultations.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-hiro-muted">
                    Nenhum prontuário gerado ainda
                  </td>
                </tr>
              ) : (
                consultations.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-black/[0.04] transition-colors hover:bg-black/[0.02]"
                  >
                    <td className="whitespace-nowrap px-6 py-3 font-medium text-hiro-text">
                      {c.doctor_name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-hiro-muted">
                      {c.patient_name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 tabular-nums text-hiro-muted">
                      {formatDateTime(c.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
