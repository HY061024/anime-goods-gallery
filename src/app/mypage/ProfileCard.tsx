"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useTransition } from "react";
import type { Profile, ProfileUpdates } from "@/lib/profiles";
import { updateProfile } from "@/lib/profiles";
import { uploadProfileImage } from "@/lib/uploadAvatar";

async function uploadImage(file: File, path: string): Promise<string | null> {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("path", path);
  return uploadProfileImage(fd);
}

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
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file, `avatars/${userId}.jpg`);
    if (url) setAvatarUrl(url);
    setUploading(false);
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file, `banners/${userId}.jpg`);
    if (url) setBannerUrl(url);
    setUploading(false);
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
    <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      {/* Banner */}
      <div className="relative h-32 bg-gradient-to-r from-pink-200 via-pink-100 to-purple-200">
        {bannerUrl && (
          <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
        )}
        {editing && (
          <label className="absolute bottom-2 right-2 cursor-pointer rounded-lg bg-white/80 px-2 py-1 text-xs text-gray-600 hover:bg-white">
            {uploading ? "上传中…" : "换背景"}
            <input type="file" accept="image/*" onChange={handleBannerChange} className="sr-only" />
          </label>
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
              <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-pink-500 p-1 text-white hover:bg-pink-600">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
              </label>
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
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-pink-400"
                />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="写一句简介…"
                  maxLength={100}
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-pink-400 resize-none"
                />
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900">
                  {displayName || "未设置昵称"}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {bio || "这个人很懒，什么都没写…"}
                </p>
              </>
            )}
          </div>

          <div className="pt-10 shrink-0">
            {editing ? (
              <div className="flex gap-1">
                <button
                  onClick={save}
                  disabled={isPending}
                  className="rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-pink-600 disabled:opacity-50"
                >
                  保存
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-200"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-200"
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
