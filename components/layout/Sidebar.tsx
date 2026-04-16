"use client";

import { useState } from "react";
import { SidebarNav } from "@/components/layout/SidebarNav";

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-hiro-green px-4 py-4 shadow-sm lg:hidden">
        <p className="font-serif text-2xl font-normal tracking-tight text-white">hiro.</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-pointer rounded-full border border-white/25 px-3 py-2 text-sm text-white transition-colors duration-150 hover:bg-white/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
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
          <aside className="absolute bottom-0 left-0 top-0 flex w-[220px] flex-col border-r border-white/10 bg-hiro-green shadow-xl">
            <div className="flex h-full min-h-0 w-full flex-col">
              <SidebarNav onNavigate={() => setOpen(false)} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
