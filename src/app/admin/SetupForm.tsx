"use client";

import { useState } from "react";
import { setupSuperAdmin } from "./actions";

export default function SetupForm() {
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    const result = await setupSuperAdmin(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input
        name="email"
        type="email"
        placeholder="超级管理员邮箱"
        autoComplete="email"
        required
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
      />
      <input
        name="password"
        type="password"
        placeholder="设置密码（至少6位）"
        autoComplete="new-password"
        required
        minLength={6}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
      />
      <input
        name="verifyCode"
        type="password"
        placeholder="初始化验证码"
        autoComplete="off"
        required
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
      />

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</p>
      )}

      <p className="text-xs text-gray-400">
        初始化验证码即当前 .env.local 中的 ADMIN_CREATE_PASSWORD 值。此页面仅在首次配置时出现。
      </p>

      <button className="w-full rounded-xl bg-pink-500 py-3 font-medium text-white transition hover:bg-pink-600 active:bg-pink-700">
        创建超级管理员
      </button>
    </form>
  );
}
