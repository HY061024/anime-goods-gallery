"use server";

import { createClient } from "@/lib/supabaseAction";
import { createProxyOrder } from "@/lib/proxyOrders";

export async function submitProxyOrder(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "请先登录后再提交代购请求" };
  }

  const itemUrl = formData.get("item_url") as string;
  const itemName = (formData.get("item_name") as string) || undefined;
  const itemPriceStr = (formData.get("item_price") as string) || undefined;
  const userNotes = (formData.get("user_notes") as string) || undefined;

  if (!itemUrl || !itemUrl.trim()) {
    return { error: "请填写代购商品链接" };
  }

  const result = await createProxyOrder(user.id, {
    item_url: itemUrl.trim(),
    item_name: itemName?.trim(),
    item_price: itemPriceStr ? Number(itemPriceStr) : undefined,
    user_notes: userNotes?.trim(),
  });

  return result;
}
