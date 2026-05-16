"use client";

import { useState } from "react";
import type { Item } from "@/data/items";
import type { Notification } from "@/lib/notifications";
import { markRead, markAllRead } from "./actions";

type ItemWithDisplay = Item & {
  displayDescription: string;
  status: { label: string; color: string };
};

export default function MyPageClient({
  items,
  notifications: initialNotifications,
}: {
  items: ItemWithDisplay[];
  notifications: Notification[];
}) {
  const [tab, setTab] = useState<"items" | "notifications">("items");
  const [notifications, setNotifications] = useState(initialNotifications);

  async function handleMarkRead(id: number) {
    await markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  async function handleMarkAllRead() {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  return (
    <div>
      {/* Tab 切换 */}
      <div className="mb-4 flex gap-1 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-gray-100">
        <button
          onClick={() => setTab("items")}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
            tab === "items"
              ? "bg-pink-500 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          我的投稿 ({items.length})
        </button>
        <button
          onClick={() => setTab("notifications")}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
            tab === "notifications"
              ? "bg-pink-500 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          通知 ({notifications.filter((n) => !n.is_read).length})
        </button>
      </div>

      {/* 投稿列表 */}
      {tab === "items" && (
        <div className="space-y-3">
          {items.length === 0 ? (
            <EmptyState message="还没有投稿" hint="去投稿页面上传你收藏的周边吧" />
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${item.status.color}`}>
                        {item.status.label}
                      </span>
                      <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="mt-1 font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">
                      {item.work} / {item.character}
                    </p>
                  </div>
                  {item.displayDescription && (
                    <p className="mt-1 text-xs text-gray-400 line-clamp-1">{item.displayDescription}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center">
                  <span className="text-sm font-bold text-pink-500">¥{item.price}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 通知列表 */}
      {tab === "notifications" && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <EmptyState message="暂无通知" hint="你的投稿审核结果会显示在这里" />
          ) : (
            <>
              <div className="flex justify-end">
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm text-pink-500 hover:text-pink-600"
                >
                  全部标记已读
                </button>
              </div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-2xl p-4 shadow-sm ring-1 ${
                    n.is_read ? "bg-white ring-gray-100" : "bg-pink-50 ring-pink-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className={`text-sm ${n.is_read ? "text-gray-600" : "font-medium text-gray-900"}`}>
                        {n.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(n.created_at).toLocaleString("zh-CN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="shrink-0 text-xs text-pink-500 hover:text-pink-600"
                      >
                        标记已读
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message, hint }: { message: string; hint: string }) {
  return (
    <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
      <p className="text-lg font-semibold text-gray-900">{message}</p>
      <p className="mt-2 text-gray-500">{hint}</p>
    </div>
  );
}
