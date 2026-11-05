
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function GET(request: Request) {
  const { userId, response } = await requireAuth();

  if (response) return response;

  const { searchParams } = new URL(request.url);
  const currentDate = new Date();
  const periodParam = searchParams.get("period");
  const period = periodParam === null ? null : Number(periodParam);

  if (period !== null && period !== 6 && period !== 12) {
    return NextResponse.json(
      { error: "La période doit être de 6 ou 12 mois." },
      { status: 400 }
    );
  }

  const requestedYear = Number(
    searchParams.get("year") || currentDate.getUTCFullYear()
  );

  if (
    period === null &&
    (!Number.isInteger(requestedYear) || requestedYear < 2020 || requestedYear > 2100)
  ) {
    return NextResponse.json(
      { error: "Année invalide." },
      { status: 400 }
    );
  }

  const startDate =
    period === null
      ? new Date(Date.UTC(requestedYear, 0, 1))
      : new Date(
          Date.UTC(
            currentDate.getUTCFullYear(),
            currentDate.getUTCMonth() - period + 1,
            1
          )
        );
  const endDate =
    period === null
      ? new Date(Date.UTC(requestedYear + 1, 0, 1))
      : new Date(
          Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 1)
        );
  const monthlyData = Array.from({ length: period ?? 12 }, (_, index) => {
    const date = new Date(
      Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + index, 1)
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

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: userId!,
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    include: { category: true },
    orderBy: { date: "asc" },
  });

  let income = 0;
  let expense = 0;

  const expensesByCategory = new Map<string, { category: string; amount: number }>();

  for (const transaction of transactions) {
    const amount = Number(transaction.amount);
    const transactionDate = new Date(transaction.date);
    const monthIndex = monthIndexes.get(
      `${transactionDate.getUTCFullYear()}-${transactionDate.getUTCMonth() + 1}`
    );

    if (monthIndex === undefined) continue;

    if (transaction.type === "INCOME") {
      income += amount;
      monthlyData[monthIndex].income += amount;
    } else {
      expense += amount;
      monthlyData[monthIndex].expense += amount;

      const currentCategory = expensesByCategory.get(transaction.categoryId);
      expensesByCategory.set(transaction.categoryId, {
        category: transaction.category.name,
        amount: (currentCategory?.amount ?? 0) + amount,
      });
    }
  }

  return NextResponse.json({
    year: period === null ? requestedYear : currentDate.getUTCFullYear(),
    period,
    summary: {
      income,
      expense,
      balance: income - expense,
    },
    monthlyData,
    expensesByCategory: [...expensesByCategory.values()].sort(
      (first, second) => second.amount - first.amount
    ),
  });
}
