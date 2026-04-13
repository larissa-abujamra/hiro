"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { SidebarDesktopShell } from "./SidebarDesktopShell";

const PUBLIC_PATHS = ["/login", "/signup", "/auth", "/onboarding"];

export function ConditionalSidebar() {
  const pathname = usePathname();
  const isPublic = pathname === "/" || PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return null;
  return (
    <>
      <SidebarDesktopShell />
      <Sidebar />
    </>
  );
}
