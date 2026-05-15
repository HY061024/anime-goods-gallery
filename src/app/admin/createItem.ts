"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "./auth";

// createItem 是一个 Server Action，将商品数据写入 Supabase
export async function createItem(formData: FormData) {
  // 1. 检查管理员身份（未登录则跳转到 /admin）
  await requireAdmin();

  // 2. 从表单中提取各字段的值
  const title = (formData.get("title") as string)?.trim();
  const work = (formData.get("work") as string)?.trim();
  const character = (formData.get("character") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const price = Number(formData.get("price"));
  const description = (formData.get("description") as string)?.trim();
  const image = (formData.get("image") as string)?.trim();

  // 3. 验证必填字段
  if (!title) return { error: "请填写商品标题" };
  if (!work) return { error: "请填写作品名称" };
  if (!character) return { error: "请填写角色名称" };
  if (!category) return { error: "请选择分类" };
  if (!price || price <= 0) return { error: "请填写有效价格" };
  if (!image) return { error: "请填写图片文件名" };

  const imagePath = `/goods/${image}`;

  // 4. 写入 Supabase（使用 service_role key，有写入权限）
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

  // 5. 跳转到新创建的商品详情页
  redirect(`/items/${data.id}`);
}
