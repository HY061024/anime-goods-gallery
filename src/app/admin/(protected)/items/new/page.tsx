import ItemForm from "@/components/ItemForm";
import { getAllCategories } from "@/lib/categories";
import { createItem } from "../../../createItem";

export default async function NewItemPage() {
  const categories = await getAllCategories();

  return (
    <ItemForm
      action={createItem}
      title="新增周边"
      description="填写商品信息并提交，支持直接上传图片或填写文件名"
      submitLabel="提交商品"
      categories={categories}
    />
  );
}
