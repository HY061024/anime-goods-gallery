"use client";

import { useState, useTransition } from "react";
import { createBrowserSupabase } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";

interface Props {
  orderId: number;
}

export default function CancelDeleteButtons({ orderId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const router = useRouter();

  function handleCancel() {
    if (!confirm("确定要取消这个代购单吗？")) return;
    setError(null);
    startTransition(async () => {
      try {
        const supabase = createBrowserSupabase();
        const { error: rpcError } = await supabase.rpc("cancel_proxy_order", {
          p_order_id: orderId,
        });
        if (rpcError) throw new Error(rpcError.message);
        setDone("已取消");
        router.refresh();
      } catch (err: any) {
        setError(err?.message || "取消失败");
      }
    });
  }

  function handleDelete() {
    if (!confirm("确定要删除这个代购单吗？删除后无法恢复。")) return;
    setError(null);
    startTransition(async () => {
      try {
        const supabase = createBrowserSupabase();
        const { error: rpcError } = await supabase.rpc("delete_proxy_order", {
          p_order_id: orderId,
        });
        if (rpcError) throw new Error(rpcError.message);
        setDone("已删除");
        router.refresh();
        // 删除后跳回列表
        setTimeout(() => router.push("/proxy-order"), 500);
      } catch (err: any) {
        setError(err?.message || "删除失败");
      }
    });
  }

  if (done) {
    return (
      <p className="text-center text-sm font-medium text-green-600">✅ {done}</p>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          取消订单
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex-1 rounded-xl border border-red-200 bg-white py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
        >
          删除订单
        </button>
      </div>
    </div>
  );
}
