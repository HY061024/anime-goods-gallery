import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createAdminNotification } from "@/lib/adminNotifications";
import { addItemImages } from "@/lib/itemImages";

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
  // 单图兼容（旧接口）
  officialImageUrl?: string;
  realImageUrl?: string;
  // 多图（新接口）
  officialImageUrls?: string[];
  realImageUrls?: string[];
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

  // 图片验证：合并单图和多图输入
  const officialUrls = [
    ...(input.officialImageUrls ?? []),
    ...(input.officialImageUrl && input.officialImageUrl.trim() ? [input.officialImageUrl.trim()] : []),
  ];
  const realUrls = [
    ...(input.realImageUrls ?? []),
    ...(input.realImageUrl && input.realImageUrl.trim() ? [input.realImageUrl.trim()] : []),
  ];

  const hasOfficial = officialUrls.length > 0;
  const hasReal = realUrls.length > 0;

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

  // 新图字段（旧列存第一张，兼容旧查询）
  const firstReal = hasReal ? realUrls[0] : null;
  const firstOfficial = hasOfficial ? officialUrls[0] : null;

  if (hasReal) {
    insertData.real_image_url = firstReal;
    if (input.userId) {
      insertData.real_image_submitter_id = input.userId;
    }
    insertData.real_image_created_at = now;
  }

  if (hasOfficial) {
    insertData.official_image_url = firstOfficial;
    if (input.userId) {
      insertData.official_image_submitter_id = input.userId;
    }
    insertData.official_image_created_at = now;
  }

  // image 字段 fallback：优先实物图 > 官图
  if (!insertData.image) {
    if (hasReal) {
      insertData.image = realUrls[0];
    } else if (hasOfficial) {
      insertData.image = officialUrls[0];
    }
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

  // 写入 item_images 多图表（兼容表不存在的情况）
  const allImages: { image_type: "official" | "real"; image_url: string }[] = [
    ...officialUrls.map((url) => ({ image_type: "official" as const, image_url: url })),
    ...realUrls.map((url) => ({ image_type: "real" as const, image_url: url })),
  ];
  if (allImages.length > 0) {
    await addItemImages(
      data.id,
      allImages.map((img) => ({
        ...img,
        submitter_id: input.userId,
      }))
    );
  }

  // 投稿时通知管理员
  if (pending) {
    createAdminNotification(data.id, title);
  }

  return { success: data.id };
}

// ====== 智能导入专用写入（宽松校验） ======

const IMPORT_PENDING_MARKER = "[待审核][智能导入]";

export type SaveImportItemInput = {
  userId: string;
  title: string;
  description?: string;
  work?: string;
  character?: string;
  category?: string;
  price?: number;
  imageUrls: string[];
  imageType?: "official" | "real" | "unknown";
  sourceUrl?: string;
  sourcePlatform?: string;
};

export async function saveImportItem(input: SaveImportItemInput): Promise<SaveItemResult> {
  try {
    const { title, imageUrls, userId } = input;

    // 最低校验：标题 + 至少一张图片
    if (!title || !title.trim()) return { error: "[验证] 请填写图鉴名称" };
    if (!imageUrls || imageUrls.length === 0) return { error: "[验证] 请至少上传一张图片" };

    const now = new Date().toISOString();
    const imageType = input.imageType ?? "unknown";

    const insertData: Record<string, unknown> = {
      title: title.trim(),
      work: input.work?.trim() ?? "",
      character: input.character?.trim() ?? "",
      category: input.category?.trim() ?? "",
      price: input.price ?? 0,
      description: `${IMPORT_PENDING_MARKER}${input.description ?? ""}`,
      visibility: "public",
      submitter_id: userId,
    };

    // 来源字段
    if (input.sourceUrl) {
      insertData.source_url = input.sourceUrl;
    }
    if (input.sourcePlatform) {
      insertData.source_platform = input.sourcePlatform;
    }

    // 图片写入对应字段（不确定→实物图）
    const firstImage = imageUrls[0];
    insertData.image = firstImage;

    if (imageType === "official") {
      insertData.official_image_url = firstImage;
      insertData.official_image_submitter_id = userId;
      insertData.official_image_created_at = now;
    } else {
      // "real" 或 "unknown" → 实物图
      insertData.real_image_url = firstImage;
      insertData.real_image_submitter_id = userId;
      insertData.real_image_created_at = now;
    }

    const { data, error } = await supabaseAdmin
      .from("items")
      .insert(insertData)
      .select("id")
      .single();

    if (error) {
      return { error: `[DB写入] code=${error.code} msg=${error.message}` };
    }

    // 写入 item_images 表
    const allImages = imageUrls.map((url) => ({
      image_type: imageType === "official" ? ("official" as const) : ("real" as const),
      image_url: url,
      submitter_id: userId,
    }));

    if (allImages.length > 0) {
      await addItemImages(data.id, allImages);
    }

    // 通知管理员有新的导入投稿
    createAdminNotification(data.id, title.trim());

    return { success: data.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("saveImportItem 出错:", msg);
    return { error: `[saveImportItem] ${msg}` };
  }
}
