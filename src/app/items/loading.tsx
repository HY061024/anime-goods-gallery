export default function ItemsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 标题骨架 */}
      <div className="mb-8 space-y-2">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-8 w-56 rounded" />
        <div className="skeleton h-4 w-64 rounded" />
      </div>

      {/* 搜索表单骨架 */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="flex gap-3 p-5">
          <div className="skeleton h-11 flex-1 rounded-xl" />
          <div className="skeleton h-11 w-40 rounded-xl" />
          <div className="skeleton h-11 w-24 rounded-xl" />
        </div>
        <div className="flex items-center justify-between border-t border-gray-50 bg-gray-50/50 px-5 py-3">
          <div className="skeleton h-4 w-24 rounded" />
        </div>
      </div>

      {/* 卡片网格骨架 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <div className="skeleton aspect-square w-full rounded-none" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
