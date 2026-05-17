import { requireAdmin } from "../auth";
import AdminNav from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <AdminNav />

      {children}
    </div>
  );
}
