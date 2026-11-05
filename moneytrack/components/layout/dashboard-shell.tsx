"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Search,
  Tags,
  TriangleAlert,
  TrendingUp,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

const mainLinks = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ReceiptText },
  { label: "Budgets", href: "/budgets", icon: WalletCards },
  { label: "Catégories", href: "/categories", icon: Tags },
  { label: "Statistiques", href: "/statistiques", icon: BarChart3 },
];

type BudgetNotification = {
  id: string;
  categoryName: string;
  percentage: number;
  remaining: number;
};

export default function DashboardShell({
  children,
  userName,
  transactionCount,
}: {
  children: React.ReactNode;
  userName: string;
  transactionCount: number;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [budgetNotifications, setBudgetNotifications] = useState<
    BudgetNotification[]
  >([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileMenuOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileMenuOpen(false);
    };

    desktopQuery.addEventListener("change", closeOnDesktop);
    return () => desktopQuery.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!notificationsOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setNotificationsOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [notificationsOpen]);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  async function loadBudgetNotifications() {
    setNotificationsLoading(true);
    setNotificationsError("");

    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const response = await fetch(`/api/budgets?month=${month}&year=${year}`);
      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Impossible de charger les alertes.";
        throw new Error(message);
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("budgets" in data) ||
        !Array.isArray(data.budgets)
      ) {
        throw new Error("La réponse des alertes est invalide.");
      }

      const alerts = data.budgets.flatMap((budget): BudgetNotification[] => {
        if (
          typeof budget !== "object" ||
          budget === null ||
          !("id" in budget) ||
          typeof budget.id !== "string" ||
          !("category" in budget) ||
          typeof budget.category !== "object" ||
          budget.category === null ||
          !("name" in budget.category) ||
          typeof budget.category.name !== "string" ||
          !("percentage" in budget) ||
          typeof budget.percentage !== "number" ||
          !("remaining" in budget) ||
          typeof budget.remaining !== "number" ||
          budget.percentage < 80
        ) {
          return [];
        }

        return [
          {
            id: budget.id,
            categoryName: budget.category.name,
            percentage: budget.percentage,
            remaining: budget.remaining,
          },
        ];
      });

      setBudgetNotifications(
        alerts.sort((first, second) => second.percentage - first.percentage)
      );
    } catch (error) {
      setNotificationsError(
        error instanceof Error
          ? error.message
          : "Impossible de charger les alertes."
      );
    } finally {
      setNotificationsLoading(false);
    }
  }

  function toggleNotifications() {
    if (notificationsOpen) {
      setNotificationsOpen(false);
      return;
    }

    setNotificationsOpen(true);
    void loadBudgetNotifications();
  }

  const initials =
    userName
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";
  const isBudgetsPage = isActive("/budgets");

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f4f6fa] text-[#14213d] md:flex">
      {mobileMenuOpen && (
        <button
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-[#0b1428]/55 backdrop-blur-[1px] md:hidden"
          onClick={closeMobileMenu}
          type="button"
        />
      )}

      <aside
        aria-label="Navigation principale"
        aria-modal={mobileMenuOpen ? true : undefined}
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[280px] max-w-[85vw] shrink-0 flex-col bg-[#14213d] text-white shadow-2xl transition-transform duration-300 ease-out md:sticky md:top-0 md:z-auto md:h-screen md:w-[240px] md:max-w-none md:translate-x-0 md:shadow-none xl:w-[290px] ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role={mobileMenuOpen ? "dialog" : undefined}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 md:px-7 md:py-6">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-3 text-xl font-bold md:text-2xl"
            onClick={closeMobileMenu}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#16a36d] text-white">
              <TrendingUp aria-hidden="true" size={23} strokeWidth={2.5} />
            </span>
            <span>
              Money<span className="text-[#16a36d]">Track</span>
            </span>
          </Link>
          <button
            aria-label="Fermer le menu"
            className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white md:hidden"
            onClick={closeMobileMenu}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-6 md:px-5 md:pt-7">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">
            Menu principal
          </p>

          <nav className="flex flex-col gap-1.5">
            {mainLinks.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-[#16a36d] font-semibold text-white shadow-lg shadow-emerald-950/20"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                  onClick={closeMobileMenu}
                >
                  <span className="flex items-center gap-3">
                    <Icon aria-hidden="true" size={19} />
                    {item.label}
                  </span>
                  {item.href === "/transactions" && (
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px]">
                      {transactionCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-8">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">
              Mon compte
            </p>

            <Link
              href="/profil"
              aria-current={isActive("/profil") ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                isActive("/profil")
                  ? "bg-[#16a36d] font-semibold text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
              onClick={closeMobileMenu}
            >
              <UserRound aria-hidden="true" size={19} />
              Mon profil
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 p-4 md:p-5">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut aria-hidden="true" size={19} />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 sm:px-5 md:static md:h-[76px] md:gap-4 md:px-4 xl:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-[#14213d] transition hover:bg-slate-50 md:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
              type="button"
            >
              {mobileMenuOpen ? (
                <X aria-hidden="true" size={20} />
              ) : (
                <Menu aria-hidden="true" size={20} />
              )}
            </button>
            <div
              className={`flex min-w-0 max-w-xl flex-1 items-center gap-2 text-slate-400 sm:gap-3 ${
                isBudgetsPage ? "hidden md:flex" : ""
              }`}
            >
              <Search aria-hidden="true" className="shrink-0" size={18} />
              <span className="truncate text-xs sm:text-sm">
                Rechercher une transaction...
              </span>
              <kbd className="ml-auto hidden shrink-0 rounded border border-slate-200 px-2 py-1 text-[10px] md:block">
                ⌘ K
              </kbd>
            </div>
            {isBudgetsPage && (
              <p className="min-w-0 flex-1 truncate text-base font-semibold text-[#14213d] md:hidden">
                Budgets
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <div className="relative">
              <button
                type="button"
                aria-label={`Notifications, ${budgetNotifications.length} alerte${budgetNotifications.length === 1 ? "" : "s"} de budget`}
                aria-expanded={notificationsOpen}
                aria-controls="budget-notifications"
                onClick={toggleNotifications}
                className="relative inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              >
                <Bell aria-hidden="true" size={19} />
                {budgetNotifications.length > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[#E85D5D] px-1 text-[10px] font-semibold leading-5 text-white">
                    {budgetNotifications.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <section
                  id="budget-notifications"
                  aria-label="Notifications de budget"
                  className="absolute right-0 z-50 mt-3 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-slate-200 bg-white text-left text-[#14213d] shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div>
                      <h2 className="text-sm font-semibold">
                        Alertes de budget
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Budgets à partir de 80 % utilisés ce mois-ci
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Fermer les notifications"
                      onClick={() => setNotificationsOpen(false)}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
                    >
                      <X aria-hidden="true" size={16} />
                    </button>
                  </div>

                  {notificationsLoading ? (
                    <p className="px-4 py-6 text-center text-sm text-slate-500">
                      Chargement des alertes...
                    </p>
                  ) : notificationsError ? (
                    <div className="px-4 py-5 text-center">
                      <p role="alert" className="text-sm text-[#E85D5D]">
                        {notificationsError}
                      </p>
                      <button
                        type="button"
                        onClick={() => void loadBudgetNotifications()}
                        className="mt-2 text-sm font-semibold text-[#16865e] hover:underline"
                      >
                        Réessayer
                      </button>
                    </div>
                  ) : budgetNotifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-slate-500">
                      Aucune alerte de budget pour le moment.
                    </p>
                  ) : (
                    <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                      {budgetNotifications.map((notification) => {
                        const exceeded = notification.remaining < 0;
                        const fullyUsed = notification.percentage >= 100;

                        return (
                          <li key={notification.id}>
                            <Link
                              href="/budgets"
                              onClick={() => setNotificationsOpen(false)}
                              className="flex gap-3 px-4 py-3 transition hover:bg-slate-50"
                            >
                              <TriangleAlert
                                aria-hidden="true"
                                className={`mt-0.5 shrink-0 ${
                                  exceeded ? "text-[#E85D5D]" : "text-amber-500"
                                }`}
                                size={18}
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium">
                                  {notification.categoryName}
                                </span>
                                <span className="mt-0.5 block text-xs text-slate-500">
                                  {exceeded
                                    ? `Budget dépassé de ${new Intl.NumberFormat(
                                        "fr-FR",
                                        { maximumFractionDigits: 0 }
                                      ).format(Math.abs(notification.remaining))} FCFA`
                                    : fullyUsed
                                      ? "Budget entièrement consommé"
                                      : "Vous avez utilisé une grande partie du budget"}
                                </span>
                              </span>
                              <span className="ml-auto shrink-0 text-xs font-semibold text-slate-600">
                                {notification.percentage}%
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              )}
            </div>

            <div className="hidden h-9 border-l border-slate-200 sm:block" />

            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e0eee9] text-[11px] font-bold text-[#16865e] sm:size-11 sm:text-xs">
                {initials}
              </span>

              <div className="hidden min-w-0 sm:block">
                <p className="max-w-36 truncate text-sm font-semibold text-[#14213d]">
                  {userName}
                </p>
                <p className="text-[10px] text-slate-400">Compte personnel</p>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px)] min-w-0 flex-1 p-3 sm:p-5 md:min-h-[calc(100vh-76px)] md:p-4 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
