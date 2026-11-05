"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { Download, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { z } from "zod";

const statisticsResponseSchema = z.object({
  year: z.number().int(),
  period: z.number().nullable(),
  summary: z.object({
    income: z.number().finite(),
    expense: z.number().finite(),
    balance: z.number().finite(),
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
      category: z.string(),
      amount: z.number().finite(),
    })
  ),
});

const errorResponseSchema = z.object({ error: z.string() });
type StatisticsData = z.infer<typeof statisticsResponseSchema>;
type Period = 6 | 12;

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});
const percentageFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 1,
});
const chartColors = ["#16A36A", "#14213D", "#E85D5D", "#F59E0B", "#7257D8", "#0EA5A4"];

function formatCurrency(value: number) {
  return `${currencyFormatter.format(value)} FCFA`;
}

function getErrorMessage(body: unknown, fallback: string) {
  const parsed = errorResponseSchema.safeParse(body);
  return parsed.success ? parsed.data.error : fallback;
}

function getMonthLabel(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 15)).toLocaleDateString("fr-FR", {
    month: "short",
    timeZone: "UTC",
  });
}

function downloadCsv(data: StatisticsData, period: Period) {
  const rows = [
    ["Période", "Revenus (FCFA)", "Dépenses (FCFA)", "Solde net (FCFA)"],
    ...data.monthlyData.map((item) => [
      `${getMonthLabel(item.year, item.month)} ${item.year}`,
      String(item.income),
      String(item.expense),
      String(item.income - item.expense),
    ]),
  ];
  const csv = `\uFEFF${rows
    .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(";"))
    .join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");

  link.href = url;
  link.download = `moneytrack-statistiques-${period}-mois.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function StatisticsPage() {
  const [period, setPeriod] = useState<Period>(6);
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    const response = await fetch(`/api/statistiques?period=${period}`, {
      cache: "no-store",
    });
    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(getErrorMessage(body, "Impossible de charger les statistiques."));
    }

    const parsed = statisticsResponseSchema.safeParse(body);
    if (!parsed.success) {
      throw new Error("La réponse des statistiques est invalide.");
    }

    return parsed.data;
  }, [period]);

  useEffect(() => {
    let active = true;

    fetchStatistics()
      .then((statistics) => {
        if (active) {
          setData(statistics);
          setError(null);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Impossible de charger les statistiques."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchStatistics]);

  async function retryLoading() {
    setLoading(true);
    try {
      const statistics = await fetchStatistics();
      setData(statistics);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger les statistiques."
      );
    } finally {
      setLoading(false);
    }
  }

  const chartData = useMemo(() => {
    if (!data) return [];

    let balance = 0;
    return data.monthlyData.map((item) => {
      balance += item.income - item.expense;
      return {
        ...item,
        label: getMonthLabel(item.year, item.month),
        balance,
      };
    });
  }, [data]);

  const averageIncome =
    data && data.monthlyData.length > 0
      ? data.summary.income / data.monthlyData.length
      : 0;
  const averageExpense =
    data && data.monthlyData.length > 0
      ? data.summary.expense / data.monthlyData.length
      : 0;
  const savingsRate =
    data && data.summary.income > 0
      ? (data.summary.balance / data.summary.income) * 100
      : 0;
  const dataIsCurrent = data?.period === period;
  const hasTransactions =
    data?.monthlyData.some((item) => item.income !== 0 || item.expense !== 0) ?? false;

  return (
    <main className="min-h-full bg-[#F5F7FA] px-4 py-6 text-[#14213D] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Statistiques financières
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Analyser les habitudes et suivre la progression.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[420px]:flex-row">
            <label className="sr-only" htmlFor="statistics-period">
              Période des statistiques
            </label>
            <select
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/15"
              id="statistics-period"
              onChange={(event) => {
                setLoading(true);
                setPeriod(event.target.value === "12" ? 12 : 6);
              }}
              value={period}
            >
              <option value={6}>6 derniers mois</option>
              <option value={12}>12 derniers mois</option>
            </select>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!dataIsCurrent || !data || loading}
              onClick={() => dataIsCurrent && data && downloadCsv(data, period)}
              type="button"
            >
              <Download aria-hidden="true" size={17} />
              Exporter
            </button>
          </div>
        </header>

        {error && (
          <div
            aria-live="polite"
            className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-[#E85D5D]/25 bg-white p-4 text-sm text-[#9f3434]"
            role="alert"
          >
            <span>{error}</span>
            <button
              className="shrink-0 font-semibold underline underline-offset-2"
              onClick={() => {
                setLoading(true);
                void retryLoading();
              }}
              type="button"
            >
              Réessayer
            </button>
          </div>
        )}

        {loading && !dataIsCurrent ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  aria-hidden="true"
                  className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white"
                  key={index}
                />
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-5">
              <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white lg:col-span-3" />
              <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white lg:col-span-2" />
            </div>
            <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
          </div>
        ) : dataIsCurrent && data ? (
          <>
            <section
              aria-label="Résumé de la période"
              className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            >
              {[
                {
                  label: "Revenus moyens",
                  value: formatCurrency(averageIncome),
                  Icon: TrendingUp,
                  color: "text-[#16A36A]",
                },
                {
                  label: "Dépenses moyennes",
                  value: formatCurrency(averageExpense),
                  Icon: TrendingDown,
                  color: "text-[#E85D5D]",
                },
                {
                  label: "Épargne moyenne",
                  value: formatCurrency(data.summary.balance / Math.max(data.monthlyData.length, 1)),
                  Icon: Wallet,
                  color: data.summary.balance >= 0 ? "text-[#16A36A]" : "text-[#E85D5D]",
                },
                {
                  label: "Taux d’épargne",
                  value: `${percentageFormatter.format(savingsRate)}%`,
                  Icon: Wallet,
                  color: savingsRate >= 0 ? "text-[#16A36A]" : "text-[#E85D5D]",
                },
              ].map(({ label, value, Icon, color }) => (
                <article
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  key={label}
                >
                  <p className="text-sm text-slate-500">{label}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-lg font-bold">{loading ? "…" : value}</p>
                    <Icon aria-hidden="true" className={color} size={19} />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{period} derniers mois</p>
                </article>
              ))}
            </section>

            {loading && (
              <p aria-live="polite" className="mb-3 text-xs text-slate-500">
                Mise à jour des statistiques…
              </p>
            )}

            <section className="grid gap-4 lg:grid-cols-5">
              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-3">
                <h2 className="mb-4 font-semibold">Revenus vs dépenses</h2>
                {hasTransactions ? (
                  <div
                    aria-label="Graphique comparant revenus et dépenses"
                    className="h-64 w-full"
                    role="img"
                  >
                    <ResponsiveContainer height="100%" width="100%">
                      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#E8EDF3" vertical={false} />
                        <XAxis
                          axisLine={false}
                          dataKey="label"
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          tickLine={false}
                        />
                        <YAxis
                          axisLine={false}
                          tick={{ fill: "#64748b", fontSize: 11 }}
                          tickFormatter={(value: number) => currencyFormatter.format(value)}
                          tickLine={false}
                          width={74}
                        />
                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value ?? 0))}
                          labelFormatter={(label) => String(label)}
                        />
                        <Legend />
                        <Bar dataKey="income" fill="#16A36A" name="Revenus" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" fill="#E85D5D" name="Dépenses" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChartMessage />
                )}
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
                <h2 className="mb-4 font-semibold">Répartition des dépenses</h2>
                {data.expensesByCategory.length > 0 ? (
                  <>
                    <div
                      aria-label="Graphique circulaire des dépenses par catégorie"
                      className="h-52 w-full"
                    >
                      <ResponsiveContainer height="100%" width="100%">
                        <PieChart>
                          <Pie
                            data={data.expensesByCategory}
                            dataKey="amount"
                            innerRadius={54}
                            nameKey="category"
                            outerRadius={82}
                            paddingAngle={3}
                          >
                            {data.expensesByCategory.map((item, index) => (
                              <Cell
                                fill={chartColors[index % chartColors.length]}
                                key={`${item.category}-${index}`}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                      {data.expensesByCategory.slice(0, 5).map((item, index) => (
                        <li className="flex items-center justify-between gap-3 text-xs" key={`${item.category}-${index}`}>
                          <span className="flex min-w-0 items-center gap-2 text-slate-600">
                            <span
                              aria-hidden="true"
                              className="size-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: chartColors[index % chartColors.length] }}
                            />
                            <span className="truncate">{item.category}</span>
                          </span>
                          <span className="shrink-0 font-medium">{formatCurrency(item.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <EmptyChartMessage />
                )}
              </article>
            </section>

            <article className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-1 font-semibold">Évolution du solde net</h2>
              <p className="mb-3 text-xs text-slate-500">
                Revenus moins dépenses cumulés depuis le début de la période sélectionnée.
              </p>
              {hasTransactions ? (
                <div
                  aria-label="Graphique de l’évolution du solde net cumulé"
                  className="h-56 w-full"
                  role="img"
                >
                  <ResponsiveContainer height="100%" width="100%">
                    <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#E8EDF3" vertical={false} />
                      <XAxis
                        axisLine={false}
                        dataKey="label"
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis
                        axisLine={false}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        tickFormatter={(value: number) => currencyFormatter.format(value)}
                        tickLine={false}
                        width={74}
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value ?? 0))}
                        labelFormatter={(label) => String(label)}
                      />
                      <Line
                        activeDot={{ r: 5 }}
                        dataKey="balance"
                        dot={{ fill: "#14213D", r: 3 }}
                        name="Solde net cumulé"
                        stroke="#14213D"
                        strokeWidth={3}
                        type="monotone"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChartMessage />
              )}
            </article>
          </>
        ) : (
          <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="font-medium">Les statistiques ne sont pas disponibles.</p>
            <p className="mt-1 text-sm text-slate-500">
              Réessaie dans quelques instants.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function EmptyChartMessage() {
  return (
    <div className="flex h-56 items-center justify-center rounded-lg bg-slate-50 px-4 text-center text-sm text-slate-500">
      Aucune transaction pour cette période.
    </div>
  );
}
