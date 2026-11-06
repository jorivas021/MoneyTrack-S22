"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout, { PasswordField, inputClass, labelClass } from "@/components/auth/auth-layout";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Adresse e-mail ou mot de passe incorrect.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Une erreur est survenue. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Connexion"
      title="Content de vous revoir."
      benefits={[
        "Suivi clair des revenus et dépenses",
        "Budgets simples et personnalisés",
        "Toutes vos finances en un seul endroit",
      ]}
      notice="Vos données restent privées et sécurisées. MoneyTrack ne les partage avec personne."
      formTitle="Se connecter"
      formSubtitle="Entrez votre e-mail et votre mot de passe."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className={labelClass}>
            Adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nom@exemple.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Mot de passe
          </label>
          <PasswordField
            id="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Votre mot de passe"
          />
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 rounded accent-[#16a36d]"
            />
            Se souvenir de moi
          </label>

          <span className="cursor-not-allowed text-slate-400" title="Fonctionnalité non disponible">
            Mot de passe oublié ?
          </span>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#16a36d] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#12885b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#16a36d]/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="mt-6 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
        Pas encore de compte ?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#16865e] transition hover:text-[#16a36d] hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </AuthLayout>
  );
}