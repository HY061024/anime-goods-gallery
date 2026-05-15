"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "./actions";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError("");

    // 调用 Server Action 验证密码
    const result = await adminLogin(formData);

    if (result?.error) {
      setError(result.error);
      return;
    }

    // 登录成功：跳转到新增商品页
    router.push("/admin/items/new");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-pink-50">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">后台管理</h1>
        <p className="mb-6 text-sm text-gray-900">请输入管理密码以继续</p>

        <form action={handleSubmit} className="space-y-4">
          <input
            name="password"
            type="password"
            placeholder="输入管理密码"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button className="w-full rounded-xl bg-pink-500 px-6 py-3 font-medium text-white hover:bg-pink-600">
            登录
          </button>
        </form>
      </div>
    </main>
  );
}
