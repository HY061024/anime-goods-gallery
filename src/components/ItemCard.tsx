"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { Item } from "@/data/items";
import { getItemMainImage } from "@/data/items";

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
  submitterId,
  submitterAvatar,
  showCollectButton = false,
  collected = false,
  onCollect,
}: {
  item: Item;
  submitterName?: string;
  submitterId?: string;
  submitterAvatar?: string | null;
  showCollectButton?: boolean;
  collected?: boolean;
  onCollect?: (itemId: number) => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-pink-100 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/items/${item.id}`} className="block">
        {/* 图片区域 */}
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          <img
            src={getItemMainImage(item)}
            alt={item.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />

          {/* 分类标签 */}
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-pink-500 shadow-sm backdrop-blur-sm">
            {item.category}
          </span>

          {/* 图片类型标签 */}
          {item.real_image_url ? (
            <span className="absolute left-2 bottom-2 rounded-full bg-green-500/85 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm backdrop-blur-sm">
              实拍
            </span>
          ) : item.official_image_url ? (
            <span className="absolute left-2 bottom-2 rounded-full bg-blue-500/85 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm backdrop-blur-sm">
              官图
            </span>
          ) : null}

          {/* 价格标签 */}
          <span className="absolute bottom-2 right-2 rounded-full bg-gray-900/80 px-2.5 py-1 text-sm font-bold text-white backdrop-blur-sm">
            ¥{item.price}
          </span>
        </div>

        {/* 信息区域 */}
        <div className="p-3">
          <h2 className="line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-pink-600 transition-colors">
            {item.title}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {item.work}
            {item.character ? ` / ${item.character}` : ""}
          </p>

          {/* 提交者 + 时间 */}
          {submitterId ? (
            <Link
              href={`/users/${submitterId}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400 hover:text-pink-500 transition-colors"
            >
              <span className="h-5 w-5 shrink-0 overflow-hidden rounded-full bg-pink-100">
                {submitterAvatar ? (
                  <img src={submitterAvatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[10px] text-pink-400">
                    {(submitterName ?? "?")[0]}
                  </span>
                )}
              </span>
              <span>{submitterName ?? `用户${submitterId.slice(0, 6)}`}</span>
              {item.created_at && <span>· {relativeTime(item.created_at)}</span>}
            </Link>
          ) : submitterName ? (
            <p className="mt-1.5 text-xs text-slate-400">
              {submitterName}
              {item.created_at ? ` · ${relativeTime(item.created_at)}` : ""}
            </p>
          ) : null}
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
