// 日韩代购 — 类型定义

export type ProxyOrderStatus =
  | "pending_payment"
  | "proof_uploaded"
  | "accepted"
  | "purchasing"
  | "purchased"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "rejected";

export const PROXY_ORDER_STATUS_LABELS: Record<ProxyOrderStatus, string> = {
  pending_payment: "待付款",
  proof_uploaded: "已上传凭证",
  accepted: "已受理",
  purchasing: "采购中",
  purchased: "已购入",
  shipped: "已发货",
  delivered: "已完成",
  cancelled: "已取消",
  rejected: "已拒绝",
};

export const PROXY_ORDER_STATUS_COLORS: Record<ProxyOrderStatus, string> = {
  pending_payment: "bg-yellow-100 text-yellow-700",
  proof_uploaded: "bg-blue-100 text-blue-700",
  accepted: "bg-indigo-100 text-indigo-700",
  purchasing: "bg-purple-100 text-purple-700",
  purchased: "bg-cyan-100 text-cyan-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-slate-100 text-slate-500",
  rejected: "bg-red-100 text-red-700",
};

export interface ProxyOrder {
  id: number;
  user_id: string;
  item_url: string;
  item_name: string | null;
  item_price: number | null;
  user_notes: string | null;
  status: ProxyOrderStatus;
  payment_proof_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProxyOrderInput {
  item_url: string;
  item_name?: string;
  item_price?: number;
  user_notes?: string;
}
