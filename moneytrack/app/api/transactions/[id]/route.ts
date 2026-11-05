import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

const transactionSchema = z.object({
  categoryId: z.string().uuid(),
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive(),
  date: z.string().date(),
  description: z.string().max(500).optional(),
});

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
        { error: "Identifiant invalide." },
        { status: 400 }
      );
    }

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: userId! },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Transaction introuvable." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = transactionSchema.safeParse(body);

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
        type: data.type,
        OR: [{ userId: userId! }, { userId: null }],
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie invalide ou inaccessible." },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        categoryId: data.categoryId,
        type: data.type,
        amount: data.amount,
        date: new Date(`${data.date}T00:00:00.000Z`),
        description: data.description?.trim() || null,
      },
      include: { category: true },
    });

    return NextResponse.json({
      message: "Transaction modifiée.",
      transaction,
    });
  } catch (error) {
    console.error("Erreur modification transaction :", error);

    return NextResponse.json(
      { error: "Impossible de modifier la transaction." },
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
        { error: "Identifiant invalide." },
        { status: 400 }
      );
    }

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: userId! },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Transaction introuvable." },
        { status: 404 }
      );
    }

    await prisma.transaction.delete({ where: { id } });

    return NextResponse.json({ message: "Transaction supprimée." });
  } catch (error) {
    console.error("Erreur suppression transaction :", error);

    return NextResponse.json(
      { error: "Impossible de supprimer la transaction." },
      { status: 500 }
    );
  }
}