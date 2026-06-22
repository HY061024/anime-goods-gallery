"use client";

import Link from "next/link";
import type { InspirationPost } from "@/data/inspiration";
import { TYPE_LABELS, TYPE_COLORS } from "@/data/inspiration";

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

export default function InspirationCard({
  post,
  authorName,
  authorAvatar,
  liked,
  favorited,
  onLike,
  onFavorite,
}: {
  post: InspirationPost;
  authorName?: string;
  authorAvatar?: string | null;
  liked?: boolean;
  favorited?: boolean;
  onLike?: (postId: number) => Promise<unknown> | void;
  onFavorite?: (postId: number) => Promise<unknown> | void;
}) {
  const imageUrls = post.image_urls ?? [];
  const isVideo = post.type === "video";
  const isMultiImage = imageUrls.length >= 2;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-pink-100 transition hover:-translate-y-1 hover:shadow-lg hover:border-pink-200">
      {/* 封面图 - 可点击进入详情 */}
      <Link href={`/inspiration/${post.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
          {post.cover_url ? (
            <img
              src={post.cover_url}
              alt={post.title}
              className="h-full w-full object-cover transition group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-4xl text-pink-300">
                {isVideo ? "🎬" : post.type === "note" ? "📝" : post.type === "material" ? "📦" : "❓"}
              </span>
            </div>
          )}

          {/* 左上角标签组 */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {/* 类型标签 */}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium shadow-sm backdrop-blur-sm ${TYPE_COLORS[post.type]}`}
            >
              {TYPE_LABELS[post.type]}
            </span>
            {/* 视频额外标签 */}
            {isVideo && post.video_url && (
              <span className="rounded-full bg-red-500/80 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm backdrop-blur-sm">
                视频
              </span>
            )}
            {/* 多图标签 */}
            {isMultiImage && (
              <span className="rounded-full bg-purple-500/70 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm backdrop-blur-sm">
                多图 · {imageUrls.length}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* 信息区域 - 在封面 Link 外面，避免 <a> 嵌套 */}
      <div className="p-3">
        <Link
          href={`/inspiration/${post.id}`}
          className="block group/title"
        >
          <h2 className="line-clamp-1 text-sm font-semibold text-slate-800 group-hover/title:text-pink-600 transition-colors">
            {post.title || post.content.slice(0, 50) || "无标题"}
          </h2>
        </Link>

        {post.work && (
          <p className="mt-1 text-xs text-slate-500">
            {post.work}
            {post.character ? ` / ${post.character}` : ""}
          </p>
        )}

        {/* 标签（最多展示 3 个，可点击） */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/inspiration?tag=${encodeURIComponent(tag)}`}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 hover:bg-pink-100 hover:text-pink-600 transition"
              >
                #{tag}
              </Link>
            ))}
            {post.tags.length > 3 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center gap-3 px-3 pb-3">
        {/* 作者信息 */}
        <Link
          href={`/users/${post.user_id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-slate-400 hover:text-pink-500 transition-colors"
        >
          <span className="h-5 w-5 shrink-0 overflow-hidden rounded-full bg-pink-100">
            {authorAvatar ? (
              <img src={authorAvatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[10px] text-pink-400">
                {(authorName ?? "?")[0]}
              </span>
            )}
          </span>
          <span className="truncate">{authorName ?? `用户${post.user_id.slice(0, 6)}`}</span>
          <span>· {relativeTime(post.created_at)}</span>
        </Link>

        {/* 赞 / 收藏 */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onLike?.(post.id);
          }}
          className={`flex items-center gap-1 text-xs transition-colors ${
            liked ? "text-red-500" : "text-slate-400 hover:text-red-400"
          }`}
        >
          <svg className="h-4 w-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {post.like_count > 0 && <span>{post.like_count}</span>}
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavorite?.(post.id);
          }}
          className={`flex items-center gap-1 text-xs transition-colors ${
            favorited ? "text-yellow-500" : "text-slate-400 hover:text-yellow-400"
          }`}
        >
          <svg className="h-4 w-4" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {post.favorite_count > 0 && <span>{post.favorite_count}</span>}
        </button>

        {/* 评论数 */}
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {post.comment_count > 0 && <span>{post.comment_count}</span>}
        </span>
      </div>
    </div>
  );
}
