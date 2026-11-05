import { auth } from "@/auth";
import DashboardPage from "@/features/dashboard/components/dashboard-page";

export default async function Page() {
  const session = await auth();

  return (
    <DashboardPage userName={session?.user?.name || "Utilisateur"} />
  );
}
