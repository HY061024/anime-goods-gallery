export default function ItemDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="skeleton mb-6 h-4 w-24 rounded" />

      <div className="grid gap-8 lg:grid-cols-[480px_1fr]">
        {/* 左侧图片骨架 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-pink-100">
          <div className="skeleton aspect-square w-full rounded-none" />
        </div>

        {/* 右侧信息骨架 */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-pink-100">
          <div className="skeleton mb-4 h-6 w-16 rounded-full" />
          <div className="skeleton mb-3 h-8 w-3/4 rounded" />
          <div className="mb-6 flex gap-2">
            <div className="skeleton h-5 w-20 rounded-lg" />
            <div className="skeleton h-5 w-24 rounded-lg" />
          </div>
          <div className="skeleton mb-6 h-10 w-28 rounded" />

          <div className="space-y-3 border-t border-pink-100 pt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton h-4 w-12 rounded" />
                <div className="skeleton h-4 w-32 rounded" />
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-2 border-t border-pink-100 pt-6">
            <div className="skeleton mb-3 h-5 w-20 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-5/6 rounded" />
            <div className="skeleton h-4 w-3/4 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
