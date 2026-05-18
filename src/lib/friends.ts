"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type FriendshipStatus = "pending" | "accepted" | "rejected";

export type Friendship = {
  id: number;
  sender_id: string;
  receiver_id: string;
  status: FriendshipStatus;
  created_at: string;
};

export type FriendInfo = {
  user_id: string;
  email?: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export type PendingRequest = Friendship & {
  sender_display_name: string;
  sender_avatar_url: string | null;
  receiver_display_name: string;
  receiver_avatar_url: string | null;
};

export async function sendFriendRequest(
  senderId: string,
  receiverId: string
): Promise<{ error?: string }> {
  if (senderId === receiverId) return { error: "不能添加自己为好友" };

  const { data: existing } = await supabaseAdmin
    .from("friendships")
    .select("id, status, sender_id, receiver_id")
    .or(`sender_id.eq.${senderId},receiver_id.eq.${senderId}`)
    .or(`sender_id.eq.${receiverId},receiver_id.eq.${receiverId}`);

  const overlap = (existing ?? []).find(
    (f) =>
      (f.sender_id === senderId && f.receiver_id === receiverId) ||
      (f.sender_id === receiverId && f.receiver_id === senderId)
  );

  if (overlap) {
    if (overlap.status === "accepted") return { error: "已是好友" };
    if (overlap.status === "pending") return { error: "已发送过好友请求" };
    // rejected → allow re-send
    await supabaseAdmin.from("friendships").delete().eq("id", overlap.id);
  }

  const { error } = await supabaseAdmin.from("friendships").insert({
    sender_id: senderId,
    receiver_id: receiverId,
    status: "pending",
  });

  if (error) return { error: `发送失败：${error.message}` };
  return {};
}

export async function acceptFriendRequest(
  friendshipId: number,
  userId: string
): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId)
    .eq("receiver_id", userId)
    .eq("status", "pending");

  if (error) return { error: `操作失败：${error.message}` };
  return {};
}

export async function rejectFriendRequest(
  friendshipId: number,
  userId: string
): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin
    .from("friendships")
    .delete()
    .eq("id", friendshipId)
    .eq("receiver_id", userId)
    .eq("status", "pending");

  if (error) return { error: `操作失败：${error.message}` };
  return {};
}

export async function getFriends(userId: string): Promise<FriendInfo[]> {
  const { data } = await supabaseAdmin
    .from("friendships")
    .select("sender_id, receiver_id")
    .eq("status", "accepted")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

  const friendIds = (data ?? []).map((f) =>
    f.sender_id === userId ? f.receiver_id : f.sender_id
  );

  if (friendIds.length === 0) return [];

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("user_id, display_name, avatar_url, bio")
    .in("user_id", friendIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.user_id, p])
  );

  return friendIds.map((id) => ({
    user_id: id,
    display_name: profileMap.get(id)?.display_name ?? null,
    avatar_url: profileMap.get(id)?.avatar_url ?? null,
    bio: profileMap.get(id)?.bio ?? null,
  }));
}

export async function getPendingRequests(
  userId: string
): Promise<{ incoming: PendingRequest[]; outgoing: PendingRequest[] }> {
  const { data: incoming } = await supabaseAdmin
    .from("friendships")
    .select("*")
    .eq("receiver_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const { data: outgoing } = await supabaseAdmin
    .from("friendships")
    .select("*")
    .eq("sender_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const rawIncoming = (incoming ?? []) as Friendship[];
  const rawOutgoing = (outgoing ?? []) as Friendship[];

  // 收集所有需要查 profiles 的 user ID
  const allUserIds = new Set<string>();
  for (const r of rawIncoming) allUserIds.add(r.sender_id);
  for (const r of rawOutgoing) allUserIds.add(r.receiver_id);

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("user_id, display_name, avatar_url")
    .in("user_id", [...allUserIds]);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.user_id, p])
  );

  function fallback(id: string) {
    return profileMap.get(id)?.display_name ?? `用户${id.slice(0, 6)}`;
  }

  return {
    incoming: rawIncoming.map((r) => ({
      ...r,
      sender_display_name: fallback(r.sender_id),
      sender_avatar_url: profileMap.get(r.sender_id)?.avatar_url ?? null,
      receiver_display_name: fallback(userId),
      receiver_avatar_url: null,
    })),
    outgoing: rawOutgoing.map((r) => ({
      ...r,
      sender_display_name: fallback(userId),
      sender_avatar_url: null,
      receiver_display_name: fallback(r.receiver_id),
      receiver_avatar_url: profileMap.get(r.receiver_id)?.avatar_url ?? null,
    })),
  };
}

export async function getFriendshipStatus(
  userId: string,
  otherId: string
): Promise<FriendshipStatus | null> {
  const { data } = await supabaseAdmin
    .from("friendships")
    .select("sender_id, receiver_id, status")
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`
    );

  const row = (data ?? [])[0];
  return row ? (row.status as FriendshipStatus) : null;
}

export async function removeFriend(
  userId: string,
  friendId: string
): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin
    .from("friendships")
    .delete()
    .eq("status", "accepted")
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`
    );

  if (error) return { error: `操作失败：${error.message}` };
  return {};
}
