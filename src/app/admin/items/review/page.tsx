/* eslint-disable @next/next/no-img-element */

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Item } from "@/data/items";
import ReviewButtons from "./ReviewButtons";

export const dynamic = "force-dynamic";

const PENDING_MARKER = "[待审核]";

function stripMarker(desc: string) {
  return desc.startsWith(PENDING_MARKER) ? desc.slice(PENDING_MARKER.length) : desc;
}

export default async function ReviewPage() {
  const { data: items } = await supabaseAdmin
    .from("items")
    .select("*")
    .ilike("description", `${PENDING_MARKER}%`)
    .order("created_at", { ascending: false });

  const pendingItems = (items ?? []) as Item[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">审核投稿</h1>
      <p className="mb-8 text-gray-500">
        审核用户提交的周边信息，通过后会在图鉴中公开展示
      </p>

      {pendingItems.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-lg font-semibold text-gray-900">暂无待审核投稿</p>
          <p className="mt-2 text-gray-500">所有投稿都已处理完毕</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingItems.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
            >
              <div className="flex gap-4 p-4">
                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                        待审核
                      </span>
                      <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        {item.category}
                      </span>
                    </div>
                    <h2 className="mt-1.5 font-semibold text-gray-900">{item.title}</h2>
                    <p className="text-sm text-gray-500">
                      {item.work} / {item.character}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-pink-500">¥{item.price}</p>
                  </div>
                  {(item.description && stripMarker(item.description)) && (
                    <p className="mt-1 text-xs text-gray-400 line-clamp-1">{stripMarker(item.description)}</p>
                  )}
                </div>

                <ReviewButtons itemId={item.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
