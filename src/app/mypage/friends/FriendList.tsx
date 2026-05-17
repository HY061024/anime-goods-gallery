"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from "@/lib/friends";
import type { Friendship } from "@/lib/friends";

export default function FriendList({
  friends,
  incoming,
  outgoing,
  currentUserId,
  currentUserName,
}: {
  friends: {
    user_id: string;
    display_name: string | null;
    avatar_url: string | null;
  }[];
  incoming: Friendship[];
  outgoing: Friendship[];
  currentUserId: string;
  currentUserName: string;
}) {
  const [localFriends, setLocalFriends] = useState(friends);
  const [localIncoming, setLocalIncoming] = useState(incoming);
  const [localOutgoing, setLocalOutgoing] = useState(outgoing);
  const [isPending, startTransition] = useTransition();

  function handleAccept(id: number) {
    startTransition(async () => {
      await acceptFriendRequest(id, currentUserId);
      setLocalIncoming((prev) => prev.filter((r) => r.id !== id));
      window.location.reload();
    });
  }

  function handleReject(id: number) {
    startTransition(async () => {
      await rejectFriendRequest(id, currentUserId);
      setLocalIncoming((prev) => prev.filter((r) => r.id !== id));
    });
  }

  function handleRemove(friendId: string) {
    if (!confirm("确定要删除好友吗？")) return;
    startTransition(async () => {
      await removeFriend(currentUserId, friendId);
      setLocalFriends((prev) => prev.filter((f) => f.user_id !== friendId));
    });
  }

  return (
    <div className="space-y-6">
      {/* Incoming requests */}
      {localIncoming.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-gray-500">
            待处理的好友请求 ({localIncoming.length})
          </h2>
          <div className="space-y-2">
            {localIncoming.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100"
              >
                <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-sm text-pink-400 shrink-0">
                  用户
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    用户{req.sender_id.slice(0, 8)}…
                  </p>
                  <p className="text-xs text-gray-400">想加你为好友</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleAccept(req.id)}
                    disabled={isPending}
                    className="rounded-lg bg-pink-500 px-3 py-1 text-xs font-medium text-white hover:bg-pink-600 disabled:opacity-50"
                  >
                    接受
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={isPending}
                    className="rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-500 hover:bg-gray-200 disabled:opacity-50"
                  >
                    拒绝
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outgoing requests */}
      {localOutgoing.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-gray-500">
            已发送的请求 ({localOutgoing.length})
          </h2>
          <div className="space-y-2">
            {localOutgoing.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100"
              >
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-400 shrink-0">
                  用户
                </div>
                <p className="flex-1 text-sm text-gray-500">
                  用户{req.receiver_id.slice(0, 8)}…
                </p>
                <span className="text-xs text-amber-500">等待回复</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-500">
          我的好友 ({localFriends.length})
        </h2>
        {localFriends.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
            <p className="text-sm text-gray-400">暂无好友，去逛逛别人的痛柜认识新朋友吧</p>
          </div>
        ) : (
          <div className="space-y-2">
            {localFriends.map((f) => (
              <div
                key={f.user_id}
                className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100"
              >
                <Link
                  href={`/users/${f.user_id}`}
                  className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0 overflow-hidden"
                >
                  {f.avatar_url ? (
                    <img src={f.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm text-pink-400">
                      {(f.display_name ?? "?")[0]}
                    </span>
                  )}
                </Link>
                <Link
                  href={`/users/${f.user_id}`}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-gray-900 hover:text-pink-500">
                    {f.display_name || `用户${f.user_id.slice(0, 6)}`}
                  </p>
                </Link>
                <Link
                  href={`/mypage/messages/${f.user_id}`}
                  className="rounded-lg bg-pink-50 px-2 py-1 text-xs text-pink-500 hover:bg-pink-100"
                >
                  发消息
                </Link>
                <button
                  onClick={() => handleRemove(f.user_id)}
                  className="rounded-lg px-2 py-1 text-xs text-gray-300 hover:text-red-500"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
