
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export async function GET() {
  const { userId, response } = await requireAuth();

  if (response) return response;

  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      OR: [
        { userId: userId! },
        { userId: null },
      ],
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const { userId, response } = await requireAuth();

  if (response) return response;

  try {
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, type } = parsed.data;

    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: userId!,
        type,
        name: { equals: name, mode: "insensitive" },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Cette catégorie existe déjà." },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        userId: userId!,
        name,
        type,
      },
    });

    return NextResponse.json(
      { message: "Catégorie créée avec succès.", category },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur catégorie :", error);

    return NextResponse.json(
      { error: "Impossible de créer la catégorie." },
      { status: 500 }
    );
  }
}
