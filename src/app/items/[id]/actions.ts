"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const DELETE_MARKER = "[申请删除]";
const PENDING_MARKER = "[待审核]";

export async function requestDeleteItem(formData: FormData) {
  const id = Number(formData.get("id"));

  const { data: item } = await supabaseAdmin
    .from("items")
    .select("description")
    .eq("id", id)
    .single();

  if (!item) return { error: "商品不存在" };

  const desc = item.description ?? "";

  if (desc.startsWith(DELETE_MARKER)) {
    return { error: "该商品已在申请删除中" };
  }
  if (desc.startsWith(PENDING_MARKER)) {
    return { error: "该商品尚未通过审核，无需申请删除" };
  }

  const marked = `${DELETE_MARKER}${desc}`;

  const { error } = await supabaseAdmin
    .from("items")
    .update({ description: marked })
    .eq("id", id);

  if (error) return { error: `申请失败：${error.message}` };

  revalidatePath("/items");
  revalidatePath(`/items/${id}`);
  redirect("/items?deleteRequested=1");
}
