import { supabase } from "@/lib/supabase";

export async function getAllCategories(): Promise<string[]> {
  const { data } = await supabase
    .from("items")
    .select("category")
    .not("description", "ilike", "[待审核]%")
    .not("description", "ilike", "[申请删除]%")
    .eq("visibility", "public")
    .order("category");

  const cats = [...new Set((data ?? []).map((r) => r.category).filter(Boolean))];
  return cats;
}
