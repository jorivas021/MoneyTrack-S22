
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function GET(request: Request) {
  const { userId, response } = await requireAuth();

  if (response) return response;

  const { searchParams } = new URL(request.url);
  const currentDate = new Date();

  const year = Number(searchParams.get("year") || currentDate.getFullYear());

  if (!Number.isInteger(year) || year < 2020 || year > 2100) {
    return NextResponse.json(
      { error: "Année invalide." },
      { status: 400 }
    );
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: userId!,
      date: {
        gte: new Date(Date.UTC(year, 0, 1)),
        lt: new Date(Date.UTC(year + 1, 0, 1)),
      },
    },
    include: { category: true },
    orderBy: { date: "asc" },
  });

  let income = 0;
  let expense = 0;

  const monthlyData = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    income: 0,
    expense: 0,
  }));

  const expensesByCategory: Record<string, number> = {};

  for (const transaction of transactions) {
    const amount = Number(transaction.amount);
    const month = new Date(transaction.date).getUTCMonth();

    if (transaction.type === "INCOME") {
      income += amount;
      monthlyData[month].income += amount;
    } else {
      expense += amount;
      monthlyData[month].expense += amount;

      const categoryName = transaction.category.name;
      expensesByCategory[categoryName] =
        (expensesByCategory[categoryName] || 0) + amount;
    }
  }

  return NextResponse.json({
    year,
    summary: {
      income,
      expense,
      balance: income - expense,
    },
    monthlyData,
    expensesByCategory: Object.entries(expensesByCategory).map(
      ([category, amount]) => ({ category, amount })
    ),
  });
}
