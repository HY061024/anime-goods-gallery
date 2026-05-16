"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "./auth";

// createItem 是一个 Server Action，将商品数据写入 Supabase
// 支持两种图片方式：上传文件（→ Supabase Storage）或填写文件名（→ public/goods/）
export async function createItem(formData: FormData) {
  // 1. 检查管理员身份
  await requireAdmin();

  // 2. 从表单中提取各字段的值
  const title = (formData.get("title") as string)?.trim();
  const work = (formData.get("work") as string)?.trim();
  const character = (formData.get("character") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const price = Number(formData.get("price"));
  const description = (formData.get("description") as string)?.trim();
  const imageName = (formData.get("image") as string)?.trim();

  // 3. 验证必填字段
  if (!title) return { error: "请填写商品标题" };
  if (!work) return { error: "请填写作品名称" };
  if (!character) return { error: "请填写角色名称" };
  if (!category) return { error: "请选择分类" };
  if (!price || price <= 0) return { error: "请填写有效价格" };

  // 4. 处理图片：优先使用上传的文件，否则用文本文件名作为 fallback
  let imagePath = "";

  const file = formData.get("imageFile") as File | null;

  if (file && file.size > 0) {
    // 用户上传了图片 → 存入 Supabase Storage
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    // 生成唯一文件名，防止重名覆盖
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("goods")
      .upload(fileName, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return { error: `图片上传失败：${uploadError.message}` };
    }

    // 获取 Supabase Storage 的公开访问 URL
    const { data: urlData } = supabaseAdmin.storage
      .from("goods")
      .getPublicUrl(fileName);

    imagePath = urlData.publicUrl;
  } else if (imageName) {
    // 没有上传文件但填了文件名 → 使用 public/goods/ 下的本地文件
    imagePath = `/goods/${imageName}`;
  } else {
    return { error: "请上传图片或填写图片文件名" };
  }

  // 5. 写入 Supabase
  const { data, error } = await supabaseAdmin
    .from("items")
    .insert({
      title,
      work,
      character,
      category,
      price,
      description,
      image: imagePath,
    })
    .select("id")
    .single();

  if (error) {
    return { error: `写入失败：${error.message}` };
  }

  // 6. 跳转到新创建的商品详情页
  redirect(`/items/${data.id}`);
}
