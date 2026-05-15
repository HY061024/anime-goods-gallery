import Link from "next/link";
import { searchItems } from "@/lib/items";
import ItemCard from "@/components/ItemCard";


export default async function HomePage() {
  const items = await searchItems();

  return (
    <main className="min-h-screen bg-pink-50">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-pink-500">
            Anime Goods Gallery
          </p>

          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            二次元周边图鉴搜索站
          </h1>

          <p className="mb-8 max-w-2xl text-gray-900">
            收录手办、吧唧、亚克力、色纸、挂件等二次元周边，支持按角色、作品、分类搜索。
          </p>

          <form action="/items" className="flex max-w-2xl gap-3">
            <input
              name="q"
              placeholder="搜索：初音未来、鸣潮、亚克力、吧唧..."
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
            />

            <button className="rounded-xl bg-pink-500 px-6 py-3 font-medium text-white hover:bg-pink-600">
              搜索
            </button>
          </form>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">最新收录</h2>

          <Link href="/items" className="text-sm font-medium text-pink-500">
            查看全部
          </Link>
        </div>

        <section className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
{items.slice(0, 4).map((item) => (
  <ItemCard key={item.id} item={item} />
))}
</section>
      </section>
    </main>
  );
}