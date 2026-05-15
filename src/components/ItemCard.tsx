/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { Item } from "@/data/items";

export default function ItemCard({ item }: { item: Item }) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <img
        src={item.image}
        alt={item.title}
        className="aspect-square w-full object-cover"
      />

      <div className="space-y-2 p-4">
        <h2 className="line-clamp-2 text-sm font-semibold text-gray-900">
          {item.title}
        </h2>

        <p className="text-xs text-gray-900">
          {item.work} / {item.character}
        </p>

        <div className="flex items-center justify-between text-xs">
          <span className="rounded-full bg-pink-50 px-2 py-1 text-pink-600">
            {item.category}
          </span>

          <span className="font-medium text-gray-900">¥{item.price}</span>
        </div>
      </div>
    </Link>
  );
}