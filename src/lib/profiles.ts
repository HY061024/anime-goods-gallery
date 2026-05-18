"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type Profile = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  cabinet_public: boolean;
  cabinet_views: number;
  created_at: string;
};

export type ProfileUpdates = {
  display_name?: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  cabinet_public?: boolean;
};

export async function getProfile(userId: string): Promise<Profile> {
  // 先查是否已有
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (data) return data as Profile;

  // 不存在则创建
  const { data: created, error } = await supabaseAdmin
    .from("profiles")
    .insert({ user_id: userId })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return created as Profile;
}

export async function incrementCabinetViews(userId: string) {
  const { error } = await supabaseAdmin.rpc("increment_cabinet_views", {
    target_user_id: userId,
  });

  if (error) throw new Error(error.message);
}

export async function updateProfile(
  userId: string,
  updates: ProfileUpdates
) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function getSubmitterNames(userIds: string[]): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return names;

  const { data } = await supabaseAdmin
    .from("profiles")
    .select("user_id, display_name")
    .in("user_id", unique);

  for (const row of data ?? []) {
    names.set(row.user_id, row.display_name ?? `用户${row.user_id.slice(0, 6)}`);
  }

  // 没找到的用户也设置默认名
  for (const id of unique) {
    if (!names.has(id)) {
      names.set(id, `用户${id.slice(0, 6)}`);
    }
  }

  return names;
}

export async function getPublicCabinet(userId: string) {
  // 检查痛柜是否公开
  const profile = await getProfile(userId);
  if (!profile.cabinet_public) return null;

  // 查收藏 + 私密上传
  const { data: refs } = await supabaseAdmin
    .from("user_collections")
    .select("item_id")
    .eq("user_id", userId);

  const collectedIds = (refs ?? []).map((r) => r.item_id);

  // 私密上传的
  const { data: privateItems } = await supabaseAdmin
    .from("items")
    .select("*")
    .eq("submitter_id", userId)
    .eq("visibility", "private")
    .order("created_at", { ascending: false });

  // 收藏的公开商品
  let collectedItems: unknown[] = [];
  if (collectedIds.length > 0) {
    const { data } = await supabaseAdmin
      .from("items")
      .select("*")
      .in("id", collectedIds);
    collectedItems = data ?? [];
  }

  return {
    profile,
    items: [...(privateItems ?? []), ...collectedItems],
  };
}
