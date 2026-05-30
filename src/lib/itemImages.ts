"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { ItemImage } from "@/data/items";

const TABLE = "item_images";

/** 获取某商品的所有图片，按 sort_order 排序 */
export async function getItemImages(itemId: number): Promise<ItemImage[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("item_id", itemId)
      .order("sort_order", { ascending: true });

    if (error) {
      // 表不存在时静默返回空数组
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return [];
      }
      console.error("getItemImages 出错:", error.message);
      return [];
    }
    return (data ?? []) as ItemImage[];
  } catch {
    return [];
  }
}

/** 获取某商品图片的贡献者列表（去重），带昵称和头像 */
export async function getItemImageSubmitters(
  itemId: number
): Promise<Map<string, { displayName?: string | null; avatarUrl?: string | null }>> {
  const images = await getItemImages(itemId);
  const submitterIds = [...new Set(images.map((img) => img.submitter_id).filter((id): id is string => !!id))];

  const result = new Map<string, { displayName?: string | null; avatarUrl?: string | null }>();

  if (submitterIds.length === 0) return result;

  try {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", submitterIds);

    const profileMap = new Map<string, { displayName?: string | null; avatarUrl?: string | null }>();
    for (const p of profiles ?? []) {
      profileMap.set(p.user_id, { displayName: p.display_name, avatarUrl: p.avatar_url });
    }

    for (const uid of submitterIds) {
      result.set(uid, profileMap.get(uid) ?? {});
    }
  } catch {
    // profiles 表查询失败时返回空显示名
    for (const uid of submitterIds) {
      result.set(uid, {});
    }
  }

  return result;
}

/** 批量插入图片到 item_images 表 */
export async function addItemImages(
  itemId: number,
  images: { image_type: "official" | "real"; image_url: string; submitter_id?: string }[]
): Promise<void> {
  if (images.length === 0) return;

  const rows = images.map((img, i) => ({
    item_id: itemId,
    image_type: img.image_type,
    image_url: img.image_url,
    submitter_id: img.submitter_id || null,
    sort_order: i,
  }));

  try {
    const { error } = await supabaseAdmin.from(TABLE).insert(rows);
    if (error) {
      // 表不存在时静默跳过
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        console.warn("item_images 表尚未创建，跳过多图写入");
        return;
      }
      console.error("addItemImages 出错:", error.message);
    }
  } catch (e) {
    console.error("addItemImages 异常:", e instanceof Error ? e.message : String(e));
  }
}

/** 补充单张图片 */
export async function supplementItemImage(
  itemId: number,
  imageType: "official" | "real",
  imageUrl: string,
  submitterId: string
): Promise<{ error?: string }> {
  try {
    // 获取当前排序号
    const existing = await getItemImages(itemId);
    const sameType = existing.filter((img) => img.image_type === imageType);
    const nextOrder = sameType.length;

    const { error } = await supabaseAdmin.from(TABLE).insert({
      item_id: itemId,
      image_type: imageType,
      image_url: imageUrl,
      submitter_id: submitterId,
      sort_order: nextOrder,
    });

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return { error: "item_images 表尚未创建，请先执行数据库迁移" };
      }
      return { error: `补充图片失败：${error.message}` };
    }
    return {};
  } catch (e) {
    return { error: `补充图片异常：${e instanceof Error ? e.message : String(e)}` };
  }
}
