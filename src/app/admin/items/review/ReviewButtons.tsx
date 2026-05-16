"use client";

import { useState } from "react";
import { approveItem, rejectItem, approveDeleteRequest, rejectDeleteRequest } from "../../reviewActions";

export default function ReviewButtons({
  itemId,
  type = "submission",
}: {
  itemId: number;
  type?: "submission" | "deleteRequest";
}) {
  const [message, setMessage] = useState("");

  async function handleApprove() {
    setMessage("");
    const formData = new FormData();
    formData.set("id", String(itemId));
    const result = type === "deleteRequest"
      ? await approveDeleteRequest(formData)
      : await approveItem(formData);
    if (result?.error) setMessage(result.error);
  }

  async function handleReject() {
    setMessage("");
    const formData = new FormData();
    formData.set("id", String(itemId));
    const result = type === "deleteRequest"
      ? await rejectDeleteRequest(formData)
      : await rejectItem(formData);
    if (result?.error) setMessage(result.error);
  }

  const approveLabel = type === "deleteRequest" ? "确认删除" : "通过";
  const rejectLabel = type === "deleteRequest" ? "恢复" : "拒绝";
  const approveClass = type === "deleteRequest"
    ? "rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
    : "rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600";
  const rejectClass = type === "deleteRequest"
    ? "rounded-xl bg-green-100 px-4 py-2 text-sm font-medium text-green-600 transition hover:bg-green-200"
    : "rounded-xl bg-red-100 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-200";

  return (
    <div className="flex shrink-0 flex-col items-end justify-between">
      <div className="flex gap-2">
        <button onClick={handleApprove} className={approveClass}>
          {approveLabel}
        </button>
        <button onClick={handleReject} className={rejectClass}>
          {rejectLabel}
        </button>
      </div>
      {message && <p className="mt-1 text-xs text-red-500">{message}</p>}
    </div>
  );
}
