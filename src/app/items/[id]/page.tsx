import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemById } from "@/lib/items";


type ItemDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;

const item = await getItemById(id);

  if (!item) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-pink-50">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <Link href="/items" className="text-sm font-medium text-pink-500">
          ← 返回搜索页
        </Link>

        <div className="mt-6 grid gap-8 md:grid-cols-[420px_1fr]">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
<img
  src={item.image}
  alt={item.title}
  className="aspect-square w-full object-cover"
/>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-pink-500">
              {item.category}
            </p>

            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              {item.title}
            </h1>

            <p className="mb-8 text-gray-900">
              {item.work} / {item.character}
            </p>

            <div className="mb-8 space-y-4">
              <Info label="作品" value={item.work} />
              <Info label="角色" value={item.character} />
              <Info label="分类" value={item.category} />
              <Info label="价格" value={`¥${item.price}`} />
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-gray-900">
                周边简介
              </h2>

              <p className="leading-7 text-gray-900">{item.description}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b border-gray-100 pb-3 text-sm">
      <span className="w-20 text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}