import Link from "next/link";
import { searchItems, getPopularWorks, getPopularCharacters } from "@/lib/items";
import { createClient } from "@/lib/supabaseServer";
import { getSubmitterInfos, getPublicCabinetUsers } from "@/lib/profiles";
import { getCollectedItemIds } from "@/lib/collections";
import { getAllCategories } from "@/lib/categories";
import { getInspirationPosts, getInspirationPostAuthors } from "@/lib/inspiration";
import { collectItem } from "@/app/actions";
import ItemCard from "@/components/ItemCard";
import InspirationCard from "@/components/InspirationCard";

export default async function HomePage() {
  const [items, categories, popularWorks, popularCharacters, cabinetUsers, inspirationPosts, supabase] = await Promise.all([
    searchItems(),
    getAllCategories(),
    getPopularWorks(8),
    getPopularCharacters(12),
    getPublicCabinetUsers(),
    getInspirationPosts({ limit: 4 }),
    createClient(),
  ]);
  const { data: { user } } = await supabase.auth.getUser();

  const submitterIds = items.map((i) => i.submitter_id).filter(Boolean) as string[];
  const inspirationAuthorIds = inspirationPosts.map((p) => p.user_id);
  const [submitterInfos, collectedIds, inspirationAuthors] = await Promise.all([
    getSubmitterInfos(submitterIds),
    user ? getCollectedItemIds(user.id) : Promise.resolve(new Set<number>()),
    getInspirationPostAuthors(inspirationAuthorIds),
  ]);

  const hotCategories = categories.slice(0, 8);

  return (
    <>
      {/* Hero 区域 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-400 via-pink-300 to-purple-400">
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="text-center">
            <p className="mb-3 text-sm font-semibold tracking-wider text-white/80">
              光影之间，留下你的收藏记忆
            </p>
            <h1 className="mb-4 text-4xl font-extrabold text-white md:text-5xl">
              照影
            </h1>
            <p className="mx-auto mb-10 max-w-xl text-lg text-white/80">
              按 IP（作品）、角色自由浏览，支持关键字搜索，找到你喜欢的周边
            </p>

            <form action="/items" className="mx-auto flex max-w-lg gap-2">
              <input
                name="q"
                placeholder="搜索角色、作品或周边名称…"
                className="flex-1 rounded-xl border-0 bg-white px-5 py-3.5 text-slate-800 shadow-lg outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-pink-300"
              />
              <button className="rounded-xl bg-gray-900 px-6 py-3.5 font-medium text-white shadow-lg transition hover:bg-gray-800">
                搜索
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {hotCategories.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-sm text-white/70">热门分类：</span>
                  {hotCategories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/items?category=${encodeURIComponent(cat)}`}
                      className="rounded-full bg-white/20 px-3 py-1 text-sm text-white transition hover:bg-white/30"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-pink-500 shadow-lg transition hover:bg-pink-50 hover:scale-105"
              >
                ✏️ 投稿你喜欢的周边
              </Link>
              <Link
                href="/import"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 bg-white/10 px-6 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition hover:bg-white/20 hover:scale-105"
              >
                🤖 智能导入图鉴
              </Link>
              <Link
                href="/proxy-order"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 bg-white/10 px-6 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition hover:bg-white/20 hover:scale-105"
              >
                🛍️ 日韩代购
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="h-8 w-full fill-[#faf5ff]">
            <path d="M0 30C240 60 480 0 720 30s480 0 720-30v60H0V30z" />
          </svg>
        </div>
      </section>

      {/* 快捷功能区 */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">快捷功能</h2>
          <p className="mt-1 text-sm text-slate-500">投稿、导入或找人代购你喜欢的周边</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/submit"
            className="group rounded-2xl bg-white border border-pink-100 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-pink-300 text-2xl">
                ✏️
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-pink-500 transition-colors">
                  投稿周边
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  手动填写周边信息，支持单个或批量上传
                </p>
              </div>
            </div>
          </Link>
          <Link
            href="/import"
            className="group rounded-2xl bg-white border border-pink-100 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 text-2xl">
                🤖
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-pink-500 transition-colors">
                  智能导入图鉴
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  粘贴链接或上传截图，自动识别周边信息
                </p>
              </div>
            </div>
          </Link>
          <Link
            href="/proxy-order"
            className="group rounded-2xl bg-white border border-pink-100 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 text-2xl">
                🛍️
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-pink-500 transition-colors">
                  日韩代购
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  提交链接并上传付款凭证后进入管理员处理
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 按 IP 浏览 */}
      {popularWorks.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">按 IP 浏览</h2>
              <p className="mt-1 text-sm text-slate-500">按作品系列查找周边</p>
            </div>
            <Link
              href="/items"
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-pink-500 border border-pink-100 shadow-sm transition hover:bg-pink-50"
            >
              全部作品 →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {popularWorks.map((w) => (
              <Link
                key={w.name}
                href={`/items?work=${encodeURIComponent(w.name)}`}
                className="group rounded-2xl bg-white p-4 border border-pink-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-purple-400 text-sm font-bold text-white">
                    {w.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-pink-500">
                      {w.name}
                    </p>
                    <p className="text-xs text-slate-400">{w.count} 件周边</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 按角色浏览 */}
      {popularCharacters.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">按角色浏览</h2>
              <p className="mt-1 text-sm text-slate-500">按角色查找周边</p>
            </div>
            <Link
              href="/items"
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-pink-500 border border-pink-100 shadow-sm transition hover:bg-pink-50"
            >
              全部角色 →
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {popularCharacters.map((c) => (
              <Link
                key={c.name}
                href={`/items?character=${encodeURIComponent(c.name)}`}
                className="rounded-full border border-pink-100 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition hover:border-pink-300 hover:bg-pink-50 hover:text-pink-500"
              >
                {c.name}
                <span className="ml-1.5 text-xs text-slate-300">{c.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 痛柜广场推广 */}
      {cabinetUsers.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">痛柜广场</h2>
              <p className="mt-1 text-sm text-slate-500">发现其他二次元爱好者的公开痛柜</p>
            </div>
            <Link
              href="/cabinets"
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-pink-500 border border-pink-100 shadow-sm transition hover:bg-pink-50"
            >
              查看全部 &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cabinetUsers.slice(0, 4).map((u) => (
              <Link
                key={u.user_id}
                href={`/users/${u.user_id}`}
                className="group overflow-hidden rounded-2xl bg-white border border-pink-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="h-16 bg-gradient-to-r from-pink-200 via-pink-100 to-purple-200">
                  {u.banner_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={u.banner_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="px-3 pb-3">
                  <div className="flex items-end gap-2 -mt-6">
                    <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white bg-pink-100 shrink-0">
                      {u.avatar_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-pink-400">
                          {(u.display_name ?? "?")[0]}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 pt-6">
                      <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-pink-500">
                        {u.display_name ?? `用户${u.user_id.slice(0, 6)}`}
                      </p>
                    </div>
                  </div>
                  {u.bio && (
                    <p className="mt-1.5 line-clamp-1 text-xs text-slate-400">{u.bio}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-300">{u.cabinet_views} 次浏览</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 照影灵感 */}
      {inspirationPosts.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">照影灵感</h2>
              <p className="mt-1 text-sm text-slate-500">二次元爱好者的灵感分享</p>
            </div>
            <Link
              href="/inspiration"
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-pink-500 border border-pink-100 shadow-sm transition hover:bg-pink-50"
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {inspirationPosts.map((post) => (
              <InspirationCard
                key={post.id}
                post={post}
                authorName={inspirationAuthors.get(post.user_id)?.displayName}
                authorAvatar={inspirationAuthors.get(post.user_id)?.avatarUrl}
              />
            ))}
          </div>
        </section>
      )}

      {/* 最新收录 */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">最新收录</h2>
            <p className="mt-1 text-sm text-slate-500">最近添加的周边商品</p>
          </div>
          <Link
            href="/items"
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-pink-500 border border-pink-100 shadow-sm transition hover:bg-pink-50"
          >
            查看全部 →
          </Link>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.slice(0, 8).map((item) => {
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
            <p className="text-slate-500">还没有收录任何周边</p>
            <Link href="/submit" className="mt-3 inline-block text-sm font-medium text-pink-500">
              去投稿 →
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
