import Link from "next/link";
import { searchItems } from "@/lib/items";
import ItemCard from "@/components/ItemCard";

const categories = ["手办", "吧唧", "亚克力", "色纸", "挂件"];

type ItemsPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
};

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const category = params.category ?? "";

  const filteredItems = await searchItems({ q, category });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <Link href="/" className="text-sm font-medium text-pink-500 transition hover:text-pink-600">
          ← 返回首页
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">周边图鉴搜索</h1>
        <p className="mt-2 text-gray-500">根据角色、作品、分类或周边名称查找记录</p>
      </div>

      {/* 搜索和筛选表单 */}
      <form className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="grid gap-3 p-5 md:grid-cols-[1fr_160px_100px]">
          <input
            name="q"
            defaultValue={q}
            placeholder="搜索：初音未来、鸣潮、亚克力、吧唧…"
            className="rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />

          <select
            name="category"
            defaultValue={category}
            className="rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          >
            <option value="">全部分类</option>
            {categories.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <button className="rounded-xl bg-pink-500 px-5 py-3 font-medium text-white transition hover:bg-pink-600 active:bg-pink-700">
            搜索
          </button>
        </div>

        {/* 结果统计 */}
        <div className="flex items-center justify-between border-t border-gray-50 bg-gray-50/50 px-5 py-3">
          <p className="text-sm text-gray-500">
            找到 <span className="font-semibold text-pink-500">{filteredItems.length}</span> 条记录
          </p>
          {(q || category) && (
            <Link href="/items" className="text-sm font-medium text-pink-500 transition hover:text-pink-600">
              清空筛选
            </Link>
          )}
        </div>
      </form>

      {/* 商品网格 */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-lg font-semibold text-gray-900">没有找到相关周边</p>
          <p className="mt-2 text-gray-500">可以换一个角色名、作品名或分类再试试</p>
          <Link href="/items" className="mt-4 inline-block text-sm font-medium text-pink-500">
            查看全部商品
          </Link>
        </div>
      )}
    </div>
  );
}
