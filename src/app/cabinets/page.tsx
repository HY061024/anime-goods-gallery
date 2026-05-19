/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { getPublicCabinetUsers } from "@/lib/profiles";
import { createClient } from "@/lib/supabaseServer";
import { getFriendshipDetails } from "@/lib/friends";
import FriendButton from "@/components/FriendButton";
import type { FriendButtonState } from "@/lib/friends";

export const dynamic = "force-dynamic";

export default async function CabinetsPage() {
  const [users, supabase] = await Promise.all([
    getPublicCabinetUsers(),
    createClient(),
  ]);
  const { data: { user } } = await supabase.auth.getUser();

  // 预加载所有好友状态
  const friendshipMap = new Map<string, { state: FriendButtonState; friendshipId: number | null }>();
  if (user) {
    for (const u of users) {
      if (u.user_id !== user.id) {
        friendshipMap.set(u.user_id, await getFriendshipDetails(user.id, u.user_id));
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/" className="text-sm font-medium text-pink-500 transition hover:text-pink-600">
        &larr; 返回首页
      </Link>
      <h1 className="mt-3 text-3xl font-bold text-gray-900">痛柜广场</h1>
      <p className="mt-2 text-gray-500">发现其他二次元爱好者的公开痛柜</p>

      {users.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-lg font-semibold text-gray-900">暂时还没有公开痛柜</p>
          <p className="mt-2 text-gray-500">成为第一个公开痛柜的用户吧！去个人中心开启痛柜公开分享</p>
          {user ? (
            <Link href="/mypage" className="mt-4 inline-block rounded-xl bg-pink-500 px-6 py-3 text-sm font-medium text-white hover:bg-pink-600 transition">
              去我的痛柜
            </Link>
          ) : (
            <Link href="/auth/login" className="mt-4 inline-block rounded-xl bg-pink-500 px-6 py-3 text-sm font-medium text-white hover:bg-pink-600 transition">
              登录并开启痛柜
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => {
            const displayName = u.display_name ?? `用户${u.user_id.slice(0, 6)}`;
            const isOwner = user?.id === u.user_id;
            const fs = friendshipMap.get(u.user_id);

            return (
              <div
                key={u.user_id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:shadow-md hover:ring-pink-200"
              >
                {/* Banner */}
                <div className="h-24 bg-gradient-to-r from-pink-200 via-pink-100 to-purple-200">
                  {u.banner_url && (
                    <img src={u.banner_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>

                <div className="px-4 pb-4">
                  {/* Avatar + Name */}
                  <div className="flex items-end gap-3 -mt-8">
                    <div className="h-16 w-16 overflow-hidden rounded-full ring-4 ring-white bg-pink-100 shrink-0">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl text-pink-400">
                          {displayName[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-8">
                      <Link
                        href={`/users/${u.user_id}`}
                        className="text-base font-bold text-gray-900 hover:text-pink-500 transition-colors"
                      >
                        {displayName}
                      </Link>
                      <p className="text-xs text-gray-400">
                        {u.cabinet_views} 次浏览
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  {u.bio && (
                    <p className="mt-3 text-sm text-gray-500 line-clamp-2">{u.bio}</p>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/users/${u.user_id}`}
                      className="flex-1 rounded-lg border border-pink-200 bg-white py-2 text-center text-sm font-medium text-pink-500 hover:bg-pink-50 transition"
                    >
                      进入痛柜
                    </Link>
                    {!isOwner && (
                      <FriendButton
                        userId={user?.id ?? ""}
                        targetId={u.user_id}
                        initialState={fs?.state ?? null}
                        initialFriendshipId={fs?.friendshipId ?? null}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
