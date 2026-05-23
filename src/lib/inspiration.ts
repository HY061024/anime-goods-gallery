"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { InspirationPost, InspirationType } from "@/data/inspiration";

type ListParams = {
  type?: InspirationType;
  work?: string;
  character?: string;
  tag?: string;
  limit?: number;
  offset?: number;
};

export async function getInspirationPosts({
  type,
  work,
  character,
  tag,
  limit = 20,
  offset = 0,
}: ListParams = {}) {
  let query = supabaseAdmin
    .from("inspiration_posts")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) query = query.eq("type", type);
  if (work) query = query.eq("work", work);
  if (character) query = query.eq("character", character);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let posts = (data ?? []) as InspirationPost[];

  if (tag) {
    posts = posts.filter((p) => p.tags?.includes(tag));
  }

  return posts;
}

export async function getInspirationPostById(id: number) {
  const { data, error } = await supabaseAdmin
    .from("inspiration_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as InspirationPost;
}

export async function createInspirationPost(input: {
  userId: string;
  type: InspirationType;
  title: string;
  content: string;
  coverUrl?: string;
  videoUrl?: string;
  materialUrl?: string;
  work?: string;
  character?: string;
  tags?: string[];
  relatedItemId?: number;
  visibility?: "public" | "private";
}) {
  const { data, error } = await supabaseAdmin
    .from("inspiration_posts")
    .insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      content: input.content,
      cover_url: input.coverUrl ?? null,
      video_url: input.videoUrl ?? null,
      material_url: input.materialUrl ?? null,
      work: input.work ?? "",
      character: input.character ?? "",
      tags: input.tags ?? [],
      related_item_id: input.relatedItemId ?? null,
      visibility: input.visibility ?? "public",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as InspirationPost;
}

export async function updateInspirationPost(
  id: number,
  userId: string,
  updates: {
    title?: string;
    content?: string;
    coverUrl?: string;
    videoUrl?: string;
    materialUrl?: string;
    work?: string;
    character?: string;
    tags?: string[];
    relatedItemId?: number;
    visibility?: "public" | "private";
  }
) {
  const mapped: Record<string, unknown> = {};
  if (updates.title !== undefined) mapped.title = updates.title;
  if (updates.content !== undefined) mapped.content = updates.content;
  if (updates.coverUrl !== undefined) mapped.cover_url = updates.coverUrl;
  if (updates.videoUrl !== undefined) mapped.video_url = updates.videoUrl;
  if (updates.materialUrl !== undefined) mapped.material_url = updates.materialUrl;
  if (updates.work !== undefined) mapped.work = updates.work;
  if (updates.character !== undefined) mapped.character = updates.character;
  if (updates.tags !== undefined) mapped.tags = updates.tags;
  if (updates.relatedItemId !== undefined) mapped.related_item_id = updates.relatedItemId;
  if (updates.visibility !== undefined) mapped.visibility = updates.visibility;

  const { error } = await supabaseAdmin
    .from("inspiration_posts")
    .update(mapped)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function deleteInspirationPost(id: number, userId: string) {
  const { error } = await supabaseAdmin
    .from("inspiration_posts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function getUserInspirationPosts(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("inspiration_posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as InspirationPost[];
}

export async function getInspirationPostAuthors(
  userIds: string[]
): Promise<Map<string, { displayName: string; avatarUrl: string | null }>> {
  const infos = new Map<string, { displayName: string; avatarUrl: string | null }>();
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return infos;

  const { data } = await supabaseAdmin
    .from("profiles")
    .select("user_id, display_name, avatar_url")
    .in("user_id", unique);

  for (const row of data ?? []) {
    infos.set(row.user_id, {
      displayName: row.display_name ?? `用户${row.user_id.slice(0, 6)}`,
      avatarUrl: row.avatar_url ?? null,
    });
  }

  for (const id of unique) {
    if (!infos.has(id)) {
      infos.set(id, { displayName: `用户${id.slice(0, 6)}`, avatarUrl: null });
    }
  }

  return infos;
}

export async function getPopularTags(limit = 20) {
  const { data } = await supabaseAdmin
    .from("inspiration_posts")
    .select("tags")
    .eq("visibility", "public");

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    for (const tag of row.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}
