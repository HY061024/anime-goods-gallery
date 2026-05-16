"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabaseServer";
import { addToCollection, removeFromCollection } from "@/lib/collections";
import { getProfile, updateProfile } from "@/lib/profiles";
import { saveItem } from "@/lib/itemActions";

export async function addToCabinet(formData: FormData) {
  const itemId = Number(formData.get("itemId"));
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "请先登录" };

  await addToCollection(user.id, itemId);
  revalidatePath("/mypage");
  revalidatePath("/");
  revalidatePath("/items");
}

export async function removeFromCabinet(formData: FormData) {
  const itemId = Number(formData.get("itemId"));
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "请先登录" };

  await removeFromCollection(user.id, itemId);
  revalidatePath("/mypage");
}

export async function toggleCabinetPublic() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "请先登录" };

  const profile = await getProfile(user.id);
  await updateProfile(user.id, { cabinet_public: !profile.cabinet_public });
  revalidatePath("/mypage");
}

export async function uploadToCabinet(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "请先登录" };

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
      userId: user.id,
      visibility: "private",
    },
    false // pending=false，无需审核
  );

  if ("error" in result) return { error: result.error };
  revalidatePath("/mypage");
  return {};
}
