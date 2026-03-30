import { SidebarNav } from "@/components/layout/SidebarNav";

export function SidebarDesktopShell() {
  return (
    <aside className="fixed bottom-0 left-0 top-0 z-30 hidden min-h-0 w-[220px] border-r border-black/[0.1] bg-hiro-card shadow-[4px_0_24px_rgba(28,43,30,0.1)] lg:flex lg:flex-col">
      <div className="flex h-full min-h-0 w-full flex-col">
        <SidebarNav />
      </div>
    </aside>
  );
}
