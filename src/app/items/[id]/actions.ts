"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseAction";

const DELETE_MARKER = "[申请删除]";
const PENDING_MARKER = "[待审核]";

// TODO: 后续可接入审核流程 — 补充图片进入 [待审核] 状态，由管理员审批后再更新
export async function supplementImage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "请先登录后再补充图鉴图片" };

  const itemId = Number(formData.get("itemId"));
  const imageType = formData.get("imageType") as string; // "official" | "real"
  const imageUrl = (formData.get("imageUrl") as string)?.trim();

  if (!imageUrl) return { error: "请上传图片" };
  if (!["official", "real"].includes(imageType)) return { error: "无效的图片类型" };

  const now = new Date().toISOString();

  const updateData: Record<string, unknown> = {};

  if (imageType === "official") {
    updateData.official_image_url = imageUrl;
    updateData.official_image_submitter_id = user.id;
    updateData.official_image_created_at = now;
  } else {
    updateData.real_image_url = imageUrl;
    updateData.real_image_submitter_id = user.id;
    updateData.real_image_created_at = now;
  }

  const { error } = await supabaseAdmin
    .from("items")
    .update(updateData)
    .eq("id", itemId);

  if (error) return { error: `补充图片失败：${error.message}` };

  revalidatePath(`/items/${itemId}`);
  return { success: true };
}

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
