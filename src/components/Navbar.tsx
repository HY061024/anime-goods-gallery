"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/lib/authActions";

export default function Navbar({ userEmail }: { userEmail?: string | null }) {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const publicLinks = [
    { href: "/", label: "首页" },
    { href: "/items", label: "商品搜索" },
    { href: "/submit", label: "投稿" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500 text-white text-sm">
            周边
          </span>
          二次元图鉴
        </Link>

        {/* 桌面端导航 */}
        <nav className="hidden items-center gap-1 md:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-pink-50 hover:text-pink-600"
            >
              {link.label}
            </Link>
          ))}

          {userEmail ? (
            <>
              <Link
                href="/mypage"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-pink-50 hover:text-pink-600"
              >
                个人中心
              </Link>
              {/* 用户菜单 */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-pink-600 transition hover:bg-pink-50"
                >
                  <span className="max-w-[160px] truncate">{userEmail}</span>
                  <svg className={`h-4 w-4 transition ${userMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-gray-200">
                    <form action={logout}>
                      <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 transition hover:bg-red-50 hover:text-red-500">
                        退出登录
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-pink-50 hover:text-pink-600"
              >
                登录
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-600"
              >
                注册
              </Link>
            </>
          )}

          <Link
            href="/admin"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 transition hover:bg-gray-50 hover:text-gray-500"
          >
            后台管理
          </Link>
        </nav>

        {/* 移动端汉堡按钮 */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-gray-600 transition hover:bg-pink-50 md:hidden"
          aria-label="菜单"
        >
          {open ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* 移动端菜单 */}
      {open && (
        <nav className="border-t border-pink-100 bg-white px-4 pb-4 md:hidden">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-pink-50 hover:text-pink-600"
            >
              {link.label}
            </Link>
          ))}
          {userEmail ? (
            <>
              <Link
                href="/mypage"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-pink-50 hover:text-pink-600"
              >
                个人中心
              </Link>
              <form action={logout}>
                <button
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
                >
                  退出登录（{userEmail}）
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-pink-50 hover:text-pink-600"
              >
                登录
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-pink-500 transition hover:bg-pink-50"
              >
                注册
              </Link>
            </>
          )}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-400 transition hover:bg-gray-50"
          >
            后台管理
          </Link>
        </nav>
      )}
    </header>
  );
}
