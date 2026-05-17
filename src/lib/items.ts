import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Item } from "@/data/items";

type SearchItemsParams = {
  q?: string;
  category?: string;
  work?: string;
  character?: string;
  minPrice?: number;
  maxPrice?: number;
};

export async function searchItems({
  q = "",
  category = "",
  work = "",
  character = "",
  minPrice,
  maxPrice,
}: SearchItemsParams = {}) {
  let query = supabase
    .from("items")
    .select("*")
    .not("description", "ilike", "[待审核]%")
    .eq("visibility", "public")
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

  if (work) {
    query = query.eq("work", work);
  }

  if (character) {
    query = query.eq("character", character);
  }

  if (minPrice != null) {
    query = query.gte("price", minPrice);
  }
  if (maxPrice != null) {
    query = query.lte("price", maxPrice);
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
    .eq("visibility", "public")
    .single();

  if (error) {
    return null;
  }

  return data as Item;
}

export async function getPopularWorks(limit = 8) {
  const { data } = await supabase
    .from("items")
    .select("work")
    .not("description", "ilike", "[待审核]%")
    .eq("visibility", "public");

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (row.work) counts.set(row.work, (counts.get(row.work) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export async function getPopularCharacters(limit = 12) {
  const { data } = await supabase
    .from("items")
    .select("character")
    .not("description", "ilike", "[待审核]%")
    .eq("visibility", "public");

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (row.character) counts.set(row.character, (counts.get(row.character) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
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