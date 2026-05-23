export default function HomeLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="bg-gradient-to-br from-pink-500 via-pink-400 to-purple-500">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="skeleton h-4 w-36 rounded" />
            <div className="skeleton mb-2 h-10 w-64 rounded" />
            <div className="skeleton mb-6 h-5 w-80 rounded" />
            <div className="flex w-full max-w-lg gap-2">
              <div className="skeleton h-12 flex-1 rounded-xl" />
              <div className="skeleton h-12 w-20 rounded-xl" />
            </div>
          </div>
        </div>
        <div className="h-8" />
      </section>

      {/* 卡片网格骨架 */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="skeleton mb-2 h-7 w-28 rounded" />
            <div className="skeleton h-4 w-40 rounded" />
          </div>
          <div className="skeleton h-9 w-24 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm border border-pink-100">
              <div className="skeleton aspect-square w-full rounded-none" />
              <div className="space-y-2 p-4">
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-3 w-2/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
