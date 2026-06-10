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
import {
  MAX_IMAGES,
  MAX_TITLE_LENGTH,
  MAX_CONTENT_LENGTH,
  processTags,
} from "@/data/inspiration";

// ====== 工具函数 ======

/** 检查 URL 是否是有效的 Supabase Storage 或外部 URL */
function isValidUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// ====== 发布帖子（服务端二次校验） ======

export async function publishPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "请先登录" };

  const type = (formData.get("type") as InspirationType) ?? "note";
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

  // 解析图片 URL 列表（客户端以 JSON 传递或逗号分隔）
  const imageUrlsRaw = formData.get("imageUrls") as string ?? "";
  let imageUrls: string[] = [];
  if (imageUrlsRaw) {
    try {
      const parsed = JSON.parse(imageUrlsRaw);
      imageUrls = Array.isArray(parsed) ? parsed.filter((u): u is string => typeof u === "string" && u.length > 0) : [];
    } catch {
      // 尝试逗号分隔
      imageUrls = imageUrlsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  // ====== 图片校验 ======
  if (imageUrls.length > MAX_IMAGES) {
    return { error: `最多上传 ${MAX_IMAGES} 张图片` };
  }
  for (const url of imageUrls) {
    if (!isValidUrl(url)) {
      return { error: "图片链接无效" };
    }
  }

  // ====== 视频校验 ======
  if (videoUrl) {
    // 外部链接
    if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://")) {
      if (!isValidUrl(videoUrl)) {
        return { error: "视频链接无效" };
      }
    }
    // Storage 上传的视频也是 public URL，已在上面的检查中覆盖
  }

  // ====== 标题校验 ======
  if (type !== "material" && !title.trim()) {
    return { error: "请填写标题" };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { error: `标题最多 ${MAX_TITLE_LENGTH} 个字` };
  }

  // ====== 正文校验 ======
  if (content.length > MAX_CONTENT_LENGTH) {
    return { error: `正文最多 ${MAX_CONTENT_LENGTH} 字` };
  }

  // ====== 空内容检查 ======
  const hasContent = content.trim().length > 0;
  const hasImages = imageUrls.length > 0;
  const hasVideo = videoUrl.length > 0;
  const hasMaterial = type === "material" && materialUrl.length > 0;

  if (!hasContent && !hasImages && !hasVideo && !hasMaterial) {
    return { error: "请填写内容，或上传图片/视频" };
  }

  // ====== 标签校验 ======
  const tagResult = processTags(tagsStr);
  if (tagResult.error) {
    return { error: tagResult.error };
  }

  // ====== 素材链接校验 ======
  if (type === "material" && materialUrl && !isValidUrl(materialUrl)) {
    return { error: "素材链接无效" };
  }

  try {
    const post = await createInspirationPost({
      userId: user.id,
      type,
      title,
      content,
      coverUrl: coverUrl || imageUrls[0] || undefined,
      imageUrls,
      videoUrl: videoUrl || undefined,
      materialUrl: materialUrl || undefined,
      work,
      character,
      tags: tagResult.tags,
      relatedItemId,
      visibility,
    });
    revalidatePath("/inspiration");
    return { success: true, postId: post.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "发布失败" };
  }
}

// ====== 删除帖子 ======

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

// ====== 评论 ======

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

// ====== 点赞 / 收藏 ======

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
