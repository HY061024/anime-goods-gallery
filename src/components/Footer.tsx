import Link from "next/link";

export default function Footer({ className = "" }: { className?: string }) {
  return (
    <footer className={`border-t border-pink-100 bg-white ${className}`}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          {/* 左侧品牌 */}
          <div>
            <p className="font-bold text-slate-800">照影</p>
            <p className="mt-1 text-sm text-slate-500">
              二次元周边图鉴与同好灵感社区
            </p>
          </div>

          {/* 右侧链接 */}
          <div className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-slate-500 transition hover:text-pink-500">
              首页
            </Link>
            <Link href="/items" className="text-slate-500 transition hover:text-pink-500">
              商品搜索
            </Link>
            <Link href="/inspiration" className="text-slate-500 transition hover:text-pink-500">
              灵感
            </Link>
            <Link href="/submit" className="text-slate-500 transition hover:text-pink-500">
              投稿
            </Link>
            <Link href="/admin" className="text-slate-500 transition hover:text-pink-500">
              后台管理
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-pink-100 pt-4 text-center text-xs text-slate-400">
          照影 &copy; {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
