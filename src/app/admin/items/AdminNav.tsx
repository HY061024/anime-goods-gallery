"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex items-center gap-1 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-gray-100">
      <NavLink href="/admin/items/new" active={pathname === "/admin/items/new"}>
        新增周边
      </NavLink>
      <NavLink href="/admin/items/review" active={pathname.startsWith("/admin/items/review")}>
        审核管理
      </NavLink>
      <div className="ml-auto flex items-center gap-2 px-3">
        <span className="text-xs text-gray-400">已登录</span>
        <span className="h-2 w-2 rounded-full bg-green-400" />
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
      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-pink-500 text-white shadow-sm"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      {children}
    </Link>
  );
}
