"use client";

import { useState } from "react";
import { adminLogin } from "./actions";

export default function LoginForm() {
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    const result = await adminLogin(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input
        name="email"
        type="email"
        placeholder="管理员邮箱"
        autoComplete="email"
        className="w-full rounded-xl border border-pink-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
      />
      <input
        name="password"
        type="password"
        placeholder="密码"
        autoComplete="current-password"
        className="w-full rounded-xl border border-pink-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
      />

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</p>
      )}

      <button className="w-full rounded-xl bg-pink-500 py-3 font-medium text-white transition hover:bg-pink-600 active:bg-pink-700">
        登录
      </button>
    </form>
  );
}
