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
  const [officialPreview, setOfficialPreview] = useState<string | null>(null);
  const [realPreview, setRealPreview] = useState<string | null>(null);
  const router = useRouter();

  function handleFileChange(type: "official" | "real", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "official") {
      if (officialPreview) URL.revokeObjectURL(officialPreview);
      setOfficialPreview(URL.createObjectURL(file));
    } else {
      if (realPreview) URL.revokeObjectURL(realPreview);
      setRealPreview(URL.createObjectURL(file));
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
      const officialFile = formData.get("officialImageFile") as File | null;
      const realFile = formData.get("realImageFile") as File | null;

      // 至少上传一种图片的校验
      const hasOfficial = officialFile && officialFile.size > 0;
      const hasReal = realFile && realFile.size > 0;
      if (!hasOfficial && !hasReal) {
        setError("请至少上传官图或实物图中的一种");
        setSubmitting(false);
        return;
      }

      // 上传官图
      if (hasOfficial) {
        setStatusText("上传官图中…");
        const url = await uploadAndGetUrl(officialFile!);
        formData.set("officialImageUrl", url);
        formData.delete("officialImageFile");
      }

      // 上传实物图
      if (hasReal) {
        setStatusText("上传实物图中…");
        const url = await uploadAndGetUrl(realFile!);
        formData.set("realImageUrl", url);
        formData.delete("realImageFile");
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

        {/* 官图上传 */}
        <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-5">
          <Field label="官方图（选填）">
            <input
              type="file"
              name="officialImageFile"
              accept="image/*"
              onChange={(e) => handleFileChange("official", e)}
              className="w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-200"
            />
            {officialPreview && (
              <div className="mt-3 overflow-hidden rounded-xl border border-pink-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={officialPreview}
                  alt="官图预览"
                  className="aspect-square w-full max-w-xs object-cover"
                />
              </div>
            )}
            <p className="mt-1.5 text-xs text-blue-500">
              商品官方图、宣传图、官方展示图
            </p>
          </Field>
        </div>

        {/* 实物图上传 */}
        <div className="rounded-2xl border-2 border-dashed border-green-200 bg-green-50/30 p-5">
          <Field label="实物图（选填）">
            <input
              type="file"
              name="realImageFile"
              accept="image/*"
              onChange={(e) => handleFileChange("real", e)}
              className="w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-green-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-green-600 hover:file:bg-green-200"
            />
            {realPreview && (
              <div className="mt-3 overflow-hidden rounded-xl border border-pink-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={realPreview}
                  alt="实物图预览"
                  className="aspect-square w-full max-w-xs object-cover"
                />
              </div>
            )}
            <p className="mt-1.5 text-xs text-green-600">
              实际拍摄的实物图、到货图、摆拍图
            </p>
          </Field>
        </div>

        <p className="text-xs text-slate-400 text-center">
          至少需要上传官图或实物图中的一种
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
