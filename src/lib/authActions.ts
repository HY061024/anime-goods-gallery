"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "请填写邮箱和密码" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/mypage");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!email || !password) {
    return { error: "请填写邮箱和密码" };
  }
  if (password !== confirm) {
    return { error: "两次密码不一致" };
  }
  if (password.length < 6) {
    return { error: "密码至少 6 位" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/mypage");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // 同时清除管理员 Cookie，确保完全退出
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete("admin_id");
  cookieStore.delete("admin_role");

  revalidatePath("/", "layout");
  redirect("/");
}

export async function switchAccount() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete("admin_id");
  cookieStore.delete("admin_role");

  revalidatePath("/", "layout");
  redirect("/auth/login");
}
