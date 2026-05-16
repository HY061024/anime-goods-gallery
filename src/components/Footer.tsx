import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-pink-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          {/* 左侧品牌 */}
          <div>
            <p className="font-bold text-gray-900">二次元周边图鉴</p>
            <p className="mt-1 text-sm text-gray-500">
              收录手办、吧唧、亚克力、色纸、挂件等二次元周边
            </p>
          </div>

          {/* 右侧链接 */}
          <div className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-gray-500 transition hover:text-pink-500">
              首页
            </Link>
            <Link href="/items" className="text-gray-500 transition hover:text-pink-500">
              商品搜索
            </Link>
            <Link href="/admin" className="text-gray-500 transition hover:text-pink-500">
              后台管理
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
          二次元周边图鉴 © {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
