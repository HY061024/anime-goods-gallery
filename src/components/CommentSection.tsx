"use client";

import { useState, useTransition } from "react";
import type { InspirationComment } from "@/data/inspiration";

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

export default function CommentSection({
  comments,
  authors,
  currentUserId,
  onAddComment,
  onDeleteComment,
}: {
  comments: InspirationComment[];
  authors: Map<string, { displayName: string; avatarUrl: string | null }>;
  currentUserId?: string;
  onAddComment?: (content: string) => Promise<unknown>;
  onDeleteComment?: (commentId: number) => Promise<unknown>;
}) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !onAddComment) return;
    startTransition(async () => {
      await onAddComment(text.trim());
      setText("");
    });
  }

  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        评论 ({comments.length})
      </h3>

      {/* 评论列表 */}
      {comments.length > 0 ? (
        <div className="space-y-3 mb-4">
          {comments.map((c) => {
            const author = authors.get(c.user_id);
            const isOwner = currentUserId === c.user_id;
            return (
              <div key={c.id} className="flex gap-2">
                <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-pink-100">
                  {author?.avatarUrl ? (
                    <img src={author.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] text-pink-400">
                      {(author?.displayName ?? "?")[0]}
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs">
                    <span className="font-medium text-gray-900">
                      {author?.displayName ?? `用户${c.user_id.slice(0, 6)}`}
                    </span>
                    <span className="ml-1.5 text-gray-400">{relativeTime(c.created_at)}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-gray-700">{c.content}</p>
                  {isOwner && onDeleteComment && (
                    <button
                      onClick={async () => {
                        setDeletingId(c.id);
                        await onDeleteComment(c.id);
                        setDeletingId(null);
                      }}
                      disabled={deletingId === c.id}
                      className="mt-0.5 text-[10px] text-gray-400 hover:text-red-500 disabled:opacity-50"
                    >
                      {deletingId === c.id ? "删除中…" : "删除"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mb-4 text-sm text-gray-400">暂无评论，来说两句吧</p>
      )}

      {/* 评论输入框 */}
      {currentUserId && onAddComment ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="写评论…"
            maxLength={500}
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-pink-400"
          />
          <button
            type="submit"
            disabled={isPending || !text.trim()}
            className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-50 transition"
          >
            {isPending ? "发送中…" : "发送"}
          </button>
        </form>
      ) : currentUserId ? null : (
        <p className="text-sm text-gray-400">
          <a href="/auth/login" className="text-pink-500 hover:underline">登录</a> 后即可评论
        </p>
      )}
    </div>
  );
}
