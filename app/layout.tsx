import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarDesktopShell } from "@/components/layout/SidebarDesktopShell";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hiro",
  description: "Aplicação de apoio clínico com IA para médicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${GeistSans.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans bg-hiro-bg text-hiro-text">
        <SidebarDesktopShell />
        <Sidebar />
        <main className="min-h-full lg:pl-[220px]">{children}</main>
      </body>
    </html>
  );
}
