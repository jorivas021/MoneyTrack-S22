import type { Prisma } from "@/generated/prisma/client";

type ExpenseBudgetCheck = {
  userId: string;
  categoryId: string;
  amount: number;
  date: Date;
  excludingTransactionId?: string;
};

export class BudgetLimitExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BudgetLimitExceededError";
  }
}

export async function ensureExpenseWithinBudget(
  transaction: Prisma.TransactionClient,
  expense: ExpenseBudgetCheck
) {
  const year = expense.date.getUTCFullYear();
  const month = expense.date.getUTCMonth() + 1;
  const budget = await transaction.budget.findUnique({
    where: {
      userId_categoryId_month_year: {
        userId: expense.userId,
        categoryId: expense.categoryId,
        month,
        year,
      },
    },
    select: {
      id: true,
      limitAmount: true,
      category: { select: { name: true } },
    },
  });

  if (!budget) return;

  await transaction.$queryRaw`
    SELECT "id" FROM "Budget" WHERE "id" = ${budget.id} FOR UPDATE
  `;

  const spending = await transaction.transaction.aggregate({
    where: {
      userId: expense.userId,
      categoryId: expense.categoryId,
      type: "EXPENSE",
      date: {
        gte: new Date(Date.UTC(year, month - 1, 1)),
        lt: new Date(Date.UTC(year, month, 1)),
      },
      ...(expense.excludingTransactionId
        ? { id: { not: expense.excludingTransactionId } }
        : {}),
    },
    _sum: { amount: true },
  });

  const spentCents = Math.round(Number(spending._sum.amount ?? 0) * 100);
  const limitCents = Math.round(Number(budget.limitAmount) * 100);
  const requestedCents = Math.round(expense.amount * 100);

  if (spentCents + requestedCents <= limitCents) return;

  const remaining = Math.max(0, limitCents - spentCents) / 100;
  const amountLabel = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(remaining);
  const message =
    remaining === 0
      ? `La limite du budget « ${budget.category.name} » est déjà atteinte. Aucune dépense supplémentaire ne peut être enregistrée pour cette période.`
      : `Cette dépense dépasserait le budget « ${budget.category.name} ». Montant restant : ${amountLabel} FCFA.`;

  throw new BudgetLimitExceededError(message);
}
