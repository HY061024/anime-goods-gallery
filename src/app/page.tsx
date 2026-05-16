import Link from "next/link";
import { searchItems } from "@/lib/items";
import { createClient } from "@/lib/supabaseServer";
import { getSubmitterNames } from "@/lib/profiles";
import { getCollectedItemIds } from "@/lib/collections";
import { collectItem } from "@/app/actions";
import ItemCard from "@/components/ItemCard";

export default async function HomePage() {
  const items = await searchItems();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const submitterIds = items.map((i) => i.submitter_id).filter(Boolean) as string[];
  const [submitterNames, collectedIds] = await Promise.all([
    getSubmitterNames(submitterIds),
    user ? getCollectedItemIds(user.id) : Promise.resolve(new Set<number>()),
  ]);

  return (
    <>
      {/* Hero 区域 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-pink-400 to-purple-500">
        {/* 装饰背景 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-pink-200">
              Anime Goods Gallery
            </p>
            <h1 className="mb-4 text-4xl font-extrabold text-white md:text-5xl">
              二次元周边图鉴
            </h1>
            <p className="mx-auto mb-10 max-w-xl text-lg text-pink-100">
              收录手办、吧唧、亚克力、色纸、挂件等二次元周边，支持按角色、作品、分类搜索
            </p>

            {/* 搜索框 */}
            <form action="/items" className="mx-auto flex max-w-lg gap-2">
              <input
                name="q"
                placeholder="搜索角色、作品或周边名称…"
                className="flex-1 rounded-xl border-0 bg-white/95 px-5 py-3.5 text-gray-900 shadow-lg outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-white/50"
              />
              <button className="rounded-xl bg-gray-900 px-6 py-3.5 font-medium text-white shadow-lg transition hover:bg-gray-800">
                搜索
              </button>
            </form>

            {/* 快捷分类 */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-pink-200">热门分类：</span>
              {["手办", "吧唧", "亚克力", "色纸", "挂件"].map((cat) => (
                <Link
                  key={cat}
                  href={`/items?category=${cat}`}
                  className="rounded-full bg-white/20 px-3 py-1 text-sm text-white transition hover:bg-white/30"
                >
                  {cat}
                </Link>
              ))}
            </div>

            {/* 投稿 CTA */}
            <div className="mt-8">
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-pink-500 shadow-lg transition hover:bg-pink-50 hover:scale-105"
              >
                投稿你喜欢的周边 →
              </Link>
            </div>
          </div>
        </div>

        {/* 底部波浪 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="h-8 w-full fill-pink-50">
            <path d="M0 30C240 60 480 0 720 30s480 0 720-30v60H0V30z" />
          </svg>
        </div>
      </section>

      {/* 最新收录 */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">最新收录</h2>
            <p className="mt-1 text-sm text-gray-500">最近添加的周边商品</p>
          </div>
          <Link
            href="/items"
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-pink-500 shadow-sm transition hover:bg-pink-50"
          >
            查看全部 →
          </Link>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.slice(0, 8).map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                submitterName={submitterNames.get(item.submitter_id ?? "")}
                showCollectButton={!!user}
                collected={collectedIds.has(item.id)}
                onCollect={collectItem}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">还没有收录任何周边</p>
            <Link href="/submit" className="mt-3 inline-block text-sm font-medium text-pink-500">
              去投稿 →
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
