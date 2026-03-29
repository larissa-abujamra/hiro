import { SidebarNav } from "@/components/layout/SidebarNav";

export function SidebarDesktopShell() {
  return (
    <aside
      className="fixed bottom-0 left-0 top-0 z-30 hidden min-h-0 w-[220px] lg:flex lg:flex-col"
      style={{ borderRight: "1px solid rgba(255, 255, 255, 0.35)" }}
    >
      <div className="liquid-glass-surface flex h-full min-h-0 w-full flex-col">
        <SidebarNav />
      </div>
    </aside>
  );
}
