"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useTransition } from "react";
import type { Profile, ProfileUpdates } from "@/lib/profiles";
import { updateProfile } from "@/lib/profiles";
import { uploadProfileImage } from "@/lib/uploadAvatar";
import { compressImage } from "@/lib/compressImage";

export default function ProfileCard({
  profile,
  userId,
}: {
  profile: Profile;
  userId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [bannerUrl, setBannerUrl] = useState(profile.banner_url ?? "");

  const [avatarStatus, setAvatarStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [avatarError, setAvatarError] = useState("");
  const [bannerStatus, setBannerStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [bannerError, setBannerError] = useState("");

  const [isPending, startTransition] = useTransition();

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    console.log("handleAvatarChange 执行了", file);
    if (!file) return;
    setAvatarStatus("uploading");
    setAvatarError("");
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.set("file", compressed);
      fd.set("path", `avatars/${userId}.jpg`);
      const url = await uploadProfileImage(fd);
      if (url) {
        setAvatarUrl(url);
        setAvatarStatus("done");
      } else {
        setAvatarStatus("error");
        setAvatarError("上传失败，请重试");
      }
    } catch (e) {
      setAvatarStatus("error");
      setAvatarError(e instanceof Error ? e.message : "上传失败");
    }
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    console.log("handleBannerChange 执行了", file);
    if (!file) {
      setBannerError("未选择文件");
      return;
    }
    setBannerStatus("uploading");
    setBannerError("");
    try {
      const compressed = await compressImage(file);
      console.log("压缩完成，大小:", compressed.size);
      const fd = new FormData();
      fd.set("file", compressed);
      fd.set("path", `banners/${userId}.jpg`);
      const url = await uploadProfileImage(fd);
      console.log("上传结果 URL:", url);
      if (url) {
        setBannerUrl(url);
        setBannerStatus("done");
      } else {
        setBannerStatus("error");
        setBannerError("上传失败，请重试");
      }
    } catch (e) {
      setBannerStatus("error");
      setBannerError(e instanceof Error ? e.message : "上传失败");
    }
  }

  function save() {
    startTransition(async () => {
      const updates: ProfileUpdates = {};
      if (displayName !== (profile.display_name ?? "")) {
        updates.display_name = displayName;
      }
      if (bio !== (profile.bio ?? "")) {
        updates.bio = bio;
      }
      if (avatarUrl !== (profile.avatar_url ?? "")) {
        updates.avatar_url = avatarUrl;
      }
      if (bannerUrl !== (profile.banner_url ?? "")) {
        updates.banner_url = bannerUrl;
      }
      if (Object.keys(updates).length > 0) {
        await updateProfile(userId, updates);
      }
      setEditing(false);
    });
  }

  return (
    <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm border border-pink-100">
      {/* Banner */}
      <div className="relative h-32 bg-gradient-to-r from-pink-200 via-pink-100 to-purple-200">
        {bannerUrl && (
          <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
        )}
        {editing && (
          <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 flex-wrap">
            {bannerStatus === "uploading" && (
              <span className="rounded-lg bg-white/90 px-2 py-1 text-xs text-pink-500 font-medium">正在上传…</span>
            )}
            {bannerStatus === "done" && (
              <span className="rounded-lg bg-green-50 px-2 py-1 text-xs text-green-600 font-medium">上传成功</span>
            )}
            {bannerStatus === "error" && (
              <span className="rounded-lg bg-red-50 px-2 py-1 text-xs text-red-500">{bannerError}</span>
            )}
            <label
              htmlFor="banner-upload-input"
              className="cursor-pointer inline-flex items-center rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-slate-600 shadow-sm hover:bg-white"
              onClick={() => {
                console.log("换背景 label 被点击");
              }}
            >
              换背景
            </label>
            <input
              id="banner-upload-input"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleBannerChange}
              onClick={(e) => {
                console.log("banner input 被点击");
                // 允许重复选择同一文件
                (e.target as HTMLInputElement).value = "";
              }}
            />
            {/* 调试用可见 input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="text-[10px] text-slate-400 w-24"
              title="调试：可见的文件选择"
            />
          </div>
        )}
      </div>

      {/* Avatar + Info */}
      <div className="relative px-5 pb-5">
        <div className="-mt-10 mb-3 flex items-end gap-4">
          <div className="relative">
            <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-white bg-pink-100">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl text-pink-400">
                  {displayName?.[0] ?? "?"}
                </div>
              )}
            </div>
            {editing && (
              <>
                <label
                  htmlFor="avatar-upload-input"
                  className="absolute bottom-0 right-0 z-10 cursor-pointer rounded-full bg-pink-500 p-1 text-white hover:bg-pink-600"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </label>
                <input
                  id="avatar-upload-input"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                  onClick={(e) => {
                    (e.target as HTMLInputElement).value = "";
                  }}
                />
                {avatarStatus === "uploading" && (
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-pink-500 font-medium">
                    上传中…
                  </span>
                )}
                {avatarStatus === "error" && (
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-red-500">
                    {avatarError}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-10">
            {editing ? (
              <div className="space-y-2">
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="昵称"
                  maxLength={20}
                  className="w-full rounded-lg border border-pink-200 px-3 py-1.5 text-sm outline-none focus:border-pink-400"
                />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="写一句简介…"
                  maxLength={100}
                  rows={2}
                  className="w-full rounded-lg border border-pink-200 px-3 py-1.5 text-sm outline-none focus:border-pink-400 resize-none"
                />
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-800">
                  {displayName || "未设置昵称"}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {bio || "这个人很懒，什么都没写…"}
                </p>
              </>
            )}
          </div>

          <div className="pt-10 shrink-0">
            {editing ? (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={save}
                  disabled={isPending}
                  className="rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-pink-600 disabled:opacity-50"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200"
              >
                编辑资料
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
