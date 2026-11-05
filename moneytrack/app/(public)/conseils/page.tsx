import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Lightbulb,
  PiggyBank,
  ShieldCheck,
  Target,
  Wallet,
} from "lucide-react";
import PublicHeader from "@/components/layout/public-header";
import PublicFooter from "@/components/layout/public-footer";

const tips = [
  {
    number: "01",
    icon: PiggyBank,
    category: "Épargne",
    title: "Payez-vous en premier",
    description:
      "Dès que vous recevez un revenu, mettez de côté une partie de cette somme avant de commencer vos dépenses.",
    advice:
      "Commencez avec un montant raisonnable et essayez de garder cette habitude chaque mois.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    number: "02",
    icon: Wallet,
    category: "Budget",
    title: "Fixez des budgets réalistes",
    description:
      "Définissez une limite de dépenses pour les catégories importantes de votre quotidien : alimentation, transport, loisirs et autres.",
    advice:
      "Observez d'abord vos habitudes pour établir des limites que vous pourrez réellement respecter.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    number: "03",
    icon: Clock3,
    category: "Dépenses",
    title: "Adoptez la règle des 24 heures",
    description:
      "Avant un achat non essentiel, prenez le temps d'y réfléchir. Attendre un jour peut vous aider à éviter une dépense impulsive.",
    advice:
      "Demandez-vous si cet achat est nécessaire et s'il correspond à vos priorités.",
    color: "bg-orange-50 text-orange-600",
  },
];

const principles = [
  {
    icon: Target,
    title: "Définissez vos priorités",
    description: "Identifiez les projets qui comptent vraiment pour vous.",
  },
  {
    icon: Lightbulb,
    title: "Restez régulier",
    description: "De petites habitudes répétées peuvent faire une différence.",
  },
  {
    icon: ShieldCheck,
    title: "Gardez une marge",
    description: "Prévoyez une réserve pour les dépenses imprévues.",
  },
];

const questions = [
  {
    question: "Comment commencer à mieux gérer mon argent ?",
    answer:
      "Commencez par noter vos revenus et vos dépenses. Vous pourrez ensuite identifier vos habitudes et définir un budget adapté.",
  },
  {
    question: "Combien dois-je mettre de côté chaque mois ?",
    answer:
      "Il n'existe pas de montant universel. Choisissez une somme compatible avec vos revenus et vos charges, puis ajustez-la progressivement.",
  },
  {
    question: "Que faire si je dépasse mon budget ?",
    answer:
      "Analysez les dépenses concernées sans vous décourager. Ajustez vos prochaines limites et cherchez à comprendre ce qui a provoqué le dépassement.",
  },
  {
    question: "Comment suivre mes progrès ?",
    answer:
      "Comparez régulièrement vos revenus, vos dépenses et votre épargne. MoneyTrack vous aide à visualiser ces informations dans votre espace personnel.",
  },
];

export default function ConseilsPage() {
  return (
    <>
      <PublicHeader />

      <main className="min-h-screen bg-white">
        {/* INTRODUCTION */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#f2faf6] via-white to-[#edf7f5] px-5 py-20 sm:py-24 lg:px-8">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />

          <div className="relative mx-auto max-w-7xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#12a875]"
            >
              <ArrowLeft size={16} />
              Retour à l'accueil
            </Link>

            <div className="mt-12 max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#12a875]">
                <Lightbulb size={15} />
                Conseils financiers
              </span>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-[#14233f] sm:text-5xl lg:text-6xl">
                Construisez de bonnes habitudes,
                <span className="text-[#12a875]"> un pas après l'autre.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
                Mieux gérer son argent ne demande pas forcément de grands
                changements. Découvrez des conseils simples à appliquer au
                quotidien pour prendre de meilleures décisions financières.
              </p>
            </div>
          </div>
        </section>

        {/* CONSEILS */}
        <section className="px-5 py-20 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#12a875]">
                  À mettre en pratique
                </span>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#14233f] sm:text-4xl">
                  Nos conseils du moment
                </h2>
                <p className="mt-3 text-sm text-slate-500 sm:text-base">
                  Des actions simples pour améliorer votre gestion financière.
                </p>
              </div>
              <span className="text-sm font-medium text-slate-400">
                3 conseils à découvrir
              </span>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {tips.map((tip) => {
                const Icon = tip.icon;

                return (
                  <article
                    key={tip.number}
                    className="flex flex-col rounded-2xl border border-slate-100 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-emerald-100 hover:shadow-xl hover:shadow-slate-200/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold tracking-widest text-slate-300">
                        CONSEIL {tip.number}
                      </span>
                      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tip.color}`}>
                        <Icon size={23} />
                      </span>
                    </div>

                    <span className="mt-7 w-fit rounded-full bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-500">
                      {tip.category}
                    </span>

                    <h3 className="mt-4 text-xl font-extrabold text-[#14233f]">
                      {tip.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-slate-500">
                      {tip.description}
                    </p>

                    <div className="mt-6 flex-1 rounded-xl bg-[#f5faf8] p-4">
                      <p className="text-xs font-bold text-[#12a875]">
                        À retenir
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {tip.advice}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* HABITUDES */}
        <section className="bg-[#f5faf8] px-5 py-20 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#12a875]">
                Les bonnes habitudes
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#14233f] sm:text-4xl">
                Chaque petit effort compte
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                Une bonne gestion financière se construit progressivement.
                Gardez ces trois principes à l'esprit.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {principles.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white bg-white p-7 text-center shadow-sm"
                  >
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#12a875]">
                      <Icon size={25} />
                    </span>
                    <h3 className="mt-5 text-base font-bold text-[#14233f]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-5 py-20 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#12a875]">
                Besoin d'aide ?
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#14233f] sm:text-4xl">
                Questions fréquentes
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-500">
                Quelques réponses pour vous aider à adopter de meilleures
                habitudes financières.
              </p>
            </div>

            <div className="divide-y divide-slate-100 border-y border-slate-100">
              {questions.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#14233f]">
                    {item.question}
                    <span className="text-xl font-normal text-[#12a875] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pt-4 text-sm leading-7 text-slate-500">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT / CTA */}
        <section className="px-5 pb-20 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 rounded-3xl bg-[#14233f] px-7 py-10 sm:px-12 sm:py-12 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                Envie de mieux gérer vos finances ?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
                Passez à l'action et retrouvez vos revenus, dépenses et budgets
                dans un seul espace.
              </p>
            </div>

            <Link
              href="/register"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#12a875] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#0e9366]"
            >
              Commencer gratuitement
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}