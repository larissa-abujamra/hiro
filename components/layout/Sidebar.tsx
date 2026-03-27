"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItemProps {
  href: string;
  label: string;
  icon: string;
  onClick?: () => void;
}

function NavItem({ href, label, icon, onClick }: NavItemProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    (href === "/consulta/nova" && pathname.startsWith("/consulta/"));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
        isActive
          ? "bg-hiro-active text-white"
          : "text-hiro-muted hover:bg-black/5"
      }`}
    >
      <span aria-hidden>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-hiro-card">
      <div className="border-b border-black/8 px-5 py-5">
        <p className="font-serif text-3xl font-normal text-hiro-text">Hiro.</p>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4">
        <NavItem href="/" icon="◻" label="Início" onClick={onNavigate} />
        <NavItem
          href="/consulta/nova"
          icon="●"
          label="Nova consulta"
          onClick={onNavigate}
        />
        <NavItem
          href="/pacientes"
          icon="◯"
          label="Pacientes"
          onClick={onNavigate}
        />
      </nav>

      <div className="border-t border-black/8 px-5 py-4">
        <p className="text-sm font-medium text-hiro-text">Dra. Larissa Oliveira</p>
        <p className="text-xs text-hiro-muted">Clínico Geral</p>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-black/8 bg-hiro-card px-4 py-4 lg:hidden">
        <p className="font-serif text-2xl font-normal text-hiro-text">Hiro.</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-black/15 px-3 py-2 text-sm text-hiro-text"
          aria-label="Abrir menu"
        >
          ☰
        </button>
      </header>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] border-r border-black/8 lg:block">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[220px] border-r border-black/8">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
