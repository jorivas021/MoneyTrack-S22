
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const mainLinks = [
  { label: "Tableau de bord", href: "/dashboard", icon: "▦" },
  { label: "Transactions", href: "/transactions", icon: "▤" },
  { label: "Budgets", href: "/budgets", icon: "▱" },
  { label: "Catégories", href: "/categories", icon: "⊙" },
  { label: "Statistiques", href: "/statistiques", icon: "▥" },
];

export default function DashboardShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#14213d] md:flex">
      {/* Barre latérale */}
      <aside className="flex w-full shrink-0 flex-col bg-[#14213d] text-white md:sticky md:top-0 md:h-screen md:w-[290px]">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 border-b border-white/10 px-7 py-6 text-2xl font-bold"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16a36d] text-xl">
            ↗
          </span>
          <span>
            Money<span className="text-[#16a36d]">Track</span>
          </span>
        </Link>

        {/* Navigation principale */}
        <div className="px-5 pt-7">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">
            Menu principal
          </p>

          <nav className="flex items-center gap-2 overflow-x-auto pb-2 md:flex-col md:items-stretch md:gap-2 md:overflow-visible md:pb-0">
            {mainLinks.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm transition md:w-full md:justify-between ${
                    active
                      ? "bg-[#16a36d] font-semibold text-white shadow-lg shadow-emerald-950/20"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    {item.label}
                  </span>

                  {item.href === "/transactions" && (
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px]">
                      24
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mon compte */}
        <div className="px-5 pt-8">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">
            Mon compte
          </p>

          <Link
            href="/profil"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
              isActive("/profil")
                ? "bg-[#16a36d] font-semibold text-white"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="text-xl">♙</span>
            Mon profil
          </Link>
        </div>

        {/* Déconnexion PC */}
        <div className="mt-auto hidden border-t border-white/10 p-5 md:block">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 px-3 py-3 text-sm text-slate-400 transition hover:text-white"
          >
            <span className="text-xl">⇥</span>
            Déconnexion
          </button>
        </div>

        {/* Déconnexion mobile */}
        <div className="border-t border-white/10 p-4 md:hidden">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-slate-300"
          >
            ⇥ Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="min-w-0 flex-1">
        {/* Barre supérieure */}
        <header className="flex h-[76px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 md:px-8">
          <div className="flex min-w-0 max-w-xl flex-1 items-center gap-3 text-slate-400">
            <span className="text-xl">⌕</span>
            <span className="truncate text-sm">
              Rechercher une transaction...
            </span>
            <kbd className="hidden rounded border border-slate-200 px-2 py-1 text-[10px] sm:block">
              ⌘ K
            </kbd>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-xl border border-slate-200 px-3 py-2 text-lg text-slate-500"
            >
              ♧
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>

            <div className="h-9 border-l border-slate-200" />

            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e0eee9] text-xs font-bold text-[#16865e]">
                {userName
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-[#14213d]">
                  {userName}
                </p>
                <p className="text-[10px] text-slate-400">
                  Compte personnel
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Pages */}
        <main className="min-h-[calc(100vh-76px)] p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
