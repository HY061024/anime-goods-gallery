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

/** 获取多位用户的痛柜预览（前 N 件商品），用于痛柜广场卡片 */
export async function getCabinetPreviewItems(
  userIds: string[],
  limit = 3
): Promise<Map<string, Item[]>> {
  const result = new Map<string, Item[]>();
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return result;

  // 并行获取每位用户的私有上传 + 收藏
  const rows = await Promise.all(
    unique.map(async (userId) => {
      const [privates, collected] = await Promise.all([
        supabaseAdmin
          .from("items")
          .select("*")
          .eq("submitter_id", userId)
          .eq("visibility", "private")
          .order("created_at", { ascending: false })
          .limit(limit),
        getUserCollection(userId),
      ]);
      // 合并：优先最近上传的
      const all = [...(privates.data ?? []), ...collected] as Item[];
      const seen = new Set<number>();
      const deduped: Item[] = [];
      for (const it of all) {
        if (!seen.has(it.id)) { seen.add(it.id); deduped.push(it); }
        if (deduped.length >= limit) break;
      }
      return { userId, items: deduped };
    })
  );

  for (const { userId, items } of rows) {
    result.set(userId, items);
  }
  return result;
}
