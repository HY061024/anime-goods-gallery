import { supabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";

const SALT_LEN = 32;
const KEY_LEN = 64;

export type AdminRole = "super_admin" | "admin";

export type Admin = {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
  created_by: string | null;
};

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LEN).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LEN).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const computed = crypto.scryptSync(password, salt, KEY_LEN).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}

export async function getAdminById(id: string): Promise<Admin | null> {
  const { data } = await supabaseAdmin
    .from("admins")
    .select("*")
    .eq("id", id)
    .single();
  return data as Admin | null;
}

export async function getAdminByEmail(email: string) {
  const { data } = await supabaseAdmin
    .from("admins")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .single();
  return data as (Admin & { password_hash: string }) | null;
}

export async function authenticateAdmin(email: string, password: string) {
  const admin = await getAdminByEmail(email);
  if (!admin) return null;
  if (!verifyPassword(password, admin.password_hash)) return null;
  const { password_hash: _, ...safe } = admin;
  return safe as Admin;
}

export async function getAllAdmins(): Promise<Admin[]> {
  const { data } = await supabaseAdmin
    .from("admins")
    .select("id, email, role, created_at, created_by")
    .order("created_at", { ascending: true });
  return (data ?? []) as Admin[];
}

export async function getAdminCount(): Promise<number> {
  const { count } = await supabaseAdmin
    .from("admins")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function createAdminAccount(
  email: string,
  password: string,
  role: AdminRole = "admin",
  createdBy?: string
): Promise<{ error?: string }> {
  const normalized = email.toLowerCase().trim();
  if (!normalized || !password) return { error: "邮箱和密码不能为空" };
  if (password.length < 6) return { error: "密码至少6位" };

  const { data: existing } = await supabaseAdmin
    .from("admins")
    .select("id")
    .eq("email", normalized)
    .single();

  if (existing) return { error: "该邮箱已是管理员" };

  const { error } = await supabaseAdmin.from("admins").insert({
    email: normalized,
    password_hash: hashPassword(password),
    role,
    created_by: createdBy ?? null,
  });

  if (error) return { error: `创建失败：${error.message}` };
  return {};
}

export async function removeAdminAccount(
  id: string,
  actorId: string
): Promise<{ error?: string }> {
  if (id === actorId) return { error: "不能删除自己" };

  const admin = await getAdminById(id);
  if (!admin) return { error: "管理员不存在" };
  if (admin.role === "super_admin") return { error: "不能删除超级管理员" };

  const { error } = await supabaseAdmin.from("admins").delete().eq("id", id);
  if (error) return { error: `删除失败：${error.message}` };
  return {};
}
