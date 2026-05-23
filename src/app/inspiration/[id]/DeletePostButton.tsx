"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeletePostButton({
  postId,
  onDelete,
}: {
  postId: number;
  onDelete: (postId: number) => Promise<{ success?: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="ml-auto text-xs text-slate-400 hover:text-red-500 transition"
      >
        删除
      </button>
    );
  }

  return (
    <span className="ml-auto flex items-center gap-1.5 text-xs">
      <span className="text-slate-400">确认删除？</span>
      <button
        onClick={async () => {
          setDeleting(true);
          const result = await onDelete(postId);
          if (result.success) {
            router.push("/inspiration");
            router.refresh();
          }
          setDeleting(false);
        }}
        disabled={deleting}
        className="text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
      >
        {deleting ? "删除中…" : "确认"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="text-slate-400 hover:text-slate-500"
      >
        取消
      </button>
    </span>
  );
}
