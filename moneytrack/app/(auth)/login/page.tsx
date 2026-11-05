
"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/auth-layout";

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
      eyebrow="HEUREUX DE VOUS REVOIR"
      title="Vos finances, simplement maîtrisées."
      description="Retrouvez toutes vos finances en un seul endroit."
      benefits={[
        "Suivi clair des revenus et dépenses",
        "Budgets simples et personnalisés",
        "Données privées et sécurisées",
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-xs font-semibold text-[#14233f]">
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
            className="w-full rounded-xl border border-slate-200 bg-[#fbfcfe] px-4 py-3.5 text-sm text-[#14233f] outline-none transition placeholder:text-slate-400 focus:border-[#16a36d] focus:bg-white focus:ring-4 focus:ring-[#16a36d]/10"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-xs font-semibold text-[#14233f]">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Votre mot de passe"
            className="w-full rounded-xl border border-slate-200 bg-[#fbfcfe] px-4 py-3.5 text-sm text-[#14233f] outline-none transition placeholder:text-slate-400 focus:border-[#16a36d] focus:bg-white focus:ring-4 focus:ring-[#16a36d]/10"
          />
        </div>

        <div className="flex items-center justify-between gap-3 text-xs">
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
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#16a36d] px-4 py-3.5 text-sm font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-[#12885b] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-[10px] text-slate-400">OU</span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>

      <p className="text-center text-xs text-slate-500">
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
