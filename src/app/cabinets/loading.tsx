export default function CabinetsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 h-5 w-24 rounded bg-gray-200 animate-pulse" />
      <div className="mb-2 h-8 w-48 rounded bg-gray-200 animate-pulse" />
      <div className="mb-8 h-4 w-64 rounded bg-gray-200 animate-pulse" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm border border-pink-100">
            <div className="h-24 bg-slate-100 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="flex items-end gap-3 -mt-8">
                <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse ring-4 ring-white" />
                <div className="pt-8 space-y-1 flex-1">
                  <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                  <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
              <div className="flex gap-2">
                <div className="flex-1 h-9 rounded-lg bg-slate-100 animate-pulse" />
                <div className="h-9 w-20 rounded-lg bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
