"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Mic, Users } from "lucide-react";

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
        <p className="text-sm font-medium text-hiro-text">Dra. Larissa Oliveira</p>
        <p className="text-xs text-hiro-muted">Clínico geral</p>
      </div>
    </>
  );
}
