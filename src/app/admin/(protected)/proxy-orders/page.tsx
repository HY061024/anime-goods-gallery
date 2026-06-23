import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { PROXY_ORDER_STATUS_LABELS, PROXY_ORDER_STATUS_COLORS } from "@/data/proxyOrders";
import type { ProxyOrder, ProxyOrderStatus } from "@/data/proxyOrders";
import { updateProxyOrderStatus } from "./actions";
import AdminProxyOrderActions from "./AdminProxyOrderActions";

export const dynamic = "force-dynamic";

export default async function AdminProxyOrdersPage() {
  const { data: orders, error } = await supabaseAdmin
    .from("proxy_orders")
    .select("*")
    .neq("status", "pending_payment")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
        <p className="text-sm text-red-600">加载失败：{error.message}</p>
      </div>
    );
  }

  const typedOrders = (orders || []) as ProxyOrder[];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">代购审核</h2>
        <p className="mt-1 text-sm text-slate-500">
          用户上传付款凭证后的订单才会出现在此列表（status ≠ pending_payment）
        </p>
      </div>

      {typedOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50/30 py-16 text-center">
          <p className="text-sm text-slate-500">暂无待审核的代购单</p>
        </div>
      ) : (
        <div className="space-y-4">
          {typedOrders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: ProxyOrder }) {
  const statusLabel = PROXY_ORDER_STATUS_LABELS[order.status] || order.status;
  const statusColor = PROXY_ORDER_STATUS_COLORS[order.status] || "bg-slate-100 text-slate-700";

  // 构建状态流转选项
  const transitions = getTransitions(order.status);

  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        {/* 左侧：订单信息 */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">#{order.id}</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColor}`}>
              {statusLabel}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400">商品</span>
            <p className="text-sm font-medium text-slate-800">
              {order.item_name || order.item_url.slice(0, 80)}
            </p>
          </div>

          {order.item_url && (
            <div>
              <span className="text-xs text-slate-400">链接</span>
              <p className="text-sm text-pink-500 break-all">
                <a href={order.item_url} target="_blank" rel="noopener noreferrer" className="underline">
                  {order.item_url.length > 60 ? order.item_url.slice(0, 60) + "…" : order.item_url}
                </a>
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {order.item_price != null && (
              <div>
                <span className="text-xs text-slate-400">预估价格</span>
                <p className="text-sm text-slate-700">¥{order.item_price}</p>
              </div>
            )}
            <div>
              <span className="text-xs text-slate-400">用户</span>
              <p className="text-sm text-slate-700 font-mono text-xs">
                {order.user_id.slice(0, 12)}…
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400">提交时间</span>
              <p className="text-sm text-slate-700">
                {new Date(order.created_at).toLocaleString("zh-CN")}
              </p>
            </div>
          </div>

          {order.user_notes && (
            <div>
              <span className="text-xs text-slate-400">用户备注</span>
              <p className="text-sm text-slate-700">{order.user_notes}</p>
            </div>
          )}
        </div>

        {/* 右侧：凭证 + 操作 */}
        <div className="flex flex-col items-start gap-3 lg:w-48 lg:shrink-0">
          {/* 付款凭证 */}
          {order.payment_proof_url && (
            <a
              href={order.payment_proof_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <img
                src={order.payment_proof_url}
                alt="付款凭证"
                className="w-full rounded-lg border border-slate-200 object-cover aspect-square"
              />
              <span className="mt-1 block text-center text-[10px] text-slate-400">点击查看大图</span>
            </a>
          )}

          {/* 状态变更按钮 */}
          {transitions.length > 0 && (
            <AdminProxyOrderActions orderId={order.id} transitions={transitions} />
          )}
        </div>
      </div>
    </div>
  );
}

/** 状态流转规则 */
function getTransitions(currentStatus: string): ProxyOrderStatus[] {
  const map: Record<string, ProxyOrderStatus[]> = {
    proof_uploaded: ["accepted", "rejected"],
    accepted: ["purchasing"],
    purchasing: ["purchased"],
    purchased: ["shipped"],
    shipped: ["delivered"],
  };
  return map[currentStatus] || [];
}
