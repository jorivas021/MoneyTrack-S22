import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import DashboardShell from "@/components/layout/dashboard-shell";
import { prisma } from "@/lib/prisma";

async function AuthenticatedDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const transactionCount = await prisma.transaction.count({
    where: { userId: session.user.id },
  });

  return (
    <DashboardShell
      transactionCount={transactionCount}
      userName={session.user.name || "Utilisateur"}
    >
      {children}
    </DashboardShell>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f4f6fa] text-[#14233f]">
          Chargement de MoneyTrack...
        </div>
      }
    >
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  );
}