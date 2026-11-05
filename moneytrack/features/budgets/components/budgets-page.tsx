"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  CalendarDays,
  CarFront,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coffee,
  GraduationCap,
  House,
  MoreHorizontal,
  Pencil,
  Plus,
  ShoppingBasket,
  Trash2,
  Utensils,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import Swal from "sweetalert2";
import { z } from "zod";

const budgetSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  limitAmount: z.union([z.number(), z.string()]),
  limit: z.number().finite(),
  spent: z.number().finite(),
  remaining: z.number().finite(),
  percentage: z.number().finite(),
  category: z.object({ id: z.string(), name: z.string() }),
});

const budgetsResponseSchema = z.object({
  budgets: z.array(budgetSchema),
});

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["INCOME", "EXPENSE"]),
});

const categoriesResponseSchema = z.object({
  categories: z.array(categorySchema),
});

const errorResponseSchema = z.object({ error: z.string() });
type Budget = z.infer<typeof budgetSchema>;
type Category = z.infer<typeof categorySchema>;
type BudgetFormValues = {
  categoryId: string;
  limitAmount: string;
  month: number;
  year: number;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});
const monthFormatter = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const categoryIcons = [
  Utensils,
  CarFront,
  House,
  Zap,
  Coffee,
  GraduationCap,
  ShoppingBasket,
  Wallet,
];
const categoryColors = [
  { icon: "bg-orange-50 text-orange-500", bar: "bg-[#16A36A]" },
  { icon: "bg-cyan-50 text-cyan-600", bar: "bg-orange-500" },
  { icon: "bg-violet-50 text-violet-500", bar: "bg-[#16A36A]" },
  { icon: "bg-rose-50 text-rose-500", bar: "bg-[#E85D5D]" },
  { icon: "bg-blue-50 text-blue-500", bar: "bg-[#16A36A]" },
  { icon: "bg-emerald-50 text-emerald-600", bar: "bg-[#16A36A]" },
  { icon: "bg-amber-50 text-amber-600", bar: "bg-orange-500" },
  { icon: "bg-slate-100 text-slate-600", bar: "bg-[#16A36A]" },
];

function formatCurrency(value: number) {
  return `${currencyFormatter.format(value)} FCFA`;
}

function getErrorMessage(body: unknown, fallback: string) {
  const parsed = errorResponseSchema.safeParse(body);
  return parsed.success ? parsed.data.error : fallback;
}

function toMonthValue(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 1));
}

function getCategoryAppearance(categoryName: string, index: number) {
  const normalizedName = categoryName.toLocaleLowerCase("fr");
  const semanticIndex = normalizedName.includes("aliment")
    ? 0
    : normalizedName.includes("transport") || normalizedName.includes("carbur")
      ? 1
      : normalizedName.includes("logement") || normalizedName.includes("loyer")
        ? 2
        : normalizedName.includes("loisir") || normalizedName.includes("sortie")
          ? 4
          : normalizedName.includes("santé") || normalizedName.includes("sante")
            ? 5
            : index % categoryIcons.length;

  return {
    Icon: categoryIcons[semanticIndex],
    colors: categoryColors[semanticIndex],
  };
}

function BudgetForm({
  budget,
  categories,
  selectedMonth,
  selectedYear,
  onClose,
  onSave,
}: {
  budget: Budget | null;
  categories: Category[];
  selectedMonth: number;
  selectedYear: number;
  onClose: () => void;
  onSave: (values: BudgetFormValues, budgetId: string | null) => Promise<void>;
}) {
  const [categoryId, setCategoryId] = useState(budget?.categoryId ?? "");
  const [limitAmount, setLimitAmount] = useState(
    budget ? String(budget.limit) : ""
  );
  const [month, setMonth] = useState(budget?.month ?? selectedMonth);
  const [year, setYear] = useState(budget?.year ?? selectedYear);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      await onSave(
        {
          categoryId,
          limitAmount,
          month,
          year,
        },
        budget?.id ?? null
      );
    } catch (saveError) {
      await Swal.fire({
        icon: "error",
        title: "Enregistrement impossible",
        text:
          saveError instanceof Error
            ? saveError.message
            : "Impossible d’enregistrer le budget.",
        confirmButtonColor: "#14213D",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14213D]/50 p-4">
      <section
        aria-labelledby="budget-form-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
        role="dialog"
      >
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-xl font-bold text-[#14213D]"
              id="budget-form-title"
            >
              {budget ? "Modifier le budget" : "Créer un budget"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Définissez une limite pour une catégorie de dépenses.
            </p>
          </div>
          <button
            aria-label="Fermer"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label
            className="block text-sm font-medium text-[#14213D]"
            htmlFor="budget-category"
          >
            Catégorie
            <select
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none transition focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/15"
              id="budget-category"
              onChange={(event) => setCategoryId(event.target.value)}
              required
              value={categoryId}
            >
              <option value="">Choisir une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label
            className="block text-sm font-medium text-[#14213D]"
            htmlFor="budget-limit"
          >
            Montant du budget (FCFA)
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none transition focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/15"
              id="budget-limit"
              min="1"
              onChange={(event) => setLimitAmount(event.target.value)}
              placeholder="Ex. 150000"
              required
              step="1"
              type="number"
              value={limitAmount}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label
              className="block text-sm font-medium text-[#14213D]"
              htmlFor="budget-month"
            >
              Mois
              <select
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none transition focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/15"
                id="budget-month"
                onChange={(event) => setMonth(Number(event.target.value))}
                value={month}
              >
                {Array.from({ length: 12 }, (_, index) => {
                  const monthNumber = index + 1;
                  const label = new Intl.DateTimeFormat("fr-FR", {
                    month: "long",
                    timeZone: "UTC",
                  }).format(new Date(Date.UTC(2025, index, 1)));

                  return (
                    <option key={monthNumber} value={monthNumber}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </label>
            <label
              className="block text-sm font-medium text-[#14213D]"
              htmlFor="budget-year"
            >
              Année
              <input
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none transition focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/15"
                id="budget-year"
                max="2100"
                min="2020"
                onChange={(event) => setYear(Number(event.target.value))}
                required
                type="number"
                value={year}
              />
            </label>
          </div>

          <footer className="flex justify-end gap-3 pt-2">
            <button
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              onClick={onClose}
              type="button"
            >
              Annuler
            </button>
            <button
              className="rounded-lg bg-[#14213D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d3155] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
              type="submit"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function BudgetCard({
  budget,
  index,
  onEdit,
  onDelete,
}: {
  budget: Budget;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { Icon, colors } = getCategoryAppearance(budget.category.name, index);
  const percent = Math.max(0, Math.round(budget.percentage));
  const exceeded = budget.remaining < 0;
  const fullyConsumed = budget.remaining === 0;
  const warning = !exceeded && !fullyConsumed && budget.percentage >= 80;
  const barColor = exceeded || fullyConsumed
    ? "bg-[#E85D5D]"
    : warning
      ? "bg-orange-500"
      : colors.bar;

  return (
    <article className="relative min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}
          >
            <Icon aria-hidden="true" size={20} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-[#14213D]">
              {budget.category.name}
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-400">Budget mensuel</p>
          </div>
        </div>

        <div className="relative">
          <button
            aria-expanded={menuOpen}
            aria-label={`Actions pour le budget ${budget.category.name}`}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#14213D]"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <MoreHorizontal aria-hidden="true" size={20} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
                type="button"
              >
                <Pencil aria-hidden="true" size={15} />
                Modifier
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#E85D5D] hover:bg-rose-50"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                type="button"
              >
                <Trash2 aria-hidden="true" size={15} />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="mt-5 flex items-end justify-between gap-4 text-xs">
        <div>
          <p className="text-[10px] text-slate-400">Dépensé</p>
          <p className="mt-1 font-semibold text-[#14213D]">
            {formatCurrency(budget.spent)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400">Budget</p>
          <p className="mt-1 font-semibold text-[#14213D]">
            {formatCurrency(budget.limit)}
          </p>
        </div>
      </div>

      <div
        aria-label={`${percent}% du budget ${budget.category.name} utilisé`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.min(percent, 100)}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
      >
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 text-[11px]">
        <p className={budget.remaining < 0 ? "font-medium text-[#E85D5D]" : "text-[#16A36A]"}>
          {formatCurrency(Math.max(0, budget.remaining))} restant
        </p>
        <p
          className={`font-semibold ${
            exceeded || fullyConsumed
              ? "text-[#E85D5D]"
              : warning
                ? "text-orange-500"
                : "text-[#16A36A]"
          }`}
        >
          {percent}%
        </p>
      </div>

      {(warning || exceeded || fullyConsumed) && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-[11px] ${
            exceeded || fullyConsumed
              ? "bg-rose-50 text-[#E85D5D]"
              : "bg-orange-50 text-orange-600"
          }`}
        >
          <AlertCircle aria-hidden="true" className="shrink-0" size={15} />
          <span>
            {exceeded
              ? `Budget dépassé de ${formatCurrency(Math.abs(budget.remaining))}`
              : fullyConsumed
                ? "Budget entièrement consommé : 100 % atteint"
                : "Attention, plus de 80 % du budget utilisé"}
          </span>
        </div>
      )}
    </article>
  );
}

export default function BudgetsPage() {
  const [month, setMonth] = useState(new Date().getUTCMonth() + 1);
  const [year, setYear] = useState(new Date().getUTCFullYear());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const fetchBudgets = useCallback(async () => {
    const response = await fetch(`/api/budgets?year=${year}&month=${month}`, {
      cache: "no-store",
    });
    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        getErrorMessage(body, "Impossible de charger les budgets.")
      );
    }

    const parsed = budgetsResponseSchema.safeParse(body);
    if (!parsed.success) {
      throw new Error("La réponse des budgets est invalide.");
    }
    return parsed.data.budgets;
  }, [month, year]);

  const fetchCategories = useCallback(async () => {
    const response = await fetch("/api/categories", { cache: "no-store" });
    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        getErrorMessage(body, "Impossible de charger les catégories.")
      );
    }

    const parsed = categoriesResponseSchema.safeParse(body);
    if (!parsed.success) {
      throw new Error("La réponse des catégories est invalide.");
    }
    return parsed.data.categories.filter(
      (category) => category.type === "EXPENSE"
    );
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([fetchBudgets(), fetchCategories()])
      .then(([budgetItems, categoryItems]) => {
        if (active) {
          setBudgets(budgetItems);
          setCategories(categoryItems);
          setError(null);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Impossible de charger les budgets."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchBudgets, fetchCategories]);

  const totals = useMemo(
    () =>
      budgets.reduce(
        (result, budget) => ({
          limit: result.limit + budget.limit,
          spent: result.spent + budget.spent,
        }),
        { limit: 0, spent: 0 }
      ),
    [budgets]
  );
  const remaining = totals.limit - totals.spent;
  const usedPercentage =
    totals.limit > 0 ? (totals.spent / totals.limit) * 100 : 0;
  const monthLabel = monthFormatter.format(toMonthValue(year, month));

  async function changePeriod(direction: -1 | 1) {
    const date = new Date(Date.UTC(year, month - 1 + direction, 1));
    setMonth(date.getUTCMonth() + 1);
    setYear(date.getUTCFullYear());
  }

  async function refreshBudgets() {
    try {
      setBudgets(await fetchBudgets());
      setError(null);
    } catch (loadError) {
      setError(
        `L’opération a peut-être réussi, mais la liste n’a pas pu être actualisée. ${
          loadError instanceof Error
            ? loadError.message
            : "Recharge la page pour vérifier."
        }`
      );
    }
  }

  async function saveBudget(values: BudgetFormValues, budgetId: string | null) {
    const isEditing = budgetId !== null;
    const response = await fetch(
      isEditing ? `/api/budgets/${budgetId}` : "/api/budgets",
      {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          limitAmount: Number(values.limitAmount),
        }),
      }
    );
    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        getErrorMessage(body, "Impossible d’enregistrer le budget.")
      );
    }

    setFormOpen(false);
    setEditingBudget(null);
    await Swal.fire({
      icon: "success",
      title: isEditing ? "Budget modifié" : "Budget créé",
      text: isEditing
        ? "Le budget a été mis à jour."
        : "Le budget a été ajouté pour cette période.",
      confirmButtonColor: "#14213D",
    });
    await refreshBudgets();
  }

  async function deleteBudget(budget: Budget) {
    const confirmation = await Swal.fire({
      title: "Supprimer ce budget ?",
      text: `Le budget « ${budget.category.name} » sera supprimé pour cette période.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#E85D5D",
      cancelButtonColor: "#64748b",
    });
    if (!confirmation.isConfirmed) return;

    try {
      const response = await fetch(`/api/budgets/${budget.id}`, {
        method: "DELETE",
      });
      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(body, "Impossible de supprimer le budget.")
        );
      }

      await Swal.fire({
        icon: "success",
        title: "Budget supprimé",
        confirmButtonColor: "#14213D",
      });
      await refreshBudgets();
    } catch (deleteError) {
      await Swal.fire({
        icon: "error",
        title: "Suppression impossible",
        text:
          deleteError instanceof Error
            ? deleteError.message
            : "Impossible de supprimer le budget.",
        confirmButtonColor: "#14213D",
      });
    }
  }

  return (
    <div className="min-w-0 space-y-4 pb-20 text-[#14213D] sm:pb-4">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center xl:gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Budgets mensuels
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Planifiez vos dépenses et gardez le cap sur vos objectifs.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="flex w-auto shrink-0 items-center rounded-lg border border-slate-200 bg-white shadow-sm">
            <button
              aria-label="Mois précédent"
              className="rounded-l-lg p-3 text-slate-500 transition hover:bg-slate-50 hover:text-[#14213D]"
              onClick={() => void changePeriod(-1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" size={17} />
            </button>
            <label
              className="relative flex size-11 shrink-0 cursor-pointer items-center justify-center text-sm font-medium capitalize lg:w-auto lg:gap-2 lg:px-3"
            >
              <CalendarDays aria-hidden="true" className="text-slate-500" size={17} />
              <input
                aria-label="Période des budgets"
                className="absolute inset-0 z-10 size-full cursor-pointer opacity-0 lg:static lg:z-auto lg:h-auto lg:w-28 lg:opacity-100 lg:outline-none"
                id="budget-period"
                onChange={(event) => {
                  const [selectedYear, selectedMonth] = event.target.value
                    .split("-")
                    .map(Number);
                  setYear(selectedYear);
                  setMonth(selectedMonth);
                }}
                type="month"
                value={`${year}-${String(month).padStart(2, "0")}`}
              />
              <ChevronDown
                aria-hidden="true"
                className="hidden text-slate-400 lg:block"
                size={15}
              />
            </label>
            <button
              aria-label="Mois suivant"
              className="rounded-r-lg p-3 text-slate-500 transition hover:bg-slate-50 hover:text-[#14213D]"
              onClick={() => void changePeriod(1)}
              type="button"
            >
              <ChevronRight aria-hidden="true" size={17} />
            </button>
          </div>
          <button
            className="hidden items-center justify-center gap-2 rounded-lg bg-[#14213D] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d3155] disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
            disabled={categories.length === 0}
            onClick={() => {
              setEditingBudget(null);
              setFormOpen(true);
            }}
            type="button"
          >
            <Plus aria-hidden="true" size={18} />
            Créer un budget
          </button>
        </div>
      </header>

      {error && (
        <div
          aria-live="polite"
          className="flex items-center justify-between gap-3 rounded-lg border border-[#E85D5D]/25 bg-white px-4 py-3 text-sm text-[#9f3434]"
          role="alert"
        >
          {error}
          <button
            className="font-semibold underline"
            onClick={() => window.location.reload()}
            type="button"
          >
            Réessayer
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4" role="status" aria-label="Chargement des budgets">
          <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                className="h-56 animate-pulse rounded-xl bg-slate-200"
                key={index}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <section
            aria-label={`Résumé des budgets pour ${monthLabel}`}
            className="grid grid-cols-2 items-start gap-x-4 gap-y-5 rounded-xl bg-[#14213D] p-4 text-white shadow-sm md:grid-cols-2 md:gap-5 md:p-6 lg:grid-cols-3 xl:grid-cols-[1fr_1fr_1fr_auto]"
          >
            <div className="min-w-0 lg:border-r lg:border-white/10 lg:pr-4 xl:pr-8">
              <p className="text-xs text-slate-400">Budget total</p>
              <p className="mt-2 break-words text-lg font-bold sm:text-2xl">
                {formatCurrency(totals.limit)}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Pour {budgets.length} catégorie{budgets.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="min-w-0 lg:border-r lg:border-white/10 lg:pr-4 xl:pr-8">
              <p className="text-xs text-slate-400">Total dépensé</p>
              <p className="mt-2 break-words text-lg font-bold sm:text-2xl">
                {formatCurrency(totals.spent)}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                {usedPercentage.toLocaleString("fr-FR", {
                  maximumFractionDigits: 1,
                })}
                % du budget
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Montant restant</p>
              <p
                className={`mt-2 break-words text-lg font-bold sm:text-2xl ${
                  remaining < 0 ? "text-[#E85D5D]" : "text-[#16A36A]"
                }`}
              >
                {formatCurrency(remaining)}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                {remaining < 0
                  ? "Dépassement du budget"
                  : `${Math.max(0, 100 - usedPercentage).toLocaleString("fr-FR", {
                      maximumFractionDigits: 1,
                    })}% disponible`}
              </p>
            </div>
            <div className="hidden items-center justify-center xl:flex xl:col-span-1">
              <div
                aria-label={`${Math.round(usedPercentage)}% du budget total utilisé`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={Math.min(Math.max(usedPercentage, 0), 100)}
                className="grid size-20 place-items-center rounded-full"
                role="progressbar"
                style={{
                  background: `conic-gradient(#16A36A ${Math.min(
                    Math.max(usedPercentage, 0),
                    100
                  )}%, #334155 0)`,
                }}
              >
                <span className="grid size-[62px] place-items-center rounded-full bg-[#14213D] text-center text-sm font-bold">
                  {Math.round(usedPercentage)}%
                  <span className="-mt-3 text-[9px] font-normal text-slate-400">
                    utilisé
                  </span>
                </span>
              </div>
            </div>
          </section>

          {budgets.length > 0 ? (
            <section
              aria-label={`Budgets de ${monthLabel}`}
              className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3"
            >
              {budgets.map((budget, index) => (
                <BudgetCard
                  budget={budget}
                  index={index}
                  key={budget.id}
                  onDelete={() => void deleteBudget(budget)}
                  onEdit={() => {
                    setEditingBudget(budget);
                    setFormOpen(true);
                  }}
                />
              ))}
            </section>
          ) : (
            <section className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-[#16A36A]">
                <Wallet aria-hidden="true" size={23} />
              </span>
              <h2 className="mt-4 font-semibold text-[#14213D]">
                Aucun budget pour {monthLabel}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Créez un budget pour suivre vos dépenses par catégorie.
              </p>
              <button
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#14213D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d3155]"
                disabled={categories.length === 0}
                onClick={() => {
                  setEditingBudget(null);
                  setFormOpen(true);
                }}
                type="button"
              >
                <Plus aria-hidden="true" size={17} />
                Créer un budget
              </button>
              {categories.length === 0 && (
                <p className="mt-3 text-xs text-slate-400">
                  Créez d’abord une catégorie de dépenses.
                </p>
              )}
            </section>
          )}
        </>
      )}

      {formOpen && (
        <BudgetForm
          budget={editingBudget}
          categories={categories}
          onClose={() => {
            setFormOpen(false);
            setEditingBudget(null);
          }}
          onSave={saveBudget}
          selectedMonth={month}
          selectedYear={year}
        />
      )}
      {!formOpen && (
        <button
          aria-label="Créer un budget"
          className="fixed bottom-6 right-6 z-30 inline-flex size-14 items-center justify-center rounded-full bg-[#16A36A] text-white shadow-lg shadow-emerald-900/25 transition hover:bg-[#118653] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16A36A] disabled:cursor-not-allowed disabled:opacity-50 sm:hidden"
          disabled={categories.length === 0}
          onClick={() => {
            setEditingBudget(null);
            setFormOpen(true);
          }}
          type="button"
        >
          <Plus aria-hidden="true" size={27} />
        </button>
      )}
    </div>
  );
}
