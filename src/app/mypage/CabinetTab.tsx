"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import type { Item } from "@/data/items";
import type { Profile } from "@/lib/profiles";
import ItemCard from "@/components/ItemCard";
import ItemForm from "@/components/ItemForm";
import BatchItemForm from "@/components/BatchItemForm";
import { addToCabinet, removeFromCabinet, toggleCabinetPublic, uploadToCabinet } from "./cabinet/actions";
import { batchUploadCabinet } from "@/lib/batchActions";

export default function CabinetTab({
  items,
  profile,
  userId,
  categories = [],
}: {
  items: Item[];
  profile: Profile;
  userId: string;
  categories?: string[];
}) {
  const [showUpload, setShowUpload] = useState(false);
  const [showBatchUpload, setShowBatchUpload] = useState(false);
  const [cabinetPublic, setCabinetPublic] = useState(profile.cabinet_public);
  const [localItems, setLocalItems] = useState(items);
  const [collectedIds, setCollectedIds] = useState<Set<number>>(
    new Set(items.map((i) => i.id))
  );

  async function handleTogglePublic() {
    await toggleCabinetPublic();
    setCabinetPublic(!cabinetPublic);
  }

  async function handleRemove(itemId: number) {
    const formData = new FormData();
    formData.set("itemId", String(itemId));
    await removeFromCabinet(formData);
    setLocalItems((prev) => prev.filter((i) => i.id !== itemId));
    setCollectedIds((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  }

  const shareUrl = cabinetPublic
    ? `${window.location.origin}/users/${userId}`
    : null;

  return (
    <div>
      {/* 工具栏 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            setShowUpload(!showUpload);
            setShowBatchUpload(false);
          }}
          className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-600"
        >
          {showUpload ? "取消上传" : "＋ 手动上传"}
        </button>

        <button
          onClick={() => {
            setShowBatchUpload(!showBatchUpload);
            setShowUpload(false);
          }}
          className="rounded-xl border border-pink-300 px-4 py-2 text-sm font-medium text-pink-500 transition hover:bg-pink-50"
        >
          {showBatchUpload ? "取消批量" : "📦 批量上传"}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePublic}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
              cabinetPublic ? "bg-pink-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                cabinetPublic ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm text-slate-600">
            {cabinetPublic ? "已公开" : "仅自己可见"}
          </span>
        </div>

        {shareUrl && (
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
          >
            复制分享链接
          </button>
        )}

        {cabinetPublic && (
          <span className="text-xs text-slate-400">
            {profile.cabinet_views} 次浏览
          </span>
        )}
      </div>

      {/* 上传表单 */}
      {showUpload && (
        <div className="mb-6">
          <ItemForm
            action={uploadToCabinet}
            title="上传到痛柜"
            description="私密上传，无需审核，仅自己可见（除非开启公开痛柜）"
            submitLabel="添加到痛柜"
            categories={categories}
          />
        </div>
      )}

      {/* 批量上传表单 */}
      {showBatchUpload && (
        <div className="mb-6 -mx-4">
          <BatchItemForm
            action={batchUploadCabinet}
            title="批量上传到痛柜"
            submitLabel="批量添加到痛柜"
            successPath="/mypage"
            categories={categories}
            cabinet
          />
        </div>
      )}

      {/* 商品网格 */}
      {localItems.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm border border-pink-100">
          <p className="text-lg font-semibold text-slate-800">痛柜还是空的</p>
          <p className="mt-2 text-slate-500">
            去「照影图鉴」逛逛，把喜欢的周边加入痛柜，或者点击上方手动上传
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {localItems.map((item) => (
            <div key={item.id} className="relative group/cabinet">
              <ItemCard
                item={item}
                submitterName={item.submitter_id === userId ? "我" : undefined}
              />
              {/* 移除按钮 */}
              <button
                onClick={async () => {
                  await handleRemove(item.id);
                }}
                className="absolute top-2 right-2 z-10 rounded-full bg-white/90 p-1.5 text-red-400 shadow-sm opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover/cabinet:opacity-100"
                title="从痛柜移除"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
