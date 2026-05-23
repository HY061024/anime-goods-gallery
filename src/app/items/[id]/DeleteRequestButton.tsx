"use client";

import { useState } from "react";
import { requestDeleteItem } from "./actions";

export default function DeleteRequestButton({ itemId }: { itemId: number }) {
  const [message, setMessage] = useState("");

  async function handleClick() {
    setMessage("");
    const formData = new FormData();
    formData.set("id", String(itemId));
    const result = await requestDeleteItem(formData);
    if (result?.error) {
      setMessage(result.error);
    }
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        如果你发现该周边信息有误或需要移除，可以申请删除。管理员审核通过后生效。
      </p>
      <button
        onClick={handleClick}
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 active:bg-red-200"
      >
        申请删除此条目
      </button>
      {message && (
        <p className="mt-2 text-sm text-red-600">{message}</p>
      )}
    </div>
  );
}
