import { createClient } from "@/lib/supabaseServer";
import { getConversations } from "@/lib/messages";
import ConversationList from "./ConversationList";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const conversations = await getConversations(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-slate-800">消息</h1>
      <p className="mb-6 text-sm text-slate-500">与好友的私信</p>

      <ConversationList conversations={conversations} />
    </div>
  );
}
