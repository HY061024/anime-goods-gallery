import { requireAdmin } from "../auth";

// admin 布局：所有 /admin/* 页面加载前都会执行 requireAdmin()
// 未登录用户会被自动跳转到 /admin 登录页
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <>{children}</>;
}
