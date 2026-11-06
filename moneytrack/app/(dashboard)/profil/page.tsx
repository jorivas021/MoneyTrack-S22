
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  UserRound,
  Mail,
  CalendarDays,
  LockKeyhole,
  Save,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

type Profile = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Impossible de charger le profil.");
        }

        setProfile(data.user);
        setName(data.user.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleNameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSavingName(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de modifier le profil.");
      }

      setProfile(data.user);
      setName(data.user.name);
      setSuccess("Ton nom a été mis à jour.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setSavingName(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSavingPassword(true);

    try {
      const response = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de modifier le mot de passe.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setSavingPassword(false);
    }
  }

  const initials = profile?.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="h-7 w-7 animate-spin text-emerald-600" />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="p-6">
        <p className="text-sm text-red-600">
          {error || "Impossible de charger ton profil."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-7 p-4 pb-10 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Mon profil
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Consulte et gère les informations de ton compte.
        </p>
      </div>

      {(error || success) && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || success}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-700">
            {initials || <UserRound size={30} />}
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-900">
              {profile.name}
            </h2>
            <p className="mt-1 break-all text-sm text-slate-500">
              {profile.email}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <ShieldCheck size={14} />
              Compte personnel
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <Mail size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Adresse e-mail</p>
              <p className="mt-1 break-all text-sm font-medium text-slate-800">
                {profile.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <CalendarDays size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Membre depuis</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {new Date(profile.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
            <UserRound size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">
              Informations personnelles
            </h2>
            <p className="text-xs text-slate-500">
              Modifie le nom associé à ton compte.
            </p>
          </div>
        </div>

        <form onSubmit={handleNameSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="profile-name" className="text-sm font-medium text-slate-700">
              Nom complet
            </label>
            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              maxLength={80}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="profile-email" className="text-sm font-medium text-slate-700">
              Adresse e-mail
            </label>
            <input
              id="profile-email"
              type="email"
              value={profile.email}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
            />
            <p className="text-xs text-slate-400">
              L'adresse e-mail ne peut pas être modifiée ici.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingName || name.trim() === profile.name}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingName ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              Enregistrer
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
            <LockKeyhole size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">
              Sécurité du compte
            </h2>
            <p className="text-xs text-slate-500">
              Modifie ton mot de passe pour protéger ton compte.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="current-password" className="text-sm font-medium text-slate-700">
              Mot de passe actuel
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium text-slate-700">
                Nouveau mot de passe
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={8}
                maxLength={72}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium text-slate-700">
                Confirmer le nouveau mot de passe
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                maxLength={72}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                savingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingPassword ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <LockKeyhole size={17} />
              )}
              Modifier le mot de passe
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
