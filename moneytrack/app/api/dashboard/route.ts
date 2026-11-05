
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function GET() {
  const { userId, response } = await requireAuth();

  if (response) return response;

  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();
  const nextMonthStart = new Date(Date.UTC(year, month, 1));
  const chartStartDate = new Date(Date.UTC(year, month - 6, 1));

  const [transactions, recentTransactions, budgets, chartTransactions] =
    await Promise.all([
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

      prisma.transaction.findMany({
        where: {
          userId: userId!,
          date: {
            gte: chartStartDate,
            lt: nextMonthStart,
          },
        },
        select: {
          type: true,
          amount: true,
          date: true,
          categoryId: true,
          category: { select: { name: true } },
        },
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

  const monthlyData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      Date.UTC(
        chartStartDate.getUTCFullYear(),
        chartStartDate.getUTCMonth() + index,
        1
      )
    );

    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      income: 0,
      expense: 0,
    };
  });
  const monthIndexes = new Map(
    monthlyData.map((item, index) => [`${item.year}-${item.month}`, index])
  );
  const expensesByCategory = new Map<
    string,
    { categoryId: string; category: string; amount: number }
  >();
  let monthlyIncome = 0;
  let monthlyExpense = 0;

  for (const transaction of chartTransactions) {
    const amount = Number(transaction.amount);
    const transactionDate = new Date(transaction.date);
    const transactionYear = transactionDate.getUTCFullYear();
    const transactionMonth = transactionDate.getUTCMonth() + 1;
    const monthIndex = monthIndexes.get(`${transactionYear}-${transactionMonth}`);

    if (monthIndex === undefined) continue;

    const monthData = monthlyData[monthIndex];

    if (transaction.type === "INCOME") {
      monthData.income += amount;
      if (transactionYear === year && transactionMonth === month) {
        monthlyIncome += amount;
      }
      continue;
    }

    monthData.expense += amount;
    if (transactionYear === year && transactionMonth === month) {
      monthlyExpense += amount;
      const currentCategory = expensesByCategory.get(transaction.categoryId);
      expensesByCategory.set(transaction.categoryId, {
        categoryId: transaction.categoryId,
        category: transaction.category.name,
        amount: (currentCategory?.amount ?? 0) + amount,
      });
    }
  }

  const totalBudget = budgets.reduce(
    (sum, budget) => sum + Number(budget.limitAmount),
    0
  );
  const spentByCategory = new Map(
    [...expensesByCategory].map(([categoryId, item]) => [categoryId, item.amount])
  );
  const budgetDetails = budgets.map((budget) => {
    const spent = spentByCategory.get(budget.categoryId) ?? 0;
    const limit = Number(budget.limitAmount);

    return {
      id: budget.id,
      category: budget.category.name,
      limit,
      spent,
      remaining: limit - spent,
      percentage: limit > 0 ? Math.round((spent / limit) * 100) : 0,
    };
  });
  const totalBudgetSpent = budgetDetails.reduce(
    (sum, budget) => sum + budget.spent,
    0
  );

  return NextResponse.json(
    {
      summary: {
        income,
        expense,
        balance: income - expense,
      },
      currentMonth: { year, month },
      monthlySummary: {
        income: monthlyIncome,
        expense: monthlyExpense,
        balance: monthlyIncome - monthlyExpense,
      },
      budgetSummary: {
        limit: totalBudget,
        spent: totalBudgetSpent,
        remaining: totalBudget - totalBudgetSpent,
        percentage:
          totalBudget > 0
            ? Math.round((totalBudgetSpent / totalBudget) * 100)
            : 0,
      },
      monthlyData,
      expensesByCategory: [...expensesByCategory.values()]
        .map((item) => ({
          ...item,
          percentage:
            monthlyExpense > 0
              ? Math.round((item.amount / monthlyExpense) * 100)
              : 0,
        }))
        .sort((first, second) => second.amount - first.amount),
      recentTransactions,
      budgets: budgetDetails,
    },
    {
      headers: { "Cache-Control": "private, no-store" },
    }
  );
}
