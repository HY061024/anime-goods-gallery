import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type NotificationType =
  | "submission_approved"
  | "submission_rejected"
  | "delete_approved"
  | "delete_rejected";

export type Notification = {
  id: number;
  user_id: string;
  item_id: number | null;
  item_title: string;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
};

const MESSAGES: Record<NotificationType, (title: string) => string> = {
  submission_approved: (t) => `你的投稿「${t}」已通过审核，已公开展示在图鉴中。`,
  submission_rejected: (t) => `你的投稿「${t}」未通过审核，已被移除。`,
  delete_approved: (t) => `你对「${t}」的删除申请已通过，该周边已从图鉴中移除。`,
  delete_rejected: (t) => `你对「${t}」的删除申请未通过，该周边已恢复展示。`,
};

export async function createNotification(
  userId: string,
  itemId: number,
  itemTitle: string,
  type: NotificationType
) {
  await supabaseAdmin.from("notifications").insert({
    user_id: userId,
    item_id: itemId,
    item_title: itemTitle,
    type,
    message: MESSAGES[type](itemTitle),
  });
}

export async function getNotificationsByUserId(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Notification[];
}

export async function getUnreadNotificationCount(userId: string) {
  const { count, error } = await supabaseAdmin
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) return 0;
  return count ?? 0;
}

export async function markNotificationRead(notificationId: number) {
  await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);
}

export async function markAllNotificationsRead(userId: string) {
  await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);
}
