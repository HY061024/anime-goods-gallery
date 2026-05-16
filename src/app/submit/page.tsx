"use client";

import ItemForm from "@/components/ItemForm";
import { submitItem } from "./actions";

export default function SubmitPage() {
  return (
    <ItemForm
      action={submitItem}
      title="投稿周边"
      description="提交你想收录的二次元周边信息，审核通过后会出现在图鉴中"
      submitLabel="提交投稿"
    />
  );
}
