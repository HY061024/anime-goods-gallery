"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Conversation } from "@/lib/messages";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "刚刚";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(dateStr).toLocaleDateString("zh-CN");
}

export default function ConversationList({
  conversations,
}: {
  conversations: Conversation[];
}) {
  if (conversations.length === 0) {
    return (
      <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
        <p className="text-sm text-gray-400">暂无消息，去加个好友聊聊天吧</p>
        <Link href="/mypage/friends" className="mt-3 inline-block text-sm font-medium text-pink-500">
          前往好友页面 →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <Link
          key={conv.userId}
          href={`/mypage/messages/${conv.userId}`}
          className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100 hover:ring-pink-200 transition"
        >
          <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0 overflow-hidden">
            {conv.avatar_url ? (
              <img src={conv.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm text-pink-400">
                {(conv.display_name ?? "?")[0]}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900">{conv.display_name}</p>
              {conv.unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">
                  {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
          </div>
          <span className="text-xs text-gray-300 shrink-0">{relativeTime(conv.lastTime)}</span>
        </Link>
      ))}
    </div>
  );
}
