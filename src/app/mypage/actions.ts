"use server";

import { revalidatePath } from "next/cache";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/notifications";
import { createClient } from "@/lib/supabaseAction";

export async function markRead(notificationId: number) {
  await markNotificationRead(notificationId);
  revalidatePath("/mypage");
}

export async function markAllRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "未登录" };
  await markAllNotificationsRead(user.id);
  revalidatePath("/mypage");
}
