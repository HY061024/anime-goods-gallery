"use client";

import { useTransition } from "react";

export function LikeButton({
  postId,
  liked,
  likeCount,
  onLike,
}: {
  postId: number;
  liked: boolean;
  likeCount: number;
  onLike: (postId: number) => Promise<{ success?: boolean; liked?: boolean; error?: string }>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => { onLike(postId); })}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition ${
        liked
          ? "bg-red-50 text-red-500"
          : "bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-400"
      }`}
    >
      <svg className="h-5 w-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {likeCount > 0 && <span className="font-medium">{likeCount}</span>}
    </button>
  );
}
