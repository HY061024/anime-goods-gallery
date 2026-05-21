import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createAdminNotification } from "@/lib/adminNotifications";

export type SaveItemInput = {
  title: string;
  work: string;
  character: string;
  category: string;
  price: number;
  description: string;
  imageName: string;
  imageFile: File | null;
  imageUrl?: string;
  userId?: string;
  visibility?: 'public' | 'private';
  // 新增：官图和实物图
  officialImageUrl?: string;
  realImageUrl?: string;
};

export type SaveItemResult = { success: number } | { error: string };

const PENDING_MARKER = "[待审核]";

export async function saveItem(
  input: SaveItemInput,
  pending = false
): Promise<SaveItemResult> {
  try {
    return await doSaveItem(input, pending);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("saveItem 出错:", msg);
    return { error: `[saveItem] ${msg}` };
  }
}

async function doSaveItem(
  input: SaveItemInput,
  pending = false
): Promise<SaveItemResult> {
  const { title, work, character, category, price, description, imageName, imageFile } = input;

  if (!title) return { error: "[验证] 请填写商品标题" };
  if (!work) return { error: "[验证] 请填写作品名称" };
  if (!character) return { error: "[验证] 请填写角色名称" };
  if (!category) return { error: "[验证] 请选择分类" };
  if (!price || price <= 0) return { error: "[验证] 请填写有效价格" };

  // 图片验证：需要提供旧版图片 或 官图 或 实物图，至少一种
  const hasOfficial = input.officialImageUrl && input.officialImageUrl.trim();
  const hasReal = input.realImageUrl && input.realImageUrl.trim();

  let imagePath = "";

  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("goods")
      .upload(fileName, buffer, {
        contentType: imageFile.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return { error: `[Storage上传] ${uploadError.message}` };
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("goods")
      .getPublicUrl(fileName);

    imagePath = urlData.publicUrl;
  } else if (input.imageUrl) {
    imagePath = input.imageUrl;
  } else if (imageName) {
    imagePath = `/goods/${imageName}`;
  }

  // 校验：新图或旧图至少有一种
  if (!hasOfficial && !hasReal && !imagePath) {
    return { error: "[验证] 请至少上传官图或实物图中的一种" };
  }

  const finalDescription = pending ? `${PENDING_MARKER}${description}` : description;
  const now = new Date().toISOString();

  const insertData: Record<string, unknown> = {
    title,
    work,
    character,
    category,
    price,
    description: finalDescription,
  };

  // 旧版图片兼容
  if (imagePath) {
    insertData.image = imagePath;
  }

  // 新图字段
  if (hasOfficial) {
    insertData.official_image_url = input.officialImageUrl!.trim();
    if (input.userId) {
      insertData.official_image_submitter_id = input.userId;
    }
    insertData.official_image_created_at = now;
  }

  if (hasReal) {
    insertData.real_image_url = input.realImageUrl!.trim();
    if (input.userId) {
      insertData.real_image_submitter_id = input.userId;
    }
    insertData.real_image_created_at = now;
  }

  if (input.userId) {
    insertData.submitter_id = input.userId;
  }
  insertData.visibility = input.visibility ?? "public";

  const { data, error } = await supabaseAdmin
    .from("items")
    .insert(insertData)
    .select("id")
    .single();

  if (error) {
    return { error: `[DB写入] code=${error.code} msg=${error.message} details=${error.details}` };
  }

  // 投稿时通知管理员
  if (pending) {
    createAdminNotification(data.id, title);
  }

  return { success: data.id };
}
