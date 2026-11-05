import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

type BudgetWithCategory = Prisma.BudgetGetPayload<{
  include: { category: true };
}>;

type BudgetUsage = {
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
};

export async function getBudgetsWithUsage(
  userId: string,
  filters: Pick<Prisma.BudgetWhereInput, "id" | "month" | "year"> = {}
) {
  const budgets: BudgetWithCategory[] = await prisma.budget.findMany({
    where: { userId, ...filters },
    include: { category: true },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const budgetPeriods = new Map<string, { year: number; month: number }>();
  for (const budget of budgets) {
    const key = `${budget.year}-${budget.month}`;
    budgetPeriods.set(key, { year: budget.year, month: budget.month });
  }

  const usageByBudget = new Map<string, number>();
  await Promise.all(
    [...budgetPeriods.values()].map(async ({ year, month }) => {
      const categoryIds = budgets
        .filter((budget) => budget.year === year && budget.month === month)
        .map((budget) => budget.categoryId);
      const expenses = await prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId,
          type: "EXPENSE",
          categoryId: { in: categoryIds },
          date: {
            gte: new Date(Date.UTC(year, month - 1, 1)),
            lt: new Date(Date.UTC(year, month, 1)),
          },
        },
        _sum: { amount: true },
      });

      for (const expense of expenses) {
        usageByBudget.set(
          `${year}-${month}-${expense.categoryId}`,
          Number(expense._sum.amount ?? 0)
        );
      }
    })
  );

  return budgets.map((budget) => {
    const limit = Number(budget.limitAmount);
    const spent =
      usageByBudget.get(
        `${budget.year}-${budget.month}-${budget.categoryId}`
      ) ?? 0;
    const usage: BudgetUsage = {
      limit,
      spent,
      remaining: limit - spent,
      percentage: limit > 0 ? Math.round((spent / limit) * 100) : 0,
    };

    return { ...budget, ...usage };
  });
}
