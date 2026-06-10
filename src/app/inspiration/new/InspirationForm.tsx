"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabaseBrowser";
import { compressImage } from "@/lib/compressImage";
import { TYPE_LABELS } from "@/data/inspiration";
import type { InspirationType } from "@/data/inspiration";
import {
  MAX_IMAGES,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEOS,
  ALLOWED_VIDEO_TYPES,
  MAX_VIDEO_SIZE,
  MAX_TITLE_LENGTH,
  MAX_CONTENT_LENGTH,
  MAX_TAGS,
  MAX_TAG_LENGTH,
  FORBIDDEN_TAG_CHARS,
} from "@/data/inspiration";
import { publishPost } from "../actions";

const TYPES: InspirationType[] = ["video", "note", "material", "question"];

const TYPE_HINTS: Record<InspirationType, string> = {
  video: "分享一个视频（支持上传或粘贴外部链接）",
  note: "分享你的二次元周边心得、测评或收藏经验",
  material: "分享素材资源（图片、模板等）",
  question: "提出问题，向大家请教",
};

type PublishState = "idle" | "uploadingImages" | "uploadingVideo" | "publishing";

// ====== 标签解析（客户端预览用） ======
function parseTags(raw: string): string[] {
  return raw
    .split(/[,，\s]+/)
    .map((t) => t.replace(/^#+/, "").trim())
    .filter(Boolean);
}

function validateTags(raw: string): string | null {
  const parts = parseTags(raw);
  const seen = new Set<string>();
  for (const tag of parts) {
    if (FORBIDDEN_TAG_CHARS.test(tag)) {
      return `标签包含不允许的字符：${tag}`;
    }
    if (tag.length > MAX_TAG_LENGTH) {
      return `单个标签最长 ${MAX_TAG_LENGTH} 个字符：${tag}`;
    }
    seen.add(tag.toLowerCase());
  }
  if (seen.size > MAX_TAGS) {
    return `最多添加 ${MAX_TAGS} 个标签`;
  }
  return null;
}

export default function InspirationForm() {
  const router = useRouter();

  // 表单字段
  const [type, setType] = useState<InspirationType>("note");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState(""); // 外部视频链接（可选）
  const [materialUrl, setMaterialUrl] = useState("");
  const [work, setWork] = useState("");
  const [character, setCharacter] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  // 图片
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [compressedImages, setCompressedImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState("");

  // 视频文件
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewName, setVideoPreviewName] = useState("");
  const [videoError, setVideoError] = useState("");

  // 发布状态
  const [publishState, setPublishState] = useState<PublishState>("idle");
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState("");

  // 标签实时校验
  const tagError = tagsStr ? validateTags(tagsStr) : null;

  // 清理 preview URL
  const imagePreviewUrlsRef = useRef<string[]>([]);
  useEffect(() => {
    return () => {
      imagePreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // ====== 图片处理 ======
  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setImageError("");

    // 检查数量
    const totalAfter = compressedImages.length + files.length;
    if (totalAfter > MAX_IMAGES) {
      setImageError(`最多上传 ${MAX_IMAGES} 张图片，当前已有 ${compressedImages.length} 张`);
      e.target.value = "";
      return;
    }

    setPublishState("idle");
    setStatusText(`正在压缩 ${files.length} 张图片…`);

    const newCompressed: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      // 类型检查
      if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
        setImageError(`不支持的图片格式：${file.type || file.name}。仅支持 jpg、png、webp`);
        continue;
      }

      try {
        // 压缩
        const compressed = await compressImage(file);

        // 大小检查
        if (compressed.size > MAX_IMAGE_SIZE) {
          setImageError(`"${file.name}" 压缩后仍超过 2MB，请更换或压缩后再上传`);
          continue;
        }

        const previewUrl = URL.createObjectURL(compressed);
        imagePreviewUrlsRef.current.push(previewUrl);
        newCompressed.push(compressed);
        newPreviews.push(previewUrl);
      } catch {
        setImageError(`"${file.name}" 处理失败，请重试`);
      }
    }

    setCompressedImages((prev) => [...prev, ...newCompressed]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setStatusText("");
    e.target.value = "";
  }

  function removeImage(index: number) {
    const url = imagePreviews[index];
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
      imagePreviewUrlsRef.current = imagePreviewUrlsRef.current.filter((u) => u !== url);
    }
    setCompressedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageError("");
  }

  // ====== 视频处理 ======
  function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoError("");

    if (!ALLOWED_VIDEO_TYPES.includes(file.type as typeof ALLOWED_VIDEO_TYPES[number])) {
      setVideoError(`不支持的视频格式：${file.type || file.name}。仅支持 mp4、webm、mov`);
      e.target.value = "";
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setVideoError("视频过大，第一版暂时支持 50MB 以内视频");
      e.target.value = "";
      return;
    }

    setVideoFile(file);
    setVideoPreviewName(file.name);
    setPublishState("idle");
    e.target.value = "";
  }

  function removeVideo() {
    setVideoFile(null);
    setVideoPreviewName("");
    setVideoError("");
  }

  // ====== 发布 ======
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // 标签客户端校验
    if (tagsStr) {
      const tagErr = validateTags(tagsStr);
      if (tagErr) {
        setError(tagErr);
        return;
      }
    }

    // 图片错误检查
    if (imageError) {
      setError(imageError);
      return;
    }

    // 视频错误检查
    if (videoError) {
      setError(videoError);
      return;
    }

    // 空内容检查（客户端预检）
    const hasContent = content.trim().length > 0;
    const hasImages = compressedImages.length > 0;
    const hasVideo = Boolean(videoFile || videoUrl.trim());
    const hasMaterial = type === "material" && materialUrl.trim().length > 0;
    if (!hasContent && !hasImages && !hasVideo && !hasMaterial) {
      setError("请填写内容，或上传图片/视频");
      return;
    }

    // 标题检查（客户端预检）
    if (type !== "material" && !title.trim()) {
      setError("请填写标题");
      return;
    }

    const supabase = createBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("请先登录");
      return;
    }
    const userId = user.id;

    let uploadedImageUrls: string[] = [];
    let uploadedVideoUrl = "";

    // ---- 上传图片 ----
    if (compressedImages.length > 0) {
      setPublishState("uploadingImages");
      setStatusText("图片上传中…");

      for (let i = 0; i < compressedImages.length; i++) {
        const file = compressedImages[i];
        setStatusText(`图片上传中（${i + 1}/${compressedImages.length}）…`);

        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const path = `inspiration/images/${userId}/${safeName}`;

        const { error: uploadErr } = await supabase.storage
          .from("goods")
          .upload(path, file, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (uploadErr) {
          setError(`图片上传失败：${uploadErr.message}`);
          setPublishState("idle");
          setStatusText("");
          return;
        }

        const { data: urlData } = supabase.storage.from("goods").getPublicUrl(path);
        uploadedImageUrls.push(urlData.publicUrl);
      }
    }

    // ---- 上传视频 ----
    if (videoFile) {
      setPublishState("uploadingVideo");
      setStatusText("视频上传中，请不要关闭页面");

      const ext = videoFile.name.split(".").pop()?.toLowerCase() ?? "mp4";
      const safeExt = ["mp4", "webm", "mov"].includes(ext) ? ext : "mp4";
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
      const videoPath = `inspiration/videos/${userId}/${safeName}`;

      try {
        const { error: uploadErr } = await supabase.storage
          .from("goods")
          .upload(videoPath, videoFile, {
            contentType: videoFile.type || "video/mp4",
            upsert: false,
          });

        if (uploadErr) {
          setError(`视频上传失败：${uploadErr.message}`);
          setPublishState("idle");
          setStatusText("");
          return;
        }

        const { data: urlData } = supabase.storage.from("goods").getPublicUrl(videoPath);
        uploadedVideoUrl = urlData.publicUrl;
        setStatusText("上传成功");
      } catch (uploadErr) {
        setError(`视频上传失败：${uploadErr instanceof Error ? uploadErr.message : "未知错误"}`);
        setPublishState("idle");
        setStatusText("");
        return;
      }
    }

    // ---- 发布 ----
    setPublishState("publishing");
    setStatusText("发布中…");

    const fd = new FormData();
    fd.set("type", type);
    fd.set("title", title);
    fd.set("content", content);
    fd.set("imageUrls", JSON.stringify(uploadedImageUrls));
    fd.set("videoUrl", uploadedVideoUrl || videoUrl);
    fd.set("materialUrl", materialUrl);
    fd.set("work", work);
    fd.set("character", character);
    fd.set("tags", tagsStr);
    fd.set("visibility", visibility);

    const result = await publishPost(fd);
    if (result.success && result.postId) {
      router.push(`/inspiration/${result.postId}`);
    } else {
      setError(result.error ?? "发布失败");
      setPublishState("idle");
      setStatusText("");
    }
  }

  // ====== 按钮文案 ======
  function getButtonText(): string {
    switch (publishState) {
      case "uploadingImages": return statusText || "图片上传中…";
      case "uploadingVideo": return "视频上传中，请不要关闭页面";
      case "publishing": return "发布中…";
      default: return "发布";
    }
  }

  const isUploading = publishState !== "idle";
  const parsedTags = parseTags(tagsStr);

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      {/* ====== 顶部提示 ====== */}
      <div className="rounded-xl bg-pink-50 border border-pink-100 px-4 py-3 text-xs text-slate-500 leading-relaxed">
        <p>支持图片、视频、文字灵感分享。请勿上传侵权素材、盗版资源或无授权内容。</p>
        {type === "material" && (
          <p className="mt-1 text-pink-500 font-medium">请确认素材为原创、可分享，或你拥有使用授权。</p>
        )}
      </div>

      {/* ====== 类型选择 ====== */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-600">类型</label>
        <div className="grid grid-cols-4 gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); setVideoUrl(""); setMaterialUrl(""); }}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${type === t ? "bg-pink-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-slate-400">{TYPE_HINTS[type]}</p>
      </div>

      {/* ====== 图片上传 ====== */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-600">
          图片（可选，最多 {MAX_IMAGES} 张）
        </label>

        {/* 预览九宫格 */}
        {imagePreviews.length > 0 && (
          <div className="mb-2 grid grid-cols-3 gap-2 sm:grid-cols-3">
            {imagePreviews.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-pink-100 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`图片 ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white/80 hover:bg-black/70 transition"
                  aria-label="删除图片"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {compressedImages.length < MAX_IMAGES && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/30 text-slate-400 transition hover:border-pink-400 hover:text-pink-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="mt-1 text-[10px]">{compressedImages.length}/{MAX_IMAGES}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageSelect}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        {/* 无图片时的上传按钮 */}
        {imagePreviews.length === 0 && (
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-pink-200 py-8 px-4 transition hover:border-pink-400 hover:bg-pink-50/30">
            <svg className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-slate-400">点击上传图片（jpg、png、webp）</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        )}

        {imageError && <p className="mt-1 text-xs text-red-500">{imageError}</p>}
      </div>

      {/* ====== 视频上传 ====== */}
      {type === "video" && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            上传视频（可选，最多 {MAX_VIDEOS} 个，50MB 以内）
          </label>

          {videoPreviewName ? (
            <div className="flex items-center gap-2 rounded-xl border border-pink-100 bg-white p-3">
              <svg className="h-5 w-5 shrink-0 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="flex-1 truncate text-sm text-slate-600">{videoPreviewName}</span>
              <button
                type="button"
                onClick={removeVideo}
                className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition"
                aria-label="移除视频"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-slate-200 py-6 px-4 transition hover:border-pink-400 hover:bg-pink-50/30">
              <svg className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-slate-400">点击上传视频（mp4、webm、mov）</span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoSelect}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          )}

          {videoError && <p className="mt-1 text-xs text-red-500">{videoError}</p>}

          {/* 外部视频链接 */}
          <div className="mt-3">
            <label className="mb-1 block text-xs text-slate-400">或粘贴外部视频链接（B站、YouTube 等）</label>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://"
              disabled={isUploading}
              className="w-full rounded-xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 disabled:opacity-50"
            />
          </div>

          {/* 视频上传提示 */}
          {videoFile && (
            <p className="mt-1 text-xs text-slate-400">视频较大时上传可能需要一些时间，请保持页面打开。</p>
          )}
        </div>
      )}

      {/* ====== 标题 ====== */}
      {type !== "material" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            标题 <span className="text-red-400">*</span>
            <span className="ml-1 text-xs font-normal text-slate-400">（最多 {MAX_TITLE_LENGTH} 字）</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === "question" ? "例如：这个手办值得入手吗？" : "给灵感起个标题…"}
            maxLength={MAX_TITLE_LENGTH}
            disabled={isUploading}
            className="w-full rounded-xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 disabled:opacity-50"
          />
        </div>
      )}

      {/* ====== 素材链接 ====== */}
      {type === "material" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">素材链接</label>
          <input
            value={materialUrl}
            onChange={(e) => setMaterialUrl(e.target.value)}
            placeholder="粘贴素材资源链接"
            disabled={isUploading}
            className="w-full rounded-xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 disabled:opacity-50"
          />
        </div>
      )}

      {/* ====== 正文 ====== */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          内容
          <span className="ml-1 text-xs font-normal text-slate-400">
            （最多 {MAX_CONTENT_LENGTH} 字，有图片或视频时可留空）
          </span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={type === "question" ? "详细描述你的问题…" : type === "video" ? "简单介绍这个视频…" : "写下你的想法…"}
          rows={6}
          maxLength={MAX_CONTENT_LENGTH}
          disabled={isUploading}
          className="w-full rounded-xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 resize-none disabled:opacity-50"
        />
        <p className="mt-0.5 text-right text-xs text-slate-400">{content.length}/{MAX_CONTENT_LENGTH}</p>
      </div>

      {/* ====== 作品/角色 ====== */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">关联作品（可选）</label>
          <input
            value={work}
            onChange={(e) => setWork(e.target.value)}
            placeholder="如：鬼灭之刃"
            disabled={isUploading}
            className="w-full rounded-xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">关联角色（可选）</label>
          <input
            value={character}
            onChange={(e) => setCharacter(e.target.value)}
            placeholder="如：灶门炭治郎"
            disabled={isUploading}
            className="w-full rounded-xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 disabled:opacity-50"
          />
        </div>
      </div>

      {/* ====== 标签 ====== */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          标签（可选，最多 {MAX_TAGS} 个，用空格或逗号分隔）
        </label>
        <input
          value={tagsStr}
          onChange={(e) => setTagsStr(e.target.value)}
          placeholder="如：鸣潮 长离 痛柜"
          disabled={isUploading}
          className="w-full rounded-xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 disabled:opacity-50"
        />
        {/* 标签预览 */}
        {parsedTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {parsedTags.map((tag, i) => (
              <span
                key={i}
                className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs text-pink-600"
              >
                #{tag}
              </span>
            ))}
            {parsedTags.length > MAX_TAGS && (
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-500">
                超出限制（{parsedTags.length}/{MAX_TAGS}）
              </span>
            )}
          </div>
        )}
        {tagError && <p className="mt-1 text-xs text-red-500">{tagError}</p>}
      </div>

      {/* ====== 可见范围 ====== */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">可见范围</label>
        <div className="flex gap-3">
          <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
              className="accent-pink-500"
            />
            公开
          </label>
          <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={visibility === "private"}
              onChange={() => setVisibility("private")}
              className="accent-pink-500"
            />
            仅自己可见
          </label>
        </div>
      </div>

      {/* ====== 错误提示 ====== */}
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
      )}

      {/* ====== 发布按钮 ====== */}
      <button
        type="submit"
        disabled={isUploading}
        className="w-full rounded-xl bg-pink-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-pink-600 disabled:opacity-50"
      >
        {isUploading && (
          <svg className="inline-block h-4 w-4 mr-1.5 animate-spin align-text-bottom" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {getButtonText()}
      </button>
    </form>
  );
}
