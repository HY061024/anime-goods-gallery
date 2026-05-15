"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// adminLogin 是一个 Server Action，在服务端运行
// 用户输入的密码不会暴露给浏览器
export async function adminLogin(formData: FormData) {
  const password = formData.get("password") as string;

  // 从环境变量读取正确的密码
  const correctPassword = process.env.ADMIN_CREATE_PASSWORD;

  if (!password || password !== correctPassword) {
    // 密码错误，返回错误信息给前端显示
    return { error: "密码错误，请重试" };
  }

  // 密码正确：设置 Cookie 标记已登录
  const cookieStore = await cookies();
  cookieStore.set("admin_token", "true", {
    httpOnly: true,   // 只能被服务端读取，JS 无法访问
    secure: false,    // 本地开发用 HTTP，生产环境应改为 true
    maxAge: 60 * 60 * 24, // 24 小时后过期
    path: "/",
  });

  // 跳转到新增商品页面
  redirect("/admin/items/new");
}
