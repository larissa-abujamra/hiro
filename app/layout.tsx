import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next";
import { ConditionalSidebar } from "@/components/layout/ConditionalSidebar";
import { MainContent } from "@/components/layout/MainContent";
import { StoreInitializer } from "@/components/StoreInitializer";
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

        <StoreInitializer />
        <ConditionalSidebar />
        <MainContent>{children}</MainContent>
        <Analytics />
      </body>
    </html>
  );
}
