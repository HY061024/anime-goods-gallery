import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { NotificationType } from "@/lib/notifications";

export async function sendFriendNotification(
  userId: string,
  type: "friend_request" | "friend_accepted",
  fromName: string
) {
  const message =
    type === "friend_request"
      ? `「${fromName}」向你发送了好友请求`
      : `「${fromName}」已接受你的好友请求`;

  // 直接插入 notifications 表（复用现有通知系统）
  await supabaseAdmin.from("notifications").insert({
    user_id: userId,
    item_id: null,
    item_title: "",
    type: type === "friend_request" ? "friend_request" : "friend_accepted",
    message,
    is_read: false,
  });
}
