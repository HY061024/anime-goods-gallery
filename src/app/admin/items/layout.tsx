import Link from "next/link";
import { requireAdmin } from "../auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* 后台导航栏 */}
      <nav className="mb-6 flex items-center gap-1 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-gray-100">
        <AdminNavLink href="/admin/items/new">新增周边</AdminNavLink>
        <AdminNavLink href="/admin/items/review">审核管理</AdminNavLink>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">已登录</span>
          <span className="h-2 w-2 rounded-full bg-green-400" />
        </div>
      </nav>

      {children}
    </div>
  );
}

// 简单的导航链接组件（之后可扩展高亮当前页面）
function AdminNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
    >
      {children}
    </Link>
  );
}
