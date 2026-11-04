
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

const budgetSchema = z.object({
  categoryId: z.string().uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  limitAmount: z.number().positive(),
});

export async function GET() {
  const { userId, response } = await requireAuth();

  if (response) return response;

  const budgets = await prisma.budget.findMany({
    where: { userId: userId! },
    include: { category: true },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return NextResponse.json({ budgets });
}

export async function POST(request: Request) {
  const { userId, response } = await requireAuth();

  if (response) return response;

  try {
    const body = await request.json();
    const parsed = budgetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        isActive: true,
        type: "EXPENSE",
        OR: [{ userId: userId! }, { userId: null }],
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "La catégorie de dépenses est invalide ou inaccessible." },
        { status: 400 }
      );
    }

    const existingBudget = await prisma.budget.findUnique({
      where: {
        userId_categoryId_month_year: {
          userId: userId!,
          categoryId: data.categoryId,
          month: data.month,
          year: data.year,
        },
      },
    });

    if (existingBudget) {
      return NextResponse.json(
        { error: "Un budget existe déjà pour cette catégorie et cette période." },
        { status: 409 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        userId: userId!,
        categoryId: data.categoryId,
        month: data.month,
        year: data.year,
        limitAmount: data.limitAmount,
      },
      include: { category: true },
    });

    return NextResponse.json(
      { message: "Budget créé avec succès.", budget },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur budget :", error);

    return NextResponse.json(
      { error: "Impossible de créer le budget." },
      { status: 500 }
    );
  }
}
