import Link from "next/link";
import { Wallet } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="bg-[#14233f] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="sm:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#12a875]">
              <Wallet size={21} />
            </span>
            <span className="text-xl font-extrabold">
              Money<span className="text-[#12a875]">Track</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
            Prenez le contrôle de vos finances personnelles et avancez
            sereinement vers vos projets.
          </p>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-bold">Navigation</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li><Link className="transition hover:text-[#37d69c]" href="/">Accueil</Link></li>
            <li><Link className="transition hover:text-[#37d69c]" href="/#fonctionnalites">Fonctionnalités</Link></li>
            <li><Link className="transition hover:text-[#37d69c]" href="/#avantages">Avantages</Link></li>
            <li><Link className="transition hover:text-[#37d69c]" href="/conseils">Conseils</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-bold">Votre compte</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li><Link className="transition hover:text-[#37d69c]" href="/login">Se connecter</Link></li>
            <li><Link className="transition hover:text-[#37d69c]" href="/register">Créer un compte</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© 2026 MoneyTrack. Tous droits réservés.</p>
          <p>Gérez mieux aujourd’hui. Préparez mieux demain.</p>
        </div>
      </div>
    </footer>
  );
}