"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabaseBrowser";
import CandidateEditor from "./CandidateEditor";
import { parseImportUrl, submitImportItem } from "./actions";
import type { ImportCandidate } from "@/data/items";

type Stage = "input" | "parsing" | "editing" | "submitting" | "done" | "error";

const EMPTY_CANDIDATE: ImportCandidate = {
  title: "",
  description: "",
  imageUrls: [],
  sourceUrl: "",
  sourcePlatform: "",
  confidence: 0,
  imageType: "unknown",
};

export default function LinkImportTab() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<Stage>("input");
  const [candidate, setCandidate] = useState<ImportCandidate>(EMPTY_CANDIDATE);
  const [error, setError] = useState("");
  const [statusText, setStatusText] = useState("");
  const [createdItemId, setCreatedItemId] = useState<number | null>(null);

  const isLoading = stage === "parsing" || stage === "submitting";

  async function handleParse() {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("请输入链接");
      return;
    }
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setError("请输入完整链接（含 https://）");
      return;
    }

    setStage("parsing");
    setError("");
    setStatusText("正在解析链接…");

    const result = await parseImportUrl(trimmed);

    if (result.error) {
      setError(result.error);
      setStage("error");
      return;
    }

    if (result.success && result.data) {
      setCandidate({
        title: result.data.title || "",
        description: result.data.description || "",
        imageUrls: result.data.imageUrls || [],
        sourceUrl: result.data.sourceUrl || trimmed,
        sourcePlatform: result.data.sourcePlatform || "网页",
        confidence: result.data.confidence,
        imageType: "unknown",
      });
      setStage("editing");
    }
  }

  async function handleSubmit() {
    setStage("submitting");
    setError("");
    setStatusText("");

    // 先上传图片到 Storage
    if (candidate.imageUrls.length > 0) {
      setStatusText("正在上传图片…");
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("请先登录");
        setStage("error");
        return;
      }

      const uploadedUrls: string[] = [];

      for (let i = 0; i < candidate.imageUrls.length; i++) {
        const imgUrl = candidate.imageUrls[i];

        // 如果已经是 Storage URL（截图导入），直接使用
        if (imgUrl.includes("supabase") || imgUrl.includes("storage")) {
          uploadedUrls.push(imgUrl);
          continue;
        }

        setStatusText(`正在下载并上传图片（${i + 1}/${candidate.imageUrls.length}）…`);

        try {
          // 下载外部图片
          const res = await fetch(imgUrl, { signal: AbortSignal.timeout(10000) });
          if (!res.ok) continue;

          const blob = await res.blob();
          const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
          const path = `import/images/${user.id}/${safeName}`;

          const { error: uploadErr } = await supabase.storage
            .from("goods")
            .upload(path, blob, {
              contentType: "image/jpeg",
              upsert: false,
            });

          if (uploadErr) continue;

          const { data: urlData } = supabase.storage.from("goods").getPublicUrl(path);
          uploadedUrls.push(urlData.publicUrl);
        } catch {
          // 下载失败，跳过该图片
          continue;
        }
      }

      if (uploadedUrls.length === 0) {
        setError("图片上传失败，请使用截图导入方式");
        setStage("error");
        return;
      }

      candidate.imageUrls = uploadedUrls;
    }

    // 提交
    setStatusText("正在提交…");
    const fd = new FormData();
    fd.set("title", candidate.title);
    fd.set("description", candidate.description ?? "");
    fd.set("work", candidate.work ?? "");
    fd.set("character", candidate.character ?? "");
    fd.set("category", candidate.category ?? "");
    fd.set("price", String(candidate.price ?? 0));
    fd.set("imageType", candidate.imageType ?? "unknown");
    fd.set("imageUrls", JSON.stringify(candidate.imageUrls));
    fd.set("sourceUrl", candidate.sourceUrl ?? "");
    fd.set("sourcePlatform", candidate.sourcePlatform ?? "");

    const result = await submitImportItem(fd);

    if (result.error) {
      setError(result.error);
      setStage("error");
      return;
    }

    if (result.success && result.itemId) {
      setCreatedItemId(result.itemId);
      setStage("done");
    } else {
      setError("提交失败，请重试");
      setStage("error");
    }
  }

  if (stage === "done") {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center">
        <svg className="mx-auto h-10 w-10 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-3 text-lg font-semibold text-green-700">已提交审核</h3>
        <p className="mt-1 text-sm text-green-600">
          图鉴已进入待审核队列，管理员审核通过后即可公开显示。
        </p>
        <p className="mt-1 text-xs text-green-500">
          其他用户可以继续补充作品、角色、价格等信息。
        </p>
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
            onClick={() => { setStage("input"); setUrl(""); setCandidate(EMPTY_CANDIDATE); setCreatedItemId(null); }}
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
      {/* URL 输入区 */}
      {stage === "input" || stage === "error" ? (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">
            粘贴链接
          </label>
          <div className="flex gap-2">
            <input
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); }}
              placeholder="https://..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 disabled:opacity-50"
              onKeyDown={(e) => { if (e.key === "Enter") handleParse(); }}
            />
            <button
              type="button"
              onClick={handleParse}
              disabled={isLoading}
              className="rounded-xl bg-pink-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-pink-600 disabled:opacity-50"
            >
              解析
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            支持小红书、B站、微博、贴吧等网页链接。系统仅读取公开标题和预览图。
          </p>
        </div>
      ) : null}

      {/* 解析中 */}
      {stage === "parsing" && (
        <div className="flex flex-col items-center py-8">
          <svg className="h-8 w-8 animate-spin text-pink-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-3 text-sm text-slate-500">{statusText}</p>
        </div>
      )}

      {/* 编辑候选 */}
      {(stage === "editing" || stage === "submitting") && (
        <>
          {/* 来源信息 */}
          {candidate.sourceUrl && (
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-2.5 text-xs text-blue-600 break-all">
              来源：{candidate.sourcePlatform ? `${candidate.sourcePlatform} · ` : ""}
              <span className="underline">{candidate.sourceUrl}</span>
              {candidate.confidence != null && (
                <span className="ml-2 text-blue-400">（置信度 {Math.round(candidate.confidence * 100)}%）</span>
              )}
            </div>
          )}

          <CandidateEditor
            candidate={candidate}
            onChange={setCandidate}
            readOnly={stage === "submitting"}
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={stage === "submitting" || !candidate.title.trim() || candidate.imageUrls.length === 0}
            className="w-full rounded-xl bg-pink-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-pink-600 disabled:opacity-50"
          >
            {stage === "submitting" ? (
              <>
                <svg className="inline-block h-4 w-4 mr-1.5 animate-spin align-text-bottom" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {statusText || "提交中…"}
              </>
            ) : "提交为待审核图鉴"}
          </button>
        </>
      )}

      {/* 错误 */}
      {error && stage !== "editing" && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}
      {error && stage === "editing" && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
}
