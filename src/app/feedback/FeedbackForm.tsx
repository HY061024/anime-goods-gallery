"use client";

import { useRef, useTransition, useState } from "react";
import { submitFeedback } from "./actions";

export default function FeedbackForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await submitFeedback(formData);
      if (result.error) setError(result.error);
      else {
        setOk(true);
        formRef.current?.reset();
      }
    });
  }

  if (ok) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm border border-pink-100">
        <p className="text-lg font-semibold text-green-600">感谢你的反馈！</p>
        <p className="mt-2 text-sm text-slate-400">我们会认真查看每一条意见</p>
        <button
          onClick={() => setOk(false)}
          className="mt-4 rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
        >
          继续反馈
        </button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} ref={formRef} className="rounded-2xl bg-white p-6 shadow-sm border border-pink-100 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          反馈内容 <span className="text-red-400">*</span>
        </label>
        <textarea
          name="content"
          required
          rows={5}
          placeholder="请描述你的问题、建议或想法…"
          className="w-full rounded-xl border border-pink-200 px-4 py-3 text-sm outline-none focus:border-pink-400 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          联系方式 <span className="text-slate-400 text-xs">(选填)</span>
        </label>
        <input
          name="email"
          type="email"
          placeholder="邮箱，方便我们回复"
          className="w-full rounded-xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-pink-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-50"
      >
        {isPending ? "提交中…" : "提交反馈"}
      </button>
    </form>
  );
}
