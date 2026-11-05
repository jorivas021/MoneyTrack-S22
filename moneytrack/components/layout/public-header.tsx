"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";

const links = [
  { label: "Fonctionnalités", href: "/#fonctionnalites" },
  { label: "Avantages", href: "/#avantages" },
  { label: "FAQ", href: "/#faq" },
  { label: "Conseils", href: "/conseils" },
];

export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Wallet size={22} />
          </span>

          <span className="text-xl font-bold tracking-tight text-slate-900">
            Money<span className="text-emerald-600">Track</span>
          </span>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-emerald-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions desktop */}
        <div className="hidden items-center gap-5 lg:flex">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 transition hover:text-emerald-600"
          >
            Se connecter
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Commencer gratuitement
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Bouton hamburger mobile et tablette */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:hidden"
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-5 pb-6 pt-3 shadow-lg lg:hidden">
          <nav className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                className="border-b border-slate-100 py-4 text-sm font-medium text-slate-700 transition hover:text-emerald-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-5 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={closeMenu}
              className="rounded-xl border border-slate-200 px-5 py-3.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Se connecter
            </Link>

            <Link
              href="/register"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Commencer gratuitement
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}