
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

const updateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => data.name !== undefined || data.isActive !== undefined,
  { message: "Aucune modification fournie." }
);

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { userId, response } = await requireAuth();

  if (response) return response;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const category = await prisma.category.findFirst({
      where: { id, userId: userId! },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie introuvable ou inaccessible." },
        { status: 404 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({
      message: "Catégorie mise à jour.",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Erreur modification catégorie :", error);

    return NextResponse.json(
      { error: "Impossible de modifier la catégorie." },
      { status: 500 }
    );
  }
}
