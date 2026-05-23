import { requireSuperAdmin } from "../../auth";
import { getAllAdmins } from "@/lib/adminAuth";
import AdminList from "./AdminList";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  await requireSuperAdmin();
  const admins = await getAllAdmins();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-slate-800">管理员管理</h1>
      <p className="mb-6 text-sm text-slate-500">管理后台管理员账号</p>

      <AdminList admins={admins} />
    </div>
  );
}
