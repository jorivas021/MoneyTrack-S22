import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import DashboardShell from "@/components/layout/dashboard-shell";

async function AuthenticatedDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <DashboardShell userName={session.user.name || "Utilisateur"}>
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