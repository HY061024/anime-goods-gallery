"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useCallback, useRef } from "react";
import type { CarouselImage } from "./ImageCarousel";

type LightboxProps = {
  images: CarouselImage[];
  currentIndex: number;
  type: "official" | "real";
  onClose: () => void;
};

export default function Lightbox({ images, currentIndex, type, onClose }: LightboxProps) {
  const [index, setIndex] = useState(currentIndex);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const label = type === "official" ? "官图" : "实物图";

  const prev = useCallback(() => {
    setIndex((c) => (c > 0 ? c - 1 : images.length - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((c) => (c < images.length - 1 ? c + 1 : 0));
  }, [images.length]);

  // ESC 关闭
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

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

  const img = images[index];
  if (!img) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* 顶部信息栏 */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 text-white z-10">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${type === "official" ? "bg-blue-500" : "bg-green-500"} text-white`}>
            {label}
          </span>
          <span className="text-sm text-white/70">
            {index + 1} / {images.length}
          </span>
        </div>
        {img.submitter_name && (
          <span className="text-xs text-white/50">
            {img.submitter_name} 上传
            {img.created_at ? ` · ${img.created_at.slice(0, 10)}` : ""}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="rounded-full bg-white/10 p-1.5 text-white/80 hover:bg-white/20 transition"
          aria-label="关闭"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 图片区域 */}
      <div
        className="flex-1 flex items-center justify-center px-12 py-16 select-none"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={img.image_url}
          alt={`${label} ${index + 1}`}
          className="max-h-full max-w-full object-contain"
          draggable={false}
        />
      </div>

      {/* 左右切换 */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white/80 hover:bg-white/20 transition z-10"
            aria-label="上一张"
          >
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white/80 hover:bg-white/20 transition z-10"
            aria-label="下一张"
          >
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* 底部指示点 */}
      {images.length > 1 && (
        <div className="absolute bottom-4 flex items-center gap-1.5 z-10">
          {images.map((_, i) => (
            <span
              key={i}
              className={`block rounded-full transition-all ${i === index ? "h-2 w-2 bg-white" : "h-1.5 w-1.5 bg-white/30"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
