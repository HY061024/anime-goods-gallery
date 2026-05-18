"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseAction";

export async function submitFeedback(formData: FormData) {
  const content = formData.get("content") as string;
  const email = formData.get("email") as string;

  if (!content?.trim()) return { error: "请填写反馈内容" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabaseAdmin.from("feedback").insert({
    user_id: user?.id ?? null,
    email: email?.trim() || (user?.email ?? ""),
    content: content.trim(),
  });

  if (error) return { error: `提交失败：${error.message}` };
  return { success: true };
}
