"use client";

import { useState } from "react";
import type { Item } from "@/data/items";
import type { Notification } from "@/lib/notifications";
import type { Profile } from "@/lib/profiles";
import { markRead, markAllRead } from "./actions";
import CabinetTab from "./CabinetTab";

type ItemWithDisplay = Item & {
  displayDescription: string;
  status: { label: string; color: string };
};

export default function MyPageClient({
  items,
  notifications: initialNotifications,
  collection,
  profile,
  userId,
  categories = [],
}: {
  items: ItemWithDisplay[];
  notifications: Notification[];
  collection: Item[];
  profile: Profile;
  userId: string;
  categories?: string[];
}) {
  const [tab, setTab] = useState<"items" | "notifications" | "cabinet">("items");
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

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      {/* Tab 切换 */}
      <div className="mb-4 flex gap-1 rounded-2xl bg-white p-1.5 shadow-sm border border-pink-100">
        {(
          [
            ["items", `我的投稿 (${items.length})`],
            ["cabinet", `我的痛柜 (${collection.length})`],
            ["notifications", `通知${unreadCount > 0 ? ` (${unreadCount})` : ""}`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
              tab === key
                ? "bg-pink-500 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
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
                className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm border border-pink-100"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
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
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="mt-1 font-semibold text-slate-800">{item.title}</h3>
                    <p className="text-sm text-slate-500">
                      {item.work} / {item.character}
                    </p>
                  </div>
                  {item.displayDescription && (
                    <p className="mt-1 text-xs text-slate-400 line-clamp-1">{item.displayDescription}</p>
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

      {/* 痛柜 Tab */}
      {tab === "cabinet" && (
        <CabinetTab items={collection} profile={profile} userId={userId} categories={categories} />
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
                    n.is_read ? "bg-white border-pink-100" : "bg-pink-50 ring-pink-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className={`text-sm ${n.is_read ? "text-slate-600" : "font-medium text-slate-800"}`}>
                        {n.message}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
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
    <div className="rounded-3xl bg-white p-12 text-center shadow-sm border border-pink-100">
      <p className="text-lg font-semibold text-slate-800">{message}</p>
      <p className="mt-2 text-slate-500">{hint}</p>
    </div>
  );
}
