import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Item } from "@/data/items";
import ReviewList from "./ReviewList";

export const dynamic = "force-dynamic";

const PENDING_MARKER = "[待审核]";
const DELETE_MARKER = "[申请删除]";

export default async function ReviewPage() {
  const { data: items } = await supabaseAdmin
    .from("items")
    .select("*")
    .or(`description.ilike.${PENDING_MARKER}%,description.ilike.${DELETE_MARKER}%`)
    .order("created_at", { ascending: true });

  const all = (items ?? []) as Item[];

  const submissions = all.filter(
    (i) => !i.description.startsWith(DELETE_MARKER)
  );
  const deleteRequests = all.filter(
    (i) => i.description.startsWith(DELETE_MARKER)
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-slate-800">审核管理</h1>
      <p className="mb-6 text-sm text-slate-500">
        审核用户提交的周边信息和删除申请，按提交时间排序
      </p>

      <ReviewList submissions={submissions} deleteRequests={deleteRequests} />
    </div>
  );
}
