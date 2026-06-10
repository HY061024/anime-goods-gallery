"use client";
/* eslint-disable @next/next/no-img-element */

import type { ImportCandidate } from "@/data/items";

type Props = {
  candidate: ImportCandidate;
  onChange: (c: ImportCandidate) => void;
  readOnly?: boolean;
};

const IMAGE_TYPE_OPTIONS = [
  { value: "unknown" as const, label: "不确定" },
  { value: "real" as const, label: "实物图" },
  { value: "official" as const, label: "官图" },
];

export default function CandidateEditor({ candidate, onChange, readOnly }: Props) {
  function update<K extends keyof ImportCandidate>(key: K, value: ImportCandidate[K]) {
    onChange({ ...candidate, [key]: value });
  }

  function removeImage(index: number) {
    const newUrls = candidate.imageUrls.filter((_, i) => i !== index);
    update("imageUrls", newUrls);
  }

  return (
    <div className="space-y-4">
      {/* 图片预览 */}
      {candidate.imageUrls.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">
            图片预览（{candidate.imageUrls.length}/9）
          </label>
          <div className="grid grid-cols-3 gap-2">
            {candidate.imageUrls.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-pink-100 bg-slate-100">
                <img
                  src={url}
                  alt={`候选图片 ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 rounded-full bg-black/50 p-2 text-white/80 hover:bg-black/70 transition"
                    aria-label="删除图片"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 图片类型选择 */}
      {candidate.imageUrls.length > 0 && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">图片类型</label>
          <div className="flex gap-2">
            {IMAGE_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={readOnly}
                onClick={() => update("imageType", opt.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  candidate.imageType === opt.value
                    ? "bg-pink-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 标题 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          图鉴名称 <span className="text-red-400">*</span>
        </label>
        <input
          value={candidate.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="输入图鉴名称"
          maxLength={200}
          readOnly={readOnly}
          className="w-full rounded-xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 read-only:bg-slate-50"
        />
      </div>

      {/* 作品 + 角色 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">作品（可选）</label>
          <input
            value={candidate.work ?? ""}
            onChange={(e) => update("work", e.target.value)}
            placeholder="如：鬼灭之刃"
            readOnly={readOnly}
            className="w-full rounded-xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 read-only:bg-slate-50"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">角色（可选）</label>
          <input
            value={candidate.character ?? ""}
            onChange={(e) => update("character", e.target.value)}
            placeholder="如：灶门炭治郎"
            readOnly={readOnly}
            className="w-full rounded-xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 read-only:bg-slate-50"
          />
        </div>
      </div>

      {/* 分类 + 价格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">分类（可选）</label>
          <input
            value={candidate.category ?? ""}
            onChange={(e) => update("category", e.target.value)}
            placeholder="如：手办"
            readOnly={readOnly}
            className="w-full rounded-xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 read-only:bg-slate-50"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">价格（可选）</label>
          <input
            type="number"
            value={candidate.price ?? ""}
            onChange={(e) => update("price", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="¥"
            min={0}
            step={0.01}
            readOnly={readOnly}
            className="w-full rounded-xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 read-only:bg-slate-50"
          />
        </div>
      </div>

      {/* 描述 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">描述（可选）</label>
        <textarea
          value={candidate.description ?? ""}
          onChange={(e) => update("description", e.target.value)}
          placeholder="补充描述信息…"
          rows={3}
          maxLength={500}
          readOnly={readOnly}
          className="w-full rounded-xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 resize-none read-only:bg-slate-50"
        />
      </div>
    </div>
  );
}
