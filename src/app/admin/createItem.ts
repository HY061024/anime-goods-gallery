"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";
import { saveItem } from "@/lib/itemActions";

export async function createItem(formData: FormData) {
  try {
    await requireAdmin();

    const imageFile = formData.get("imageFile") as File | null;

    const result = await saveItem({
      title: (formData.get("title") as string)?.trim() ?? "",
      work: (formData.get("work") as string)?.trim() ?? "",
      character: (formData.get("character") as string)?.trim() ?? "",
      category: (formData.get("category") as string)?.trim() ?? "",
      price: Number(formData.get("price")),
      description: (formData.get("description") as string)?.trim() ?? "",
      imageName: (formData.get("image") as string)?.trim() ?? "",
      imageFile: imageFile && imageFile.size > 0 ? imageFile : null,
    });

    if ("error" in result) return { error: result.error };
    revalidatePath("/items");
    return { redirectUrl: `/items/${result.success}` };
  } catch (e) {
    console.error("createItem 出错:", e);
    return { error: "提交失败，请稍后再试" };
  }
}
