"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabaseBrowser";
import { compressImage } from "@/lib/compressImage";
import ips from "@/data/ips";

type ItemFormProps = {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean; redirectUrl?: string }>;
  title: string;
  description: string;
  submitLabel: string;
  categories?: string[];
  successPath?: string;
};

export default function ItemForm({ action, title, description, submitLabel, categories = [], successPath }: ItemFormProps) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [officialPreviews, setOfficialPreviews] = useState<string[]>([]);
  const [realPreviews, setRealPreviews] = useState<string[]>([]);
  const [officialFiles, setOfficialFiles] = useState<File[]>([]);
  const [realFiles, setRealFiles] = useState<File[]>([]);
  const router = useRouter();

  const MAX_OFFICIAL = 3;
  const MAX_REAL = 5;

  function handleFilesChange(type: "official" | "real", e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const max = type === "official" ? MAX_OFFICIAL : MAX_REAL;
    const currentPreviews = type === "official" ? officialPreviews : realPreviews;
    const currentFiles = type === "official" ? officialFiles : realFiles;
    const remaining = max - currentFiles.length;
    const toAdd = files.slice(0, remaining);

    // 清理旧预览
    currentPreviews.forEach((p) => URL.revokeObjectURL(p));

    const newFiles = [...currentFiles, ...toAdd];
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));

    if (type === "official") {
      setOfficialFiles(newFiles);
      setOfficialPreviews(newPreviews);
    } else {
      setRealFiles(newFiles);
      setRealPreviews(newPreviews);
    }

    if (files.length > remaining) {
      setError(`最多${max}张，超出部分已忽略`);
    }
  }

  function removeFile(type: "official" | "real", index: number) {
    if (type === "official") {
      URL.revokeObjectURL(officialPreviews[index]);
      setOfficialFiles((prev) => prev.filter((_, i) => i !== index));
      setOfficialPreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      URL.revokeObjectURL(realPreviews[index]);
      setRealFiles((prev) => prev.filter((_, i) => i !== index));
      setRealPreviews((prev) => prev.filter((_, i) => i !== index));
    }
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
      throw new Error(`[Storage上传] ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("goods")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  async function handleSubmit(formData: FormData) {
    setError("");
    setStatusText("");
    setSubmitting(true);
    try {
      // 至少上传一种图片的校验
      if (officialFiles.length === 0 && realFiles.length === 0) {
        setError("请至少上传官图或实物图中的一种");
        setSubmitting(false);
        return;
      }

      // 上传官图（多张）
      for (let i = 0; i < officialFiles.length; i++) {
        setStatusText(`上传官图 ${i + 1}/${officialFiles.length}…`);
        const url = await uploadAndGetUrl(officialFiles[i]);
        formData.set(`officialImageUrl_${i}`, url);
      }
      // 兼容单图字段：第一张设为 officialImageUrl
      if (officialFiles.length > 0) {
        const firstUrl = (formData.get("officialImageUrl_0") as string);
        if (firstUrl) formData.set("officialImageUrl", firstUrl);
      }

      // 上传实物图（多张）
      for (let i = 0; i < realFiles.length; i++) {
        setStatusText(`上传实物图 ${i + 1}/${realFiles.length}…`);
        const url = await uploadAndGetUrl(realFiles[i]);
        formData.set(`realImageUrl_${i}`, url);
      }
      if (realFiles.length > 0) {
        const firstUrl = (formData.get("realImageUrl_0") as string);
        if (firstUrl) formData.set("realImageUrl", firstUrl);
      }

      // 兼容旧的单图上传（管理员新增页可能还在用）
      const oldFile = formData.get("imageFile") as File | null;
      if (oldFile && oldFile.size > 0) {
        setStatusText("上传图片中…");
        const url = await uploadAndGetUrl(oldFile);
        formData.set("imageUrl", url);
        formData.delete("imageFile");
      }

      setStatusText("保存中…");
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.redirectUrl) {
        router.push(result.redirectUrl);
      } else if (result?.success && successPath) {
        router.push(successPath);
      }
    } catch (e) {
      if (
        e instanceof Error &&
        "digest" in e &&
        (e as Error & { digest: string }).digest === "NEXT_REDIRECT"
      ) {
        throw e;
      }
      const msg = e instanceof Error ? e.message : String(e);
      setError(`[ItemForm] ${msg}`);
      console.error(e);
    } finally {
      setSubmitting(false);
      setStatusText("");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-slate-800">{title}</h1>
      <p className="mb-8 text-slate-500">{description}</p>

      <form action={handleSubmit} className="space-y-5 rounded-3xl bg-white p-8 shadow-sm border border-pink-100">
        <Field label="商品标题" required>
          <Input name="title" placeholder="例如：初音未来 16周年 纪念亚克力立牌" />
        </Field>

        <Field label="作品名称" required>
          <input
            name="work"
            list="work-list"
            placeholder="例如：初音未来、鸣潮、刀剑神域…也可自由输入"
            className="w-full rounded-xl border border-pink-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
          <datalist id="work-list">
            {ips.map((ip) => (
              <option key={ip} value={ip} />
            ))}
          </datalist>
        </Field>

        <Field label="角色名称" required>
          <Input name="character" placeholder="例如：初音未来 Miku、长离" />
        </Field>

        <Field label="分类" required>
          <input
            name="category"
            list="category-list"
            placeholder="例如：手办、吧唧、亚克力、色纸…也可自由输入"
            className="w-full rounded-xl border border-pink-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
          {categories.length > 0 && (
            <datalist id="category-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          )}
        </Field>

        <Field label="价格（元）" required>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="例如：129.00"
            className="w-full rounded-xl border border-pink-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </Field>

        <Field label="周边简介">
          <textarea
            name="description"
            rows={4}
            placeholder="描述这件周边的特点、材质、尺寸等…"
            className="w-full rounded-xl border border-pink-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </Field>

        {/* 官图上传（最多3张） */}
        <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-5">
          <Field label={`官方图（最多${MAX_OFFICIAL}张）`}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFilesChange("official", e)}
              disabled={officialFiles.length >= MAX_OFFICIAL}
              className="w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-200 disabled:opacity-50"
            />
            {officialPreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {officialPreviews.map((preview, i) => (
                  <div key={i} className="relative overflow-hidden rounded-xl border border-pink-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt={`官图 ${i + 1}`}
                      className="aspect-square w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile("official", i)}
                      className="absolute top-1 right-1 rounded-full bg-white/90 p-0.5 text-slate-400 shadow hover:text-red-500"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-1.5 text-xs text-blue-500">
              商品官方图、宣传图、官方展示图（{officialFiles.length}/{MAX_OFFICIAL}）
            </p>
          </Field>
        </div>

        {/* 实物图上传（最多5张） */}
        <div className="rounded-2xl border-2 border-dashed border-green-200 bg-green-50/30 p-5">
          <Field label={`实物图（最多${MAX_REAL}张）`}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFilesChange("real", e)}
              disabled={realFiles.length >= MAX_REAL}
              className="w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-green-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-green-600 hover:file:bg-green-200 disabled:opacity-50"
            />
            {realPreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {realPreviews.map((preview, i) => (
                  <div key={i} className="relative overflow-hidden rounded-xl border border-pink-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt={`实物图 ${i + 1}`}
                      className="aspect-square w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile("real", i)}
                      className="absolute top-1 right-1 rounded-full bg-white/90 p-0.5 text-slate-400 shadow hover:text-red-500"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-1.5 text-xs text-green-600">
              实际拍摄的实物图、到货图、摆拍图（{realFiles.length}/{MAX_REAL}）
            </p>
          </Field>
        </div>

        <p className="text-xs text-slate-400 text-center">
          至少需要上传官图或实物图中的一种（官图最多{MAX_OFFICIAL}张、实物图最多{MAX_REAL}张）
        </p>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-pink-500 py-3 font-medium text-white transition hover:bg-pink-600 active:bg-pink-700 disabled:opacity-50"
        >
          {submitting ? (statusText || "提交中…") : submitLabel}
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
      className="w-full rounded-xl border border-pink-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
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
      <span className="mb-2 block text-sm font-medium text-slate-800">
        {label}
        {required && <span className="ml-1 text-pink-500">*</span>}
      </span>
      {children}
    </label>
  );
}
