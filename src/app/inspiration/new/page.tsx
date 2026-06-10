import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import InspirationForm from "./InspirationForm";

export default async function NewInspirationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/inspiration" className="text-sm font-medium text-pink-500 transition hover:text-pink-600">
          ← 返回灵感广场
        </Link>
        <div className="mt-12 rounded-3xl bg-white p-12 text-center shadow-sm border border-pink-100">
          <svg className="mx-auto h-12 w-12 text-pink-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h1 className="mt-4 text-xl font-bold text-slate-800">登录后可发布灵感</h1>
          <p className="mt-2 text-slate-500">分享你的二次元周边心得、测评、视频和素材</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/auth/login" className="rounded-xl bg-pink-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-pink-600 transition">
              登录
            </Link>
            <Link href="/auth/signup" className="rounded-xl border border-pink-200 bg-white px-6 py-2.5 text-sm font-medium text-pink-500 hover:bg-pink-50 transition">
              注册
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/inspiration" className="text-sm font-medium text-pink-500 transition hover:text-pink-600">
        ← 返回灵感广场
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-slate-800">发布灵感</h1>
      <InspirationForm />
    </div>
  );
}
