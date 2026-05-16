import { createClient } from "@/lib/supabaseServer";
import { getItemsByUserId } from "@/lib/items";
import { getNotificationsByUserId, getUnreadNotificationCount } from "@/lib/notifications";
import { getUserCollection } from "@/lib/collections";
import { getProfile } from "@/lib/profiles";
import { getAllCategories } from "@/lib/categories";
import MyPageClient from "./MyPageClient";

export const dynamic = "force-dynamic";

function stripMarker(desc: string) {
  if (desc.startsWith("[待审核]")) return desc.slice("[待审核]".length);
  if (desc.startsWith("[申请删除]")) return desc.slice("[申请删除]".length);
  return desc;
}

function getItemStatus(desc: string): { label: string; color: string } {
  if (desc.startsWith("[待审核]")) return { label: "待审核", color: "bg-yellow-100 text-yellow-700" };
  if (desc.startsWith("[申请删除]")) return { label: "申请删除中", color: "bg-red-100 text-red-700" };
  return { label: "已通过", color: "bg-green-100 text-green-700" };
}

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [items, notifications, unreadCount, collection, profile, categories] = await Promise.all([
    getItemsByUserId(user.id),
    getNotificationsByUserId(user.id),
    getUnreadNotificationCount(user.id),
    getUserCollection(user.id),
    getProfile(user.id),
    getAllCategories(),
  ]);

  const approvedCount = items.filter(
    (i) => !i.description.startsWith("[待审核]") && !i.description.startsWith("[申请删除]")
  ).length;
  const pendingCount = items.filter((i) => i.description.startsWith("[待审核]")).length;

  const itemsData = items.map((item) => ({
    ...item,
    displayDescription: stripMarker(item.description),
    status: getItemStatus(item.description),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
        <p className="mt-2 text-gray-500">{user.email}</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="总投稿" value={items.length} />
        <StatCard label="已通过" value={approvedCount} color="text-green-600" />
        <StatCard label="待审核" value={pendingCount} color="text-yellow-600" />
        <StatCard label="痛柜收藏" value={collection.length} color="text-pink-500" />
      </div>

      <MyPageClient
        items={itemsData}
        notifications={notifications}
        collection={collection}
        profile={profile}
        userId={user.id}
        categories={categories}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "text-gray-900",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-gray-100">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}
