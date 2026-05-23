"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TYPE_LABELS } from "@/data/inspiration";
import type { InspirationType } from "@/data/inspiration";
import { publishPost } from "../actions";

const TYPES: InspirationType[] = ["video", "note", "material", "question"];

const TYPE_HINTS: Record<InspirationType, string> = {
  video: "分享一个视频链接（B站、YouTube 等）",
  note: "分享你的二次元周边心得、测评或收藏经验",
  material: "分享素材资源链接（图片、模板等）",
  question: "提出问题，向大家请教",
};

export default function NewInspirationPage() {
  const router = useRouter();
  const [type, setType] = useState<InspirationType>("note");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");
  const [work, setWork] = useState("");
  const [character, setCharacter] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [error, setError] = useState("");

  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("请填写内容");
      return;
    }

    const fd = new FormData();
    fd.set("type", type);
    fd.set("title", title);
    fd.set("content", content);
    fd.set("coverUrl", coverUrl);
    fd.set("videoUrl", videoUrl);
    fd.set("materialUrl", materialUrl);
    fd.set("work", work);
    fd.set("character", character);
    fd.set("tags", tagsStr);
    fd.set("visibility", visibility);

    startTransition(async () => {
      const result = await publishPost(fd);
      if (result.success) {
        router.push(`/inspiration/${result.postId}`);
      } else {
        setError(result.error ?? "发布失败");
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/inspiration" className="text-sm font-medium text-pink-500 transition hover:text-pink-600">
        ← 返回灵感广场
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-gray-900">发布灵感</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* 类型选择 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">类型</label>
          <div className="grid grid-cols-4 gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  setVideoUrl("");
                  setMaterialUrl("");
                }}
                className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  type === t
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-gray-400">{TYPE_HINTS[type]}</p>
        </div>

        {/* 标题 (笔记/提问/视频 类型显示) */}
        {type !== "material" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">标题</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "question" ? "例如：这个手办值得入手吗？" : "给灵感起个标题…"}
              maxLength={100}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400"
            />
          </div>
        )}

        {/* 视频链接 */}
        {type === "video" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">视频链接</label>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="粘贴视频 URL（B站、YouTube 等）"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400"
            />
          </div>
        )}

        {/* 素材链接 */}
        {type === "material" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">素材链接</label>
            <input
              value={materialUrl}
              onChange={(e) => setMaterialUrl(e.target.value)}
              placeholder="粘贴素材资源链接"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400"
            />
          </div>
        )}

        {/* 封面图 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">封面图 URL（可选）</label>
          <input
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="粘贴图片链接作为封面"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400"
          />
        </div>

        {/* 内容 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            内容 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              type === "question"
                ? "详细描述你的问题…"
                : type === "video"
                  ? "简单介绍这个视频…"
                  : "写下你的想法…"
            }
            rows={6}
            maxLength={5000}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 resize-none"
          />
        </div>

        {/* 关联作品 / 角色 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">关联作品（可选）</label>
            <input
              value={work}
              onChange={(e) => setWork(e.target.value)}
              placeholder="如：鬼灭之刃"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">关联角色（可选）</label>
            <input
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              placeholder="如：灶门炭治郎"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400"
            />
          </div>
        </div>

        {/* 标签 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">标签（用逗号或空格分隔）</label>
          <input
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            placeholder="如：手办, 开箱, 粘土人"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400"
          />
        </div>

        {/* 可见性 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">可见范围</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
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
            <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
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

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-pink-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-pink-600 disabled:opacity-50"
        >
          {isPending ? "发布中…" : "发布"}
        </button>
      </form>
    </div>
  );
}
