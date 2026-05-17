"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminNotification = {
  id: number;
  item_id: number | null;
  item_title: string;
  is_read: boolean;
  created_at: string;
};

export async function createAdminNotification(itemId: number, itemTitle: string) {
  const { error } = await supabaseAdmin.from("admin_notifications").insert({
    item_id: itemId,
    item_title: itemTitle,
  });
  if (error) console.error("创建管理员通知失败:", error.message);
}

export async function getAdminNotifications(): Promise<AdminNotification[]> {
  const { data } = await supabaseAdmin
    .from("admin_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as AdminNotification[];
}

export async function getUnreadAdminCount(): Promise<number> {
  const { count } = await supabaseAdmin
    .from("admin_notifications")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false);
  return count ?? 0;
}

export async function markAdminNotificationRead(id: number) {
  await supabaseAdmin
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("id", id);
}

export async function markAllAdminNotificationsRead() {
  await supabaseAdmin
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("is_read", false);
}
