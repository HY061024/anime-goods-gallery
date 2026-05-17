"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "./auth";
import { createNotification } from "@/lib/notifications";

const PENDING_MARKER = "[待审核]";
const DELETE_MARKER = "[申请删除]";

export async function approveItem(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));

  // 操作前先查提交者信息
  const { data: item } = await supabaseAdmin
    .from("items")
    .select("description, submitter_id, title")
    .eq("id", id)
    .single();

  if (!item) return { error: "商品不存在" };

  const cleanDescription = (item.description ?? "").replace(PENDING_MARKER, "");

  const { error } = await supabaseAdmin
    .from("items")
    .update({ description: cleanDescription })
    .eq("id", id);

  if (error) return { error: `审核失败：${error.message}` };

  // 给提交者发通知
  if (item.submitter_id) {
    await createNotification(item.submitter_id, id, item.title, "submission_approved");
  }

  revalidatePath("/admin/items/review");
  revalidatePath("/");
  revalidatePath("/items");
}

export async function rejectItem(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));

  // 操作前先查提交者信息
  const { data: item } = await supabaseAdmin
    .from("items")
    .select("submitter_id, title")
    .eq("id", id)
    .single();

  if (!item) return { error: "商品不存在" };

  const { error } = await supabaseAdmin
    .from("items")
    .delete()
    .eq("id", id);

  if (error) return { error: `拒绝失败：${error.message}` };

  // 给提交者发通知
  if (item.submitter_id) {
    await createNotification(item.submitter_id, id, item.title, "submission_rejected");
  }

  revalidatePath("/admin/items/review");
}

export async function approveDeleteRequest(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));

  const { data: item } = await supabaseAdmin
    .from("items")
    .select("submitter_id, title")
    .eq("id", id)
    .single();

  if (!item) return { error: "商品不存在" };

  const { error } = await supabaseAdmin
    .from("items")
    .delete()
    .eq("id", id);

  if (error) return { error: `删除失败：${error.message}` };

  // 给申请者发通知
  if (item.submitter_id) {
    await createNotification(item.submitter_id, id, item.title, "delete_approved");
  }

  revalidatePath("/admin/items/review");
  revalidatePath("/");
  revalidatePath("/items");
}

export async function rejectDeleteRequest(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));

  const { data: item } = await supabaseAdmin
    .from("items")
    .select("description, submitter_id, title")
    .eq("id", id)
    .single();

  if (!item) return { error: "商品不存在" };

  const restored = (item.description ?? "").replace(DELETE_MARKER, "");

  const { error } = await supabaseAdmin
    .from("items")
    .update({ description: restored })
    .eq("id", id);

  if (error) return { error: `恢复失败：${error.message}` };

  // 给申请者发通知
  if (item.submitter_id) {
    await createNotification(item.submitter_id, id, item.title, "delete_rejected");
  }

  revalidatePath("/admin/items/review");
  revalidatePath("/");
  revalidatePath("/items");
}
