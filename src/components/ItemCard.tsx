"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { Item } from "@/data/items";

function relativeTime(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  const months = Math.floor(days / 30);
  return `${months} 个月前`;
}

export default function ItemCard({
  item,
  submitterName,
  showCollectButton = false,
  collected = false,
  onCollect,
}: {
  item: Item;
  submitterName?: string;
  showCollectButton?: boolean;
  collected?: boolean;
  onCollect?: (itemId: number) => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-lg hover:ring-pink-200">
      <Link href={`/items/${item.id}`} className="block">
        {/* 图片区域 */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />

          {/* 分类标签 */}
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-pink-500 shadow-sm backdrop-blur-sm">
            {item.category}
          </span>

          {/* 价格标签 */}
          <span className="absolute bottom-2 right-2 rounded-full bg-gray-900/80 px-2.5 py-1 text-sm font-bold text-white backdrop-blur-sm">
            ¥{item.price}
          </span>
        </div>

        {/* 信息区域 */}
        <div className="p-3">
          <h2 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
            {item.title}
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {item.work}
            {item.character ? ` / ${item.character}` : ""}
          </p>

          {/* 提交者 + 时间 */}
          {submitterName && (
            <p className="mt-1.5 text-xs text-gray-400">
              {submitterName}
              {item.created_at ? ` · ${relativeTime(item.created_at)}` : ""}
            </p>
          )}
        </div>
      </Link>

      {/* 加入痛柜按钮（在 Link 外面，阻止事件冒泡） */}
      {showCollectButton && onCollect && (
        <div className="px-3 pb-3">
          {collected ? (
            <span className="inline-block w-full rounded-lg bg-pink-50 py-1.5 text-center text-xs font-medium text-pink-500">
              已加入痛柜
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCollect(item.id);
              }}
              className="w-full rounded-lg border border-pink-200 bg-white py-1.5 text-xs font-medium text-pink-500 transition hover:bg-pink-50 active:bg-pink-100"
            >
              ＋ 加入痛柜
            </button>
          )}
        </div>
      )}
    </div>
  );
}
