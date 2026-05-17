import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicCabinet, getProfile } from "@/lib/profiles";
import { createClient } from "@/lib/supabaseServer";
import ItemCard from "@/components/ItemCard";
import FriendButton from "@/components/FriendButton";
import ViewTracker from "./ViewTracker";

type Props = {
  params: Promise<{ userId: string }>;
};

export default async function PublicCabinetPage({ params }: Props) {
  const { userId } = await params;
  const cabinet = await getPublicCabinet(userId);

  if (!cabinet) {
    const profile = await getProfile(userId).catch(() => null);
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Banner */}
        <div className="mb-6 h-32 overflow-hidden rounded-2xl bg-gradient-to-r from-pink-200 via-pink-100 to-purple-200">
          {profile?.banner_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={profile.banner_url} alt="" className="h-full w-full object-cover" />
          )}
        </div>

        <div className="flex items-end gap-4 -mt-8 mb-6 px-2">
          <div className="h-16 w-16 overflow-hidden rounded-full ring-4 ring-white bg-pink-100">
            {profile?.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl text-pink-400">
                {(profile?.display_name ?? "?")[0]}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              {profile?.display_name ?? `用户${userId.slice(0, 6)}`}
            </h1>
            <p className="text-sm text-gray-400">{profile?.bio || "该用户未公开痛柜"}</p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-lg font-semibold text-gray-900">该用户未公开痛柜</p>
          <p className="mt-2 text-gray-500">Ta 还没有开启痛柜的公开分享</p>
          <Link href="/" className="mt-4 inline-block text-sm font-medium text-pink-500">
            ← 返回首页
          </Link>
        </div>
      </div>
    );
  }

  const { profile, items } = cabinet;
  const displayName = profile.display_name ?? `用户${userId.slice(0, 6)}`;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === userId;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <ViewTracker userId={userId} isOwner={isOwner} />

      <Link href="/" className="text-sm font-medium text-pink-500 transition hover:text-pink-600">
        ← 返回首页
      </Link>

      {/* Banner */}
      <div className="mt-4 mb-6 h-36 overflow-hidden rounded-2xl bg-gradient-to-r from-pink-200 via-pink-100 to-purple-200">
        {profile.banner_url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={profile.banner_url} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      {/* Profile info */}
      <div className="flex items-end gap-4 -mt-10 mb-6 px-2">
        <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-white bg-pink-100 shrink-0">
          {profile.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-pink-400">
              {displayName[0]}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 pt-10">
          <h1 className="text-2xl font-bold text-gray-900">{displayName} 的痛柜</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {profile.bio || ""}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {items.length} 件周边 · {profile.cabinet_views} 次浏览
          </p>
        </div>

        <div className="pt-10 shrink-0">
          {!isOwner && user && <FriendButton userId={user.id} targetId={userId} />}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-lg font-semibold text-gray-900">痛柜还是空的</p>
          <p className="mt-2 text-gray-500">Ta 还没有添加任何周边</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {isOwner && (
        <div className="mt-8 text-center">
          <Link
            href="/mypage"
            className="inline-block rounded-xl bg-pink-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-pink-600"
          >
            管理我的痛柜
          </Link>
        </div>
      )}
    </div>
  );
}
