import { createClient } from "@/lib/supabaseServer";
import { getFriends, getPendingRequests } from "@/lib/friends";
import { getProfile } from "@/lib/profiles";
import FriendList from "./FriendList";

export const dynamic = "force-dynamic";

export default async function FriendsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [friends, pending] = await Promise.all([
    getFriends(user.id),
    getPendingRequests(user.id),
  ]);

  const profile = await getProfile(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">好友</h1>
      <p className="mb-6 text-sm text-gray-500">管理好友和请求</p>

      <FriendList
        friends={friends}
        incoming={pending.incoming}
        outgoing={pending.outgoing}
        currentUserId={user.id}
        currentUserName={profile.display_name ?? `用户${user.id.slice(0, 6)}`}
      />
    </div>
  );
}
