import { createClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";
import { notFound } from "next/navigation";
import PaymentProofUploader from "./PaymentProofUploader";
import CancelDeleteButtons from "./CancelDeleteButtons";
import { PROXY_ORDER_STATUS_LABELS, PROXY_ORDER_STATUS_COLORS } from "@/data/proxyOrders";
import type { ProxyOrder } from "@/data/proxyOrders";

export default async function ProxyOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <div className="mb-4 text-5xl">🔐</div>
        <h1 className="mb-3 text-2xl font-bold text-slate-800">请先登录</h1>
        <p className="mb-6 text-sm text-slate-500">查看代购单需要登录账号</p>
        <Link
          href={`/auth/login?redirect=/proxy-order/${orderId}`}
          className="inline-block rounded-xl bg-pink-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-pink-600"
        >
          去登录
        </Link>
      </div>
    );
  }

  // 用 service_role 查询单条订单（不受 RLS 限制，但应用层验证所有权）
  const { data: order } = await supabaseAdmin
    .from("proxy_orders")
    .select("*")
    .eq("id", orderId)
    .single<ProxyOrder>();

  if (!order) notFound();

  // 应用层权限：只能看自己的
  if (order.user_id !== user.id) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <div className="mb-4 text-5xl">🚫</div>
        <h1 className="mb-3 text-2xl font-bold text-slate-800">无权访问</h1>
        <p className="text-sm text-slate-500">这不是你的代购单</p>
      </div>
    );
  }

  const statusLabel = PROXY_ORDER_STATUS_LABELS[order.status] || order.status;
  const statusColor = PROXY_ORDER_STATUS_COLORS[order.status] || "bg-slate-100 text-slate-700";
  const canUpload = order.status === "pending_payment";

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <Link
        href="/proxy-order"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-pink-500"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">代购单 #{order.id}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* 订单信息 */}
      <div className="mb-6 space-y-3 rounded-2xl border border-pink-100 bg-white p-5">
        <InfoRow label="商品链接" value={order.item_url} isLink />
        {order.item_name && <InfoRow label="商品名称" value={order.item_name} />}
        {order.item_price != null && <InfoRow label="预估价格" value={`¥${order.item_price}`} />}
        {order.user_notes && <InfoRow label="备注" value={order.user_notes} />}
        <InfoRow label="提交时间" value={new Date(order.created_at).toLocaleString("zh-CN")} />
      </div>

      {/* 付款凭证上传区域 */}
      {canUpload ? (
        <>
          <div className="rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/30 p-6 mb-4">
            <h2 className="mb-2 text-center text-sm font-semibold text-slate-700">
              上传付款凭证
            </h2>
            <p className="mb-4 text-center text-xs text-slate-500">
              请先根据付款码弹窗中的二维码完成付款，然后上传截图
            </p>
            <PaymentProofUploader orderId={order.id} />
          </div>
          {/* 待付款状态下可取消或删除 */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="mb-2 text-xs text-slate-500">付款遇到问题？你可以：</p>
            <CancelDeleteButtons orderId={order.id} />
          </div>
        </>
      ) : order.payment_proof_url ? (
        <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
          <h2 className="mb-2 text-sm font-semibold text-green-700">✅ 已提交给管理员审核</h2>
          <img
            src={order.payment_proof_url}
            alt="付款凭证"
            className="mt-2 w-full rounded-lg border border-green-200 object-cover"
          />
        </div>
      ) : order.status === "cancelled" || order.status === "rejected" ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
          <p className="text-sm text-slate-500">
            {order.status === "cancelled" ? "此代购单已取消" : "此代购单凭证未通过审核"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center">
          <p className="text-sm font-medium text-blue-600">
            管理员正在处理你的代购请求
          </p>
          <p className="mt-1 text-xs text-slate-500">当前状态：{statusLabel}</p>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  isLink,
}: {
  label: string;
  value: string;
  isLink?: boolean;
}) {
  return (
    <div>
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <p className="mt-0.5 text-sm text-slate-700 break-all">
        {isLink ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-500 underline hover:text-pink-600"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </p>
    </div>
  );
}
