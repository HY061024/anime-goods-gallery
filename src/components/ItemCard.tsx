/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { Item } from "@/data/items";

export default function ItemCard({ item }: { item: Item }) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-lg hover:ring-pink-200"
    >
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
      <div className="p-4">
        <h2 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
          {item.title}
        </h2>

        <p className="mt-1.5 text-xs text-gray-500">
          {item.work}
          {item.character ? ` / ${item.character}` : ""}
        </p>
      </div>
    </Link>
  );
}
