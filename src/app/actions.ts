"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabaseServer";
import { addToCollection } from "@/lib/collections";

export async function collectItem(itemId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "请先登录" };

  await addToCollection(user.id, itemId);
  revalidatePath("/");
  revalidatePath("/items");
}
