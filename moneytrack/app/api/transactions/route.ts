
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

export async function GET() {
  const { userId, response } = await requireAuth();

  if (response) return response;

  const transactions = await prisma.transaction.findMany({
    where: { userId: userId! },
    include: { category: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ transactions });
}

export async function POST(request: Request) {
  const { userId, response } = await requireAuth();

  if (response) return response;

  try {
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
        OR: [
          { userId: userId! },
          { userId: null },
        ],
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie invalide ou inaccessible." },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: userId!,
        categoryId: data.categoryId,
        type: data.type,
        amount: data.amount,
        date: new Date(`${data.date}T00:00:00.000Z`),
        description: data.description,
      },
      include: { category: true },
    });

    return NextResponse.json(
      { message: "Transaction créée.", transaction },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur transaction :", error);

    return NextResponse.json(
      { error: "Impossible de créer la transaction." },
      { status: 500 }
    );
  }
}
