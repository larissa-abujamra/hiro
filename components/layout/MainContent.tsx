"use client";

import { usePathname } from "next/navigation";

const PUBLIC_PATHS = ["/login", "/signup", "/auth", "/onboarding"];

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === "/" || PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  return (
    <main
      className={`relative z-[3] min-h-full ${isPublic ? "" : "lg:pl-[220px]"}`}
    >
      {children}
    </main>
  );
}
