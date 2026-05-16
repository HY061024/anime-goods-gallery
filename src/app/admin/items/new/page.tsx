"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createItem } from "../../createItem";

const categories = ["手办", "吧唧", "亚克力", "色纸", "挂件"];

export default function NewItemPage() {
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(formData: FormData) {
    setError("");
    const result = await createItem(formData);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push("/items");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">新增周边</h1>
      <p className="mb-8 text-gray-500">
        填写商品信息并提交，支持直接上传图片或填写文件名
      </p>

      <form action={handleSubmit} className="space-y-5 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        {/* 商品标题 */}
        <Field label="商品标题" required>
          <Input name="title" placeholder="例如：初音未来 16周年 纪念亚克力立牌" />
        </Field>

        {/* 作品名称 */}
        <Field label="作品名称" required>
          <Input name="work" placeholder="例如：初音未来、鸣潮、刀剑神域" />
        </Field>

        {/* 角色名称 */}
        <Field label="角色名称" required>
          <Input name="character" placeholder="例如：初音未来 Miku、长离" />
        </Field>

        {/* 分类 */}
        <Field label="分类" required>
          <select
            name="category"
            defaultValue=""
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          >
            <option value="" disabled>请选择分类</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
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
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </Field>

        {/* 描述 */}
        <Field label="周边简介">
          <textarea
            name="description"
            rows={4}
            placeholder="描述这件周边的特点、材质、尺寸等…"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </Field>

        {/* 图片上传 */}
        <Field label="上传图片">
          <input
            type="file"
            name="imageFile"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-700 file:mr-4 file:rounded-xl file:border-0 file:bg-pink-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-pink-600 hover:file:bg-pink-100"
          />
          {preview && (
            <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="预览"
                className="aspect-square w-full max-w-xs object-cover"
              />
            </div>
          )}
          <p className="mt-1.5 text-xs text-gray-400">
            从手机或电脑选择图片，自动上传到云端存储
          </p>
        </Field>

        {/* fallback 文件名 */}
        <Field label="或填写图片文件名">
          <Input name="image" placeholder="例如：miku_16th.jpg（图片已放入 public/goods/）" />
          <p className="mt-1.5 text-xs text-gray-400">
            如果已通过电脑把图片放入 public/goods/ 目录，可在此填写。上传了图片则忽略此项
          </p>
        </Field>

        {/* 错误提示 */}
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </p>
        )}

        {/* 提交按钮 */}
        <button className="w-full rounded-xl bg-pink-500 py-3 font-medium text-white transition hover:bg-pink-600 active:bg-pink-700">
          提交商品
        </button>
      </form>
    </div>
  );
}

function Input({ name, placeholder }: { name: string; placeholder: string }) {
  return (
    <input
      name={name}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
    />
  );
}

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
