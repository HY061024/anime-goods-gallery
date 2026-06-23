"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { ProxyOrder, ProxyOrderInput } from "@/data/proxyOrders";

/** 创建代购单，返回订单 ID */
export async function createProxyOrder(
  userId: string,
  input: ProxyOrderInput
): Promise<{ orderId: number } | { error: string }> {
  const { data, error } = await supabaseAdmin
    .from("proxy_orders")
    .insert({
      user_id: userId,
      item_url: input.item_url,
      item_name: input.item_name || null,
      item_price: input.item_price || null,
      user_notes: input.user_notes || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message || "创建代购单失败" };
  }

  return { orderId: data.id };
}

/** 获取用户的代购单列表 */
export async function getUserProxyOrders(
  userId: string
): Promise<ProxyOrder[]> {
  const { data, error } = await supabaseAdmin
    .from("proxy_orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as ProxyOrder[];
}
