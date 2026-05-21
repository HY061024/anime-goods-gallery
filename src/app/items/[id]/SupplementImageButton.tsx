"use client";

import { useState, useTransition } from "react";
import { createBrowserSupabase } from "@/lib/supabaseBrowser";
import { compressImage } from "@/lib/compressImage";
import { supplementImage } from "./actions";

export default function SupplementImageButton({
  itemId,
  type,
}: {
  itemId: number;
  type: "official" | "real";
}) {
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [uploading, startUploading] = useTransition();
  const [statusText, setStatusText] = useState("");

  const label = type === "official" ? "官图" : "实物图";
  const isOfficial = type === "official";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  }

  async function handleUpload() {
    if (!file) {
      setError("请选择图片");
      return;
    }

    setError("");
    setStatusText("压缩图片中…");
    startUploading(async () => {
      try {
        const compressed = await compressImage(file);
        setStatusText("上传图片中…");
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

        const supabase = createBrowserSupabase();
        const { error: uploadError } = await supabase.storage
          .from("goods")
          .upload(fileName, compressed, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (uploadError) {
          setError(`上传失败：${uploadError.message}`);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("goods")
          .getPublicUrl(fileName);

        setStatusText("保存中…");
        const fd = new FormData();
        fd.set("itemId", String(itemId));
        fd.set("imageType", type);
        fd.set("imageUrl", urlData.publicUrl);

        const result = await supplementImage(fd);
        if (result?.error) {
          setError(result.error);
        } else {
          setShowUpload(false);
          setPreview(null);
          setFile(null);
          window.location.reload();
        }
      } catch (e) {
        setError(`上传失败：${e instanceof Error ? e.message : "未知错误"}`);
      } finally {
        setStatusText("");
      }
    });
  }

  if (showUpload) {
    return (
      <div className={
        isOfficial
          ? "rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-4"
          : "rounded-2xl border-2 border-dashed border-green-200 bg-green-50/30 p-4"
      }>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">补充{label}</span>
          <button
            type="button"
            onClick={() => { setShowUpload(false); setPreview(null); setFile(null); setError(""); }}
            className="text-xs text-gray-400 hover:text-gray-500"
          >
            取消
          </button>
        </div>

        {preview ? (
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="预览"
              className="aspect-square w-full max-w-[200px] rounded-xl object-cover ring-1 ring-gray-200"
            />
            <div className="flex gap-2">
              <label className={
                isOfficial
                  ? "cursor-pointer rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-200"
                  : "cursor-pointer rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-200"
              }>
                重新选择
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-pink-600 disabled:opacity-50"
              >
                {uploading ? (statusText || "上传中…") : "确认上传"}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <label className={
              isOfficial
                ? "flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-blue-200 py-6 px-4 transition hover:border-blue-400 hover:bg-blue-50/50 w-full"
                : "flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-green-200 py-6 px-4 transition hover:border-green-400 hover:bg-green-50/50 w-full"
            }>
              <svg className="h-6 w-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs text-gray-400">点击选择{label}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowUpload(true)}
      className={
        isOfficial
          ? "inline-flex items-center gap-1 rounded-xl border border-dashed border-blue-300 px-4 py-2 text-sm font-medium text-blue-500 transition hover:bg-blue-50"
          : "inline-flex items-center gap-1 rounded-xl border border-dashed border-green-300 px-4 py-2 text-sm font-medium text-green-500 transition hover:bg-green-50"
      }
    >
      ＋ 补充{label}
    </button>
  );
}
