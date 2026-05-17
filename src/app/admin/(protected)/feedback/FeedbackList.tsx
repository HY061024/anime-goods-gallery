"use client";

export type FeedbackEntry = {
  id: number;
  user_id: string | null;
  email: string;
  content: string;
  created_at: string;
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "刚刚";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(dateStr).toLocaleDateString("zh-CN");
}

export default function FeedbackList({ feedbacks }: { feedbacks: FeedbackEntry[] }) {
  if (feedbacks.length === 0) {
    return (
      <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
        <p className="text-sm text-gray-400">暂无反馈</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {feedbacks.map((fb) => (
        <div
          key={fb.id}
          className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {fb.email || "匿名用户"}
              </span>
              {fb.user_id && (
                <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] text-green-600">
                  已登录
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400 shrink-0">
              {new Date(fb.created_at).toLocaleString("zh-CN")}
            </span>
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{fb.content}</p>
          <p className="mt-2 text-xs text-gray-300">{relativeTime(fb.created_at)}</p>
        </div>
      ))}
    </div>
  );
}
