"use client";

export default function MyPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-4xl">&#x1F614;</p>
      <h2 className="mt-4 text-xl font-bold text-gray-900">加载失败</h2>
      <p className="mt-2 text-sm text-gray-500">
        {error.message || "请稍后再试"}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-xl bg-pink-500 px-6 py-2 text-sm font-medium text-white hover:bg-pink-600"
      >
        重试
      </button>
    </div>
  );
}
