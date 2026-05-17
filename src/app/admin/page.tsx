import { getAdminCount } from "@/lib/adminAuth";
import LoginForm from "./LoginForm";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const count = await getAdminCount();
  const needsSetup = count === 0;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="mb-2 flex justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500 text-white text-lg">
              周边
            </span>
          </div>

          <h1 className="text-center text-2xl font-bold text-gray-900">
            {needsSetup ? "初始化管理员" : "后台管理"}
          </h1>
          <p className="mb-6 mt-2 text-center text-sm text-gray-500">
            {needsSetup
              ? "首次使用，请设置超级管理员账号"
              : "请使用管理员账号登录"}
          </p>

          {needsSetup ? <SetupForm /> : <LoginForm />}
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          <a href="/" className="hover:text-pink-500 transition">← 返回首页</a>
        </p>
      </div>
    </div>
  );
}
