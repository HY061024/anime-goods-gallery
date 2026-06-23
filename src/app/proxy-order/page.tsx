import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import { getUserProxyOrders } from "@/lib/proxyOrders";
import { PROXY_ORDER_STATUS_LABELS, PROXY_ORDER_STATUS_COLORS } from "@/data/proxyOrders";

export default async function ProxyOrderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 已登录 → 显示"我的代购单"列表
  if (user) {
    const orders = await getUserProxyOrders(user.id);

    return (
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">我的代购单</h1>
            <p className="mt-1 text-sm text-slate-500">提交链接 → 付款 → 等待采购</p>
          </div>
          <Link
            href="/proxy-order/new"
            className="rounded-xl bg-pink-500 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-pink-600"
          >
            ＋ 新建代购
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50/30 py-16 text-center">
            <div className="mb-3 text-5xl">🛍️</div>
            <p className="mb-2 text-sm font-medium text-slate-600">还没有代购单</p>
            <p className="mb-5 text-xs text-slate-500">提交你的第一个日韩代购请求</p>
            <Link
              href="/proxy-order/new"
              className="inline-block rounded-xl bg-pink-500 px-8 py-2.5 text-sm font-bold text-white shadow transition hover:bg-pink-600"
            >
              提交代购请求 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/proxy-order/${order.id}`}
                className="block rounded-2xl border border-pink-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                      {order.item_name || order.item_url.slice(0, 60)}
                    </p>
                    {order.item_price != null && (
                      <p className="mt-0.5 text-xs text-slate-500">预估 ¥{order.item_price}</p>
                    )}
                    <p className="mt-1 text-[11px] text-slate-400">
                      #{order.id} · {new Date(order.created_at).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      PROXY_ORDER_STATUS_COLORS[order.status] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {PROXY_ORDER_STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 未登录 → 显示介绍页
  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <div className="mb-4 text-6xl">🛍️</div>
      <h1 className="mb-3 text-2xl font-bold text-slate-800">日韩代购</h1>
      <p className="mb-2 text-sm text-slate-500">
        提交代购链接，付款后管理员帮你从日本/韩国采购
      </p>

      {/* 说明 */}
      <div className="mx-auto mb-8 mt-6 max-w-sm space-y-3 text-left">
        <div className="flex items-start gap-3 rounded-xl border border-pink-100 bg-white p-4">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-500">1</span>
          <div>
            <p className="text-sm font-medium text-slate-800">提交代购链接</p>
            <p className="text-xs text-slate-500">填写商品链接、名称、价格、备注</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-pink-100 bg-white p-4">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-500">2</span>
          <div>
            <p className="text-sm font-medium text-slate-800">扫码付款</p>
            <p className="text-xs text-slate-500">支付宝或微信付款后上传凭证截图</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-pink-100 bg-white p-4">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-500">3</span>
          <div>
            <p className="text-sm font-medium text-slate-800">等待采购</p>
            <p className="text-xs text-slate-500">管理员确认凭证后开始采购，可随时查看进度</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/auth/login?redirect=/proxy-order"
          className="inline-block rounded-xl bg-pink-500 px-10 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-pink-600"
        >
          登录后开始 →
        </Link>
      </div>
    </div>
  );
}
