
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères.").max(80),
});

export async function GET() {
  const { userId, response } = await requireAuth();
  if (response) return response;

  const user = await prisma.user.findUnique({
    where: { id: userId! },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur introuvable." },
      { status: 404 }
    );
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const { userId, response } = await requireAuth();
  if (response) return response;

  const body = await request.json();
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: userId! },
    data: { name: parsed.data.name },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    message: "Profil mis à jour.",
    user,
  });
}
