import { SidebarNav } from "@/components/layout/SidebarNav";

export function SidebarDesktopShell() {
  return (
    <aside className="fixed bottom-0 left-0 top-0 z-30 hidden min-h-0 w-[220px] border-r border-white/10 bg-hiro-green shadow-[4px_0_24px_rgba(28,43,30,0.25)] lg:flex lg:flex-col">
      <div className="flex h-full min-h-0 w-full flex-col">
        <SidebarNav />
      </div>
    </aside>
  );
}
