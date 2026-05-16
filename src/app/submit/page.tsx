import ItemForm from "@/components/ItemForm";
import { getAllCategories } from "@/lib/categories";
import { submitItem } from "./actions";

export default async function SubmitPage() {
  const categories = await getAllCategories();

  return (
    <ItemForm
      action={submitItem}
      title="投稿周边"
      description="提交你想收录的二次元周边信息，审核通过后会出现在图鉴中"
      submitLabel="提交投稿"
      categories={categories}
    />
  );
}
