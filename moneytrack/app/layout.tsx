import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MoneyTrack – Gestion intelligente des finances personnelles",
    template: "%s | MoneyTrack",
  },
  description:
    "Suivez vos revenus et vos dépenses, gérez vos budgets et consultez vos statistiques dans un espace personnel sécurisé.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-surface font-sans text-navy">
        {children}
      </body>
    </html>
  );
}