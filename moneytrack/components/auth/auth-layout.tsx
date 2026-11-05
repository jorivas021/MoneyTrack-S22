
import Link from "next/link";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  benefits: string[];
  children: ReactNode;
};

export default function AuthLayout({
  eyebrow,
  title,
  description,
  benefits,
  children,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f4f6fa] p-0 md:p-5 lg:p-7">
      <div className="mx-auto grid min-h-screen max-w-[1440px] overflow-hidden bg-white md:min-h-[calc(100vh-40px)] md:rounded-2xl md:border md:border-slate-200 md:shadow-xl lg:min-h-[calc(100vh-56px)] lg:grid-cols-[46%_54%]">

        {/* Panneau de présentation */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#14233f] p-10 text-white lg:flex xl:p-14">
          <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full border border-white/5" />
          <div className="pointer-events-none absolute -right-20 top-32 h-72 w-72 rounded-full border border-white/5" />
          <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-[#16a36d]/10 blur-3xl" />

          <Link href="/" className="relative flex w-fit items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#16a36d] text-2xl font-bold">
              ↗
            </span>
            <span className="text-2xl font-bold tracking-tight">
              Money<span className="text-[#16a36d]">Track</span>
            </span>
          </Link>

          <div className="relative my-12 max-w-lg">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#16a36d]/30 bg-[#16a36d]/10 px-4 py-2 text-[10px] font-bold tracking-[2px] text-[#55d6a0]">
              <span className="h-2 w-2 rounded-full bg-[#16a36d]" />
              {eyebrow}
            </span>

            <h1 className="text-4xl font-bold leading-[1.2] tracking-tight xl:text-5xl">
              {title}
            </h1>

            <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
              {description}
            </p>

            <div className="mt-10 space-y-5">
              {benefits.map((benefit, index) => (
                <div key={benefit} className="flex items-center gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#16a36d]/30 bg-[#16a36d]/10 text-sm font-bold text-[#55d6a0]">
                    {index + 1}
                  </span>
                  <p className="text-sm text-slate-200">{benefit}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-medium text-white">
                Une meilleure vision de votre argent.
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Suivez vos dépenses, organisez vos budgets et prenez de
                meilleures décisions financières.
              </p>
            </div>
          </div>

          <p className="relative text-xs text-slate-500">
            © 2026 MoneyTrack. Tous droits réservés.
          </p>
        </section>

        {/* Zone du formulaire */}
        <section className="flex min-h-screen flex-col bg-[#f8fafc] px-5 py-6 sm:px-10 md:px-14 lg:min-h-0 lg:px-16 xl:px-24">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#16a36d] text-xl font-bold text-white">
                ↗
              </span>
              <span className="text-lg font-bold text-[#14233f]">
                Money<span className="text-[#16a36d]">Track</span>
              </span>
            </Link>

            <Link
              href="/"
              className="ml-auto text-xs font-medium text-slate-500 transition hover:text-[#16a36d]"
            >
              ← Retour à l’accueil
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-[430px]">
              <div className="mb-8 hidden items-center gap-2 font-bold text-[#14233f] lg:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16a36d] text-white">
                  ↗
                </span>
                MoneyTrack
              </div>

              <div className="mb-7">
                <span className="inline-flex rounded-full border border-[#16a36d]/20 bg-[#16a36d]/10 px-3 py-1.5 text-[10px] font-bold tracking-[1.5px] text-[#16865e]">
                  {eyebrow}
                </span>

                <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#14233f]">
                  {title === "Vos finances, simplement maîtrisées."
                    ? "Content de vous revoir."
                    : "Rejoignez MoneyTrack."}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
                {children}
              </div>

              <p className="mt-7 text-center text-[11px] text-slate-400">
                Vos données restent privées et sécurisées.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
