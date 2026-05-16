"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "./auth";

const PENDING_MARKER = "[待审核]";

export async function approveItem(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));

  // Fetch the item to get its current description
  const { data: item } = await supabaseAdmin
    .from("items")
    .select("description")
    .eq("id", id)
    .single();

  if (!item) return { error: "商品不存在" };

  // Remove [待审核] prefix
  const cleanDescription = (item.description ?? "").replace(PENDING_MARKER, "");

  const { error } = await supabaseAdmin
    .from("items")
    .update({ description: cleanDescription })
    .eq("id", id);

  if (error) return { error: `审核失败：${error.message}` };

  revalidatePath("/admin/items/review");
  revalidatePath("/");
  revalidatePath("/items");
}

export async function rejectItem(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));

  const { error } = await supabaseAdmin
    .from("items")
    .delete()
    .eq("id", id);

  if (error) return { error: `拒绝失败：${error.message}` };

  revalidatePath("/admin/items/review");
}
