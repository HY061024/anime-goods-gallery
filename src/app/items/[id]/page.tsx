/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemById } from "@/lib/items";
import { createClient } from "@/lib/supabaseServer";
import { getSubmitterInfos } from "@/lib/profiles";
import { isInCollection } from "@/lib/collections";
import { getItemImages } from "@/lib/itemImages";
import { groupItemImagesByType, canAddOfficialImage, canAddRealImage, getImageCount, MAX_OFFICIAL, MAX_REAL } from "@/data/items";
import type { ItemImage } from "@/data/items";
import DeleteRequestButton from "./DeleteRequestButton";
import CollectButton from "./CollectButton";
import SupplementImageButton from "./SupplementImageButton";
import type { CarouselImage } from "@/components/ImageCarousel";
import LightboxClient from "./LightboxClient";

type ItemDetailPageProps = {
  params: Promise<{ id: string }>;
};

function relativeTime(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  const months = Math.floor(days / 30);
  return `${months} 个月前`;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const item = await getItemById(id);

  if (!item) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const submitterId = item.submitter_id ?? "";
  const officialSubmitterId = item.official_image_submitter_id ?? "";
  const realSubmitterId = item.real_image_submitter_id ?? "";

  // 获取 item_images 多图数据
  const allImages = await getItemImages(item.id);
  const { official: officialImages, real: realImages } = groupItemImagesByType(allImages);

  // 收集所有需要查询 profile 的用户 ID
  const itemImageSubmitterIds = [...new Set(allImages.map((img) => img.submitter_id).filter((id): id is string => !!id))];
  const allSubmitterIds = [submitterId, officialSubmitterId, realSubmitterId, ...itemImageSubmitterIds].filter((id): id is string => !!id);

  const [submitterInfos, collected] = await Promise.all([
    allSubmitterIds.length > 0 ? getSubmitterInfos(allSubmitterIds) : Promise.resolve(new Map()),
    user ? isInCollection(user.id, item.id) : Promise.resolve(false),
  ]);

  const submitterInfo = submitterInfos.get(submitterId);
  const submitterName = submitterInfo?.displayName;

  // 构建 CarouselImage 数组（优先 item_images，fallback 旧字段）
  function buildCarouselImages(
    dbImages: ItemImage[],
    legacyUrl: string | null | undefined,
    type: "official" | "real"
  ): CarouselImage[] {
    if (dbImages.length > 0) {
      return dbImages.map((img) => {
        const info = submitterInfos.get(img.submitter_id ?? "");
        return {
          image_url: img.image_url,
          submitter_id: img.submitter_id,
          submitter_name: info?.displayName ?? (img.submitter_id ? `用户${img.submitter_id.slice(0, 6)}` : null),
          submitter_avatar: info?.avatarUrl,
          created_at: img.created_at,
        };
      });
    }
    // Fallback 到旧字段
    if (legacyUrl) {
      const legacySubmitterId = type === "official" ? officialSubmitterId : realSubmitterId;
      const legacyInfo = submitterInfos.get(legacySubmitterId);
      const legacyCreatedAt = type === "official" ? item!.official_image_created_at : item!.real_image_created_at;
      return [{
        image_url: legacyUrl,
        submitter_id: legacySubmitterId || null,
        submitter_name: legacyInfo?.displayName ?? (legacySubmitterId ? `用户${legacySubmitterId.slice(0, 6)}` : null),
        submitter_avatar: legacyInfo?.avatarUrl,
        created_at: legacyCreatedAt ?? null,
      }];
    }
    return [];
  }

  const officialCarouselImages = buildCarouselImages(officialImages, item.official_image_url, "official");
  const realCarouselImages = buildCarouselImages(realImages, item.real_image_url, "real");

  const hasOfficial = officialCarouselImages.length > 0;
  const hasReal = realCarouselImages.length > 0;

  // 贡献者显示名（去重）
  function getSubmitterNames(images: CarouselImage[]): string {
    const names = [...new Set(images.map((img) => img.submitter_name).filter(Boolean))];
    return names.length > 0 ? names.join("、") : "";
  }

  const officialContributors = getSubmitterNames(officialCarouselImages);
  const realContributors = getSubmitterNames(realCarouselImages);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <Link href="/items" className="text-sm font-medium text-pink-500 transition hover:text-pink-600">
        ← 返回搜索页
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[480px_1fr]">
        {/* 左侧：图片区域 */}
        <div className="space-y-4">
          {/* 实物图轮播 */}
          <LightboxClient images={realCarouselImages} type="real" />

          {/* 官图轮播 */}
          <LightboxClient images={officialCarouselImages} type="official" />

          {/* 兼容旧图片：只有当新字段和 item_images 都为空时才显示旧 image */}
          {!hasOfficial && !hasReal && item.image && (
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-pink-100">
              <img
                src={item.image}
                alt={item.title}
                className="aspect-square w-full object-cover"
              />
            </div>
          )}
        </div>

        {/* 右侧信息 */}
        <div className="rounded-3xl bg-white p-8 border border-pink-100 shadow-sm">
          {/* 分类标签 */}
          <span className="inline-block rounded-full bg-pink-50 px-3 py-1 text-sm font-medium text-pink-600">
            {item.category}
          </span>

          {/* 标题 */}
          <h1 className="mt-4 text-3xl font-bold text-slate-800">{item.title}</h1>

          {/* 作品/角色 */}
          <div className="mt-3 flex items-center gap-2 text-slate-500">
            <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-sm">{item.work}</span>
            <span className="text-slate-300">/</span>
            <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-sm">{item.character}</span>
          </div>

          {/* 条目提交者信息 */}
          {submitterId ? (
            <Link
              href={`/users/${submitterId}`}
              className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-pink-500 transition-colors"
            >
              <span className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-pink-100">
                {submitterInfo?.avatarUrl ? (
                  <img src={submitterInfo.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[10px] text-pink-400">
                    {(submitterName ?? "?")[0]}
                  </span>
                )}
              </span>
              <span className="font-medium">{submitterName ?? `用户${submitterId.slice(0, 6)}`}</span>
              {item.created_at && <span>· {relativeTime(item.created_at)}</span>}
            </Link>
          ) : submitterName ? (
            <p className="mt-3 text-xs text-slate-400">
              {submitterName}
              {item.created_at ? ` · ${relativeTime(item.created_at)}` : ""}
            </p>
          ) : null}

          {/* 价格 */}
          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-pink-500">¥{item.price}</span>
          </div>

          {/* 详细信息 */}
          <div className="mt-8 space-y-4 border-t border-pink-100 pt-6">
            <Info label="作品" value={item.work} />
            <Info label="角色" value={item.character} />
            <Info label="分类" value={item.category} />
            <Info label="价格" value={`¥${item.price}`} />
          </div>

          {/* 简介 */}
          {item.description && (
            <div className="mt-8 border-t border-pink-100 pt-6">
              <h2 className="mb-3 text-lg font-bold text-slate-800">周边简介</h2>
              <p className="leading-7 text-slate-600">{item.description}</p>
            </div>
          )}

          {/* 加入痛柜 */}
          {user && (
            <div className="mt-8 border-t border-pink-100 pt-6">
              <CollectButton itemId={item.id} initialCollected={collected} />
            </div>
          )}

          {/* 删除申请 */}
          <div className="mt-8 border-t border-pink-100 pt-6">
            <DeleteRequestButton itemId={item.id} />
          </div>

          {/* 贡献者 */}
          {(officialContributors || realContributors) && (
            <div className="mt-6 border-t border-pink-100 pt-6">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">图片贡献</h3>
              <div className="space-y-1 text-xs text-slate-500">
                {realContributors && (
                  <p><span className="inline-block w-10 rounded bg-green-100 px-1 py-0.5 text-center text-[10px] font-medium text-green-600 mr-1">实物</span>{realContributors}</p>
                )}
                {officialContributors && (
                  <p><span className="inline-block w-10 rounded bg-blue-100 px-1 py-0.5 text-center text-[10px] font-medium text-blue-600 mr-1">官图</span>{officialContributors}</p>
                )}
              </div>
            </div>
          )}

          {/* 补充图片入口 */}
          {user && (canAddOfficialImage(allImages) || canAddRealImage(allImages)) && (
            <div className="mt-6 border-t border-pink-100 pt-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">补充图片</h3>
              <div className="flex flex-wrap gap-2">
                {canAddOfficialImage(allImages) && (
                  <SupplementImageButton
                    itemId={item.id}
                    type="official"
                    currentCount={getImageCount(allImages, "official")}
                    maxCount={MAX_OFFICIAL}
                  />
                )}
                {canAddRealImage(allImages) && (
                  <SupplementImageButton
                    itemId={item.id}
                    type="real"
                    currentCount={getImageCount(allImages, "real")}
                    maxCount={MAX_REAL}
                  />
                )}
              </div>
            </div>
          )}
          {user && !canAddOfficialImage(allImages) && !canAddRealImage(allImages) && (
            <div className="mt-6 border-t border-pink-100 pt-6">
              <p className="text-xs text-green-600 font-medium">图片已完整</p>
            </div>
          )}
          {!user && (
            <div className="mt-6 border-t border-pink-100 pt-6">
              <p className="text-xs text-slate-400">
                登录后可补充图鉴图片
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-14 shrink-0 font-medium text-slate-400">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
