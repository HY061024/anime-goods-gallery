"use client";

import { useTransition } from "react";

export function FavoriteButton({
  postId,
  favorited,
  favoriteCount,
  onFavorite,
}: {
  postId: number;
  favorited: boolean;
  favoriteCount: number;
  onFavorite: (postId: number) => Promise<{ success?: boolean; favorited?: boolean; error?: string }>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => { onFavorite(postId); })}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition ${
        favorited
          ? "bg-yellow-50 text-yellow-500"
          : "bg-gray-50 text-gray-500 hover:bg-yellow-50 hover:text-yellow-400"
      }`}
    >
      <svg className="h-5 w-5" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      {favoriteCount > 0 && <span className="font-medium">{favoriteCount}</span>}
    </button>
  );
}
