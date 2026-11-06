
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Saisis ton mot de passe actuel."),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères.").max(72),
  confirmPassword: z.string().min(1, "Confirme ton nouveau mot de passe."),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

export async function PATCH(request: Request) {
  const { userId, response } = await requireAuth();
  if (response) return response;

  const body = await request.json();
  const parsed = passwordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId! },
    select: { passwordHash: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur introuvable." },
      { status: 404 }
    );
  }

  const isValid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash
  );

  if (!isValid) {
    return NextResponse.json(
      { error: "Ton mot de passe actuel est incorrect." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await prisma.user.update({
    where: { id: userId! },
    data: { passwordHash },
  });

  return NextResponse.json({
    message: "Mot de passe modifié avec succès.",
  });
}
