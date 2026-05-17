import { requireAdmin } from "../auth";
import AdminNav from "./AdminNav";
import { getUnreadAdminCount } from "@/lib/adminNotifications";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  const unreadCount = await getUnreadAdminCount();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <AdminNav role={admin.role} unreadCount={unreadCount} />

      {children}
    </div>
  );
}
