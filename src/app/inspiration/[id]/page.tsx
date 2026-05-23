import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { getInspirationPostById, getInspirationPostAuthors } from "@/lib/inspiration";
import { getComments, getLikedPostIds, getFavoritedPostIds } from "@/lib/inspirationComments";
import { TYPE_LABELS, TYPE_COLORS } from "@/data/inspiration";
import { addComment, removeComment, likePost, favoritePost, deletePost } from "../actions";
import CommentSection from "@/components/CommentSection";
import { DeletePostButton } from "./DeletePostButton";
import { LikeButton } from "./LikeButton";
import { FavoriteButton } from "./FavoriteButton";

type Props = {
  params: Promise<{ id: string }>;
};

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

export default async function InspirationDetailPage({ params }: Props) {
  const { id } = await params;
  const postId = Number(id);

  if (isNaN(postId)) notFound();

  const [post, supabase] = await Promise.all([
    getInspirationPostById(postId),
    createClient(),
  ]);

  if (!post) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  const comments = await getComments(postId);

  const allAuthorIds = [post.user_id, ...comments.map((c) => c.user_id)];
  const authors = await getInspirationPostAuthors(allAuthorIds);

  const isOwner = user?.id === post.user_id;

  let liked = false;
  let favorited = false;
  if (user) {
    const [likedIds, favoritedIds] = await Promise.all([
      getLikedPostIds(user.id, [postId]),
      getFavoritedPostIds(user.id, [postId]),
    ]);
    liked = likedIds.has(postId);
    favorited = favoritedIds.has(postId);
  }

  const author = authors.get(post.user_id);
  const addCommentAction = addComment.bind(null, postId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/inspiration" className="text-sm font-medium text-pink-500 transition hover:text-pink-600">
        ← 返回灵感广场
      </Link>

      {/* 类型标签 + 时间 */}
      <div className="mt-4 flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[post.type]}`}>
          {TYPE_LABELS[post.type]}
        </span>
        <span className="text-xs text-slate-400">{relativeTime(post.created_at)}</span>
        {post.visibility === "private" && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">仅自己可见</span>
        )}
      </div>

      {/* 标题 */}
      {post.title && (
        <h1 className="mt-3 text-2xl font-bold text-slate-800">{post.title}</h1>
      )}

      {/* 作者信息 */}
      <div className="mt-4 flex items-center gap-2">
        <Link href={`/users/${post.user_id}`} className="flex items-center gap-2 hover:opacity-80 transition">
          <span className="h-8 w-8 overflow-hidden rounded-full bg-pink-100">
            {author?.avatarUrl ? (
              <img src={author.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm text-pink-400">
                {(author?.displayName ?? "?")[0]}
              </span>
            )}
          </span>
          <span className="text-sm font-medium text-slate-800">
            {author?.displayName ?? `用户${post.user_id.slice(0, 6)}`}
          </span>
        </Link>
        {isOwner && <DeletePostButton postId={postId} onDelete={deletePost} />}
      </div>

      {/* 封面图 */}
      {post.cover_url && (
        <div className="mt-4 overflow-hidden rounded-2xl">
          <img src={post.cover_url} alt="" className="w-full object-cover max-h-96" />
        </div>
      )}

      {/* 视频嵌入 */}
      {post.type === "video" && post.video_url && (
        <div className="mt-4 overflow-hidden rounded-2xl bg-black aspect-video">
          {post.video_url.includes("bilibili.com") ? (
            <iframe
              src={post.video_url
                .replace("https://www.bilibili.com/video/", "https://player.bilibili.com/player.html?bvid=")
                .replace("https://b23.tv/", "https://player.bilibili.com/player.html?bvid=")
                .split("?")[0]}
              className="h-full w-full"
              allowFullScreen
            />
          ) : (
            <video src={post.video_url} controls className="h-full w-full" />
          )}
        </div>
      )}

      {/* 内容 */}
      <div className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
        {post.content}
      </div>

      {/* 素材链接 */}
      {post.type === "material" && post.material_url && (
        <div className="mt-4">
          <a
            href={post.material_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            下载素材
          </a>
        </div>
      )}

      {/* 关联信息 */}
      <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
        {post.work && <span>作品：{post.work}</span>}
        {post.character && <span>角色：{post.character}</span>}
        {post.related_item_id && (
          <Link href={`/items/${post.related_item_id}`} className="text-pink-500 hover:underline">
            查看关联周边 →
          </Link>
        )}
      </div>

      {/* 标签 */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/inspiration?tag=${encodeURIComponent(tag)}`}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500 hover:bg-pink-50 hover:text-pink-500 transition"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* 操作栏 */}
      <div className="mt-6 flex items-center gap-4 border-t border-pink-100 pt-4">
        <LikeButton postId={postId} liked={liked} likeCount={post.like_count} onLike={likePost} />
        <FavoriteButton postId={postId} favorited={favorited} favoriteCount={post.favorite_count} onFavorite={favoritePost} />
      </div>

      {/* 评论 */}
      <div className="mt-8 border-t border-pink-100 pt-6">
        <CommentSection
          comments={comments}
          authors={authors}
          currentUserId={user?.id}
          onAddComment={addCommentAction}
          onDeleteComment={removeComment}
        />
      </div>
    </div>
  );
}
