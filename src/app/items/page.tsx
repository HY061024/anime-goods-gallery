import Link from "next/link";
import { searchItems, getPopularWorks, getPopularCharacters } from "@/lib/items";
import { createClient } from "@/lib/supabaseServer";
import { getSubmitterInfos } from "@/lib/profiles";
import { getCollectedItemIds } from "@/lib/collections";
import { getAllCategories } from "@/lib/categories";
import { collectItem } from "@/app/actions";
import ips from "@/data/ips";
import ItemCard from "@/components/ItemCard";

type ItemsPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    work?: string;
    character?: string;
    minPrice?: string;
    maxPrice?: string;
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
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const submitted = params.submitted === "1";
  const deleteRequested = params.deleteRequested === "1";

  const [filteredItems, categories, popularWorks, popularCharacters, supabaseResult] = await Promise.all([
    searchItems({ q, category, work, character, minPrice, maxPrice }),
    getAllCategories(),
    getPopularWorks(8),
    getPopularCharacters(12),
    createClient(),
  ]);
  const supabase = supabaseResult;
  const { data: { user } } = await supabase.auth.getUser();

  const submitterIds = filteredItems.map((i) => i.submitter_id).filter(Boolean) as string[];
  const [submitterInfos, collectedIds] = await Promise.all([
    getSubmitterInfos(submitterIds),
    user ? getCollectedItemIds(user.id) : Promise.resolve(new Set<number>()),
  ]);

  const activeFilterCount = [q, category, work, character, params.minPrice, params.maxPrice].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <Link href="/" className="text-sm font-medium text-pink-500 transition hover:text-pink-600">
          ← 返回首页
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-slate-800">照影图鉴</h1>
        <p className="mt-2 text-slate-500">按 IP（作品）、角色或分类浏览所有二次元周边</p>

        {/* 操作入口 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-pink-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            公开投稿
          </Link>
          <Link
            href="/import"
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-dashed border-pink-300 bg-white px-4 py-2 text-sm font-medium text-pink-500 transition hover:bg-pink-50 hover:border-pink-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            智能导入
          </Link>
        </div>
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
      <form className="mb-4 overflow-hidden rounded-2xl bg-white border border-pink-100 shadow-sm">
        <div className="grid gap-3 p-5 md:grid-cols-[1fr_160px_160px_100px]">
          <input
            name="q"
            defaultValue={q}
            placeholder="搜索角色、作品或周边名称…"
            className="rounded-xl border border-pink-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />

          <input
            name="category"
            defaultValue={category}
            list="category-list"
            placeholder="分类筛选…"
            className="rounded-xl border border-pink-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
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
            className="rounded-xl border border-pink-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
          <datalist id="work-list">
            {ips.map((ip) => (
              <option key={ip} value={ip} />
            ))}
          </datalist>

          <button className="rounded-xl bg-pink-500 px-5 py-3 font-medium text-white transition hover:bg-pink-600 active:bg-pink-700">
            搜索
          </button>
        </div>

        <div className="flex items-center gap-3 border-t border-pink-50 px-5 pb-5">
          <span className="text-xs text-slate-400 shrink-0">价格区间</span>
          <input
            name="minPrice"
            type="number"
            min="0"
            step="0.01"
            defaultValue={params.minPrice ?? ""}
            placeholder="最低价"
            className="w-full rounded-xl border border-pink-200 px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400"
          />
          <span className="text-xs text-slate-300">—</span>
          <input
            name="maxPrice"
            type="number"
            min="0"
            step="0.01"
            defaultValue={params.maxPrice ?? ""}
            placeholder="最高价"
            className="w-full rounded-xl border border-pink-200 px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-400"
          />
        </div>

        {/* 结果统计 */}
        <div className="flex items-center justify-between border-t border-pink-50 bg-slate-50/50 px-5 py-3">
          <p className="text-sm text-slate-500">
            找到 <span className="font-semibold text-pink-500">{filteredItems.length}</span> 条记录
            {activeFilterCount > 0 && (
              <span className="ml-1 text-slate-400">（已筛选）</span>
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
          <span className="text-xs font-medium text-slate-400">热门IP：</span>
          {popularWorks.map((w) => (
            <Link
              key={w.name}
              href={`/items?work=${encodeURIComponent(w.name)}`}
              className="rounded-full bg-white border border-pink-100 px-3 py-1.5 text-xs text-slate-600 shadow-sm transition hover:bg-pink-50 hover:text-pink-500"
            >
              {w.name}
              <span className="ml-1 text-slate-300">{w.count}</span>
            </Link>
          ))}
        </div>
      )}

      {/* 热门角色快捷标签 */}
      {!activeFilterCount && popularCharacters.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400">热门角色：</span>
          {popularCharacters.map((c) => (
            <Link
              key={c.name}
              href={`/items?character=${encodeURIComponent(c.name)}`}
              className="rounded-full bg-white border border-pink-100 px-3 py-1.5 text-xs text-slate-600 shadow-sm transition hover:bg-pink-50 hover:text-pink-500"
            >
              {c.name}
              <span className="ml-1 text-slate-300">{c.count}</span>
            </Link>
          ))}
        </div>
      )}

      {/* 商品网格 */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item) => {
            const info = submitterInfos.get(item.submitter_id ?? "");
            return (
              <ItemCard
                key={item.id}
                item={item}
                submitterName={info?.displayName}
                submitterId={item.submitter_id ?? undefined}
                submitterAvatar={info?.avatarUrl}
                showCollectButton={!!user}
                collected={collectedIds.has(item.id)}
                onCollect={collectItem}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-pink-100 p-12 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-800">没有找到相关周边</p>
          <p className="mt-2 text-slate-500">可以换一个角色名、作品名或分类再试试</p>
          <Link href="/items" className="mt-4 inline-block text-sm font-medium text-pink-500">
            查看全部商品
          </Link>
        </div>
      )}
    </div>
  );
}
