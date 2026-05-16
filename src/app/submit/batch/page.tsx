import BatchItemForm from "@/components/BatchItemForm";
import { getAllCategories } from "@/lib/categories";
import { batchSubmitPublic } from "@/lib/batchActions";

export default async function BatchSubmitPage() {
  const categories = await getAllCategories();

  return (
    <BatchItemForm
      action={batchSubmitPublic}
      title="批量投稿"
      submitLabel="批量提交投稿"
      successPath="/items?submitted=1"
      categories={categories}
    />
  );
}
