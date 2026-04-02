"use client";

import { usePathname } from "next/navigation";

const AUTH_PATHS = ["/login", "/signup", "/auth"];

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p));
  return (
    <main
      className={`relative z-[3] min-h-full ${isAuth ? "" : "lg:pl-[220px]"}`}
    >
      {children}
    </main>
  );
}
