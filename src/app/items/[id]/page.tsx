/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemById } from "@/lib/items";
import { createClient } from "@/lib/supabaseServer";
import { getSubmitterInfos } from "@/lib/profiles";
import { isInCollection } from "@/lib/collections";
import DeleteRequestButton from "./DeleteRequestButton";
import CollectButton from "./CollectButton";
import SupplementImageButton from "./SupplementImageButton";

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

  // 收集所有需要查询 profile 的用户 ID
  const allSubmitterIds = [submitterId, officialSubmitterId, realSubmitterId].filter(Boolean);

  const [submitterInfos, collected] = await Promise.all([
    allSubmitterIds.length > 0 ? getSubmitterInfos(allSubmitterIds) : Promise.resolve(new Map()),
    user ? isInCollection(user.id, item.id) : Promise.resolve(false),
  ]);

  const submitterInfo = submitterInfos.get(submitterId);
  const submitterName = submitterInfo?.displayName;

  const officialSubmitterInfo = submitterInfos.get(officialSubmitterId);
  const realSubmitterInfo = submitterInfos.get(realSubmitterId);

  const officialSubmitterName = officialSubmitterInfo?.displayName ?? (officialSubmitterId ? `用户${officialSubmitterId.slice(0, 6)}` : null);
  const realSubmitterName = realSubmitterInfo?.displayName ?? (realSubmitterId ? `用户${realSubmitterId.slice(0, 6)}` : null);

  const hasOfficial = !!item.official_image_url;
  const hasReal = !!item.real_image_url;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <Link href="/items" className="text-sm font-medium text-pink-500 transition hover:text-pink-600">
        ← 返回搜索页
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[480px_1fr]">
        {/* 左侧：图片区域 */}
        <div className="space-y-4">
          {/* 实物图 */}
          <ImageSection
            label="实物图"
            imageUrl={item.real_image_url}
            submitterName={realSubmitterName}
            submitterId={realSubmitterId}
            submitterAvatar={realSubmitterInfo?.avatarUrl}
            createdAt={item.real_image_created_at}
            emptyText="暂无实物图，欢迎补充"
            accentColor="green"
          />

          {/* 官图 */}
          <ImageSection
            label="官图"
            imageUrl={item.official_image_url}
            submitterName={officialSubmitterName}
            submitterId={officialSubmitterId}
            submitterAvatar={officialSubmitterInfo?.avatarUrl}
            createdAt={item.official_image_created_at}
            emptyText="暂无官图，欢迎补充"
            accentColor="blue"
          />

          {/* 兼容旧图片：只有当新字段都为空时才显示旧 image */}
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

          {/* 补充图片入口 */}
          {user && (!hasOfficial || !hasReal) && (
            <div className="mt-6 border-t border-pink-100 pt-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">补充图片</h3>
              <div className="flex flex-wrap gap-2">
                {!hasOfficial && <SupplementImageButton itemId={item.id} type="official" />}
                {!hasReal && <SupplementImageButton itemId={item.id} type="real" />}
              </div>
            </div>
          )}
          {user && hasOfficial && hasReal && (
            <div className="mt-6 border-t border-pink-100 pt-6">
              <p className="text-xs text-green-600 font-medium">图片已完整</p>
            </div>
          )}
          {!user && (!hasOfficial || !hasReal) && (
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

function ImageSection({
  label,
  imageUrl,
  submitterName,
  submitterId,
  submitterAvatar,
  createdAt,
  emptyText,
  accentColor,
}: {
  label: string;
  imageUrl?: string | null;
  submitterName?: string | null;
  submitterId?: string;
  submitterAvatar?: string | null;
  createdAt?: string | null;
  emptyText: string;
  accentColor: "green" | "blue";
}) {
  const borderColor = accentColor === "green" ? "border-green-200" : "border-blue-200";
  const labelBg = accentColor === "green" ? "bg-green-500" : "bg-blue-500";

  return (
    <div className={`overflow-hidden rounded-3xl bg-white shadow-sm border ${imageUrl ? ringGray : borderColor}`}>
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={label}
            className="aspect-square w-full object-cover"
          />
          <div className="px-4 py-3 space-y-1">
            <span className={`inline-block rounded-full ${labelBg} px-2 py-0.5 text-xs font-medium text-white`}>
              {label}
            </span>
            {submitterName && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>图片由</span>
                {submitterId ? (
                  <Link href={`/users/${submitterId}`} className="flex items-center gap-1 hover:text-pink-500 transition-colors">
                    {submitterAvatar && (
                      <img src={submitterAvatar} alt="" className="h-4 w-4 rounded-full object-cover" />
                    )}
                    <span className="font-medium">{submitterName}</span>
                  </Link>
                ) : (
                  <span className="font-medium">{submitterName}</span>
                )}
                <span>上传</span>
                {createdAt && <span>· {relativeTime(createdAt)}</span>}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex aspect-square w-full flex-col items-center justify-center bg-slate-50 text-slate-400">
          <svg className="h-10 w-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">{emptyText}</p>
        </div>
      )}
    </div>
  );
}

const ringGray = "border-pink-100";
