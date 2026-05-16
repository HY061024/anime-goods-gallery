"use server";

import { redirect } from "next/navigation";
import { saveItem } from "@/lib/itemActions";

export async function submitItem(formData: FormData) {
  const imageFile = formData.get("imageFile") as File | null;

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
    },
    true
  );

  if ("error" in result) return { error: result.error };
  redirect("/items?submitted=1");
}
