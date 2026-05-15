"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createItem } from "../../createItem";

const categories = ["手办", "吧唧", "亚克力", "色纸", "挂件"];

export default function NewItemPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError("");

    // 调用 Server Action 写入 Supabase
    const result = await createItem(formData);

    if (result?.error) {
      setError(result.error);
      return;
    }

    // 成功后会 redirect 到新商品详情页
    // 这里用 router.push 作为 fallback
    router.push("/items");
  }

  return (
    <main className="min-h-screen bg-pink-50">
      <section className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">新增周边</h1>
        <p className="mb-8 text-gray-900">
          填写商品信息并提交，图片文件请先放入 public/goods/ 目录。
        </p>

        <form action={handleSubmit} className="space-y-5 rounded-3xl bg-white p-8 shadow-sm">
          {/* 商品标题 */}
          <Field label="商品标题" required>
            <input
              name="title"
              placeholder="例如：初音未来 16周年 纪念亚克力立牌"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
            />
          </Field>

          {/* 作品名称 */}
          <Field label="作品名称" required>
            <input
              name="work"
              placeholder="例如：初音未来、鸣潮、刀剑神域"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
            />
          </Field>

          {/* 角色名称 */}
          <Field label="角色名称" required>
            <input
              name="character"
              placeholder="例如：初音未来 Miku、长离"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
            />
          </Field>

          {/* 分类 */}
          <Field label="分类" required>
            <select name="category" defaultValue="" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400">
              <option value="" disabled>
                请选择分类
              </option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          {/* 价格 */}
          <Field label="价格（元）" required>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="例如：129.00"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
            />
          </Field>

          {/* 描述 */}
          <Field label="周边简介">
            <textarea
              name="description"
              rows={4}
              placeholder="描述这件周边的特点、材质、尺寸等..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
            />
          </Field>

          {/* 图片文件名 */}
          <Field label="图片文件名" required>
            <input
              name="image"
              placeholder="例如：miku_16th.jpg（图片需先放入 public/goods/）"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
            />
            <p className="mt-1 text-xs text-gray-600">
              先将图片文件放入 public/goods/ 目录，然后在这里填文件名
            </p>
          </Field>

          {/* 错误提示 */}
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
              {error}
            </p>
          )}

          {/* 提交按钮 */}
          <button className="w-full rounded-xl bg-pink-500 py-3 font-medium text-white hover:bg-pink-600">
            提交商品
          </button>
        </form>
      </section>
    </main>
  );
}

// 表单字段的包装组件，统一渲染 label + children
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-900">
        {label}
        {required && <span className="ml-1 text-pink-500">*</span>}
      </span>
      {children}
    </label>
  );
}
