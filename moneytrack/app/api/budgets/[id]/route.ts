import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { getBudgetsWithUsage } from "@/features/budgets/services/budget-service";

const updateBudgetSchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(2020).max(2100).optional(),
    limitAmount: z.number().positive().optional(),
  })
  .refine(
    (data) =>
      data.categoryId !== undefined ||
      data.month !== undefined ||
      data.year !== undefined ||
      data.limitAmount !== undefined,
    { message: "Aucune modification fournie." }
  );

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { userId, response } = await requireAuth();
  if (response) return response;

  try {
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: "Identifiant de budget invalide." },
        { status: 400 }
      );
    }

    const existingBudget = await prisma.budget.findFirst({
      where: { id, userId: userId! },
    });
    if (!existingBudget) {
      return NextResponse.json(
        { error: "Budget introuvable." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateBudgetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const categoryId = data.categoryId ?? existingBudget.categoryId;
    const month = data.month ?? existingBudget.month;
    const year = data.year ?? existingBudget.year;

    if (data.categoryId !== undefined) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
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
    }

    const duplicateBudget = await prisma.budget.findUnique({
      where: {
        userId_categoryId_month_year: {
          userId: userId!,
          categoryId,
          month,
          year,
        },
      },
    });
    if (duplicateBudget && duplicateBudget.id !== id) {
      return NextResponse.json(
        { error: "Un budget existe déjà pour cette catégorie et cette période." },
        { status: 409 }
      );
    }

    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        categoryId,
        month,
        year,
        ...(data.limitAmount !== undefined
          ? { limitAmount: data.limitAmount }
          : {}),
      },
      include: { category: true },
    });
    const [budget] = await getBudgetsWithUsage(userId!, { id: updatedBudget.id });

    return NextResponse.json({ message: "Budget mis à jour.", budget });
  } catch (error) {
    console.error("Erreur modification budget :", error);

    return NextResponse.json(
      { error: "Impossible de modifier le budget." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { userId, response } = await requireAuth();
  if (response) return response;

  try {
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: "Identifiant de budget invalide." },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.findFirst({
      where: { id, userId: userId! },
      select: { id: true },
    });
    if (!budget) {
      return NextResponse.json(
        { error: "Budget introuvable." },
        { status: 404 }
      );
    }

    await prisma.budget.delete({ where: { id } });

    return NextResponse.json({ message: "Budget supprimé." });
  } catch (error) {
    console.error("Erreur suppression budget :", error);

    return NextResponse.json(
      { error: "Impossible de supprimer le budget." },
      { status: 500 }
    );
  }
}
