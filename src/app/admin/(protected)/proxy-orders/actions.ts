"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import type { ProxyOrderStatus } from "@/data/proxyOrders";

/** 状态流转规则：key = 当前状态, value[] = 可变更的目标状态 */
const ALLOWED_TRANSITIONS: Record<string, ProxyOrderStatus[]> = {
  proof_uploaded: ["accepted", "rejected"],
  accepted: ["purchasing"],
  purchasing: ["purchased"],
  purchased: ["shipped"],
  shipped: ["delivered"],
};

export async function updateProxyOrderStatus(
  orderId: number,
  newStatus: ProxyOrderStatus
): Promise<{ error?: string }> {
  // 获取当前订单
  const { data: order, error: fetchError } = await supabaseAdmin
    .from("proxy_orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return { error: "订单不存在" };
  }

  const currentStatus = order.status;
  const allowed = ALLOWED_TRANSITIONS[currentStatus];

  if (!allowed || !allowed.includes(newStatus)) {
    return { error: `不允许从 ${currentStatus} 变更到 ${newStatus}` };
  }

  const { error: updateError } = await supabaseAdmin
    .from("proxy_orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (updateError) {
    return { error: updateError.message };
  }

  // 写入操作日志
  await supabaseAdmin.from("proxy_order_logs").insert({
    order_id: orderId,
    action: "status_change",
    old_status: currentStatus,
    new_status: newStatus,
    note: "管理员更新状态",
  });

  revalidatePath("/admin/proxy-orders");
  return {};
}
