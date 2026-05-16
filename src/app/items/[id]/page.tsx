/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemById } from "@/lib/items";
import DeleteRequestButton from "./DeleteRequestButton";

type ItemDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const item = await getItemById(id);

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/items" className="text-sm font-medium text-pink-500 transition hover:text-pink-600">
        ← 返回搜索页
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[480px_1fr]">
        {/* 左侧图片 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
          <img
            src={item.image}
            alt={item.title}
            className="aspect-square w-full object-cover"
          />
        </div>

        {/* 右侧信息 */}
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          {/* 分类标签 */}
          <span className="inline-block rounded-full bg-pink-50 px-3 py-1 text-sm font-medium text-pink-600">
            {item.category}
          </span>

          {/* 标题 */}
          <h1 className="mt-4 text-3xl font-bold text-gray-900">{item.title}</h1>

          {/* 作品/角色 */}
          <div className="mt-3 flex items-center gap-2 text-gray-500">
            <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-sm">{item.work}</span>
            <span className="text-gray-300">/</span>
            <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-sm">{item.character}</span>
          </div>

          {/* 价格 */}
          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-pink-500">¥{item.price}</span>
          </div>

          {/* 详细信息 */}
          <div className="mt-8 space-y-4 border-t border-gray-100 pt-6">
            <Info label="作品" value={item.work} />
            <Info label="角色" value={item.character} />
            <Info label="分类" value={item.category} />
            <Info label="价格" value={`¥${item.price}`} />
          </div>

          {/* 简介 */}
          {item.description && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="mb-3 text-lg font-bold text-gray-900">周边简介</h2>
              <p className="leading-7 text-gray-600">{item.description}</p>
            </div>
          )}

          {/* 删除申请 */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <DeleteRequestButton itemId={item.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-14 shrink-0 font-medium text-gray-400">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
