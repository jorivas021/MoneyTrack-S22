
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
};

type Transaction = {
  id: string;
  categoryId: string;
  type: "INCOME" | "EXPENSE";
  amount: number | string;
  date: string;
  description: string | null;
  category: Category;
};

type TransactionForm = {
  type: "EXPENSE" | "INCOME";
  amount: string;
  description: string;
  categoryId: string;
  date: string;
};

function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const emptyForm: TransactionForm = {
  type: "EXPENSE",
  amount: "",
  description: "",
  categoryId: "",
  date: getLocalDate(),
};

const money = (value: number) =>
  `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value)} FCFA`;

const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TransactionForm>(emptyForm);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [transactionsResponse, categoriesResponse] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/categories"),
      ]);

      if (!transactionsResponse.ok || !categoriesResponse.ok) {
        throw new Error("Impossible de charger les données.");
      }

      const transactionsData = await transactionsResponse.json();
      const categoriesData = await categoriesResponse.json();

      setTransactions(transactionsData.transactions ?? []);
      setCategories(categoriesData.categories ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentMonth = getLocalDate().slice(0, 7);

  const monthlyTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          new Date(transaction.date).toISOString().slice(0, 7) === currentMonth
      ),
    [transactions, currentMonth]
  );

  const income = monthlyTransactions
    .filter((item) => item.type === "INCOME")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenses = monthlyTransactions
    .filter((item) => item.type === "EXPENSE")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionMonth = new Date(transaction.date)
        .toISOString()
        .slice(0, 7);

      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        (transaction.description ?? "").toLowerCase().includes(searchValue) ||
        transaction.category.name.toLowerCase().includes(searchValue);

      const matchesMonth = month === "all" || transactionMonth === month;

      const matchesCategory =
        categoryFilter === "all" ||
        transaction.categoryId === categoryFilter;

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      return (
        matchesSearch &&
        matchesMonth &&
        matchesCategory &&
        matchesType
      );
    });
  }, [transactions, search, month, categoryFilter, typeFilter]);

  const months = useMemo(
    () =>
      Array.from(
        new Set(
          transactions.map((item) =>
            new Date(item.date).toISOString().slice(0, 7)
          )
        )
      ).sort((a, b) => b.localeCompare(a)),
    [transactions]
  );

  function openCreateModal() {
    setEditingId(null);
    setForm({ ...emptyForm, date: getLocalDate() });
    setError("");
    setModalOpen(true);
  }

  function openEditModal(transaction: Transaction) {
    setEditingId(transaction.id);
    setForm({
      type: transaction.type,
      amount: String(transaction.amount),
      description: transaction.description ?? "",
      categoryId: transaction.categoryId,
      date: new Date(transaction.date).toISOString().slice(0, 10),
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.categoryId) {
      setError("Sélectionne une catégorie.");
      return;
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Saisis un montant supérieur à zéro.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        editingId ? `/api/transactions/${editingId}` : "/api/transactions",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            amount,
            description: form.description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Enregistrement impossible.");
      }

      setModalOpen(false);
      await loadData();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette transaction ?"
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Suppression impossible.");
      }

      await loadData();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    }
  }

  const availableCategories = categories.filter(
    (category) => category.type === form.type
  );

  return (
    <div className="mx-auto flex min-h-[calc(100vh-116px)] w-full max-w-[1450px] flex-col gap-5 md:min-h-[calc(100vh-140px)]">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#14213d] sm:text-3xl">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Consultez et gérez vos mouvements financiers.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#14213d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20365d]"
        >
          <span className="text-lg">＋</span>
          Ajouter une transaction
        </button>
      </div>

      {error && !modalOpen && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Indicateurs financiers */}
      <section className="grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-3">
        <div className="flex items-center gap-3 border-b border-slate-100 p-4 sm:border-b-0 sm:border-r">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-lg text-emerald-600">
            ↘
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Revenus ce mois</p>
            <p className="mt-1 truncate text-base font-bold text-[#14213d] sm:text-lg">
              {money(income)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-slate-100 p-4 sm:border-b-0 sm:border-r">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-lg text-red-500">
            ↗
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Dépenses ce mois</p>
            <p className="mt-1 truncate text-base font-bold text-[#14213d] sm:text-lg">
              {money(expenses)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg text-[#14213d]">
            ▤
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Solde net</p>
            <p className="mt-1 truncate text-base font-bold text-[#14213d] sm:text-lg">
              {money(income - expenses)}
            </p>
          </div>
        </div>
      </section>

      {/* Liste et filtres */}
      <section className="flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid gap-3 border-b border-slate-200 p-4 lg:grid-cols-[minmax(200px,1fr)_170px_190px_150px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="⌕  Rechercher une transaction..."
            aria-label="Rechercher une transaction"
            className="min-w-0 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500"
          />

          <select
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            aria-label="Filtrer par période"
            className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-emerald-500"
          >
            <option value="all">Toutes les périodes</option>
            {months.map((item) => (
              <option key={item} value={item}>
                {new Intl.DateTimeFormat("fr-FR", {
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(new Date(`${item}-01T00:00:00.000Z`))}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Filtrer par catégorie"
            className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-emerald-500"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            aria-label="Filtrer par type"
            className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-emerald-500"
          >
            <option value="all">Tous les types</option>
            <option value="INCOME">Revenus</option>
            <option value="EXPENSE">Dépenses</option>
          </select>
        </div>

        <div className="min-h-0 flex-1 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Catégorie</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Montant</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                    Chargement des transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                    Aucune transaction trouvée.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => {
                  const isIncome = transaction.type === "INCOME";

                  return (
                    <tr
                      key={transaction.id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="max-w-[260px] px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base ${
                              isIncome
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-orange-50 text-orange-500"
                            }`}
                          >
                            {isIncome ? "▣" : "⌂"}
                          </span>
                          <span className="truncate text-sm font-semibold text-[#14213d]">
                            {transaction.description || "Sans description"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-sm text-slate-500">
                        {transaction.category.name}
                      </td>

                      <td className="px-5 py-3.5 text-sm text-slate-500">
                        {dateLabel(transaction.date)}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            isIncome
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          {isIncome ? "↘ Revenu" : "↗ Dépense"}
                        </span>
                      </td>

                      <td
                        className={`whitespace-nowrap px-5 py-3.5 text-sm font-bold ${
                          isIncome ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {isIncome ? "+" : "−"}
                        {money(Number(transaction.amount))}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => openEditModal(transaction)}
                            title="Modifier"
                            aria-label="Modifier la transaction"
                            className="text-base text-slate-400 transition hover:text-[#14213d]"
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(transaction.id)}
                            title="Supprimer"
                            aria-label="Supprimer la transaction"
                            className="text-base text-slate-400 transition hover:text-red-500"
                          >
                            ♜
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col justify-between gap-2 border-t border-slate-100 px-5 py-3.5 text-xs text-slate-400 sm:flex-row sm:items-center">
          <span>{filteredTransactions.length} transaction(s) affichée(s)</span>
          <span>Montants exprimés en FCFA</span>
        </div>
      </section>

      {/* Fenêtre d'ajout / modification */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#101d35]/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <div className="my-auto max-h-[calc(100vh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:max-h-[calc(100vh-2.5rem)] sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                  Gestion des mouvements
                </p>
                <h2 className="mt-1.5 text-xl font-semibold text-[#14213d]">
                  {editingId
                    ? "Modifier la transaction"
                    : "Ajouter une transaction"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Renseignez les informations du mouvement.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-2xl leading-none text-slate-400 hover:text-slate-700"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#14213d]">
                  Type de transaction
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, type: "EXPENSE", categoryId: "" })
                    }
                    className={`rounded-lg border p-3 text-left transition ${
                      form.type === "EXPENSE"
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-[#14213d]">
                      ↗ Dépense
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Argent dépensé
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, type: "INCOME", categoryId: "" })
                    }
                    className={`rounded-lg border p-3 text-left transition ${
                      form.type === "INCOME"
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-[#14213d]">
                      ↘ Revenu
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Argent reçu
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#14213d]">
                    Montant (FCFA)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={form.amount}
                    onChange={(event) =>
                      setForm({ ...form, amount: event.target.value })
                    }
                    placeholder="Ex. 25000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#14213d]">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(event) =>
                      setForm({ ...form, date: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#14213d]">
                    Catégorie
                  </label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(event) =>
                      setForm({ ...form, categoryId: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {availableCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  {availableCategories.length === 0 && (
                    <p className="mt-1 text-xs text-orange-600">
                      Aucune catégorie disponible pour ce type.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#14213d]">
                    Description (facultatif)
                  </label>
                  <input
                    type="text"
                    maxLength={500}
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    placeholder="Ex. Courses alimentaires"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#14213d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#20365d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Enregistrement..."
                    : editingId
                      ? "Enregistrer les modifications"
                      : "Enregistrer la transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
