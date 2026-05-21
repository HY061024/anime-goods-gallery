"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabaseAction";
import { saveItem } from "@/lib/itemActions";

export async function batchSubmitPublic(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "请先登录" };

  const result = await batchSave(user.id, formData, "public", true);
  revalidatePath("/");
  revalidatePath("/items");
  return result;
}

export async function batchUploadCabinet(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "请先登录" };

  const result = await batchSave(user.id, formData, "private", false);
  if ("error" in result) return result;
  revalidatePath("/mypage");
  return result;
}

async function batchSave(
  userId: string,
  formData: FormData,
  visibility: "public" | "private",
  pending: boolean
) {
  const count = Number(formData.get("count"));
  if (!count || count < 1) return { error: "请至少添加一个商品" };

  const sharedWork = (formData.get("work") as string)?.trim() ?? "";
  const sharedCharacter = (formData.get("character") as string)?.trim() ?? "";

  const errors: string[] = [];
  let successCount = 0;

  for (let i = 0; i < count; i++) {
    const title = (formData.get(`title_${i}`) as string)?.trim() ?? "";
    const work = (formData.get(`work_${i}`) as string)?.trim() || sharedWork;
    const character = (formData.get(`character_${i}`) as string)?.trim() || sharedCharacter;
    const category = (formData.get(`category_${i}`) as string)?.trim() ?? "";
    const price = Number(formData.get(`price_${i}`));
    const description = (formData.get(`description_${i}`) as string)?.trim() ?? "";
    const imageName = (formData.get(`image_${i}`) as string)?.trim() ?? "";
    const imageFile = formData.get(`imageFile_${i}`) as File | null;
    const imageUrl = (formData.get(`imageUrl_${i}`) as string)?.trim() || undefined;
    const officialImageUrl = (formData.get(`officialImageUrl_${i}`) as string)?.trim() || undefined;
    const realImageUrl = (formData.get(`realImageUrl_${i}`) as string)?.trim() || undefined;

    if (!title) {
      errors.push(`第 ${i + 1} 个商品缺少标题`);
      continue;
    }

    const result = await saveItem(
      {
        title,
        work,
        character,
        category,
        price,
        description,
        imageName,
        imageFile: imageFile && imageFile.size > 0 ? imageFile : null,
        imageUrl,
        userId,
        visibility,
        officialImageUrl,
        realImageUrl,
      },
      pending
    );

    if ("error" in result) {
      errors.push(`${title}: ${result.error}`);
    } else {
      successCount++;
    }
  }

  if (errors.length > 0 && successCount === 0) {
    return { error: errors.join("；") };
  }

  return { successCount, errors: errors.length > 0 ? errors : undefined };
}
