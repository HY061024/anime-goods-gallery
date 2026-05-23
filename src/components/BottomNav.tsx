"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavProps {
  userEmail: string | null;
  unreadMessages: number;
}

type TabKey = "home" | "inspiration" | "cabinet" | "me";

export default function BottomNav({ userEmail, unreadMessages }: BottomNavProps) {
  const pathname = usePathname();

  const activeTab = getActiveTab(pathname);

  const tabs = [
    {
      key: "home" as TabKey,
      href: "/",
      label: "首页",
      icon: HomeIcon,
    },
    {
      key: "inspiration" as TabKey,
      href: "/inspiration",
      label: "灵感",
      icon: InspirationIcon,
    },
    {
      key: "cabinet" as TabKey,
      href: "/mypage",
      label: "痛柜",
      icon: CabinetIcon,
      badge: unreadMessages,
    },
    {
      key: "me" as TabKey,
      href: "/profile",
      label: "我的",
      icon: PersonIcon,
    },
  ];

  return (
    <>
      {/* ====== 桌面端：左侧固定侧边栏 (lg 及以上) ====== */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[4.5rem] flex-col items-center bg-white border-r border-pink-100 z-40">
        {/* Logo */}
        <Link
          href="/"
          className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500 text-white text-xs font-bold"
        >
          照影
        </Link>

        {/* 三个 Tab（居中） */}
        <nav className="mt-auto mb-auto flex flex-col items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`relative flex w-full flex-col items-center gap-0.5 px-3 py-3 transition-colors duration-200 ${
                  isActive
                    ? "text-pink-500"
                    : "text-slate-400 hover:text-slate-500"
                }`}
              >
                {/* 左侧激活指示条 */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r-full bg-pink-500" />
                )}
                <tab.icon active={isActive} />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {tab.badge != null && tab.badge > 0 && (
                  <span className="absolute top-1 right-2 min-w-[16px] h-[16px] rounded-full bg-red-500 text-[9px] text-white flex items-center justify-center px-1">
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 底部用户头像 */}
        {userEmail ? (
          <Link
            href="/profile"
            className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-500 transition hover:ring-2 hover:ring-pink-300"
            title={userEmail}
          >
            {userEmail.charAt(0).toUpperCase()}
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:ring-2 hover:ring-pink-200"
            title="登录"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        )}
      </aside>

      {/* ====== 移动端：底部固定导航栏 (< lg) ====== */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex h-14 bg-white border-t border-pink-100"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors duration-200 border-t-2 ${
                isActive
                  ? "border-pink-500 text-pink-500"
                  : "border-transparent text-slate-400"
              }`}
            >
              <tab.icon active={isActive} />
              <span className="text-[11px] font-medium">{tab.label}</span>
              {tab.badge != null && tab.badge > 0 && (
                <span className="absolute top-1 right-1/4 min-w-[18px] h-[18px] rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center px-1">
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function getActiveTab(pathname: string): TabKey {
  if (pathname.startsWith("/inspiration")) return "inspiration";
  if (pathname.startsWith("/mypage")) return "cabinet";
  if (
    pathname === "/" ||
    pathname.startsWith("/items") ||
    pathname.startsWith("/submit") ||
    pathname.startsWith("/users/")
  )
    return "home";
  return "me";
}

/* ====== SVG 图标 ====== */

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? "currentColor" : "currentColor";
  return (
    <svg className="h-6 w-6" fill="none" stroke={c} strokeWidth={1.8} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
      />
    </svg>
  );
}

function CabinetIcon({ active }: { active: boolean }) {
  const c = active ? "currentColor" : "currentColor";
  return (
    <svg className="h-6 w-6" fill="none" stroke={c} strokeWidth={1.8} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
}

function InspirationIcon({ active }: { active: boolean }) {
  const c = active ? "currentColor" : "currentColor";
  return (
    <svg className="h-6 w-6" fill="none" stroke={c} strokeWidth={1.8} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}

function PersonIcon({ active }: { active: boolean }) {
  const c = active ? "currentColor" : "currentColor";
  return (
    <svg className="h-6 w-6" fill="none" stroke={c} strokeWidth={1.8} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}
