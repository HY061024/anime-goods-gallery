/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { getPublicCabinetUsers } from "@/lib/profiles";
import { getCabinetPreviewItems } from "@/lib/collections";
import { createClient } from "@/lib/supabaseServer";
import { getFriendshipDetails } from "@/lib/friends";
import { getItemMainImage } from "@/data/items";
import FriendButton from "@/components/FriendButton";
import type { FriendButtonState } from "@/lib/friends";

export const dynamic = "force-dynamic";

export default async function CabinetsPage() {
  const [users, supabase] = await Promise.all([
    getPublicCabinetUsers(),
    createClient(),
  ]);
  const { data: { user } } = await supabase.auth.getUser();

  const userIds = users.map((u) => u.user_id);
  const [previewMap, friendshipMap] = await Promise.all([
    getCabinetPreviewItems(userIds, 3),
    (async () => {
      const map = new Map<string, { state: FriendButtonState; friendshipId: number | null }>();
      if (user) {
        for (const u of users) {
          if (u.user_id !== user.id) {
            map.set(u.user_id, await getFriendshipDetails(user.id, u.user_id));
          }
        }
      }
      return map;
    })(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <Link href="/" className="text-sm font-medium text-pink-500 transition hover:text-pink-600">
        &larr; 返回首页
      </Link>
      <h1 className="mt-3 text-3xl font-bold text-slate-800">痛柜广场</h1>
      <p className="mt-2 text-slate-500">发现其他二次元爱好者的公开痛柜</p>

      {users.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm border border-pink-100">
          <p className="text-lg font-semibold text-slate-800">暂时还没有公开痛柜</p>
          <p className="mt-2 text-slate-500">成为第一个公开痛柜的用户吧！去个人中心开启痛柜公开分享</p>
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
            const previewItems = previewMap.get(u.user_id) ?? [];

            return (
              <div
                key={u.user_id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm border border-pink-100 transition hover:shadow-md hover:border-pink-200"
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
                        className="text-base font-bold text-slate-800 hover:text-pink-500 transition-colors"
                      >
                        {displayName}
                      </Link>
                      <p className="text-xs text-slate-400">{u.cabinet_views} 次浏览</p>
                    </div>
                  </div>

                  {/* Bio */}
                  {u.bio && (
                    <p className="mt-3 text-sm text-slate-500 line-clamp-2">{u.bio}</p>
                  )}

                  {/* 商品预览缩略图 */}
                  {previewItems.length > 0 && (
                    <div className="mt-3 flex gap-1.5">
                      {previewItems.map((item) => (
                        <div key={item.id} className="h-14 w-14 overflow-hidden rounded-lg bg-slate-100 shrink-0">
                          <img
                            src={getItemMainImage(item)}
                            alt={item.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                      {previewItems.length < 3 && (
                        Array.from({ length: 3 - previewItems.length }).map((_, i) => (
                          <div key={`empty-${i}`} className="h-14 w-14 rounded-lg bg-slate-50 shrink-0 flex items-center justify-center">
                            <svg className="h-4 w-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/users/${u.user_id}`}
                      className="flex-1 rounded-lg border border-pink-200 bg-white py-2 text-center text-sm font-medium text-pink-500 hover:bg-pink-50 transition"
                    >
                      进入痛柜
                    </Link>
                    {!isOwner && user && (
                      <FriendButton
                        userId={user.id}
                        targetId={u.user_id}
                        initialState={fs?.state ?? null}
                        initialFriendshipId={fs?.friendshipId ?? null}
                      />
                    )}
                    {!isOwner && !user && (
                      <Link
                        href="/auth/login"
                        className="rounded-lg bg-pink-500 px-3 py-2 text-xs font-medium text-white hover:bg-pink-600 transition"
                      >
                        加好友
                      </Link>
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
