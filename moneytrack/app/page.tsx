import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  LockKeyhole,
  PiggyBank,
  ShieldCheck,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import PublicHeader from "@/components/layout/public-header";
import PublicFooter from "@/components/layout/public-footer";

const features = [
  {
    icon: CreditCard,
    title: "Suivi des transactions",
    description:
      "Gardez une trace de vos revenus et dépenses. Toutes vos opérations sont réunies au même endroit.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Wallet,
    title: "Budgets intelligents",
    description:
      "Définissez des limites adaptées à vos besoins et suivez votre consommation en temps réel.",
    color: "bg-orange-50 text-orange-500",
  },
  {
    icon: BarChart3,
    title: "Analyses visuelles",
    description:
      "Comprenez où va votre argent grâce à des graphiques simples et faciles à lire.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: Target,
    title: "Objectifs d’épargne",
    description:
      "Définissez vos objectifs et suivez progressivement votre évolution.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Bell,
    title: "Alertes personnalisées",
    description:
      "Restez attentif à vos budgets et à vos habitudes grâce à des alertes utiles.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: ShieldCheck,
    title: "Données protégées",
    description:
      "Vos informations financières sont personnelles. MoneyTrack place leur protection au cœur de son expérience.",
    color: "bg-rose-50 text-rose-600",
  },
];

const faqs = [
  {
    question: "Comment créer mon premier budget ?",
    answer:
      "Connectez-vous à votre compte, ouvrez la rubrique Budgets et créez un budget en choisissant une catégorie et un montant.",
  },
  {
    question: "Puis-je modifier une transaction ?",
    answer:
      "Oui. Depuis la rubrique Transactions, vous pouvez retrouver une opération et modifier ses informations.",
  },
  {
    question: "Comment sont calculées mes statistiques ?",
    answer:
      "Les statistiques sont établies à partir des revenus et dépenses enregistrés dans votre compte.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer:
      "MoneyTrack utilise un système d'authentification et des mécanismes de protection pour préserver l'accès à votre compte.",
  },
];

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[570px]">
      <div className="absolute -left-8 top-12 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="absolute -right-8 bottom-0 h-48 w-48 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_25px_70px_-25px_rgba(20,35,63,0.3)]">
        <div className="flex min-h-[360px]">
          <aside className="hidden w-[72px] shrink-0 flex-col items-center gap-6 bg-[#14233f] py-6 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#12a875] text-white">
              <Wallet size={19} />
            </div>
            <div className="h-7 w-7 rounded-lg bg-white/10" />
            <div className="h-7 w-7 rounded-lg bg-[#12a875]" />
            <div className="h-7 w-7 rounded-lg bg-white/10" />
            <div className="h-7 w-7 rounded-lg bg-white/10" />
          </aside>

          <div className="min-w-0 flex-1 p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400">Tableau de bord</p>
                <h3 className="mt-1 text-sm font-bold text-[#14233f] sm:text-base">
                  Bonjour, bienvenue !
                </h3>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                JR
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {[
                { label: "Solde total", value: "1 248 500", color: "text-[#14233f]" },
                { label: "Revenus", value: "850 000", color: "text-emerald-600" },
                { label: "Dépenses", value: "320 000", color: "text-rose-500" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <p className="text-[9px] text-slate-400 sm:text-[10px]">{item.label}</p>
                  <p className={`mt-2 text-xs font-extrabold sm:text-sm ${item.color}`}>
                    {item.value}
                  </p>
                  <p className="mt-1 text-[9px] text-slate-400">FCFA</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-[#14233f]">Évolution financière</p>
                  <p className="mt-1 text-[9px] text-slate-400">Revenus et dépenses</p>
                </div>
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-600">
                  Cette année
                </span>
              </div>

              <div className="relative mt-5 h-[105px]">
                <div className="absolute inset-0 flex flex-col justify-between">
                  <div className="border-t border-dashed border-slate-100" />
                  <div className="border-t border-dashed border-slate-100" />
                  <div className="border-t border-dashed border-slate-100" />
                  <div className="border-t border-dashed border-slate-100" />
                </div>
                <svg viewBox="0 0 420 110" className="relative h-full w-full" fill="none">
                  <path d="M0 85 C35 75 45 82 75 65 S120 70 150 48 S205 60 235 38 S285 50 320 23 S380 35 420 8" stroke="#12a875" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0 100 C40 96 50 90 80 88 S130 92 160 77 S210 86 240 72 S290 80 320 62 S380 70 420 55" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="mt-2 flex justify-between text-[9px] text-slate-400">
                <span>Jan</span><span>Mar</span><span>Mai</span><span>Juil</span><span>Sep</span><span>Déc</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-[10px] font-bold text-[#14233f]">Dernières transactions</p>
              <span className="text-[9px] font-semibold text-[#12a875]">Tout voir</span>
            </div>
            <div className="mt-3 space-y-3">
              {[
                { name: "Salaire", date: "Aujourd'hui", amount: "+ 250 000", positive: true },
                { name: "Courses", date: "Hier", amount: "- 35 000", positive: false },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <CircleDollarSign size={14} />
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold text-[#14233f]">{item.name}</p>
                      <p className="text-[9px] text-slate-400">{item.date}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold ${item.positive ? "text-emerald-600" : "text-rose-500"}`}>
                    {item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-xl sm:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <TrendingUp size={19} />
        </span>
        <div>
          <p className="text-[10px] text-slate-400">Suivi simplifié</p>
          <p className="text-xs font-bold text-[#14233f]">Vos finances en un seul endroit</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <PublicHeader />

      <main className="overflow-hidden bg-white">
        {/* HERO */}
        <section className="relative bg-gradient-to-br from-[#f5fbf8] via-white to-[#eef7f5]">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:py-20 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:py-24">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-2 text-xs font-semibold text-[#12a875] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#12a875]" />
                Vos finances, simplement maîtrisées
              </span>

              <h1 className="mt-7 max-w-xl text-4xl font-extrabold leading-[1.12] tracking-tight text-[#14233f] sm:text-5xl lg:text-[58px]">
                Prenez le contrôle de vos{" "}
                <span className="text-[#12a875]">finances personnelles</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-8 text-slate-500 sm:text-lg">
                Suivez vos dépenses, maîtrisez vos budgets et atteignez vos
                objectifs financiers avec une vision claire de votre argent.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#12a875] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-[#0e9366]"
                >
                  Commencer gratuitement
                  <ArrowRight size={17} />
                </Link>
                <Link
                  href="/#fonctionnalites"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-[#14233f] transition hover:border-emerald-300 hover:text-[#12a875]"
                >
                  Voir les fonctionnalités
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500">
                <span className="flex items-center gap-2"><Check size={15} className="text-[#12a875]" /> Simple à utiliser</span>
                <span className="flex items-center gap-2"><Check size={15} className="text-[#12a875]" /> Vue d'ensemble claire</span>
              </div>
            </div>

            <DashboardPreview />
          </div>
        </section>

        {/* BANDEAU DE CONFIANCE */}
        <section className="border-y border-slate-100 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 py-8 text-center sm:grid-cols-3 lg:px-8">
            <div>
              <p className="text-sm font-bold text-[#14233f]">Une vision claire</p>
              <p className="mt-1 text-xs text-slate-400">Toutes vos finances réunies</p>
            </div>
            <div className="border-y border-slate-100 py-5 sm:border-x sm:border-y-0 sm:py-0">
              <p className="text-sm font-bold text-[#14233f]">Un meilleur suivi</p>
              <p className="mt-1 text-xs text-slate-400">Revenus et dépenses organisés</p>
            </div>
            <div>
              <p className="text-sm font-bold text-[#14233f]">Plus de sérénité</p>
              <p className="mt-1 text-xs text-slate-400">Des décisions mieux éclairées</p>
            </div>
          </div>
        </section>

        {/* FONCTIONNALITÉS */}
        <section id="fonctionnalites" className="scroll-mt-24 bg-white px-5 py-20 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#12a875]">Fonctionnalités</span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#14233f] sm:text-4xl">
                Une vision claire de votre argent
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                Les outils essentiels pour organiser votre quotidien financier
                et garder le cap sur vos objectifs.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className="group rounded-2xl border border-slate-100 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-emerald-100 hover:shadow-xl hover:shadow-slate-200/50"
                  >
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color}`}>
                      <Icon size={23} />
                    </span>
                    <h3 className="mt-6 text-lg font-bold text-[#14233f]">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-500">{feature.description}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#12a875] opacity-0 transition group-hover:opacity-100">
                      En savoir plus <ArrowUpRight size={14} />
                    </span>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* AVANTAGES */}
        <section id="avantages" className="scroll-mt-24 overflow-hidden bg-[#f5faf8] px-5 py-20 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute inset-8 rounded-full bg-emerald-100 blur-3xl" />
              <div className="relative rounded-[28px] border border-white bg-white p-6 shadow-[0_25px_70px_-30px_rgba(20,35,63,0.25)] sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Votre épargne</p>
                    <p className="mt-2 text-2xl font-extrabold text-[#14233f]">124 500 <span className="text-sm">FCFA</span></p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-[#12a875]">
                    <PiggyBank size={24} />
                  </span>
                </div>
                <div className="mt-8 flex h-36 items-end justify-around gap-3 rounded-xl bg-slate-50 px-4 pt-5">
                  {[38, 56, 46, 72, 62, 88, 100].map((height, index) => (
                    <div key={index} className="flex h-full flex-1 items-end">
                      <div className="w-full rounded-t-md bg-gradient-to-t from-[#12a875] to-[#83dfbd]" style={{ height: `${height}%` }} />
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Progression de votre épargne</span>
                  <span className="font-bold text-[#12a875]">Suivi régulier</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#12a875]">Pourquoi MoneyTrack ?</span>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#14233f] sm:text-4xl">
                Moins de stress.
                <br />
                Plus de projets.
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-500 sm:text-base">
                Reprenez la main sur votre argent avec une méthode simple :
                comprendre, organiser et progresser.
              </p>

              <div className="mt-8 space-y-6">
                {[
                  ["Visualisez vos habitudes", "Identifiez plus facilement vos principales dépenses."],
                  ["Gardez le contrôle de vos budgets", "Suivez vos limites et ajustez vos dépenses."],
                  ["Avancez vers vos objectifs", "Transformez vos projets en objectifs concrets."],
                ].map(([title, description]) => (
                  <div key={title} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#12a875] shadow-sm">
                      <Check size={18} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[#14233f]">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/register" className="mt-9 inline-flex items-center gap-2 rounded-xl bg-[#14233f] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#1d355d]">
                Découvrir MoneyTrack <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* BANNIÈRE CONSEILS */}
        <section className="px-5 py-16 lg:px-8">
          <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl bg-[#14233f] px-7 py-10 sm:px-12 sm:py-14 lg:flex-row lg:items-center">
            <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[35px] border-white/5" />
            <div className="relative max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#55d9a8]">Conseils & habitudes</span>
              <h2 className="mt-4 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                Construisez de bonnes habitudes,
                <br className="hidden sm:block" /> un pas après l’autre.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                Découvrez des conseils simples pour mieux gérer votre argent
                et préparer vos projets.
              </p>
            </div>
            <Link href="/conseils" className="relative inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#12a875] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#0e9366]">
              Nos conseils du moment <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 bg-white px-5 py-20 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#12a875]">FAQ</span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#14233f] sm:text-4xl">
                Questions fréquentes
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-500">
                Vous avez une question sur MoneyTrack ? Retrouvez ici les
                réponses aux questions les plus courantes.
              </p>
              <Link href="/conseils" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#12a875] hover:underline">
                Voir nos conseils <ArrowRight size={16} />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 border-y border-slate-100">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#14233f]">
                    {faq.question}
                    <ChevronDown size={18} className="shrink-0 text-[#12a875] transition group-open:rotate-180" />
                  </summary>
                  <p className="max-w-2xl pt-4 text-sm leading-7 text-slate-500">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-[#f5faf8] px-5 py-16 text-center lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-extrabold text-[#14233f] sm:text-3xl">
              Prêt à mieux gérer votre argent ?
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              Faites le premier pas vers une gestion financière plus organisée.
            </p>
            <Link href="/register" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#12a875] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-[#0e9366]">
              Créer mon compte gratuitement <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}