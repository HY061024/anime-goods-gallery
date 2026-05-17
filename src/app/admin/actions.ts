"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticateAdmin, createAdminAccount, removeAdminAccount, getAdminCount } from "@/lib/adminAuth";
import { requireSuperAdmin } from "./auth";

export async function adminLogin(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "请输入邮箱和密码" };
  }

  const admin = await authenticateAdmin(email, password);
  if (!admin) {
    return { error: "邮箱或密码错误" };
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_id", admin.id, {
    httpOnly: true,
    secure: false,
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  cookieStore.set("admin_role", admin.role, {
    httpOnly: true,
    secure: false,
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  redirect("/admin/items/new");
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_id");
  cookieStore.delete("admin_role");
  redirect("/admin");
}

export async function setupSuperAdmin(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const verifyCode = formData.get("verifyCode") as string;

  if (!email || !password) return { error: "请输入邮箱和密码" };
  if (password.length < 6) return { error: "密码至少6位" };

  const correctCode = process.env.ADMIN_CREATE_PASSWORD;
  if (!verifyCode || verifyCode !== correctCode) {
    return { error: "初始化验证码错误" };
  }

  const count = await getAdminCount();
  if (count > 0) return { error: "已存在管理员，无法重复初始化" };

  const result = await createAdminAccount(email, password, "super_admin");
  if (result.error) return result;

  // 创建成功后自动登录
  const admin = await authenticateAdmin(email, password);
  if (admin) {
    const cookieStore = await cookies();
    cookieStore.set("admin_id", admin.id, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    cookieStore.set("admin_role", admin.role, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24,
      path: "/",
    });
  }

  redirect("/admin/items/new");
}

export async function createAdmin(formData: FormData) {
  const actor = await requireSuperAdmin();

  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  const result = await createAdminAccount(email, password, "admin", actor.id);
  return result;
}

export async function removeAdmin(formData: FormData) {
  const actor = await requireSuperAdmin();

  const id = formData.get("id") as string;
  return removeAdminAccount(id, actor.id);
}
