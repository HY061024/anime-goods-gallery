import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import { getInspirationPosts, getInspirationPostAuthors, getPopularTags } from "@/lib/inspiration";
import { getLikedPostIds, getFavoritedPostIds } from "@/lib/inspirationComments";
import InspirationCard from "@/components/InspirationCard";
import { TYPE_LABELS, TYPE_COLORS } from "@/data/inspiration";
import type { InspirationType } from "@/data/inspiration";
import { likePost, favoritePost } from "./actions";

type PageProps = {
  searchParams: Promise<{ type?: string; tag?: string }>;
};

export default async function InspirationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeType = params.type as InspirationType | undefined;
  const activeTag = params.tag ?? "";

  const [posts, popularTags, supabase] = await Promise.all([
    getInspirationPosts({ type: activeType, tag: activeTag, limit: 20 }),
    getPopularTags(12),
    createClient(),
  ]);

  const { data: { user } } = await supabase.auth.getUser();

  const authorIds = posts.map((p) => p.user_id).filter(Boolean);
  const [authors] = await Promise.all([getInspirationPostAuthors(authorIds)]);

  let likedIds = new Set<number>();
  let favoritedIds = new Set<number>();
  if (user) {
    const postIds = posts.map((p) => p.id);
    [likedIds, favoritedIds] = await Promise.all([
      getLikedPostIds(user.id, postIds),
      getFavoritedPostIds(user.id, postIds),
    ]);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <Link href="/" className="text-sm font-medium text-pink-500 transition hover:text-pink-600">
          ← 返回首页
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">照影灵感</h1>
        <p className="mt-2 text-gray-500">二次元爱好者的灵感交流社区</p>
      </div>

      {/* 发布按钮 */}
      <div className="mb-6">
        {user ? (
          <Link
            href="/inspiration/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-pink-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-pink-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            发布灵感
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 rounded-xl bg-pink-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-pink-600"
          >
            登录后发布
          </Link>
        )}
      </div>

      {/* 类型筛选 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href="/inspiration"
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            !activeType
              ? "bg-pink-500 text-white"
              : "bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:bg-pink-50 hover:text-pink-500"
          }`}
        >
          全部
        </Link>
        {(Object.entries(TYPE_LABELS) as [InspirationType, string][]).map(([key, label]) => (
          <Link
            key={key}
            href={`/inspiration?type=${key}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              activeType === key
                ? "bg-pink-500 text-white"
                : "bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:bg-pink-50 hover:text-pink-500"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* 热门标签 */}
      {popularTags.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-400">热门标签：</span>
          {popularTags.map((t) => (
            <Link
              key={t.name}
              href={`/inspiration?tag=${encodeURIComponent(t.name)}`}
              className={`rounded-full px-3 py-1 text-xs transition ${
                activeTag === t.name
                  ? "bg-pink-100 text-pink-600 ring-1 ring-pink-300"
                  : "bg-gray-100 text-gray-500 hover:bg-pink-50 hover:text-pink-500"
              }`}
            >
              #{t.name}
              <span className="ml-1 text-gray-300">{t.count}</span>
            </Link>
          ))}
        </div>
      )}

      {/* 帖子网格 */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <InspirationCard
              key={post.id}
              post={post}
              authorName={authors.get(post.user_id)?.displayName}
              authorAvatar={authors.get(post.user_id)?.avatarUrl}
              liked={likedIds.has(post.id)}
              favorited={favoritedIds.has(post.id)}
              onLike={likePost}
              onFavorite={favoritePost}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-lg font-semibold text-gray-900">还没有灵感帖子</p>
          <p className="mt-2 text-gray-500">成为第一个分享灵感的人吧</p>
          <Link href="/inspiration/new" className="mt-4 inline-block text-sm font-medium text-pink-500">
            发布灵感 →
          </Link>
        </div>
      )}
    </div>
  );
}
