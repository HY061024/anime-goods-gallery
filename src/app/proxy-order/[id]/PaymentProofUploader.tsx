"use client";

import { useState, useRef } from "react";
import { createBrowserSupabase } from "@/lib/supabaseBrowser";
import { compressImage } from "@/lib/compressImage";
import { useRouter } from "next/navigation";

interface Props {
  orderId: number;
}

export default function PaymentProofUploader({ orderId }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      // 1. 压缩图片
      const compressed = await compressImage(file);

      // 2. 生成唯一文件名
      const ext = "jpg";
      const fileName = `proxy-order-${orderId}-${Date.now()}.${ext}`;

      // 3. 直传 Supabase Storage
      const supabase = createBrowserSupabase();
      const { error: uploadError } = await supabase.storage
        .from("goods")
        .upload(fileName, compressed, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw new Error(`上传失败: ${uploadError.message}`);

      // 4. 获取 public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("goods").getPublicUrl(fileName);

      // 5. 调用 RPC 更新订单状态
      const { error: rpcError } = await supabase.rpc("upload_payment_proof", {
        p_order_id: orderId,
        p_proof_url: publicUrl,
      });

      if (rpcError) throw new Error(rpcError.message);

      // 6. 成功
      setDone(true);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "上传失败，请重试");
    } finally {
      setUploading(false);
      // 重置 file input 以便重新选择同一文件
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mb-2 text-3xl">✅</div>
        <p className="text-sm font-medium text-green-600">已提交给管理员审核</p>
        <p className="mt-1 text-xs text-slate-500">管理员确认凭证后将开始采购</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id={`upload-proof-${orderId}`}
      />

      <label
        htmlFor={`upload-proof-${orderId}`}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition ${
          uploading
            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-pink-500 text-white shadow hover:bg-pink-600"
        }`}
      >
        {uploading ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            上传中…
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            选择付款截图上传
          </>
        )}
      </label>

      <p className="mt-2 text-[11px] text-slate-400">
        支持 JPG/PNG，自动压缩
      </p>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
