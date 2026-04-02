import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next";
import { ConditionalSidebar } from "@/components/layout/ConditionalSidebar";
import { MainContent } from "@/components/layout/MainContent";
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
        {/* Manchas de fundo — fixas, atrás de todo o conteúdo */}
        <div
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
          aria-hidden
        >
          <div
            className="absolute -right-[18%] -top-[22%] h-[min(85vw,720px)] w-[min(85vw,720px)]"
            style={{
              background:
                "radial-gradient(circle at 40% 40%, rgba(198, 139, 47, 0.2) 0%, transparent 58%)",
            }}
          />
          <div
            className="absolute -bottom-[28%] -left-[20%] h-[min(90vw,780px)] w-[min(90vw,780px)]"
            style={{
              background:
                "radial-gradient(circle at 45% 45%, rgba(45, 92, 63, 0.16) 0%, transparent 60%)",
            }}
          />
          <div
            className="absolute right-[-8%] top-[38%] h-[min(55vw,420px)] w-[min(55vw,420px)]"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(45, 92, 63, 0.11) 0%, transparent 55%)",
            }}
          />
        </div>

        <ConditionalSidebar />
        <MainContent>{children}</MainContent>
        <Analytics />
      </body>
    </html>
  );
}
