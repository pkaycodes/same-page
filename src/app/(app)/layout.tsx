import { AppShell } from "@/components/AppShell";
import { requireOnboardedUser } from "@/lib/auth";
import { getPendingIncomingCount, getUnreadTotal } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOnboardedUser();
  const [unreadCount, pendingCount] = await Promise.all([
    getUnreadTotal(user.id),
    getPendingIncomingCount(user.id),
  ]);

  return (
    <AppShell user={user} unreadCount={unreadCount} pendingCount={pendingCount}>
      {children}
    </AppShell>
  );
}
