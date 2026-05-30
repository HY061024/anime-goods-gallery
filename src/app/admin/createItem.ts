"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";
import { saveItem } from "@/lib/itemActions";

/** 从 FormData 提取 indexed 数组字段 */
function extractArrayFromFormData(formData: FormData, prefix: string): string[] {
  const result: string[] = [];
  for (let i = 0; i < 10; i++) {
    const val = (formData.get(`${prefix}_${i}`) as string)?.trim();
    if (val) result.push(val);
  }
  return result;
}

export async function createItem(formData: FormData) {
  try {
    await requireAdmin();

    const imageFile = formData.get("imageFile") as File | null;
    const imageUrl = (formData.get("imageUrl") as string)?.trim() || undefined;

    const officialImageUrls = extractArrayFromFormData(formData, "officialImageUrl");
    const realImageUrls = extractArrayFromFormData(formData, "realImageUrl");

    const officialImageUrl = (formData.get("officialImageUrl") as string)?.trim() || undefined;
    const realImageUrl = (formData.get("realImageUrl") as string)?.trim() || undefined;

    const result = await saveItem({
      title: (formData.get("title") as string)?.trim() ?? "",
      work: (formData.get("work") as string)?.trim() ?? "",
      character: (formData.get("character") as string)?.trim() ?? "",
      category: (formData.get("category") as string)?.trim() ?? "",
      price: Number(formData.get("price")),
      description: (formData.get("description") as string)?.trim() ?? "",
      imageName: (formData.get("image") as string)?.trim() ?? "",
      imageFile: imageFile && imageFile.size > 0 ? imageFile : null,
      imageUrl,
      officialImageUrl,
      realImageUrl,
      officialImageUrls: officialImageUrls.length > 0 ? officialImageUrls : undefined,
      realImageUrls: realImageUrls.length > 0 ? realImageUrls : undefined,
    });

    if ("error" in result) return { error: result.error };
    revalidatePath("/items");
    return { redirectUrl: `/items/${result.success}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("createItem 出错:", msg);
    return { error: `[createItem] ${msg}` };
  }
}
