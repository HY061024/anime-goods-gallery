"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogout } from "../actions";

export default function AdminNav({
  role,
  unreadCount,
}: {
  role: string;
  unreadCount: number;
}) {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex items-center gap-1 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-gray-100">
      <NavLink href="/admin/items/new" active={pathname === "/admin/items/new"}>
        新增周边
      </NavLink>
      <NavLink
        href="/admin/items/review"
        active={pathname.startsWith("/admin/items/review")}
      >
        审核管理
      </NavLink>
      <NavLink
        href="/admin/notifications"
        active={pathname.startsWith("/admin/notifications")}
      >
        通知
        {unreadCount > 0 && (
          <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </NavLink>
      <NavLink
        href="/admin/feedback"
        active={pathname.startsWith("/admin/feedback")}
      >
        反馈
      </NavLink>
      {role === "super_admin" && (
        <NavLink
          href="/admin/admins"
          active={pathname.startsWith("/admin/admins")}
        >
          管理员
        </NavLink>
      )}

      <div className="ml-auto flex items-center gap-3 px-3">
        <span className="text-xs text-gray-400">
          {role === "super_admin" ? "超级管理员" : "副管理员"}
        </span>
        <span className="h-2 w-2 rounded-full bg-green-400" />
        <form action={adminLogout}>
          <button className="text-xs text-gray-400 hover:text-red-500 transition">
            退出
          </button>
        </form>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-pink-500 text-white shadow-sm"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      {children}
    </Link>
  );
}
