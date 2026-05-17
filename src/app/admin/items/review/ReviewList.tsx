"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useTransition } from "react";
import type { Item } from "@/data/items";
import {
  approveItem,
  rejectItem,
  approveDeleteRequest,
  rejectDeleteRequest,
} from "../../reviewActions";

const PENDING_MARKER = "[待审核]";
const DELETE_MARKER = "[申请删除]";

function stripMarker(desc: string) {
  if (desc.startsWith(PENDING_MARKER)) return desc.slice(PENDING_MARKER.length);
  if (desc.startsWith(DELETE_MARKER)) return desc.slice(DELETE_MARKER.length);
  return desc;
}

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

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function ReviewList({
  submissions,
  deleteRequests,
}: {
  submissions: Item[];
  deleteRequests: Item[];
}) {
  const [tab, setTab] = useState<"submissions" | "deleteRequests">(
    submissions.length > 0 ? "submissions" : "deleteRequests"
  );
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [localSubmissions, setLocalSubmissions] = useState(submissions);
  const [localDeletes, setLocalDeletes] = useState(deleteRequests);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [errorId, setErrorId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const items = tab === "submissions" ? localSubmissions : localDeletes;

  function removeItem(id: number) {
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      if (tab === "submissions") {
        setLocalSubmissions((prev) => prev.filter((i) => i.id !== id));
      } else {
        setLocalDeletes((prev) => prev.filter((i) => i.id !== id));
      }
      if (expandedId === id) setExpandedId(null);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 200);
  }

  async function handleAction(id: number, action: (fd: FormData) => Promise<{ error: string } | undefined>) {
    setErrorId(null);
    setErrorMsg("");
    const fd = new FormData();
    fd.set("id", String(id));
    startTransition(async () => {
      const result = await action(fd);
      if (result?.error) {
        setErrorId(id);
        setErrorMsg(result.error);
      } else {
        removeItem(id);
      }
    });
  }

  if (localSubmissions.length === 0 && localDeletes.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
        <p className="text-lg font-semibold text-gray-900">暂无待审核内容</p>
        <p className="mt-2 text-sm text-gray-500">所有投稿和删除申请都已处理完毕</p>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-gray-100">
        <button
          onClick={() => { setTab("submissions"); setExpandedId(null); }}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            tab === "submissions"
              ? "bg-pink-500 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          待审核投稿
          {localSubmissions.length > 0 && (
            <span className={`ml-1.5 rounded-full px-2 py-0.5 text-xs ${
              tab === "submissions" ? "bg-pink-400" : "bg-gray-100"
            }`}>
              {localSubmissions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setTab("deleteRequests"); setExpandedId(null); }}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            tab === "deleteRequests"
              ? "bg-pink-500 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          删除申请
          {localDeletes.length > 0 && (
            <span className={`ml-1.5 rounded-full px-2 py-0.5 text-xs ${
              tab === "deleteRequests" ? "bg-pink-400" : "bg-gray-100"
            }`}>
              {localDeletes.length}
            </span>
          )}
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.map((item) => {
          const isExpanded = expandedId === item.id;
          const isRemoving = removingIds.has(item.id);
          const cleanDesc = stripMarker(item.description);
          const isDelete = item.description.startsWith(DELETE_MARKER);

          return (
            <div
              key={item.id}
              className={`rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-200 ${
                isRemoving ? "scale-95 opacity-0" : ""
              }`}
            >
              {/* Collapsed row — always visible */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="flex w-full items-center gap-4 p-4 text-left"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {isDelete ? (
                      <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                        申请删除
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        待审核
                      </span>
                    )}
                    <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {item.category}
                    </span>
                    <span className="ml-auto shrink-0 text-xs text-gray-400">
                      {item.created_at ? relativeTime(item.created_at) : ""}
                    </span>
                  </div>
                  <h2 className="mt-1 truncate text-sm font-semibold text-gray-900">
                    {item.title}
                  </h2>
                  <p className="truncate text-xs text-gray-500">
                    {item.work} / {item.character}
                    <span className="ml-2 font-medium text-pink-500">¥{item.price}</span>
                  </p>
                </div>

                {/* Expand indicator */}
                <svg
                  className={`h-5 w-5 shrink-0 text-gray-300 transition ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded panel */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                  {/* Larger image */}
                  <div className="mb-4 flex justify-center">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-48 w-48 rounded-xl object-cover ring-1 ring-gray-200"
                    />
                  </div>

                  {/* Detail grid */}
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="text-gray-400">商品标题</dt>
                    <dd className="font-medium text-gray-900">{item.title}</dd>

                    <dt className="text-gray-400">作品名称</dt>
                    <dd className="text-gray-700">{item.work}</dd>

                    <dt className="text-gray-400">角色名称</dt>
                    <dd className="text-gray-700">{item.character}</dd>

                    <dt className="text-gray-400">分类</dt>
                    <dd className="text-gray-700">{item.category}</dd>

                    <dt className="text-gray-400">价格</dt>
                    <dd className="font-medium text-pink-500">¥{item.price}</dd>

                    <dt className="text-gray-400">提交时间</dt>
                    <dd className="text-gray-700" title={item.created_at ? formatDate(item.created_at) : ""}>
                      {item.created_at ? formatDate(item.created_at) : "—"}
                    </dd>

                    <dt className="text-gray-400">提交者</dt>
                    <dd className="font-mono text-xs text-gray-500">
                      {item.submitter_id ? `${item.submitter_id.slice(0, 8)}...` : "—"}
                    </dd>
                  </dl>

                  {cleanDesc && (
                    <div className="mt-3 rounded-xl bg-gray-50 p-3">
                      <p className="text-xs text-gray-400 mb-1">描述</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{cleanDesc}</p>
                    </div>
                  )}

                  {/* Error */}
                  {errorId === item.id && errorMsg && (
                    <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-500">
                      {errorMsg}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="mt-4 flex gap-3">
                    {isDelete ? (
                      <>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleAction(item.id, approveDeleteRequest)}
                          className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
                        >
                          {isPending ? "处理中…" : "确认删除"}
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleAction(item.id, rejectDeleteRequest)}
                          className="flex-1 rounded-xl bg-green-100 py-2.5 text-sm font-medium text-green-700 transition hover:bg-green-200 disabled:opacity-50"
                        >
                          {isPending ? "处理中…" : "恢复条目"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleAction(item.id, approveItem)}
                          className="flex-1 rounded-xl bg-green-500 py-2.5 text-sm font-medium text-white transition hover:bg-green-600 disabled:opacity-50"
                        >
                          {isPending ? "处理中…" : "✓ 通过审核"}
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleAction(item.id, rejectItem)}
                          className="flex-1 rounded-xl bg-red-50 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          {isPending ? "处理中…" : "✗ 拒绝"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
            <p className="text-sm text-gray-400">
              {tab === "submissions" ? "没有待审核投稿" : "没有待处理删除申请"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
