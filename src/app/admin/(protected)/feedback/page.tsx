import { requireAdmin } from "@/app/admin/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import FeedbackList from "./FeedbackList";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  await requireAdmin();

  const { data: feedbacks } = await supabaseAdmin
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-slate-800">用户反馈</h1>
      <p className="mb-6 text-sm text-slate-500">共 {(feedbacks ?? []).length} 条反馈</p>
      <FeedbackList feedbacks={(feedbacks ?? []) as any[]} />
    </div>
  );
}
