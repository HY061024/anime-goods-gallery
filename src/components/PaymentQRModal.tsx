"use client";

import { useEffect, useRef, useState } from "react";

interface PaymentQRModalProps {
  open: boolean;
  onClose: () => void;
  orderId?: number;
  /** 可配置的收款码图片 URL，默认使用本地 public/payments/ */
  alipayQrUrl?: string;
  wechatQrUrl?: string;
}

export default function PaymentQRModal({
  open,
  onClose,
  orderId,
  alipayQrUrl = "/payments/alipay.jpg",
  wechatQrUrl = "/payments/wechat.jpg",
}: PaymentQRModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  if (!open) return null;

  function handleUploadClick() {
    onClose();
    if (orderId) {
      window.location.href = `/proxy-order/${orderId}`;
    } else {
      window.location.href = "/proxy-order";
    }
  }

  return (
    <>
      <dialog
        ref={dialogRef}
        onClose={onClose}
        className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-2xl border-0 bg-white p-0 shadow-2xl backdrop:bg-black/50"
      >
        <div className="p-6">
          {/* 标题栏 */}
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">请扫码付款</h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 步骤指引 */}
          <div className="mb-5 space-y-2.5">
            <div className="flex items-center gap-2.5 rounded-lg bg-pink-50 p-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500 text-[11px] font-bold text-white">1</span>
              <span className="text-sm text-slate-700">选择支付宝或微信扫码付款</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg bg-pink-50 p-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500 text-[11px] font-bold text-white">2</span>
              <span className="text-sm text-slate-700">付款后保存付款截图</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg bg-pink-50 p-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500 text-[11px] font-bold text-white">3</span>
              <span className="text-sm text-slate-700">点击下方按钮上传凭证</span>
            </div>
          </div>

          {/* 两个收款码 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLightboxImg(alipayQrUrl)}
              className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-center transition hover:ring-2 hover:ring-blue-300"
            >
              <p className="mb-2 text-xs font-semibold text-blue-600">支付宝</p>
              <img
                src={alipayQrUrl}
                alt="支付宝收款码"
                className="mx-auto aspect-square w-full max-w-[140px] rounded-lg object-contain"
              />
              <p className="mt-1.5 text-[10px] text-slate-400">点击二维码可放大</p>
            </button>

            <button
              onClick={() => setLightboxImg(wechatQrUrl)}
              className="rounded-xl border border-green-100 bg-green-50/50 p-3 text-center transition hover:ring-2 hover:ring-green-300"
            >
              <p className="mb-2 text-xs font-semibold text-green-600">微信支付</p>
              <img
                src={wechatQrUrl}
                alt="微信收款码"
                className="mx-auto aspect-square w-full max-w-[140px] rounded-lg object-contain"
              />
              <p className="mt-1.5 text-[10px] text-slate-400">点击二维码可放大</p>
            </button>
          </div>

          {/* "去上传凭证" 按钮 */}
          <button
            onClick={handleUploadClick}
            className="mt-5 w-full rounded-xl bg-pink-500 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-pink-600"
          >
            我已付款，去上传凭证
          </button>
        </div>
      </dialog>

      {/* 二维码放大 lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex max-w-sm flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImg}
              alt="收款码"
              className="max-h-[70vh] max-w-full rounded-2xl bg-white p-4 object-contain"
            />
            <p className="mt-4 text-center text-sm text-white/80">
              扫码付款后请保存付款截图
            </p>
          </div>
        </div>
      )}
    </>
  );
}
