import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Item } from "@/data/items";

export async function addToCollection(userId: string, itemId: number) {
  const { error } = await supabaseAdmin
    .from("user_collections")
    .upsert({ user_id: userId, item_id: itemId }, { onConflict: "user_id,item_id" });

  if (error) throw new Error(error.message);
}

export async function removeFromCollection(userId: string, itemId: number) {
  const { error } = await supabaseAdmin
    .from("user_collections")
    .delete()
    .eq("user_id", userId)
    .eq("item_id", itemId);

  if (error) throw new Error(error.message);
}

export async function getUserCollection(userId: string): Promise<Item[]> {
  // 先查收藏的商品ID列表
  const { data: refs, error: refError } = await supabaseAdmin
    .from("user_collections")
    .select("item_id")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });

  if (refError || !refs?.length) return [];

  const itemIds = refs.map((r) => r.item_id);

  // 再查商品详情（含私密上传的）
  const { data: items, error } = await supabaseAdmin
    .from("items")
    .select("*")
    .in("id", itemIds);

  if (error) throw new Error(error.message);

  // 按收藏时间排序
  const idOrder = new Map(itemIds.map((id, i) => [id, i]));
  return ((items ?? []) as Item[]).sort(
    (a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0)
  );
}

export async function isInCollection(userId: string, itemId: number): Promise<boolean> {
  const { count, error } = await supabaseAdmin
    .from("user_collections")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("item_id", itemId);

  if (error) return false;
  return (count ?? 0) > 0;
}

export async function getCollectedItemIds(userId: string): Promise<Set<number>> {
  const { data, error } = await supabaseAdmin
    .from("user_collections")
    .select("item_id")
    .eq("user_id", userId);

  if (error || !data) return new Set();
  return new Set(data.map((r) => r.item_id));
}
