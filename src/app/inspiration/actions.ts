"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabaseAction";
import {
  createInspirationPost,
  deleteInspirationPost,
} from "@/lib/inspiration";
import {
  createComment,
  deleteComment,
  toggleLike,
  toggleFavorite,
} from "@/lib/inspirationComments";
import type { InspirationType } from "@/data/inspiration";

export async function publishPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "请先登录" };

  const type = formData.get("type") as InspirationType;
  const title = (formData.get("title") as string) ?? "";
  const content = (formData.get("content") as string) ?? "";
  const coverUrl = (formData.get("coverUrl") as string) ?? "";
  const videoUrl = (formData.get("videoUrl") as string) ?? "";
  const materialUrl = (formData.get("materialUrl") as string) ?? "";
  const work = (formData.get("work") as string) ?? "";
  const character = (formData.get("character") as string) ?? "";
  const tagsStr = (formData.get("tags") as string) ?? "";
  const relatedItemId = formData.get("relatedItemId") ? Number(formData.get("relatedItemId")) : undefined;
  const visibility = (formData.get("visibility") as "public" | "private") ?? "public";

  const tags = tagsStr
    .split(/[,，\s]+/)
    .map((t) => t.replace(/^#/, "").trim())
    .filter(Boolean);

  try {
    const post = await createInspirationPost({
      userId: user.id,
      type,
      title,
      content,
      coverUrl: coverUrl || undefined,
      videoUrl: videoUrl || undefined,
      materialUrl: materialUrl || undefined,
      work,
      character,
      tags,
      relatedItemId,
      visibility,
    });
    revalidatePath("/inspiration");
    return { success: true, postId: post.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "发布失败" };
  }
}

export async function deletePost(postId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "请先登录" };

  try {
    await deleteInspirationPost(postId, user.id);
    revalidatePath("/inspiration");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "删除失败" };
  }
}

export async function addComment(postId: number, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "请先登录" };

  try {
    await createComment(postId, user.id, content);
    revalidatePath(`/inspiration/${postId}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "评论失败" };
  }
}

export async function removeComment(commentId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "请先登录" };

  try {
    await deleteComment(commentId, user.id);
    revalidatePath("/inspiration/[id]", "layout");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "删除失败" };
  }
}

export async function likePost(postId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "请先登录" };

  try {
    const liked = await toggleLike(postId, user.id);
    revalidatePath("/inspiration");
    revalidatePath(`/inspiration/${postId}`);
    return { success: true, liked };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "操作失败" };
  }
}

export async function favoritePost(postId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "请先登录" };

  try {
    const favorited = await toggleFavorite(postId, user.id);
    revalidatePath("/inspiration");
    revalidatePath(`/inspiration/${postId}`);
    return { success: true, favorited };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "操作失败" };
  }
}
