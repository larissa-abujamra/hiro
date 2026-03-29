"use client";

import { useState } from "react";
import { SidebarNav } from "@/components/layout/SidebarNav";

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-black/10 glass-warm px-4 py-4 lg:hidden">
        <p className="font-serif text-2xl font-normal tracking-tight text-hiro-text">Hiro.</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-pointer rounded-full border border-black/15 px-3 py-2 text-sm text-hiro-text transition-colors duration-150 hover:bg-black/[0.05] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hiro-active/40"
          aria-label="Abrir menu"
        >
          ☰
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 cursor-pointer bg-black/30 transition-opacity"
            onClick={() => setOpen(false)}
          />
          <aside
            className="absolute bottom-0 left-0 top-0 flex w-[220px] flex-col shadow-lg"
            style={{ borderRight: "1px solid rgba(255, 255, 255, 0.35)" }}
          >
            <div className="liquid-glass-surface flex h-full min-h-0 w-full flex-col">
              <SidebarNav onNavigate={() => setOpen(false)} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
