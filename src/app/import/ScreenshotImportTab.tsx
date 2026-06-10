"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabaseBrowser";
import { compressImage } from "@/lib/compressImage";
import CandidateEditor from "./CandidateEditor";
import { submitImportItem } from "./actions";
import type { ImportCandidate } from "@/data/items";
import { MAX_IMPORT_IMAGES } from "@/data/items";

const EMPTY_CANDIDATE: ImportCandidate = {
  title: "",
  description: "",
  imageUrls: [],
  imageType: "unknown",
};

export default function ScreenshotImportTab() {
  const router = useRouter();
  const [candidate, setCandidate] = useState<ImportCandidate>(EMPTY_CANDIDATE);
  const [previews, setPreviews] = useState<string[]>([]);
  const [compressedFiles, setCompressedFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [done, setDone] = useState(false);
  const [createdItemId, setCreatedItemId] = useState<number | null>(null);

  const previewUrlsRef = useRef<string[]>([]);
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError("");

    const totalAfter = compressedFiles.length + files.length;
    if (totalAfter > MAX_IMPORT_IMAGES) {
      setError(`最多上传 ${MAX_IMPORT_IMAGES} 张图片，当前已有 ${compressedFiles.length} 张`);
      e.target.value = "";
      return;
    }

    setStatusText(`正在压缩 ${files.length} 张图片…`);

    const newCompressed: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        const previewUrl = URL.createObjectURL(compressed);
        previewUrlsRef.current.push(previewUrl);
        newCompressed.push(compressed);
        newPreviews.push(previewUrl);
      } catch {
        setError(`"${file.name}" 处理失败，请重试`);
      }
    }

    setCompressedFiles((prev) => [...prev, ...newCompressed]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    setStatusText("");
    e.target.value = "";
  }

  function removeImage(index: number) {
    const url = previews[index];
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setCompressedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!candidate.title.trim()) {
      setError("请填写图鉴名称");
      return;
    }
    if (compressedFiles.length === 0) {
      setError("请至少上传一张图片");
      return;
    }

    setSubmitting(true);
    setError("");
    setStatusText("正在上传图片…");

    const supabase = createBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("请先登录");
      setSubmitting(false);
      return;
    }

    const uploadedUrls: string[] = [];

    for (let i = 0; i < compressedFiles.length; i++) {
      const file = compressedFiles[i];
      setStatusText(`正在上传图片（${i + 1}/${compressedFiles.length}）…`);

      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const path = `import/images/${user.id}/${safeName}`;

      const { error: uploadErr } = await supabase.storage
        .from("goods")
        .upload(path, file, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadErr) {
        setError(`图片上传失败：${uploadErr.message}`);
        setSubmitting(false);
        setStatusText("");
        return;
      }

      const { data: urlData } = supabase.storage.from("goods").getPublicUrl(path);
      uploadedUrls.push(urlData.publicUrl);
    }

    // 提交
    setStatusText("正在提交…");
    const fd = new FormData();
    fd.set("title", candidate.title.trim());
    fd.set("description", candidate.description ?? "");
    fd.set("work", candidate.work ?? "");
    fd.set("character", candidate.character ?? "");
    fd.set("category", candidate.category ?? "");
    fd.set("price", String(candidate.price ?? 0));
    fd.set("imageType", candidate.imageType ?? "unknown");
    fd.set("imageUrls", JSON.stringify(uploadedUrls));

    const result = await submitImportItem(fd);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      setStatusText("");
      return;
    }

    if (result.success && result.itemId) {
      setCreatedItemId(result.itemId);
      setDone(true);
    } else {
      setError("提交失败，请重试");
      setSubmitting(false);
      setStatusText("");
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center">
        <svg className="mx-auto h-10 w-10 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-3 text-lg font-semibold text-green-700">已提交审核</h3>
        <p className="mt-1 text-sm text-green-600">图鉴已进入待审核队列。</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          {createdItemId && (
            <button
              type="button"
              onClick={() => router.push(`/items/${createdItemId}`)}
              className="rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition"
            >
              查看图鉴
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setDone(false);
              setCandidate(EMPTY_CANDIDATE);
              setPreviews([]);
              setCompressedFiles([]);
              setCreatedItemId(null);
            }}
            className="rounded-xl border border-green-300 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 transition"
          >
            继续导入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 图片上传 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-600">
          上传截图或图片（最多 {MAX_IMPORT_IMAGES} 张）
        </label>

        {previews.length > 0 && (
          <div className="mb-2 grid grid-cols-3 gap-2">
            {previews.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-pink-100 bg-slate-100">
                <img
                  src={url}
                  alt={`图片 ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  disabled={submitting}
                  className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white/80 hover:bg-black/70 transition"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {compressedFiles.length < MAX_IMPORT_IMAGES && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/30 text-slate-400 transition hover:border-pink-400 hover:text-pink-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="mt-1 text-[10px]">{compressedFiles.length}/{MAX_IMPORT_IMAGES}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageSelect}
                  disabled={submitting}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        {previews.length === 0 && (
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-pink-200 py-8 px-4 transition hover:border-pink-400 hover:bg-pink-50/30">
            <svg className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-slate-400">点击上传截图（jpg、png、webp）</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              disabled={submitting}
              className="hidden"
            />
          </label>
        )}

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      {/* 编辑 */}
      <CandidateEditor
        candidate={candidate}
        onChange={setCandidate}
        readOnly={submitting}
      />

      {/* 提交按钮 */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !candidate.title.trim() || compressedFiles.length === 0}
        className="w-full rounded-xl bg-pink-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-pink-600 disabled:opacity-50"
      >
        {submitting ? (
          <>
            <svg className="inline-block h-4 w-4 mr-1.5 animate-spin align-text-bottom" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {statusText || "提交中…"}
          </>
        ) : "提交为待审核图鉴"}
      </button>
    </div>
  );
}
