"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { SidebarDesktopShell } from "./SidebarDesktopShell";

const AUTH_PATHS = ["/login", "/signup", "/auth"];

export function ConditionalSidebar() {
  const pathname = usePathname();
  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p));
  if (isAuth) return null;
  return (
    <>
      <SidebarDesktopShell />
      <Sidebar />
    </>
  );
}
