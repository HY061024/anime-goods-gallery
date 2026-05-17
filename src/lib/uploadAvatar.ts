"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function uploadProfileImage(formData: FormData): Promise<string | null> {
  const file = formData.get("file") as File | null;
  const filePath = formData.get("path") as string;
  if (!file || !filePath || file.size === 0) return null;

  try {
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);
    const { error } = await supabaseAdmin.storage.from("goods").upload(filePath, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });
    if (error) return null;
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${baseUrl}/storage/v1/object/public/goods/${filePath}`;
  } catch {
    return null;
  }
}
