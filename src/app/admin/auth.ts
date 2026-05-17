"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminById } from "@/lib/adminAuth";
import type { AdminRole } from "@/lib/adminAuth";

export async function requireAdmin(): Promise<{
  id: string;
  email: string;
  role: AdminRole;
}> {
  const cookieStore = await cookies();
  const idCookie = cookieStore.get("admin_id");
  if (!idCookie?.value) redirect("/admin");

  const admin = await getAdminById(idCookie.value);
  if (!admin) redirect("/admin");

  return admin;
}

export async function requireSuperAdmin() {
  const admin = await requireAdmin();
  if (admin.role !== "super_admin") {
    redirect("/admin/items/new");
  }
  return admin;
}
