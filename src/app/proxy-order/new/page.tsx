import { createClient } from "@/lib/supabaseServer";
import ProxyOrderForm from "@/components/ProxyOrderForm";
import Link from "next/link";

export default async function NewProxyOrderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <div className="mb-4 text-5xl">🔐</div>
        <h1 className="mb-3 text-2xl font-bold text-slate-800">请先登录</h1>
        <p className="mb-6 text-sm text-slate-500">提交代购请求需要登录账号</p>
        <Link
          href={`/auth/login?redirect=/proxy-order/new`}
          className="inline-block rounded-xl bg-pink-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-pink-600"
        >
          去登录
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      {/* 返回链接 */}
      <Link
        href="/proxy-order"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-pink-500"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">提交代购请求</h1>
        <p className="mt-1 text-sm text-slate-500">
          填写商品链接和需求，付款后管理员帮你采购
        </p>
      </div>

      {/* 说明卡片 */}
      <div className="mb-6 rounded-xl border border-pink-100 bg-pink-50/50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-pink-600">代购流程</h3>
        <ol className="space-y-1 text-xs text-slate-600">
          <li>1. 填写代购商品信息并提交</li>
          <li>2. 扫码付款（支付宝/微信）</li>
          <li>3. 在&quot;我的代购单&quot;中上传付款凭证</li>
          <li>4. 管理员确认后开始采购</li>
          <li>5. 随时在&quot;我的代购单&quot;查看进度</li>
        </ol>
      </div>

      <ProxyOrderForm />
    </div>
  );
}
