"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useCallback } from "react";

export type CarouselImage = {
  image_url: string;
  submitter_id?: string | null;
  submitter_name?: string | null;
  submitter_avatar?: string | null;
  created_at?: string | null;
};

type ImageCarouselProps = {
  images: CarouselImage[];
  type: "official" | "real";
  onImageClick: (index: number) => void;
};

export default function ImageCarousel({ images, type, onImageClick }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const label = type === "official" ? "官图" : "实物图";
  const labelColor = type === "official" ? "bg-blue-500" : "bg-green-500";
  const emptyText = type === "official" ? "暂无官图，欢迎补充" : "暂无实物图，欢迎补充";

  const prev = useCallback(() => {
    setCurrent((c) => (c > 0 ? c - 1 : images.length - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c < images.length - 1 ? c + 1 : 0));
  }, [images.length]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.touches[0].clientX;
  }

  function handleTouchEnd() {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  }

  if (images.length === 0) {
    return (
      <div className="w-full max-w-full rounded-3xl bg-white shadow-sm border border-pink-100 overflow-hidden">
        <div className="flex aspect-[4/3] w-full max-w-full flex-col items-center justify-center bg-slate-50 text-slate-400 sm:h-[420px] max-sm:h-[300px]">
          <svg className="h-10 w-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">{emptyText}</p>
        </div>
      </div>
    );
  }

  const img = images[current];
  const showArrows = images.length > 1;

  return (
    <div className="w-full max-w-full rounded-3xl bg-white shadow-sm border border-pink-100 overflow-hidden">
      {/* 标签 + 计数 */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className={`inline-block rounded-full ${labelColor} px-2.5 py-0.5 text-xs font-medium text-white`}>
          {label}
        </span>
        <span className="text-xs text-slate-400">
          {current + 1} / {images.length}
        </span>
      </div>

      {/* 图片区域 */}
      <div
        className="relative w-full max-w-full bg-slate-100 sm:h-[420px] max-sm:h-[300px] flex items-center justify-center cursor-pointer select-none overflow-hidden"
        onClick={() => onImageClick(current)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={img.image_url}
          alt={`${label} ${current + 1}`}
          className="h-full w-full object-contain"
          draggable={false}
        />

        {/* 左右箭头 */}
        {showArrows && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow backdrop-blur-sm text-slate-700 hover:bg-white transition"
              aria-label="上一张"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow backdrop-blur-sm text-slate-700 hover:bg-white transition"
              aria-label="下一张"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
