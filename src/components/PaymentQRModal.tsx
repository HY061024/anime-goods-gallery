"use client";

import { useEffect, useRef, useState } from "react";

interface PaymentQRModalProps {
  open: boolean;
  onClose: () => void;
  orderId?: number;
  /** 收款码图片 URL，由 Server Component 读取环境变量后传入 */
  alipayQrUrl: string;
  wechatQrUrl: string;
}

export default function PaymentQRModal({
  open,
  onClose,
  orderId,
  alipayQrUrl,
  wechatQrUrl,
}: PaymentQRModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedQr, setSelectedQr] = useState<{ title: string; src: string } | null>(null);
  const [alipayError, setAlipayError] = useState(false);
  const [wechatError, setWechatError] = useState(false);

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
            {/* 支付宝 */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-center">
              <p className="mb-2 text-xs font-semibold text-blue-600">支付宝</p>
              {alipayError ? (
                <div className="flex flex-col items-center justify-center gap-1 py-4">
                  <svg className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-[10px] text-slate-400">付款码暂未加载</p>
                  <p className="text-[10px] text-slate-400">请联系管理员</p>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedQr({ title: "支付宝", src: alipayQrUrl })}
                  className="w-full transition hover:ring-2 hover:ring-blue-300 rounded-lg"
                >
                  <img
                    src={alipayQrUrl}
                    alt="支付宝收款码"
                    className="mx-auto aspect-square w-full max-w-[140px] rounded-lg object-contain"
                    onError={() => setAlipayError(true)}
                  />
                </button>
              )}
              <p className="mt-1.5 text-[10px] text-slate-400">点击二维码可放大</p>
            </div>

            {/* 微信 */}
            <div className="rounded-xl border border-green-100 bg-green-50/50 p-3 text-center">
              <p className="mb-2 text-xs font-semibold text-green-600">微信支付</p>
              {wechatError ? (
                <div className="flex flex-col items-center justify-center gap-1 py-4">
                  <svg className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-[10px] text-slate-400">付款码暂未加载</p>
                  <p className="text-[10px] text-slate-400">请联系管理员</p>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedQr({ title: "微信支付", src: wechatQrUrl })}
                  className="w-full transition hover:ring-2 hover:ring-green-300 rounded-lg"
                >
                  <img
                    src={wechatQrUrl}
                    alt="微信收款码"
                    className="mx-auto aspect-square w-full max-w-[140px] rounded-lg object-contain"
                    onError={() => setWechatError(true)}
                  />
                </button>
              )}
              <p className="mt-1.5 text-[10px] text-slate-400">点击二维码可放大</p>
            </div>
          </div>

          {/* 全局错误提示：两个码都加载失败 */}
          {alipayError && wechatError && (
            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-center text-xs text-amber-700">
              付款码暂未加载，请联系管理员
            </div>
          )}

          {/* "去上传凭证" 按钮 */}
          <button
            onClick={handleUploadClick}
            className="mt-5 w-full rounded-xl bg-pink-500 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-pink-600"
          >
            我已付款，去上传凭证
          </button>
        </div>

        {/* 二维码放大 lightbox — 必须在 dialog 内部，才能突破 showModal 的 top layer */}
        {selectedQr && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedQr(null)}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setSelectedQr(null)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 内容区 — 点击不透传，防止误关 */}
            <div className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-3 text-lg font-bold text-white">{selectedQr.title}</h3>
              <img
                src={selectedQr.src}
                alt={selectedQr.title}
                className="max-h-[75vh] max-w-[90vw] rounded-2xl bg-white p-4 object-contain"
              />
              <p className="mt-4 text-center text-sm text-white/80">
                扫码付款后请保存付款截图
              </p>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
