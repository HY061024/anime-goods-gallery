"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 验证管理员是否已登录（供 Server Action 和新页面调用）
export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");

  if (!token || token.value !== "true") {
    redirect("/admin");
  }
}
