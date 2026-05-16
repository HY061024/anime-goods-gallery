import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicCabinet } from "@/lib/profiles";
import { createClient } from "@/lib/supabaseServer";
import ItemCard from "@/components/ItemCard";
import ViewTracker from "./ViewTracker";

type Props = {
  params: Promise<{ userId: string }>;
};

export default async function PublicCabinetPage({ params }: Props) {
  const { userId } = await params;
  const cabinet = await getPublicCabinet(userId);

  if (!cabinet) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-3xl bg-white p-12 shadow-sm ring-1 ring-gray-100">
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

      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{displayName} 的痛柜</h1>
        <p className="mt-2 text-gray-500">
          {items.length} 件周边 · {profile.cabinet_views} 次浏览
        </p>
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
