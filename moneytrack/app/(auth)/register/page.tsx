"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout, { PasswordField, inputClass, labelClass } from "@/components/auth/auth-layout";

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
      eyebrow="Inscription"
      title="Commencez à mieux gérer votre argent."
      benefits={[
        "Gratuit pour commencer",
        "Configuration en quelques minutes",
        "Données privées et sécurisées",
      ]}
      notice="MoneyTrack ne vous demandera jamais votre mot de passe par e-mail ou par message."
      formTitle="Créer votre compte"
      formSubtitle="Gratuit, en moins d’une minute."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className={labelClass}>
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
            className={inputClass}
          />
        </div>

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

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className={labelClass}>
              Mot de passe
            </label>
            <PasswordField
              id="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="8 caractères minimum"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className={labelClass}>
              Confirmer
            </label>
            <PasswordField
              id="confirmPassword"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Répétez le mot de passe"
            />
          </div>
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
          {loading ? "Création du compte..." : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-6 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
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