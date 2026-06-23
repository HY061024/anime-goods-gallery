"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProxyOrderStatus } from "./actions";
import { PROXY_ORDER_STATUS_LABELS } from "@/data/proxyOrders";
import type { ProxyOrderStatus } from "@/data/proxyOrders";

interface Props {
  orderId: number;
  transitions: ProxyOrderStatus[];
}

export default function AdminProxyOrderActions({ orderId, transitions }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();

  function handleUpdate(newStatus: ProxyOrderStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateProxyOrderStatus(orderId, newStatus);
      if (result?.error) {
        setError(result.error);
      } else {
        setDone(true);
        router.refresh();
      }
    });
  }

  if (done) {
    return <p className="text-xs text-green-600 font-medium">✅ 已更新</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {transitions.map((status) => {
        const label = PROXY_ORDER_STATUS_LABELS[status] || status;
        const isReject = status === "rejected";
        return (
          <button
            key={status}
            onClick={() => handleUpdate(status)}
            disabled={isPending}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
              isReject
                ? "border border-red-200 bg-white text-red-500 hover:bg-red-50"
                : "bg-pink-500 text-white hover:bg-pink-600"
            }`}
          >
            {isPending ? "…" : label}
          </button>
        );
      })}
      {error && <p className="w-full text-[10px] text-red-500">{error}</p>}
    </div>
  );
}
