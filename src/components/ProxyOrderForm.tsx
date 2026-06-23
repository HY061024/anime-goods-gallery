"use client";

import { useState, useTransition } from "react";
import { submitProxyOrder } from "@/app/proxy-order/actions";
import PaymentQRModal from "./PaymentQRModal";

export default function ProxyOrderForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const result = await submitProxyOrder(formData);

      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }

      // 提交成功 → 记住订单 ID，显示付款码弹窗
      if ("orderId" in result) {
        setCreatedOrderId(result.orderId);
      }
      setShowQR(true);
      setFormKey((k) => k + 1);
    });
  }

  return (
    <>
      <form key={formKey} action={handleSubmit} className="space-y-5">
        {/* 商品链接 */}
        <div>
          <label htmlFor="item_url" className="block text-sm font-medium text-slate-700 mb-1.5">
            代购商品链接 <span className="text-red-400">*</span>
          </label>
          <input
            id="item_url"
            name="item_url"
            type="url"
            required
            placeholder="粘贴乐天/煤炉/推特等商品链接"
            className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </div>

        {/* 商品名称 */}
        <div>
          <label htmlFor="item_name" className="block text-sm font-medium text-slate-700 mb-1.5">
            商品名称
          </label>
          <input
            id="item_name"
            name="item_name"
            type="text"
            placeholder="如：五条悟 棉花娃娃"
            className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </div>

        {/* 预估价格 */}
        <div>
          <label htmlFor="item_price" className="block text-sm font-medium text-slate-700 mb-1.5">
            预估价格（日元/韩元）
          </label>
          <input
            id="item_price"
            name="item_price"
            type="number"
            step="1"
            min="0"
            placeholder="如：3000"
            className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </div>

        {/* 备注 */}
        <div>
          <label htmlFor="user_notes" className="block text-sm font-medium text-slate-700 mb-1.5">
            备注（颜色/尺码/数量等）
          </label>
          <textarea
            id="user_notes"
            name="user_notes"
            rows={3}
            placeholder="如：蓝色 L 码，两件"
            className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none"
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-pink-500 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "提交中…" : "提交代购请求"}
        </button>
      </form>

      {/* 付款码弹窗 — 提交成功后才显示 */}
      <PaymentQRModal
        open={showQR}
        onClose={() => setShowQR(false)}
        orderId={createdOrderId ?? undefined}
      />
    </>
  );
}
