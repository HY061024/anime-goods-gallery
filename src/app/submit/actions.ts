"use server";

import { revalidatePath } from "next/cache";
import { saveItem } from "@/lib/itemActions";
import { createClient } from "@/lib/supabaseAction";

/** 从 FormData 提取 indexed 数组字段，如 officialImageUrl_0, officialImageUrl_1... */
function extractArrayFromFormData(formData: FormData, prefix: string): string[] {
  const result: string[] = [];
  for (let i = 0; i < 10; i++) {
    const val = (formData.get(`${prefix}_${i}`) as string)?.trim();
    if (val) result.push(val);
  }
  return result;
}

export async function submitItem(formData: FormData) {
  try {
    const imageFile = formData.get("imageFile") as File | null;
    const imageUrl = (formData.get("imageUrl") as string)?.trim() || undefined;

    // 多图支持：从 FormData 提取 officialImageUrl_0, officialImageUrl_1... 等
    const officialImageUrls = extractArrayFromFormData(formData, "officialImageUrl");
    const realImageUrls = extractArrayFromFormData(formData, "realImageUrl");

    // 兼容旧的单图字段
    const officialImageUrl = (formData.get("officialImageUrl") as string)?.trim() || undefined;
    const realImageUrl = (formData.get("realImageUrl") as string)?.trim() || undefined;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const result = await saveItem(
      {
        title: (formData.get("title") as string)?.trim() ?? "",
        work: (formData.get("work") as string)?.trim() ?? "",
        character: (formData.get("character") as string)?.trim() ?? "",
        category: (formData.get("category") as string)?.trim() ?? "",
        price: Number(formData.get("price")),
        description: (formData.get("description") as string)?.trim() ?? "",
        imageName: (formData.get("image") as string)?.trim() ?? "",
        imageFile: imageFile && imageFile.size > 0 ? imageFile : null,
        imageUrl,
        userId: user?.id,
        visibility: "public",
        officialImageUrl,
        realImageUrl,
        officialImageUrls: officialImageUrls.length > 0 ? officialImageUrls : undefined,
        realImageUrls: realImageUrls.length > 0 ? realImageUrls : undefined,
      },
      true
    );

    if ("error" in result) return { error: result.error };
    revalidatePath("/items");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("submitItem 出错:", msg);
    return { error: `[submitItem] ${msg}` };
  }
}
