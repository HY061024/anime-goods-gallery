"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
} from "@/lib/friends";
import type { FriendButtonState } from "@/lib/friends";

export default function FriendButton({
  userId,
  targetId,
  initialState = null,
  initialFriendshipId = null,
}: {
  userId: string;
  targetId: string;
  initialState?: FriendButtonState | null;
  initialFriendshipId?: number | null;
}) {
  const [state, setState] = useState(initialState ?? "none");
  const [friendshipId, setFriendshipId] = useState<number | null>(initialFriendshipId ?? null);
  const [isPending, startTransition] = useTransition();

  const stateLabels: Record<FriendButtonState, string> = {
    none: "+ 加好友",
    pending_sent: "已发送申请",
    pending_received: "收到好友申请",
    accepted: "已是好友",
    rejected: "+ 加好友",
  };

  function handleSend() {
    startTransition(async () => {
      const result = await sendFriendRequest(userId, targetId);
      if (!result.error) setState("pending_sent");
    });
  }

  function handleAccept() {
    if (!friendshipId) return;
    startTransition(async () => {
      const result = await acceptFriendRequest(friendshipId, targetId);
      if (!result.error) {
        setState("accepted");
        window.location.reload();
      }
    });
  }

  function handleReject() {
    if (!friendshipId) return;
    startTransition(async () => {
      const result = await rejectFriendRequest(friendshipId, targetId);
      if (!result.error) setState("none");
    });
  }

  function handleCancel() {
    if (!friendshipId) return;
    startTransition(async () => {
      const result = await cancelFriendRequest(friendshipId);
      if (!result.error) {
        setState("none");
        setFriendshipId(null);
      }
    });
  }

  if (state === "accepted") {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          已是好友
        </span>
        <Link
          href={`/mypage/messages/${targetId}`}
          className="rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-pink-600 transition"
        >
          发私信
        </Link>
      </span>
    );
  }

  if (state === "pending_sent") {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600">
          已发送申请
        </span>
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 transition"
        >
          取消
        </button>
      </span>
    );
  }

  if (state === "pending_received") {
    return (
      <span className="inline-flex items-center gap-1">
        <button
          onClick={handleAccept}
          disabled={isPending}
          className="rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-pink-600 disabled:opacity-50 transition"
        >
          接受
        </button>
        <button
          onClick={handleReject}
          disabled={isPending}
          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-200 disabled:opacity-50 transition"
        >
          拒绝
        </button>
      </span>
    );
  }

  // "none" or "rejected" — both allow sending request
  return (
    <button
      onClick={handleSend}
      disabled={isPending}
      className="rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-pink-600 disabled:opacity-50 transition"
    >
      {isPending ? "发送中…" : stateLabels[state]}
    </button>
  );
}
