
"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/auth-layout";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Impossible de créer le compte.");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Une erreur est survenue. Vérifie ta connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="COMMENCEZ DÈS AUJOURD’HUI"
      title="Commencez à mieux gérer votre argent."
      description="Rejoignez MoneyTrack et reprenez le contrôle."
      benefits={[
        "Gratuit pour commencer",
        "Configuration en quelques minutes",
        "Données privées et sécurisées",
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-2 block text-xs font-semibold text-[#14233f]">
            Nom complet
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex. Awa Diop"
            className="w-full rounded-xl border border-slate-200 bg-[#fbfcfe] px-4 py-3 text-sm text-[#14233f] outline-none transition placeholder:text-slate-400 focus:border-[#16a36d] focus:bg-white focus:ring-4 focus:ring-[#16a36d]/10"
          />
        </div>

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
            className="w-full rounded-xl border border-slate-200 bg-[#fbfcfe] px-4 py-3 text-sm text-[#14233f] outline-none transition placeholder:text-slate-400 focus:border-[#16a36d] focus:bg-white focus:ring-4 focus:ring-[#16a36d]/10"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-xs font-semibold text-[#14233f]">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="8 caractères minimum"
            className="w-full rounded-xl border border-slate-200 bg-[#fbfcfe] px-4 py-3 text-sm text-[#14233f] outline-none transition placeholder:text-slate-400 focus:border-[#16a36d] focus:bg-white focus:ring-4 focus:ring-[#16a36d]/10"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-xs font-semibold text-[#14233f]">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirmez votre mot de passe"
            className="w-full rounded-xl border border-slate-200 bg-[#fbfcfe] px-4 py-3 text-sm text-[#14233f] outline-none transition placeholder:text-slate-400 focus:border-[#16a36d] focus:bg-white focus:ring-4 focus:ring-[#16a36d]/10"
          />
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
          {loading ? "Création du compte..." : "Créer mon compte"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-[10px] text-slate-400">OU</span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>

      <p className="text-center text-xs text-slate-500">
        Tu as déjà un compte ?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#16865e] transition hover:text-[#16a36d] hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  );
}
