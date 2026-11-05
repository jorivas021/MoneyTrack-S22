"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Landmark,
  Plus,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Cell,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { z } from "zod";

const dashboardResponseSchema = z.object({
  summary: z.object({
    income: z.number().finite(),
    expense: z.number().finite(),
    balance: z.number().finite(),
  }),
  currentMonth: z.object({
    year: z.number().int(),
    month: z.number().int().min(1).max(12),
  }),
  monthlySummary: z.object({
    income: z.number().finite(),
    expense: z.number().finite(),
    balance: z.number().finite(),
  }),
  budgetSummary: z.object({
    limit: z.number().finite(),
    spent: z.number().finite(),
    remaining: z.number().finite(),
    percentage: z.number().finite(),
  }),
  monthlyData: z.array(
    z.object({
      year: z.number().int(),
      month: z.number().int().min(1).max(12),
      income: z.number().finite(),
      expense: z.number().finite(),
    })
  ),
  expensesByCategory: z.array(
    z.object({
      categoryId: z.string(),
      category: z.string(),
      amount: z.number().finite(),
      percentage: z.number().finite(),
    })
  ),
  recentTransactions: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["INCOME", "EXPENSE"]),
      amount: z.union([z.number(), z.string()]),
      date: z.string(),
      description: z.string().nullable(),
      category: z.object({ name: z.string() }),
    })
  ),
  budgets: z.array(
    z.object({
      id: z.string(),
      category: z.string(),
      limit: z.number().finite(),
      spent: z.number().finite(),
      remaining: z.number().finite(),
      percentage: z.number().finite(),
    })
  ),
});

const errorResponseSchema = z.object({ error: z.string() });
type DashboardData = z.infer<typeof dashboardResponseSchema>;

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});
const chartColors = ["#14213D", "#16A36A", "#F59E0B", "#7257D8", "#CBD5E1"];

function formatCurrency(value: number) {
  return `${currencyFormatter.format(value)} FCFA`;
}

function getErrorMessage(body: unknown) {
  const parsed = errorResponseSchema.safeParse(body);
  return parsed.success
    ? parsed.data.error
    : "Impossible de charger les données du tableau de bord.";
}

function getMonthLabel(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 15)).toLocaleDateString("fr-FR", {
    month: "short",
    timeZone: "UTC",
  });
}

function formatTransactionDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function getChange(current: number, previous: number) {
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function ChangeBadge({
  change,
  inverse = false,
}: {
  change: number | null;
  inverse?: boolean;
}) {
  if (change === null) {
    return <span className="text-xs text-slate-400">Pas de comparaison</span>;
  }

  const isPositive = inverse ? change <= 0 : change >= 0;
  const Icon = change >= 0 ? TrendingUp : TrendingDown;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
        isPositive
          ? "bg-emerald-50 text-[#16A36A]"
          : "bg-rose-50 text-[#E85D5D]"
      }`}
    >
      <Icon aria-hidden="true" size={13} />
      {change > 0 ? "+" : ""}
      {change.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}%
    </span>
  );
}

function SummaryCard({
  title,
  amount,
  icon: Icon,
  iconClassName,
  change,
  caption,
  inverseChange,
  budgetPercentage,
}: {
  title: string;
  amount: number;
  icon: typeof Landmark;
  iconClassName: string;
  change?: number | null;
  caption?: string;
  inverseChange?: boolean;
  budgetPercentage?: number;
}) {
  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-500">{title}</h2>
        <span className={`flex size-10 items-center justify-center rounded-xl ${iconClassName}`}>
          <Icon aria-hidden="true" size={20} />
        </span>
      </div>
      <p className="mt-4 break-words text-xl font-bold tracking-tight text-[#14213D] xl:text-2xl">
        {formatCurrency(amount)}
      </p>
      {budgetPercentage !== undefined ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div
            aria-label={`${Math.min(budgetPercentage, 100)} % du budget utilisé`}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={Math.min(budgetPercentage, 100)}
          >
            <div
              className="h-full rounded-full bg-[#16A36A]"
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            />
          </div>
          <span className="text-xs text-slate-400">
            {budgetPercentage}% utilisé
          </span>
        </div>
      ) : change !== undefined ? (
        <div className="mt-4 flex items-center gap-2">
          <ChangeBadge change={change} inverse={inverseChange} />
          <span className="text-xs text-slate-400">vs mois précédent</span>
        </div>
      ) : caption ? (
        <p className="mt-4 text-xs text-slate-400">{caption}</p>
      ) : null}
    </article>
  );
}

function DashboardLoading() {
  return (
    <div
      aria-label="Chargement des données du tableau de bord"
      className="space-y-5"
      role="status"
    >
      <div className="h-20 animate-pulse rounded-xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4 xl:gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="h-36 animate-pulse rounded-xl bg-slate-200"
            key={index}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.7fr_1fr] xl:gap-4">
        <div className="h-96 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-96 animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

function DashboardCharts({ data }: { data: DashboardData }) {
  const monthlyChartData = data.monthlyData.map((item) => ({
    ...item,
    label: getMonthLabel(item.year, item.month),
  }));
  const categoryChartData = data.expensesByCategory.map((item) => ({
    ...item,
    percentage:
      data.monthlySummary.expense > 0
        ? (item.amount / data.monthlySummary.expense) * 100
        : 0,
  }));

  return (
    <section className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-[1.7fr_1fr] xl:gap-4">
      <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:p-5">
        <header className="mb-5">
          <h2 className="font-semibold text-[#14213D]">Évolution financière</h2>
          <p className="mt-1 text-xs text-slate-500">
            Revenus et dépenses sur les 6 derniers mois
          </p>
        </header>
        {monthlyChartData.some((item) => item.income > 0 || item.expense > 0) ? (
          <div
            aria-label="Graphique des revenus et dépenses des six derniers mois"
            className="h-[260px] w-full sm:h-[300px] xl:h-[330px]"
            role="img"
          >
            <ResponsiveContainer height="100%" width="100%">
              <LineChart
                data={monthlyChartData}
                margin={{ top: 10, right: 4, left: -18, bottom: 4 }}
              >
                <CartesianGrid stroke="#E8EDF3" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 10 }}
                  tickFormatter={(value: number) =>
                    value >= 1_000_000
                      ? `${(value / 1_000_000).toLocaleString("fr-FR")}M`
                      : `${Math.round(value / 1_000)}k`
                  }
                  tickLine={false}
                  width={48}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                  labelFormatter={(label) => String(label)}
                />
                <Legend
                  align="center"
                  iconType="circle"
                  verticalAlign="bottom"
                />
                <Line
                  activeDot={{ r: 5 }}
                  dataKey="income"
                  dot={{ fill: "#FFFFFF", r: 3, strokeWidth: 2 }}
                  name="Revenus"
                  stroke="#16A36A"
                  strokeWidth={3}
                  type="monotone"
                />
                <Line
                  activeDot={{ r: 5 }}
                  dataKey="expense"
                  dot={false}
                  name="Dépenses"
                  stroke="#E85D5D"
                  strokeWidth={2.5}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[330px] items-center justify-center text-sm text-slate-400">
            Aucune transaction enregistrée sur cette période.
          </div>
        )}
      </article>

      <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:p-5">
        <header>
          <h2 className="font-semibold text-[#14213D]">
            Dépenses par catégorie
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Répartition ce mois-ci
          </p>
        </header>
        {categoryChartData.length > 0 ? (
          <>
            <div
              aria-label="Diagramme des dépenses par catégorie ce mois-ci"
              className="relative mx-auto mt-2 h-[210px] w-full sm:h-[225px]"
              role="img"
            >
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="amount"
                    innerRadius={56}
                    nameKey="category"
                    outerRadius={84}
                    paddingAngle={2}
                  >
                    {categoryChartData.map((item, index) => (
                      <Cell
                        fill={chartColors[index % chartColors.length]}
                        key={item.categoryId}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-[#14213D]">
                  {currencyFormatter.format(data.monthlySummary.expense)}
                </span>
                <span className="text-[10px] text-slate-400">FCFA dépensés</span>
              </div>
            </div>
            <ul className="mt-3 space-y-3">
              {categoryChartData.map((item, index) => (
                <li
                  className="flex items-center justify-between gap-3 text-xs"
                  key={item.categoryId}
                >
                  <span className="flex min-w-0 items-center gap-2 text-slate-600">
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: chartColors[index % chartColors.length],
                      }}
                    />
                    <span className="truncate">{item.category}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="font-medium text-[#14213D]">
                      {currencyFormatter.format(item.amount)}
                    </span>
                    <span className="ml-1 text-slate-400 sm:ml-2">
                      {Math.round(item.percentage)}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="flex h-[330px] items-center justify-center text-sm text-slate-400">
            Aucune dépense enregistrée ce mois-ci.
          </div>
        )}
      </article>
    </section>
  );
}

export default function DashboardPage({ userName }: { userName: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const requestController = useRef<AbortController | null>(null);

  const loadDashboard = useCallback(async () => {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;

    try {
      const response = await fetch("/api/dashboard", {
        cache: "no-store",
        signal: controller.signal,
      });
      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(body));
      }

      const parsed = dashboardResponseSchema.safeParse(body);
      if (!parsed.success) {
        throw new Error("La réponse du tableau de bord est invalide.");
      }

      setData(parsed.data);
      setError(null);
    } catch (loadError) {
      if (!controller.signal.aborted) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger les données du tableau de bord."
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const refreshDashboard = useCallback(() => {
    setRefreshing(true);
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    void Promise.resolve().then(loadDashboard);

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        refreshDashboard();
      }
    }

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      requestController.current?.abort();
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadDashboard, refreshDashboard]);

  const chartData = data?.monthlyData ?? [];
  const previousMonth = chartData.at(-2);
  const currentMonth = chartData.at(-1);
  const incomeChange =
    currentMonth && previousMonth
      ? getChange(currentMonth.income, previousMonth.income)
      : null;
  const expenseChange =
    currentMonth && previousMonth
      ? getChange(currentMonth.expense, previousMonth.expense)
      : null;
  const monthLabel = data
    ? new Date(
        Date.UTC(data.currentMonth.year, data.currentMonth.month - 1, 15)
      ).toLocaleDateString("fr-FR", { month: "long", timeZone: "UTC" })
    : "";
  const firstName = userName.trim().split(/\s+/)[0] || "Utilisateur";

  return (
    <div className="min-w-0 space-y-4 bg-[#F5F7FA] text-[#14213D]">
      {loading ? (
        <DashboardLoading />
      ) : error && !data ? (
        <div
          aria-live="polite"
          className="rounded-xl border border-[#E85D5D]/25 bg-white p-6 text-sm text-[#9f3434]"
          role="alert"
        >
          {error}
          <button
            className="ml-3 font-semibold underline"
            onClick={() => window.location.reload()}
            type="button"
          >
            Réessayer
          </button>
        </div>
      ) : data ? (
        <>
          <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between xl:gap-6">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {data.currentMonth.month}/{data.currentMonth.year}
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#14213D] sm:text-3xl">
                Bonjour {firstName}, voici vos finances.
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Un aperçu de votre situation financière ce mois-ci.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium capitalize text-[#14213D] sm:px-4">
                <CalendarDays aria-hidden="true" size={17} />
                {monthLabel}
              </span>
              <Link
                className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg bg-[#14213D] px-3 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d3157] sm:px-5"
                href="/transactions"
              >
                <Plus aria-hidden="true" size={18} />
                Ajouter une transaction
              </Link>
            </div>
          </header>

          <section
            aria-label="Résumé financier"
            className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4 xl:gap-4"
          >
            <SummaryCard
              amount={data.summary.balance}
              caption="Revenus cumulés moins dépenses"
              icon={Landmark}
              iconClassName="bg-slate-100 text-[#14213D]"
              title="Solde total"
            />
            <SummaryCard
              amount={data.monthlySummary.income}
              change={incomeChange}
              icon={ArrowDownRight}
              iconClassName="bg-emerald-50 text-[#16A36A]"
              title="Revenus du mois"
            />
            <SummaryCard
              amount={data.monthlySummary.expense}
              change={expenseChange}
              icon={ArrowUpRight}
              iconClassName="bg-rose-50 text-[#E85D5D]"
              inverseChange
              title="Dépenses du mois"
            />
            <SummaryCard
              amount={data.budgetSummary.remaining}
              budgetPercentage={data.budgetSummary.percentage}
              icon={Target}
              iconClassName="bg-orange-50 text-orange-500"
              title="Budget restant"
            />
          </section>

          {error && (
            <div
              aria-live="polite"
              className="rounded-lg border border-[#E85D5D]/25 bg-white px-4 py-3 text-sm text-[#9f3434]"
              role="status"
            >
              Mise à jour impossible : {error}
            </div>
          )}

          <DashboardCharts data={data} />

          <section className="grid min-w-0 grid-cols-1 items-stretch gap-4 xl:grid-cols-[1.7fr_1fr]">
            <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:p-5">
              <header className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-[#14213D]">
                    Dernières transactions
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Vos mouvements les plus récents
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    aria-label="Actualiser les dernières transactions"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-[#14213D] disabled:cursor-wait disabled:opacity-60"
                    disabled={refreshing}
                    onClick={refreshDashboard}
                    title="Actualiser"
                    type="button"
                  >
                    <RefreshCw
                      aria-hidden="true"
                      className={refreshing ? "animate-spin" : ""}
                      size={14}
                    />
                  </button>
                  <Link
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A36A] transition hover:text-[#118653]"
                    href="/transactions"
                  >
                    Voir tout
                    <ChevronRight aria-hidden="true" size={15} />
                  </Link>
                </div>
              </header>

              {data.recentTransactions.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {data.recentTransactions.map((transaction) => {
                    const isIncome = transaction.type === "INCOME";
                    const Icon = isIncome ? ArrowDownRight : ArrowUpRight;

                    return (
                      <li
                        className="flex flex-col gap-3 py-3 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between"
                        key={transaction.id}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                              isIncome
                                ? "bg-emerald-50 text-[#16A36A]"
                                : "bg-rose-50 text-[#E85D5D]"
                            }`}
                          >
                            <Icon aria-hidden="true" size={19} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#14213D]">
                              {transaction.description?.trim() ||
                                transaction.category.name}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-400">
                              {transaction.category.name}
                              <span aria-hidden="true"> · </span>
                              {formatTransactionDate(transaction.date)}
                            </p>
                          </div>
                        </div>
                        <p
                          className={`shrink-0 text-sm font-bold sm:text-right ${
                            isIncome ? "text-[#16A36A]" : "text-[#14213D]"
                          }`}
                        >
                          {isIncome ? "+" : "−"}
                          {formatCurrency(Number(transaction.amount))}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="rounded-lg bg-slate-50 px-4 py-8 text-center">
                  <p className="text-sm text-slate-500">
                    Aucune transaction enregistrée pour le moment.
                  </p>
                  <Link
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#16A36A] hover:text-[#118653]"
                    href="/transactions"
                  >
                    Ajouter une transaction
                    <ChevronRight aria-hidden="true" size={16} />
                  </Link>
                </div>
              )}
            </article>

            <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:p-5">
              <header className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-[#14213D]">
                    Suivi des budgets
                  </h2>
                  <p className="mt-1 text-xs capitalize text-slate-500">
                    {monthLabel}
                  </p>
                </div>
                <Link
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#16A36A] transition hover:text-[#118653]"
                  href="/budgets"
                >
                  Gérer
                  <ChevronRight aria-hidden="true" size={15} />
                </Link>
              </header>

              {data.budgets.length > 0 ? (
                <>
                  <ul className="space-y-4">
                    {[...data.budgets]
                      .sort(
                        (first, second) =>
                          second.percentage - first.percentage
                      )
                      .slice(0, 4)
                      .map((budget, index) => {
                        const exceeded = budget.percentage >= 100;
                        const warning = budget.percentage >= 80 && !exceeded;
                        const barColor = exceeded
                          ? "bg-[#E85D5D]"
                          : warning
                            ? "bg-orange-500"
                            : "bg-[#16A36A]";
                        const iconColor =
                          index % 3 === 0
                            ? "bg-orange-50 text-orange-500"
                            : index % 3 === 1
                              ? "bg-cyan-50 text-cyan-600"
                              : "bg-violet-50 text-violet-500";

                        return (
                          <li className="min-w-0" key={budget.id}>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-2.5">
                                <span
                                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconColor}`}
                                >
                                  <CircleDollarSign
                                    aria-hidden="true"
                                    size={18}
                                  />
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold text-[#14213D]">
                                    {budget.category}
                                  </p>
                                  <p className="mt-0.5 truncate text-[10px] text-slate-400">
                                    {currencyFormatter.format(budget.spent)} sur{" "}
                                    {currencyFormatter.format(budget.limit)} FCFA
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`shrink-0 text-xs font-semibold ${
                                  exceeded
                                    ? "text-[#E85D5D]"
                                    : warning
                                      ? "text-orange-500"
                                      : "text-[#14213D]"
                                }`}
                              >
                                {Math.round(budget.percentage)}%
                              </span>
                            </div>
                            <div
                              aria-label={`${Math.round(budget.percentage)}% du budget ${budget.category} utilisé`}
                              aria-valuemax={100}
                              aria-valuemin={0}
                              aria-valuenow={Math.min(
                                Math.max(budget.percentage, 0),
                                100
                              )}
                              className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
                              role="progressbar"
                            >
                              <div
                                className={`h-full rounded-full ${barColor}`}
                                style={{
                                  width: `${Math.min(
                                    Math.max(budget.percentage, 0),
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                  {data.budgets.length > 4 && (
                    <Link
                      className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#16A36A] hover:text-[#118653]"
                      href="/budgets"
                    >
                      Voir les {data.budgets.length} budgets
                      <ChevronRight aria-hidden="true" size={14} />
                    </Link>
                  )}
                </>
              ) : (
                <div className="flex min-h-40 flex-col items-center justify-center rounded-lg bg-slate-50 px-4 py-6 text-center">
                  <Target
                    aria-hidden="true"
                    className="text-slate-400"
                    size={23}
                  />
                  <p className="mt-3 text-sm text-slate-500">
                    Aucun budget défini pour ce mois.
                  </p>
                  <Link
                    className="mt-2 text-xs font-semibold text-[#16A36A] hover:text-[#118653]"
                    href="/budgets"
                  >
                    Créer un budget
                  </Link>
                </div>
              )}
            </article>
          </section>
        </>
      ) : null}
    </div>
  );
}
