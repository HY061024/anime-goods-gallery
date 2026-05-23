"use client";

import { useState, useTransition } from "react";
import { createAdmin, removeAdmin } from "../../actions";

export default function AdminList({
  admins: initialAdmins,
}: {
  admins: {
    id: string;
    email: string;
    role: string;
    created_at: string;
    created_by: string | null;
  }[];
}) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate(formData: FormData) {
    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await createAdmin(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess("副管理员已创建");
        setShowForm(false);
        window.location.reload();
      }
    });
  }

  function handleRemove(id: string) {
    if (!confirm("确定要移除此管理员吗？")) return;
    setError("");
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      const result = await removeAdmin(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setAdmins((prev) => prev.filter((a) => a.id !== id));
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      {showForm ? (
        <form
          action={handleCreate}
          className="rounded-2xl bg-white p-5 shadow-sm border border-pink-100 space-y-3"
        >
          <h2 className="text-sm font-semibold text-slate-600">添加副管理员</h2>
          <div className="flex gap-3">
            <input
              name="email"
              type="email"
              placeholder="邮箱"
              required
              className="flex-1 rounded-xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400"
            />
            <input
              name="password"
              type="password"
              placeholder="密码（至少6位）"
              required
              minLength={6}
              className="flex-1 rounded-xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-pink-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-50"
            >
              {isPending ? "创建中…" : "创建"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-200"
            >
              取消
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-pink-600"
        >
          + 添加副管理员
        </button>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-500">{error}</p>
      )}
      {success && (
        <p className="rounded-xl bg-green-50 px-4 py-2 text-sm text-green-600">{success}</p>
      )}

      {/* Admin list */}
      <div className="space-y-2">
        {admins.map((admin) => (
          <div
            key={admin.id}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-pink-100"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">{admin.email}</p>
              <p className="text-xs text-slate-400">
                {admin.role === "super_admin" ? "超级管理员" : "副管理员"}
                {" · "}
                {new Date(admin.created_at).toLocaleDateString("zh-CN")}
              </p>
            </div>
            {admin.role !== "super_admin" && (
              <button
                onClick={() => handleRemove(admin.id)}
                disabled={isPending}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
              >
                移除
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
