"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabaseBrowser";
import { compressImage } from "@/lib/compressImage";
import ips from "@/data/ips";

type ItemRow = {
  id: number;
  imageFile: File | null;
  preview: string | null;
  officialImageFiles: File[];
  officialPreviews: string[];
  realImageFiles: File[];
  realPreviews: string[];
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
    officialImageFiles: [],
    officialPreviews: [],
    realImageFiles: [],
    realPreviews: [],
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

  const MAX_OFFICIAL = 3;
  const MAX_REAL = 5;

  function handleFilesChange(rowId: number, type: "official" | "real", files: File[]) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const max = type === "official" ? MAX_OFFICIAL : MAX_REAL;
        const currentFiles = type === "official" ? r.officialImageFiles : r.realImageFiles;
        const currentPreviews = type === "official" ? r.officialPreviews : r.realPreviews;
        const remaining = max - currentFiles.length;
        const toAdd = files.slice(0, remaining);

        currentPreviews.forEach((p) => URL.revokeObjectURL(p));
        const newFiles = [...currentFiles, ...toAdd];
        const newPreviews = newFiles.map((f) => URL.createObjectURL(f));

        if (type === "official") {
          return { ...r, officialImageFiles: newFiles, officialPreviews: newPreviews };
        } else {
          return { ...r, realImageFiles: newFiles, realPreviews: newPreviews };
        }
      })
    );
  }

  function removeRowFile(rowId: number, type: "official" | "real", index: number) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        if (type === "official") {
          URL.revokeObjectURL(r.officialPreviews[index]);
          return {
            ...r,
            officialImageFiles: r.officialImageFiles.filter((_, i) => i !== index),
            officialPreviews: r.officialPreviews.filter((_, i) => i !== index),
          };
        } else {
          URL.revokeObjectURL(r.realPreviews[index]);
          return {
            ...r,
            realImageFiles: r.realImageFiles.filter((_, i) => i !== index),
            realPreviews: r.realPreviews.filter((_, i) => i !== index),
          };
        }
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
      row?.officialPreviews.forEach((p) => URL.revokeObjectURL(p));
      row?.realPreviews.forEach((p) => URL.revokeObjectURL(p));
      return prev.filter((r) => r.id !== rowId);
    });
  }

  async function uploadAndGetUrl(file: File): Promise<string> {
    const compressed = await compressImage(file);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

    const supabase = createBrowserSupabase();
    const { error: uploadError } = await supabase.storage
      .from("goods")
      .upload(fileName, compressed, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: urlData } = supabase.storage
      .from("goods")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const fd = new FormData();
    fd.set("count", String(rows.length));
    fd.set("work", sharedWork);
    fd.set("character", sharedCharacter);

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      fd.set(`title_${i}`, r.title);
      if (r.work) fd.set(`work_${i}`, r.work);
      if (r.character) fd.set(`character_${i}`, r.character);
      fd.set(`category_${i}`, r.category);
      fd.set(`price_${i}`, r.price);
      if (r.description) fd.set(`description_${i}`, r.description);

      // 旧版图片
      if (r.imageFile && r.imageFile.size > 0) {
        try {
          setError(`正在处理第 ${i + 1} 件图片…`);
          const url = await uploadAndGetUrl(r.imageFile);
          fd.set(`imageUrl_${i}`, url);
        } catch (e) {
          setError(`第 ${i + 1} 件图片上传失败: ${e instanceof Error ? e.message : "未知错误"}`);
          setSubmitting(false);
          return;
        }
      }

      // 官图（多张）
      for (let j = 0; j < r.officialImageFiles.length; j++) {
        try {
          setError(`正在处理第 ${i + 1} 件官图 ${j + 1}/${r.officialImageFiles.length}…`);
          const url = await uploadAndGetUrl(r.officialImageFiles[j]);
          fd.set(`officialImageUrl_${i}_${j}`, url);
        } catch (e) {
          setError(`第 ${i + 1} 件官图 ${j + 1} 上传失败: ${e instanceof Error ? e.message : "未知错误"}`);
          setSubmitting(false);
          return;
        }
      }
      // 兼容单图字段
      if (r.officialImageFiles.length > 0) {
        const firstUrl = fd.get(`officialImageUrl_${i}_0`) as string;
        if (firstUrl) fd.set(`officialImageUrl_${i}`, firstUrl);
      }

      // 实物图（多张）
      for (let j = 0; j < r.realImageFiles.length; j++) {
        try {
          setError(`正在处理第 ${i + 1} 件实物图 ${j + 1}/${r.realImageFiles.length}…`);
          const url = await uploadAndGetUrl(r.realImageFiles[j]);
          fd.set(`realImageUrl_${i}_${j}`, url);
        } catch (e) {
          setError(`第 ${i + 1} 件实物图 ${j + 1} 上传失败: ${e instanceof Error ? e.message : "未知错误"}`);
          setSubmitting(false);
          return;
        }
      }
      if (r.realImageFiles.length > 0) {
        const firstUrl = fd.get(`realImageUrl_${i}_0`) as string;
        if (firstUrl) fd.set(`realImageUrl_${i}`, firstUrl);
      }
    }

    // 检查至少有一个商品有图片
    let hasAnyImage = false;
    for (let i = 0; i < rows.length; i++) {
      if (
        fd.get(`imageUrl_${i}`) ||
        fd.get(`officialImageUrl_${i}_0`) ||
        fd.get(`officialImageUrl_${i}`) ||
        fd.get(`realImageUrl_${i}_0`) ||
        fd.get(`realImageUrl_${i}`)
      ) {
        hasAnyImage = true;
        break;
      }
    }
    if (!hasAnyImage && !cabinet) {
      setError("请至少为一件商品上传官图或实物图");
      setSubmitting(false);
      return;
    }

    setError("");
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
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm border border-pink-100">
          <p className="text-2xl">🎉</p>
          <p className="mt-4 text-lg font-semibold text-slate-800">
            成功上传 {result.successCount} 件商品
          </p>
          {result.errors && result.errors.length > 0 && (
            <div className="mt-4 text-left">
              <p className="text-sm font-medium text-slate-600">以下商品提交失败：</p>
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
      <h1 className="mb-2 text-3xl font-bold text-slate-800">{title}</h1>
      <p className="mb-8 text-slate-500">
        一次上传多件周边，共用作品和角色信息，每件可单独设置官图、实物图、标题、分类和价格
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 共用信息 */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-pink-100">
          <h2 className="mb-3 text-sm font-semibold text-slate-600">共用信息（可被各行覆盖）</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={sharedWork}
              onChange={(e) => setSharedWork(e.target.value)}
              list="batch-work-list"
              placeholder="作品名称（如：初音未来）"
              className="rounded-xl border border-pink-200 px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400"
            />
            <input
              value={sharedCharacter}
              onChange={(e) => setSharedCharacter(e.target.value)}
              placeholder="角色名称（如：Miku）"
              className="rounded-xl border border-pink-200 px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400"
            />
          </div>
        </div>

        {/* 各行商品 */}
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="rounded-2xl bg-white p-5 shadow-sm border border-pink-100"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">第 {index + 1} 件</span>
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
              {/* 官图上传（最多3张） */}
              <div>
                <p className="mb-1 text-xs font-medium text-blue-600">
                  官图（最多{MAX_OFFICIAL}张 · {row.officialImageFiles.length}/{MAX_OFFICIAL}）
                </p>
                {row.officialPreviews.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {row.officialPreviews.map((preview, j) => (
                        <div key={j} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview}
                            alt={`官图 ${j + 1}`}
                            className="aspect-square w-full rounded-xl object-cover ring-1 ring-blue-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeRowFile(row.id, "official", j)}
                            className="absolute -top-1.5 -right-1.5 rounded-full bg-white p-0.5 text-slate-400 shadow border border-pink-200 hover:text-red-500"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    {row.officialImageFiles.length < MAX_OFFICIAL && (
                      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-blue-200 py-2 transition hover:border-blue-400 hover:bg-blue-50/50">
                        <span className="text-xs text-blue-400">+ 继续添加</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFilesChange(row.id, "official", Array.from(e.target.files ?? []))}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-blue-200 py-4 transition hover:border-blue-400 hover:bg-blue-50/50">
                    <svg className="h-5 w-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs text-blue-400">点击上传官图</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFilesChange(row.id, "official", Array.from(e.target.files ?? []))}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* 实物图上传（最多5张） */}
              <div>
                <p className="mb-1 text-xs font-medium text-green-600">
                  实物图（最多{MAX_REAL}张 · {row.realImageFiles.length}/{MAX_REAL}）
                </p>
                {row.realPreviews.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {row.realPreviews.map((preview, j) => (
                        <div key={j} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview}
                            alt={`实物图 ${j + 1}`}
                            className="aspect-square w-full rounded-xl object-cover ring-1 ring-green-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeRowFile(row.id, "real", j)}
                            className="absolute -top-1.5 -right-1.5 rounded-full bg-white p-0.5 text-slate-400 shadow border border-pink-200 hover:text-red-500"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    {row.realImageFiles.length < MAX_REAL && (
                      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-green-200 py-2 transition hover:border-green-400 hover:bg-green-50/50">
                        <span className="text-xs text-green-400">+ 继续添加</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFilesChange(row.id, "real", Array.from(e.target.files ?? []))}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-green-200 py-4 transition hover:border-green-400 hover:bg-green-50/50">
                    <svg className="h-5 w-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs text-green-400">点击上传实物图</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFilesChange(row.id, "real", Array.from(e.target.files ?? []))}
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
                className="w-full rounded-xl border border-pink-200 px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400"
              />

              {/* 作品 / 角色（可选覆盖） */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={row.work}
                  onChange={(e) => updateRow(row.id, "work", e.target.value)}
                  list="batch-work-list"
                  placeholder={`作品${sharedWork ? `（共用: ${sharedWork}）` : ""}`}
                  className="rounded-xl border border-pink-200 px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400"
                />
                <input
                  value={row.character}
                  onChange={(e) => updateRow(row.id, "character", e.target.value)}
                  placeholder={`角色${sharedCharacter ? `（共用: ${sharedCharacter}）` : ""}`}
                  className="rounded-xl border border-pink-200 px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400"
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
                  className="rounded-xl border border-pink-200 px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400"
                />
                <input
                  value={row.price}
                  onChange={(e) => updateRow(row.id, "price", e.target.value)}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="价格 *"
                  required
                  className="rounded-xl border border-pink-200 px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400"
                />
              </div>

              {/* 简介 */}
              <input
                value={row.description}
                onChange={(e) => updateRow(row.id, "description", e.target.value)}
                placeholder="简介（选填）"
                className="w-full rounded-xl border border-pink-200 px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400"
              />
            </div>
          </div>
        ))}

        <datalist id="batch-work-list">
          {ips.map((ip) => (
            <option key={ip} value={ip} />
          ))}
        </datalist>

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

        <p className="text-xs text-slate-400 text-center">
          每件商品至少需要上传官图或实物图中的一种
        </p>

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
