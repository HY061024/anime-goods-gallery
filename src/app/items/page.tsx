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

const filteredItems = await searchItems({
  q,
  category,
});

  return (
    <main className="min-h-screen bg-pink-50">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="text-sm font-medium text-pink-500">
              ← 返回首页
            </Link>

            <h1 className="mt-3 text-3xl font-bold text-gray-900">
              周边图鉴搜索
            </h1>

            <p className="mt-2 text-gray-900">
              根据角色、作品、分类或周边名称查找记录。
            </p>
          </div>
        </div>

        <form className="mb-8 grid gap-3 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-[1fr_180px_100px]">
          <input
            name="q"
            defaultValue={q}
            placeholder="搜索：初音未来、鸣潮、亚克力、吧唧..."
            className="rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
          />

          <select
            name="category"
            defaultValue={category}
            className="rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
          >
            <option value="">全部分类</option>

            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <button className="rounded-xl bg-pink-500 px-5 py-3 font-medium text-white hover:bg-pink-600">
            搜索
          </button>
        </form>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-900">
            当前找到{" "}
            <span className="font-semibold text-pink-500">
              {filteredItems.length}
            </span>{" "}
            条记录
          </p>

          {(q || category) && (
            <Link href="/items" className="text-sm text-pink-500">
              清空筛选
            </Link>
          )}
        </div>

        {filteredItems.length > 0 ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </section>
        ) : (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-900">
              没有找到相关周边
            </p>

            <p className="mt-2 text-gray-900">
              可以换一个角色名、作品名或分类再试试。
            </p>
          </div>
        )}
      </section>
    </main>
  );
}