"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/lib/authActions";

export default function LoginPage() {
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    const result = await login(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="mb-2 flex justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500 text-lg text-white">
              周边
            </span>
          </div>

          <h1 className="text-center text-2xl font-bold text-gray-900">用户登录</h1>
          <p className="mb-6 mt-2 text-center text-sm text-gray-500">
            登录后可查看自己的投稿和通知
          </p>

          <form action={handleSubmit} className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="邮箱地址"
              autoComplete="email"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
            <input
              name="password"
              type="password"
              placeholder="密码"
              autoComplete="current-password"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</p>
            )}

            <button className="w-full rounded-xl bg-pink-500 py-3 font-medium text-white transition hover:bg-pink-600 active:bg-pink-700">
              登录
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-400">
          还没有账号？{" "}
          <Link href="/auth/signup" className="font-medium text-pink-500 hover:text-pink-600">
            立即注册
          </Link>
        </p>
        <p className="mt-4 text-center text-sm text-gray-400">
          <Link href="/" className="hover:text-pink-500 transition">← 返回首页</Link>
        </p>
      </div>
    </div>
  );
}
