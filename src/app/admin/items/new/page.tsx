"use client";

import ItemForm from "@/components/ItemForm";
import { createItem } from "../../createItem";

export default function NewItemPage() {
  return (
    <ItemForm
      action={createItem}
      title="新增周边"
      description="填写商品信息并提交，支持直接上传图片或填写文件名"
      submitLabel="提交商品"
    />
  );
}
