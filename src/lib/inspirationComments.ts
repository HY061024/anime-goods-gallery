"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { InspirationComment } from "@/data/inspiration";

export async function getComments(postId: number) {
  const { data, error } = await supabaseAdmin
    .from("inspiration_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as InspirationComment[];
}

export async function createComment(postId: number, userId: string, content: string) {
  const { data, error } = await supabaseAdmin
    .from("inspiration_comments")
    .insert({ post_id: postId, user_id: userId, content })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  // 更新评论计数
  const { count } = await supabaseAdmin
    .from("inspiration_comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  await supabaseAdmin
    .from("inspiration_posts")
    .update({ comment_count: count ?? 0 })
    .eq("id", postId);

  return data as InspirationComment;
}

export async function deleteComment(commentId: number, userId: string) {
  const { data: comment } = await supabaseAdmin
    .from("inspiration_comments")
    .select("post_id")
    .eq("id", commentId)
    .maybeSingle();

  const { error } = await supabaseAdmin
    .from("inspiration_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  if (comment) {
    const { count } = await supabaseAdmin
      .from("inspiration_comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", comment.post_id);

    await supabaseAdmin
      .from("inspiration_posts")
      .update({ comment_count: count ?? 0 })
      .eq("id", comment.post_id);
  }
}

export async function toggleLike(postId: number, userId: string) {
  const { data: existing } = await supabaseAdmin
    .from("inspiration_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from("inspiration_likes")
      .delete()
      .eq("id", existing.id);

    const { count } = await supabaseAdmin
      .from("inspiration_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    await supabaseAdmin
      .from("inspiration_posts")
      .update({ like_count: count ?? 0 })
      .eq("id", postId);

    return false;
  } else {
    await supabaseAdmin
      .from("inspiration_likes")
      .insert({ post_id: postId, user_id: userId });

    const { count } = await supabaseAdmin
      .from("inspiration_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    await supabaseAdmin
      .from("inspiration_posts")
      .update({ like_count: count ?? 0 })
      .eq("id", postId);

    return true;
  }
}

export async function toggleFavorite(postId: number, userId: string) {
  const { data: existing } = await supabaseAdmin
    .from("inspiration_favorites")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from("inspiration_favorites")
      .delete()
      .eq("id", existing.id);

    const { count } = await supabaseAdmin
      .from("inspiration_favorites")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    await supabaseAdmin
      .from("inspiration_posts")
      .update({ favorite_count: count ?? 0 })
      .eq("id", postId);

    return false;
  } else {
    await supabaseAdmin
      .from("inspiration_favorites")
      .insert({ post_id: postId, user_id: userId });

    const { count } = await supabaseAdmin
      .from("inspiration_favorites")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    await supabaseAdmin
      .from("inspiration_posts")
      .update({ favorite_count: count ?? 0 })
      .eq("id", postId);

    return true;
  }
}

export async function getLikedPostIds(userId: string, postIds: number[]) {
  if (postIds.length === 0) return new Set<number>();
  const { data } = await supabaseAdmin
    .from("inspiration_likes")
    .select("post_id")
    .eq("user_id", userId)
    .in("post_id", postIds);

  return new Set((data ?? []).map((r) => r.post_id));
}

export async function getFavoritedPostIds(userId: string, postIds: number[]) {
  if (postIds.length === 0) return new Set<number>();
  const { data } = await supabaseAdmin
    .from("inspiration_favorites")
    .select("post_id")
    .eq("user_id", userId)
    .in("post_id", postIds);

  return new Set((data ?? []).map((r) => r.post_id));
}
