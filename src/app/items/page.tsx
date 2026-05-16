import Link from "next/link";
import { searchItems, getPopularWorks, getPopularCharacters } from "@/lib/items";
import { createClient } from "@/lib/supabaseServer";
import { getSubmitterNames } from "@/lib/profiles";
import { getCollectedItemIds } from "@/lib/collections";
import { getAllCategories } from "@/lib/categories";
import { collectItem } from "@/app/actions";
import ItemCard from "@/components/ItemCard";

type ItemsPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    work?: string;
    character?: string;
    submitted?: string;
    deleteRequested?: string;
  }>;
};

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const category = params.category ?? "";
  const work = params.work ?? "";
  const character = params.character ?? "";
  const submitted = params.submitted === "1";
  const deleteRequested = params.deleteRequested === "1";

  const [filteredItems, categories, popularWorks, popularCharacters, supabaseResult] = await Promise.all([
    searchItems({ q, category, work, character }),
    getAllCategories(),
    getPopularWorks(8),
    getPopularCharacters(12),
    createClient(),
  ]);
  const supabase = supabaseResult;
  const { data: { user } } = await supabase.auth.getUser();

  const submitterIds = filteredItems.map((i) => i.submitter_id).filter(Boolean) as string[];
  const [submitterNames, collectedIds] = await Promise.all([
    getSubmitterNames(submitterIds),
    user ? getCollectedItemIds(user.id) : Promise.resolve(new Set<number>()),
  ]);

  const activeFilterCount = [q, category, work, character].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <Link href="/" className="text-sm font-medium text-pink-500 transition hover:text-pink-600">
          ← 返回首页
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">谷子图鉴</h1>
        <p className="mt-2 text-gray-500">按 IP（作品）、角色或分类浏览所有二次元周边</p>
      </div>

      {/* 投稿成功提示 */}
      {submitted && (
        <div className="mb-6 rounded-2xl bg-green-50 px-5 py-4 text-sm text-green-700 ring-1 ring-green-200">
          投稿已提交，审核通过后会在图鉴中展示。感谢你的贡献！
        </div>
      )}

      {/* 删除申请成功提示 */}
      {deleteRequested && (
        <div className="mb-6 rounded-2xl bg-blue-50 px-5 py-4 text-sm text-blue-700 ring-1 ring-blue-200">
          删除申请已提交，管理员审核通过后该周边将被移除。
        </div>
      )}

      {/* 搜索和筛选表单 */}
      <form className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="grid gap-3 p-5 md:grid-cols-[1fr_160px_160px_100px]">
          <input
            name="q"
            defaultValue={q}
            placeholder="搜索角色、作品或周边名称…"
            className="rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />

          <input
            name="category"
            defaultValue={category}
            list="category-list"
            placeholder="分类筛选…"
            className="rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
          <datalist id="category-list">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <input
            name="work"
            defaultValue={work}
            list="work-list"
            placeholder="IP／作品…"
            className="rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
          <datalist id="work-list">
            {popularWorks.map((w) => (
              <option key={w.name} value={w.name} />
            ))}
          </datalist>

          <button className="rounded-xl bg-pink-500 px-5 py-3 font-medium text-white transition hover:bg-pink-600 active:bg-pink-700">
            搜索
          </button>
        </div>

        {/* 结果统计 */}
        <div className="flex items-center justify-between border-t border-gray-50 bg-gray-50/50 px-5 py-3">
          <p className="text-sm text-gray-500">
            找到 <span className="font-semibold text-pink-500">{filteredItems.length}</span> 条记录
            {activeFilterCount > 0 && (
              <span className="ml-1 text-gray-400">（已筛选）</span>
            )}
          </p>
          {activeFilterCount > 0 && (
            <Link href="/items" className="text-sm font-medium text-pink-500 transition hover:text-pink-600">
              清空全部筛选
            </Link>
          )}
        </div>
      </form>

      {/* 热门 IP 快捷标签 */}
      {!activeFilterCount && popularWorks.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-400">热门IP：</span>
          {popularWorks.map((w) => (
            <Link
              key={w.name}
              href={`/items?work=${encodeURIComponent(w.name)}`}
              className="rounded-full bg-white px-3 py-1.5 text-xs text-gray-600 shadow-sm ring-1 ring-gray-150 transition hover:bg-pink-50 hover:text-pink-500 hover:ring-pink-200"
            >
              {w.name}
              <span className="ml-1 text-gray-300">{w.count}</span>
            </Link>
          ))}
        </div>
      )}

      {/* 热门角色快捷标签 */}
      {!activeFilterCount && popularCharacters.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-400">热门角色：</span>
          {popularCharacters.map((c) => (
            <Link
              key={c.name}
              href={`/items?character=${encodeURIComponent(c.name)}`}
              className="rounded-full bg-white px-3 py-1.5 text-xs text-gray-600 shadow-sm ring-1 ring-gray-150 transition hover:bg-pink-50 hover:text-pink-500 hover:ring-pink-200"
            >
              {c.name}
              <span className="ml-1 text-gray-300">{c.count}</span>
            </Link>
          ))}
        </div>
      )}

      {/* 商品网格 */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item) => (
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
