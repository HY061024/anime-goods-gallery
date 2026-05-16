"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type ItemRow = {
  id: number;
  imageFile: File | null;
  preview: string | null;
  title: string;
  work: string;
  character: string;
  category: string;
  price: string;
  description: string;
};

let nextId = 0;

function createRow(): ItemRow {
  return {
    id: nextId++,
    imageFile: null,
    preview: null,
    title: "",
    work: "",
    character: "",
    category: "",
    price: "",
    description: "",
  };
}

type BatchItemFormProps = {
  action: (formData: FormData) => Promise<{ error?: string; successCount?: number; errors?: string[] }>;
  title: string;
  submitLabel: string;
  successPath: string;
  categories?: string[];
  cabinet?: boolean;
};

export default function BatchItemForm({
  action,
  title,
  submitLabel,
  successPath,
  categories = [],
  cabinet = false,
}: BatchItemFormProps) {
  const [rows, setRows] = useState<ItemRow[]>([createRow()]);
  const [sharedWork, setSharedWork] = useState("");
  const [sharedCharacter, setSharedCharacter] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ successCount: number; errors?: string[] } | null>(null);
  const router = useRouter();

  function handleFileChange(rowId: number, file: File | null) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        if (r.preview) URL.revokeObjectURL(r.preview);
        return {
          ...r,
          imageFile: file,
          preview: file ? URL.createObjectURL(file) : null,
        };
      })
    );
  }

  function updateRow(rowId: number, field: keyof ItemRow, value: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    );
  }

  function addRow() {
    setRows((prev) => [...prev, createRow()]);
  }

  function removeRow(rowId: number) {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      const row = prev.find((r) => r.id === rowId);
      if (row?.preview) URL.revokeObjectURL(row.preview);
      return prev.filter((r) => r.id !== rowId);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const fd = new FormData();
    fd.set("count", String(rows.length));
    fd.set("work", sharedWork);
    fd.set("character", sharedCharacter);

    let hasFile = false;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      fd.set(`title_${i}`, r.title);
      if (r.work) fd.set(`work_${i}`, r.work);
      if (r.character) fd.set(`character_${i}`, r.character);
      fd.set(`category_${i}`, r.category);
      fd.set(`price_${i}`, r.price);
      if (r.description) fd.set(`description_${i}`, r.description);
      if (r.imageFile) {
        fd.set(`imageFile_${i}`, r.imageFile);
        hasFile = true;
      }
    }

    if (!hasFile && !cabinet) {
      setError("请至少为一个商品上传图片");
      setSubmitting(false);
      return;
    }

    const res = await action(fd);
    if (res?.error) {
      setError(res.error);
    } else {
      setResult({ successCount: res.successCount ?? 0, errors: res.errors });
      if (!res.errors) {
        router.push(successPath);
      }
    }
    setSubmitting(false);
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-2xl">🎉</p>
          <p className="mt-4 text-lg font-semibold text-gray-900">
            成功上传 {result.successCount} 件商品
          </p>
          {result.errors && result.errors.length > 0 && (
            <div className="mt-4 text-left">
              <p className="text-sm font-medium text-gray-700">以下商品提交失败：</p>
              <ul className="mt-2 space-y-1 text-sm text-red-500">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={() => router.push(successPath)}
            className="mt-6 rounded-xl bg-pink-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-pink-600"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">{title}</h1>
      <p className="mb-8 text-gray-500">
        一次上传多件周边，共用作品和角色信息，每件可单独设置图片、标题、分类和价格
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 共用信息 */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">共用信息（可被各行覆盖）</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={sharedWork}
              onChange={(e) => setSharedWork(e.target.value)}
              placeholder="作品名称（如：初音未来）"
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
            />
            <input
              value={sharedCharacter}
              onChange={(e) => setSharedCharacter(e.target.value)}
              placeholder="角色名称（如：Miku）"
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
            />
          </div>
        </div>

        {/* 各行商品 */}
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500">第 {index + 1} 件</span>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="text-xs text-red-400 hover:text-red-500"
                >
                  删除此行
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* 图片上传 */}
              <div>
                {row.preview ? (
                  <div className="relative mx-auto w-full max-w-[200px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.preview}
                      alt="预览"
                      className="aspect-square w-full rounded-xl object-cover ring-1 ring-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleFileChange(row.id, null)}
                      className="absolute -top-2 -right-2 rounded-full bg-white p-1 text-gray-400 shadow ring-1 ring-gray-200 hover:text-red-500"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-gray-300 py-8 transition hover:border-pink-300 hover:bg-pink-50/50">
                    <svg className="h-6 w-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs text-gray-400">点击上传图片</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(row.id, e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* 标题 */}
              <input
                value={row.title}
                onChange={(e) => updateRow(row.id, "title", e.target.value)}
                placeholder="商品标题 *"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
              />

              {/* 作品 / 角色（可选覆盖） */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={row.work}
                  onChange={(e) => updateRow(row.id, "work", e.target.value)}
                  placeholder={`作品${sharedWork ? `（共用: ${sharedWork}）` : ""}`}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
                />
                <input
                  value={row.character}
                  onChange={(e) => updateRow(row.id, "character", e.target.value)}
                  placeholder={`角色${sharedCharacter ? `（共用: ${sharedCharacter}）` : ""}`}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
                />
              </div>

              {/* 分类 / 价格 */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={row.category}
                  onChange={(e) => updateRow(row.id, "category", e.target.value)}
                  list="batch-category-list"
                  placeholder="分类 *"
                  required
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
                />
                <input
                  value={row.price}
                  onChange={(e) => updateRow(row.id, "price", e.target.value)}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="价格 *"
                  required
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
                />
              </div>

              {/* 简介 */}
              <input
                value={row.description}
                onChange={(e) => updateRow(row.id, "description", e.target.value)}
                placeholder="简介（选填）"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
              />
            </div>
          </div>
        ))}

        <datalist id="batch-category-list">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        {/* 添加行 */}
        <button
          type="button"
          onClick={addRow}
          className="flex w-full items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-pink-300 py-4 text-sm font-medium text-pink-500 transition hover:bg-pink-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加一件商品
        </button>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-pink-500 py-3.5 font-medium text-white transition hover:bg-pink-600 disabled:opacity-50"
        >
          {submitting ? "提交中…" : `${submitLabel}（共 ${rows.length} 件）`}
        </button>
      </form>
    </div>
  );
}
