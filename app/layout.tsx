import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans bg-hiro-bg text-hiro-text">
        <Sidebar />
        <main className="min-h-full lg:pl-[220px]">{children}</main>
      </body>
    </html>
  );
}
