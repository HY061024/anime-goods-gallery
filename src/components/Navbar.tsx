"use client";

import { useState } from "react";
import Link from "next/link";
import { logout, switchAccount } from "@/lib/authActions";

export default function Navbar({
  userEmail,
  unreadMessages = 0,
  className = "",
}: {
  userEmail?: string | null;
  unreadMessages?: number;
  className?: string;
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100 ${className}`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-gray-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500 text-white text-sm font-bold">
            照影
          </span>
          照影
        </Link>

        {/* 用户区域 */}
        <div className="flex items-center gap-2">
          {userEmail ? (
            <>
              {/* 消息图标 + 未读红点 */}
              <Link
                href="/mypage/messages"
                className="relative rounded-lg p-2 text-gray-500 transition hover:bg-pink-50 hover:text-pink-500"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                {unreadMessages > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center px-1">
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                )}
              </Link>

              {/* 用户菜单 */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-pink-600 transition hover:bg-pink-50"
                >
                  <span className="max-w-[120px] truncate">{userEmail}</span>
                  <svg
                    className={`h-4 w-4 transition ${userMenuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-gray-200">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 transition hover:bg-pink-50 hover:text-pink-500"
                    >
                      个人中心
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 transition hover:bg-red-50 hover:text-red-500"
                    >
                      退出登录
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        switchAccount();
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-400 transition hover:bg-gray-50 hover:text-gray-500"
                    >
                      切换账号
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <Link
                href="/auth/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-pink-50 hover:text-pink-600"
              >
                登录
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-xl bg-pink-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-pink-600"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
