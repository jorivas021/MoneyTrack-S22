"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { z } from "zod";
import {
  Archive,
  ArrowDownLeft,
  ArrowUpRight,
  FolderPlus,
  Pencil,
  Tag,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["INCOME", "EXPENSE"]),
  userId: z.string().nullable(),
  transactionCount: z.number().int().nonnegative(),
});

const categoriesResponseSchema = z.object({
  categories: z.array(categorySchema),
});

const errorResponseSchema = z.object({ error: z.string() });

type Category = z.infer<typeof categorySchema>;
type CategoryType = Category["type"];

function getErrorMessage(body: unknown, fallback: string) {
  const parsed = errorResponseSchema.safeParse(body);
  return parsed.success ? parsed.data.error : fallback;
}

function CategoryForm({
  category,
  onClose,
  onSave,
}: {
  category: Category | null;
  onClose: () => void;
  onSave: (name: string, type: CategoryType) => Promise<void>;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      await onSave(name.trim(), type);
    } catch (saveError) {
      await Swal.fire({
        icon: "error",
        title: "Enregistrement impossible",
        text:
          saveError instanceof Error
            ? saveError.message
            : "Impossible d’enregistrer la catégorie.",
        confirmButtonColor: "#14213D",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14213D]/45 p-4">
      <section
        aria-labelledby="category-form-title"
        aria-modal="true"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#14213D]" id="category-form-title">
              {category ? "Modifier la catégorie" : "Ajouter une catégorie"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {category
                ? "Mets à jour le nom de ta catégorie."
                : "Choisis un nom et le type de mouvements associé."}
            </p>
          </div>
          <button
            aria-label="Fermer"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A36A]"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-[#14213D]" htmlFor="category-name">
            Nom de la catégorie
            <input
              autoFocus
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none transition focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/15"
              id="category-name"
              maxLength={80}
              minLength={2}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex. Alimentation"
              required
              value={name}
            />
          </label>

          {!category && (
            <label className="block text-sm font-medium text-[#14213D]" htmlFor="category-type">
              Type
              <select
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none transition focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/15"
                id="category-type"
                onChange={(event) =>
                  setType(event.target.value === "INCOME" ? "INCOME" : "EXPENSE")
                }
                value={type}
              >
                <option value="EXPENSE">Dépense</option>
                <option value="INCOME">Revenu</option>
              </select>
            </label>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              onClick={onClose}
              type="button"
            >
              Annuler
            </button>
            <button
              className="rounded-lg bg-[#14213D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d3155] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
              type="submit"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const fetchCategories = useCallback(async () => {
    const response = await fetch("/api/categories", { cache: "no-store" });
    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(getErrorMessage(body, "Impossible de charger les catégories."));
    }

    const parsed = categoriesResponseSchema.safeParse(body);
    if (!parsed.success) {
      throw new Error("La réponse des catégories est invalide.");
    }

    return parsed.data.categories;
  }, []);

  useEffect(() => {
    let active = true;

    fetchCategories()
      .then((items) => {
        if (active) {
          setCategories(items);
          setError(null);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Impossible de charger les catégories."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchCategories]);

  const refreshCategories = useCallback(async () => {
    const items = await fetchCategories();
    setCategories(items);
    setError(null);
  }, [fetchCategories]);

  const totals = useMemo(
    () => ({
      active: categories.length,
      income: categories.filter((category) => category.type === "INCOME").length,
      expense: categories.filter((category) => category.type === "EXPENSE").length,
    }),
    [categories]
  );

  async function retryLoading() {
    setLoading(true);
    try {
      await refreshCategories();
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger les catégories."
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshAfterMutation() {
    try {
      await refreshCategories();
    } catch (loadError) {
      setError(
        `La modification a réussi, mais la liste n’a pas pu être actualisée. ${
          loadError instanceof Error
            ? loadError.message
            : "Réessaie de recharger la page."
        }`
      );
    }
  }

  async function saveCategory(name: string, type: CategoryType) {
    const editing = editingCategory !== null;
    const response = await fetch(
      editing ? `/api/categories/${editingCategory.id}` : "/api/categories",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { name } : { name, type }),
      }
    );
    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(getErrorMessage(body, "Impossible d’enregistrer la catégorie."));
    }

    setFormOpen(false);
    setEditingCategory(null);
    await Swal.fire({
      icon: "success",
      title: editing ? "Catégorie modifiée" : "Catégorie créée",
      text: editing
        ? "La catégorie a été mise à jour."
        : "La catégorie a été ajoutée à ta liste.",
      confirmButtonColor: "#14213D",
    });
    await refreshAfterMutation();
  }

  async function archiveCategory(category: Category) {
    const confirmation = await Swal.fire({
      title: "Archiver cette catégorie ?",
      text: "Elle ne sera plus proposée pour les nouvelles transactions.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Archiver",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#14213D",
      cancelButtonColor: "#64748b",
    });

    if (!confirmation.isConfirmed) return;

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });
      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(body, "Impossible d’archiver la catégorie."));
      }

      await Swal.fire({
        icon: "success",
        title: "Catégorie archivée",
        confirmButtonColor: "#14213D",
      });
      await refreshAfterMutation();
    } catch (archiveError) {
      await Swal.fire({
        icon: "error",
        title: "Action impossible",
        text:
          archiveError instanceof Error
            ? archiveError.message
            : "Impossible d’archiver la catégorie.",
        confirmButtonColor: "#14213D",
      });
    }
  }

  return (
    <main className="min-h-full bg-[#F5F7FA] px-4 py-6 text-[#14213D] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Catégories</h1>
            <p className="mt-1 text-sm text-slate-500">
              Organiser les transactions par catégories.
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#14213D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d3155] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A36A]"
            onClick={() => {
              setEditingCategory(null);
              setFormOpen(true);
            }}
            type="button"
          >
            <FolderPlus aria-hidden="true" size={18} />
            Ajouter une catégorie
          </button>
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

        <section
          aria-label="Résumé des catégories"
          className="mb-5 grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-3"
        >
          {[
            { label: "catégories actives", value: totals.active },
            { label: "catégories de revenus", value: totals.income },
            { label: "catégories de dépenses", value: totals.expense },
          ].map((item, index) => (
            <div
              className={`px-5 py-5 ${index > 0 ? "border-t border-slate-200 sm:border-l sm:border-t-0" : ""}`}
              key={item.label}
            >
              <p className="text-2xl font-bold">{loading ? "—" : item.value}</p>
              <p className="text-sm text-slate-500">{item.label}</p>
            </div>
          ))}
        </section>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                aria-hidden="true"
                className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white"
                key={index}
              />
            ))}
          </div>
        ) : categories.length === 0 && !error ? (
          <section className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <Tag aria-hidden="true" className="mx-auto text-slate-400" size={28} />
            <h2 className="mt-3 font-semibold">Aucune catégorie active</h2>
            <p className="mt-1 text-sm text-slate-500">
              Ajoute une catégorie pour organiser tes transactions.
            </p>
          </section>
        ) : (
          <section aria-label="Liste des catégories" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => {
              const isIncome = category.type === "INCOME";
              const Icon = isIncome ? ArrowUpRight : ArrowDownLeft;
              const isEditable = category.userId !== null;

              return (
                <article
                  className="flex min-h-32 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  key={category.id}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                        isIncome
                          ? "bg-[#16A36A]/10 text-[#16A36A]"
                          : "bg-[#E85D5D]/10 text-[#E85D5D]"
                      }`}
                    >
                      <Icon aria-hidden="true" size={19} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-semibold">{category.name}</h2>
                      <p className="text-xs text-slate-500">
                        {category.transactionCount}{" "}
                        {category.transactionCount === 1 ? "transaction" : "transactions"}
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          isIncome
                            ? "bg-[#16A36A]/10 text-[#137d53]"
                            : "bg-[#E85D5D]/10 text-[#b23f3f]"
                        }`}
                      >
                        {isIncome ? "Revenu" : "Dépense"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto flex gap-4 border-t border-slate-100 pt-3">
                    {isEditable ? (
                      <>
                        <button
                          className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-[#14213D] focus-visible:outline-2 focus-visible:outline-[#16A36A]"
                          onClick={() => {
                            setEditingCategory(category);
                            setFormOpen(true);
                          }}
                          type="button"
                        >
                          <Pencil aria-hidden="true" size={13} />
                          Modifier
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-[#E85D5D] focus-visible:outline-2 focus-visible:outline-[#16A36A]"
                          onClick={() => archiveCategory(category)}
                          type="button"
                        >
                          <Archive aria-hidden="true" size={13} />
                          Archiver
                        </button>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400">Catégorie par défaut</p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {formOpen && (
        <CategoryForm
          category={editingCategory}
          onClose={() => {
            setFormOpen(false);
            setEditingCategory(null);
          }}
          onSave={saveCategory}
        />
      )}
    </main>
  );
}
