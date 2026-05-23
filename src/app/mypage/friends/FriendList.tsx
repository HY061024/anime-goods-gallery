"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from "@/lib/friends";
import type { PendingRequest, FriendInfo } from "@/lib/friends";

export default function FriendList({
  friends,
  incoming,
  outgoing,
  currentUserId,
  currentUserName,
}: {
  friends: FriendInfo[];
  incoming: PendingRequest[];
  outgoing: PendingRequest[];
  currentUserId: string;
  currentUserName: string;
}) {
  const [activeTab, setActiveTab] = useState<"friends" | "incoming" | "outgoing">("friends");
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

  const tabOptions = [
    { key: "friends" as const, label: "我的好友", count: localFriends.length },
    { key: "incoming" as const, label: "收到的申请", count: localIncoming.length },
    { key: "outgoing" as const, label: "发出的申请", count: localOutgoing.length },
  ];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex rounded-xl bg-white p-1 shadow-sm border border-pink-100">
        {tabOptions.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-pink-500 text-white"
                : "text-slate-500 hover:text-slate-600"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1 text-xs ${activeTab === tab.key ? "text-pink-100" : "text-slate-300"}`}>
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Incoming requests */}
      {activeTab === "incoming" && (
        localIncoming.length > 0 ? (
          <div className="space-y-2">
            {localIncoming.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm border border-pink-100"
              >
                <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {req.sender_avatar_url ? (
                    <img src={req.sender_avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm text-pink-400">
                      {req.sender_display_name[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {req.sender_display_name}
                  </p>
                  <p className="text-xs text-slate-400">想加你为好友</p>
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
                    className="rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-500 hover:bg-slate-200 disabled:opacity-50"
                  >
                    拒绝
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm border border-pink-100">
            <p className="text-sm text-slate-400">暂无收到的好友申请</p>
          </div>
        )
      )}

      {/* Outgoing requests */}
      {activeTab === "outgoing" && (
        localOutgoing.length > 0 ? (
          <div className="space-y-2">
            {localOutgoing.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm border border-pink-100"
              >
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {req.receiver_avatar_url ? (
                    <img src={req.receiver_avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm text-slate-400">
                      {req.receiver_display_name[0]}
                    </span>
                  )}
                </div>
                <p className="flex-1 text-sm text-slate-500">
                  {req.receiver_display_name}
                </p>
                <span className="text-xs text-amber-500">等待回复</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm border border-pink-100">
            <p className="text-sm text-slate-400">暂无发出的好友申请</p>
          </div>
        )
      )}

      {/* Friends list */}
      {activeTab === "friends" && (
        localFriends.length > 0 ? (
          <div className="space-y-2">
            {localFriends.map((f) => (
              <div
                key={f.user_id}
                className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm border border-pink-100"
              >
                <Link
                  href={`/users/${f.user_id}`}
                  className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center shrink-0 overflow-hidden"
                >
                  {f.avatar_url ? (
                    <img src={f.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-base text-pink-400">
                      {(f.display_name ?? "?")[0]}
                    </span>
                  )}
                </Link>
                <Link
                  href={`/users/${f.user_id}`}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-slate-800 hover:text-pink-500">
                    {f.display_name || `用户${f.user_id.slice(0, 6)}`}
                  </p>
                  {f.bio && (
                    <p className="text-xs text-slate-400 truncate">{f.bio}</p>
                  )}
                </Link>
                <Link
                  href={`/mypage/messages/${f.user_id}`}
                  className="rounded-lg bg-pink-500 px-3 py-1 text-xs font-medium text-white hover:bg-pink-600 transition"
                >
                  发私信
                </Link>
                <button
                  onClick={() => handleRemove(f.user_id)}
                  className="rounded-lg px-2 py-1 text-xs text-slate-300 hover:text-red-500"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm border border-pink-100">
            <p className="text-sm text-slate-400">暂无好友，去逛逛别人的痛柜认识新朋友吧</p>
            <Link href="/cabinets" className="mt-2 inline-block text-sm font-medium text-pink-500">
              去痛柜广场 &rarr;
            </Link>
          </div>
        )
      )}
    </div>
  );
}
