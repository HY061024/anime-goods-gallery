"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type SaveItemInput = {
  title: string;
  work: string;
  character: string;
  category: string;
  price: number;
  description: string;
  imageName: string;
  imageFile: File | null;
  userId?: string;
  visibility?: 'public' | 'private';
};

export type SaveItemResult = { success: number } | { error: string };

const PENDING_MARKER = "[待审核]";

export async function saveItem(
  input: SaveItemInput,
  pending = false
): Promise<SaveItemResult> {
  const { title, work, character, category, price, description, imageName, imageFile } = input;

  if (!title) return { error: "请填写商品标题" };
  if (!work) return { error: "请填写作品名称" };
  if (!character) return { error: "请填写角色名称" };
  if (!category) return { error: "请选择分类" };
  if (!price || price <= 0) return { error: "请填写有效价格" };

  let imagePath = "";

  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("goods")
      .upload(fileName, buffer, {
        contentType: imageFile.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return { error: `图片上传失败：${uploadError.message}` };
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("goods")
      .getPublicUrl(fileName);

    imagePath = urlData.publicUrl;
  } else if (imageName) {
    imagePath = `/goods/${imageName}`;
  } else {
    return { error: "请上传图片或填写图片文件名" };
  }

  const finalDescription = pending ? `${PENDING_MARKER}${description}` : description;

  const insertData: Record<string, unknown> = {
    title,
    work,
    character,
    category,
    price,
    description: finalDescription,
    image: imagePath,
  };
  if (input.userId) {
    insertData.submitter_id = input.userId;
  }
  insertData.visibility = input.visibility ?? "public";

  const { data, error } = await supabaseAdmin
    .from("items")
    .insert(insertData)
    .select("id")
    .single();

  if (error) {
    return { error: `写入失败：${error.message}` };
  }

  return { success: data.id };
}
