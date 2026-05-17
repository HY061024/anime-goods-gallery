"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { markAdminNotificationRead, markAllAdminNotificationsRead } from "@/lib/adminNotifications";

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "刚刚";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  const months = Math.floor(days / 30);
  return `${months}个月前`;
}

export default function NotificationList({
  notifications: initial,
}: {
  notifications: {
    id: number;
    item_id: number | null;
    item_title: string;
    is_read: boolean;
    created_at: string;
  }[];
}) {
  const [notifications, setNotifications] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function markRead(id: number) {
    startTransition(async () => {
      await markAdminNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    });
  }

  function markAllRead() {
    startTransition(async () => {
      await markAllAdminNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    });
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
        <p className="text-sm text-gray-400">暂无通知</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <button
          onClick={markAllRead}
          disabled={isPending}
          className="text-sm text-pink-500 hover:text-pink-600 disabled:opacity-50"
        >
          全部标记已读
        </button>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex items-center gap-4 rounded-2xl p-4 shadow-sm ring-1 ${
            n.is_read
              ? "bg-white ring-gray-100"
              : "bg-pink-50 ring-pink-200"
          }`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              新投稿：{n.item_title}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {n.created_at ? relativeTime(n.created_at) : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {n.item_id && (
              <Link
                href={`/admin/items/review`}
                className="rounded-lg bg-pink-100 px-3 py-1.5 text-xs font-medium text-pink-600 hover:bg-pink-200"
              >
                去审核
              </Link>
            )}
            {!n.is_read && (
              <button
                onClick={() => markRead(n.id)}
                disabled={isPending}
                className="rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                已读
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
