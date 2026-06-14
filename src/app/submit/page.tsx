import Link from "next/link";
import ItemForm from "@/components/ItemForm";
import { getAllCategories } from "@/lib/categories";
import { submitItem } from "./actions";

export default async function SubmitPage() {
  const categories = await getAllCategories();

  return (
    <>
      <ItemForm
        action={submitItem}
        title="投稿周边"
        description="提交你想收录的二次元周边信息，审核通过后会出现在图鉴中"
        submitLabel="提交投稿"
        categories={categories}
        successPath="/items?submitted=1"
      />
      <div className="mx-auto max-w-2xl px-4 pb-8 text-center">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/submit/batch"
            className="inline-flex items-center gap-1 text-sm font-medium text-pink-500 transition hover:text-pink-600"
          >
            有多件要投稿？使用批量上传 →
          </Link>
          <Link
            href="/import"
            className="inline-flex items-center gap-1 text-sm font-medium text-purple-500 transition hover:text-purple-600"
          >
            🤖 使用智能导入，自动识别信息 →
          </Link>
        </div>
      </div>
    </>
  );
}
