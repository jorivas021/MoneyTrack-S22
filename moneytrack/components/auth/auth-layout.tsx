"use client";

import Link from "next/link";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";

export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-[#14233f] outline-none transition placeholder:text-slate-400 focus:border-[#16a36d] focus:ring-4 focus:ring-[#16a36d]/10";

export const labelClass = "mb-1.5 block text-sm font-semibold text-[#14233f]";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className">;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`${inputClass} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-[#14233f] focus-visible:text-[#14233f] focus-visible:outline-none"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {visible ? (
            <>
              <path d="M3 3l18 18" />
              <path d="M10.6 6.2A9.8 9.8 0 0 1 12 6c5.5 0 9 6 9 6a15.6 15.6 0 0 1-3.2 3.8M6.5 7.5C4 9.2 3 12 3 12s3.5 6 9 6c1.4 0 2.7-.4 3.8-.9" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            </>
          ) : (
            <>
              <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex w-fit items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#16a36d] text-lg font-bold text-white">
        ↗
      </span>
      <span
        className={`text-xl font-bold tracking-tight ${dark ? "text-white" : "text-[#14233f]"}`}
      >
        Money<span className="text-[#16a36d]">Track</span>
      </span>
    </Link>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

type AuthLayoutProps = {
  /** Petit libellé au-dessus du titre à gauche (ex. « Connexion ») */
  eyebrow: string;
  /** Grand titre du panneau gauche */
  title: string;
  /** Liste d'avantages du panneau gauche */
  benefits: string[];
  /** Message d'information en bas du panneau gauche */
  notice: string;
  /** Titre du formulaire (à droite) */
  formTitle: string;
  /** Sous-titre du formulaire (à droite) */
  formSubtitle: string;
  children: ReactNode;
};

export default function AuthLayout({
  eyebrow,
  title,
  benefits,
  notice,
  formTitle,
  formSubtitle,
  children,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[46%_54%]">
      {/* Panneau gauche : fixe pendant que le formulaire défile */}
      <section className="hidden bg-[#14233f] text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:px-12 lg:py-10 xl:px-14">
        <Logo dark />

        <div className="max-w-md">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#55d6a0]">
            {eyebrow}
          </p>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight xl:text-5xl">
            {title}
          </h1>

          <ul className="mt-8 space-y-3.5">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-[15px] text-slate-200">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#16a36d]/15 text-[#55d6a0]">
                  <CheckIcon />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-white/[0.06] px-5 py-4 text-sm leading-6 text-slate-200">
          <svg
            viewBox="0 0 24 24"
            className="mt-0.5 h-5 w-5 shrink-0 text-[#55d6a0]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <p>{notice}</p>
        </div>
      </section>

      {/* Formulaire : directement sur fond blanc, sans cadre */}
      <section className="flex min-h-screen flex-col px-6 py-8 sm:px-10 lg:min-h-0 lg:justify-center lg:px-12 lg:py-12">
        <div className="mb-10 lg:hidden">
          <Logo />
        </div>

        <div className="mx-auto w-full max-w-[440px]">
          <h2 className="text-3xl font-bold tracking-tight text-[#14233f]">{formTitle}</h2>
          <p className="mt-2 text-[15px] text-slate-500">{formSubtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}