"use client";

import { useState } from "react";
import Link from "next/link";
import { signup } from "@/lib/authActions";

export default function SignupPage() {
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    const result = await signup(formData);
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

          <h1 className="text-center text-2xl font-bold text-gray-900">用户注册</h1>
          <p className="mb-6 mt-2 text-center text-sm text-gray-500">
            注册后可投稿周边和接收审核通知
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
              placeholder="密码（至少 6 位）"
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
            <input
              name="confirm"
              type="password"
              placeholder="确认密码"
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</p>
            )}

            <button className="w-full rounded-xl bg-pink-500 py-3 font-medium text-white transition hover:bg-pink-600 active:bg-pink-700">
              注册
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-400">
          已有账号？{" "}
          <Link href="/auth/login" className="font-medium text-pink-500 hover:text-pink-600">
            立即登录
          </Link>
        </p>
        <p className="mt-4 text-center text-sm text-gray-400">
          <Link href="/" className="hover:text-pink-500 transition">← 返回首页</Link>
        </p>
      </div>
    </div>
  );
}
