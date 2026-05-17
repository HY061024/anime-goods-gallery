import { requireAdmin } from "../../auth";
import { getAdminNotifications, getUnreadAdminCount } from "@/lib/adminNotifications";
import NotificationList from "./NotificationList";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  await requireAdmin();
  const notifications = await getAdminNotifications();
  const unreadCount = await getUnreadAdminCount();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">管理员通知</h1>
      <p className="mb-6 text-sm text-gray-500">
        用户投稿提交时自动通知，共 {unreadCount} 条未读
      </p>

      <NotificationList notifications={notifications} />
    </div>
  );
}
