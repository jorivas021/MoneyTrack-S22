
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function GET() {
  const { userId, response } = await requireAuth();

  if (response) return response;

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [transactions, recentTransactions, budgets] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: userId! },
      select: { type: true, amount: true },
    }),

    prisma.transaction.findMany({
      where: { userId: userId! },
      include: { category: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),

    prisma.budget.findMany({
      where: {
        userId: userId!,
        month,
        year,
      },
      include: { category: true },
    }),
  ]);

  let income = 0;
  let expense = 0;

  for (const transaction of transactions) {
    const amount = Number(transaction.amount);

    if (transaction.type === "INCOME") {
      income += amount;
    } else {
      expense += amount;
    }
  }

  const budgetDetails = await Promise.all(
    budgets.map(async (budget) => {
      const result = await prisma.transaction.aggregate({
        where: {
          userId: userId!,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          date: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
        },
        _sum: { amount: true },
      });

      const spent = Number(result._sum.amount || 0);
      const limit = Number(budget.limitAmount);

      return {
        id: budget.id,
        category: budget.category.name,
        limit,
        spent,
        remaining: limit - spent,
        percentage: limit > 0 ? Math.round((spent / limit) * 100) : 0,
      };
    })
  );

  return NextResponse.json({
    summary: {
      income,
      expense,
      balance: income - expense,
    },
    recentTransactions,
    budgets: budgetDetails,
  });
}
