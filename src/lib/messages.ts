import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type Message = {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export type Conversation = {
  userId: string;
  display_name: string | null;
  avatar_url: string | null;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
};

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
): Promise<{ error?: string }> {
  if (!content.trim()) return { error: "消息不能为空" };

  // 验证是否是好友
  const { data: friendship } = await supabaseAdmin
    .from("friendships")
    .select("id")
    .eq("status", "accepted")
    .or(
      `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
    )
    .single();

  if (!friendship) return { error: "只能给好友发送消息" };

  const { error } = await supabaseAdmin.from("messages").insert({
    sender_id: senderId,
    receiver_id: receiverId,
    content: content.trim(),
  });

  if (error) return { error: `发送失败：${error.message}` };
  return {};
}

export async function getConversations(
  userId: string
): Promise<Conversation[]> {
  // 获取当前用户参与的所有消息
  const { data: msgs } = await supabaseAdmin
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(500);

  const partnerMap = new Map<string, Message[]>();

  for (const m of msgs ?? []) {
    const partnerId =
      m.sender_id === userId ? m.receiver_id : m.sender_id;
    if (!partnerMap.has(partnerId)) {
      partnerMap.set(partnerId, []);
    }
    partnerMap.get(partnerId)!.push(m as Message);
  }

  // 获取所有伙伴的 profiles
  const partnerIds = [...partnerMap.keys()];
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("user_id, display_name, avatar_url")
    .in("user_id", partnerIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.user_id, p])
  );

  const conversations: Conversation[] = [];

  for (const [partnerId, msgs] of partnerMap) {
    const lastMsg = msgs[0];
    const profile = profileMap.get(partnerId);
    conversations.push({
      userId: partnerId,
      display_name: profile?.display_name ?? `用户${partnerId.slice(0, 6)}`,
      avatar_url: profile?.avatar_url ?? null,
      lastMessage: lastMsg.content.slice(0, 50),
      lastTime: lastMsg.created_at,
      unreadCount: msgs.filter(
        (m) => m.receiver_id === userId && !m.is_read
      ).length,
    });
  }

  conversations.sort(
    (a, b) =>
      new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()
  );

  return conversations;
}

export async function getMessagesWith(
  userId: string,
  partnerId: string
): Promise<Message[]> {
  const { data } = await supabaseAdmin
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
    )
    .order("created_at", { ascending: true })
    .limit(200);

  return (data ?? []) as Message[];
}

export async function markMessagesRead(
  userId: string,
  partnerId: string
) {
  await supabaseAdmin
    .from("messages")
    .update({ is_read: true })
    .eq("sender_id", partnerId)
    .eq("receiver_id", userId)
    .eq("is_read", false);
}

export async function getTotalUnreadCount(userId: string): Promise<number> {
  const { count } = await supabaseAdmin
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", userId)
    .eq("is_read", false);

  return count ?? 0;
}
