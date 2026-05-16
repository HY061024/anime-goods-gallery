/* eslint-disable @next/next/no-img-element */

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Item } from "@/data/items";
import ReviewButtons from "./ReviewButtons";

export const dynamic = "force-dynamic";

const PENDING_MARKER = "[待审核]";
const DELETE_MARKER = "[申请删除]";

function stripMarker(desc: string) {
  if (desc.startsWith(PENDING_MARKER)) return desc.slice(PENDING_MARKER.length);
  if (desc.startsWith(DELETE_MARKER)) return desc.slice(DELETE_MARKER.length);
  return desc;
}

function getItemType(desc: string): "submission" | "deleteRequest" {
  return desc.startsWith(DELETE_MARKER) ? "deleteRequest" : "submission";
}

export default async function ReviewPage() {
  const { data: items } = await supabaseAdmin
    .from("items")
    .select("*")
    .or(`description.ilike.${PENDING_MARKER}%,description.ilike.${DELETE_MARKER}%`)
    .order("created_at", { ascending: false });

  const pendingItems = (items ?? []) as Item[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">审核管理</h1>
      <p className="mb-8 text-gray-500">
        审核用户提交的周边信息和删除申请
      </p>

      {pendingItems.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-lg font-semibold text-gray-900">暂无待审核内容</p>
          <p className="mt-2 text-gray-500">所有投稿和删除申请都已处理完毕</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingItems.map((item) => {
            const itemType = getItemType(item.description);
            return (
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
                        {itemType === "deleteRequest" ? (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            申请删除
                          </span>
                        ) : (
                          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                            待审核
                          </span>
                        )}
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

                  <ReviewButtons itemId={item.id} type={itemType} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
