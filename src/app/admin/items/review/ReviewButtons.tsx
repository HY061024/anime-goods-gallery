"use client";

import { useState } from "react";
import { approveItem, rejectItem } from "../../reviewActions";

export default function ReviewButtons({ itemId }: { itemId: number }) {
  const [message, setMessage] = useState("");

  async function handleApprove() {
    setMessage("");
    const formData = new FormData();
    formData.set("id", String(itemId));
    const result = await approveItem(formData);
    if (result?.error) setMessage(result.error);
  }

  async function handleReject() {
    setMessage("");
    const formData = new FormData();
    formData.set("id", String(itemId));
    const result = await rejectItem(formData);
    if (result?.error) setMessage(result.error);
  }

  return (
    <div className="flex shrink-0 flex-col items-end justify-between">
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          className="rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600"
        >
          通过
        </button>
        <button
          onClick={handleReject}
          className="rounded-xl bg-red-100 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-200"
        >
          拒绝
        </button>
      </div>
      {message && (
        <p className="mt-1 text-xs text-red-500">{message}</p>
      )}
    </div>
  );
}
