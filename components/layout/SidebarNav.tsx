"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Mic, Users, LogOut } from "lucide-react";
import { useDoctorStore } from "@/lib/doctorStore";
import { createClient } from "@/lib/supabase/client";

interface NavItemProps {
  href: string;
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  prefetch?: boolean;
}

function NavItem({ href, label, icon, onClick, prefetch }: NavItemProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    (href === "/consulta/nova" && pathname.startsWith("/consulta/"));

  return (
    <Link
      href={href}
      prefetch={prefetch}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-r-xl border-l-2 py-2.5 pl-2.5 pr-3 text-sm font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hiro-active/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-[0.98] ${
        isActive
          ? "border-hiro-active bg-[rgba(45,92,63,0.1)] text-hiro-text"
          : "border-transparent text-hiro-muted hover:bg-black/[0.04] hover:text-hiro-text"
      }`}
    >
      <span
        aria-hidden
        className="flex h-4 w-4 shrink-0 items-center justify-center opacity-80 [&_svg]:h-4 [&_svg]:w-4"
      >
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const profile = useDoctorStore((s) => s.profile);
  const isComplete = useDoctorStore((s) => s.isProfileComplete)();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const displayName = hydrated && (profile.nome || profile.sobrenome)
    ? `${profile.sexo === "M" ? "Dr." : "Dra."} ${profile.nome} ${profile.sobrenome}`.trim()
    : "Meu perfil";

  const specialty = hydrated && profile.especialidade
    ? profile.especialidade
    : "Configure seu perfil";

  const showIncompleteDot = hydrated && !isComplete;

  return (
    <>
      <div className="border-b border-black/10 px-5 py-5">
        <p className="font-serif text-3xl font-normal tracking-tight text-hiro-text">Hiro.</p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <NavItem href="/" icon={<span className="text-[13px] leading-none">◻</span>} label="Início" onClick={onNavigate} />
        <NavItem
          href="/consulta/nova"
          icon={<Mic strokeWidth={1.75} />}
          label="Nova consulta"
          prefetch={false}
          onClick={onNavigate}
        />
        <NavItem
          href="/pacientes"
          icon={<Users strokeWidth={1.75} />}
          label="Pacientes"
          onClick={onNavigate}
        />
      </nav>

      <div className="border-t border-black/10 px-5 py-4">
        <Link
          href="/perfil"
          onClick={onNavigate}
          className="group flex flex-col gap-0.5 rounded-xl p-1.5 -mx-1.5 transition-colors hover:bg-black/[0.04]"
        >
          <span className="flex items-center gap-1.5 text-sm font-medium text-hiro-text group-hover:text-hiro-green transition-colors">
            {displayName}
            {showIncompleteDot && (
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-hiro-amber shrink-0" title="Perfil incompleto" />
            )}
          </span>
          <span className="text-xs text-hiro-muted">{specialty}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-2 rounded-xl px-1.5 py-1.5 -mx-1.5 text-xs text-hiro-muted transition-colors hover:bg-black/[0.04] hover:text-hiro-red"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          Sair
        </button>
      </div>
    </>
  );
}
