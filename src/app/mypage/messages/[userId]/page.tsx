import { createClient } from "@/lib/supabaseServer";
import { getMessagesWith, markMessagesRead } from "@/lib/messages";
import { getProfile } from "@/lib/profiles";
import ChatView from "./ChatView";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ userId: string }>;
};

export default async function ChatPage({ params }: Props) {
  const { userId: partnerId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [messages, partner] = await Promise.all([
    getMessagesWith(user.id, partnerId),
    getProfile(partnerId),
  ]);

  // 标记对方发来的消息为已读
  await markMessagesRead(user.id, partnerId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <ChatView
        currentUserId={user.id}
        partnerId={partnerId}
        partnerName={partner.display_name ?? `用户${partnerId.slice(0, 6)}`}
        initialMessages={messages}
      />
    </div>
  );
}
