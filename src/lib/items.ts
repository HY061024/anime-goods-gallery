import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Item } from "@/data/items";

type SearchItemsParams = {
  q?: string;
  category?: string;
};

export async function searchItems({
  q = "",
  category = "",
}: SearchItemsParams = {}) {
  let query = supabase
    .from("items")
    .select("*")
    .not("description", "ilike", "[待审核]%")
    .not("description", "ilike", "[申请删除]%")
    .order("created_at", { ascending: false });

  const keyword = q.trim();

  if (keyword) {
    query = query.or(
      [
        `title.ilike.%${keyword}%`,
        `work.ilike.%${keyword}%`,
        `character.ilike.%${keyword}%`,
        `category.ilike.%${keyword}%`,
      ].join(",")
    );
  }

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Item[];
}

export async function getItemById(id: string) {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", Number(id))
    .not("description", "ilike", "[待审核]%")
    .not("description", "ilike", "[申请删除]%")
    .single();

  if (error) {
    return null;
  }

  return data as Item;
}

export async function getItemsByUserId(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("items")
    .select("*")
    .eq("submitter_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Item[];
}