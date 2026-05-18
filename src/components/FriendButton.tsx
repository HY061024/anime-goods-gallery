"use client";

import { useState, useTransition } from "react";
import { sendFriendRequest } from "@/lib/friends";

export default function FriendButton({
  userId,
  targetId,
  initialStatus,
}: {
  userId: string;
  targetId: string;
  initialStatus?: string | null;
}) {
  const [status, setStatus] = useState(initialStatus ?? null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await sendFriendRequest(userId, targetId);
      if (!result.error) setStatus("pending");
    });
  }

  if (status === "accepted") {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          已是好友
        </span>
        <a
          href={`/mypage/messages/${targetId}`}
          className="rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-pink-600 transition"
        >
          发私信
        </a>
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600">
        已发送请求
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-pink-600 disabled:opacity-50"
    >
      {isPending ? "发送中…" : "+ 加好友"}
    </button>
  );
}
