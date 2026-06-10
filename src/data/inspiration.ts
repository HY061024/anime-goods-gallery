export const INSPIRATION_TYPES = ["video", "note", "material", "question"] as const;
export type InspirationType = (typeof INSPIRATION_TYPES)[number];

export type InspirationPost = {
  id: number;
  user_id: string;
  type: InspirationType;
  title: string;
  content: string;
  cover_url: string | null;
  image_urls: string[];
  video_url: string | null;
  material_url: string | null;
  work: string;
  character: string;
  tags: string[];
  related_item_id: number | null;
  visibility: "public" | "private";
  like_count: number;
  comment_count: number;
  favorite_count: number;
  created_at: string;
  updated_at: string;
};

export type InspirationComment = {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
};

export const TYPE_LABELS: Record<InspirationType, string> = {
  video: "视频",
  note: "笔记",
  material: "素材",
  question: "提问",
};

export const TYPE_COLORS: Record<InspirationType, string> = {
  video: "bg-red-100 text-red-600",
  note: "bg-blue-100 text-blue-600",
  material: "bg-green-100 text-green-600",
  question: "bg-yellow-100 text-yellow-600",
};

// ====== 上传限制常量 ======

/** 图片最大数量 */
export const MAX_IMAGES = 9;
/** 图片允许的 MIME 类型 */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const;
/** 图片允许的扩展名（Storage 路径用） */
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;
/** 压缩后单张图片最大大小（字节） */
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
/** 视频最大数量 */
export const MAX_VIDEOS = 1;
/** 视频允许的 MIME 类型 */
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;
/** 视频允许的扩展名 */
export const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"] as const;
/** 视频最大大小（字节） */
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
/** 标题最大字数 */
export const MAX_TITLE_LENGTH = 60;
/** 正文最大字数 */
export const MAX_CONTENT_LENGTH = 3000;
/** 标签最大数量 */
export const MAX_TAGS = 10;
/** 单个标签最大字符数 */
export const MAX_TAG_LENGTH = 20;
/** 标签中禁止的危险字符（正则字符类） */
export const FORBIDDEN_TAG_CHARS = /[<>/\\"'`;]/;

/**
 * 标签处理（前后端共用）：去 #、trim、去重、拒绝空/危险字符、限 10 个 × 20 字符
 * 返回 { tags, error }，error 为非空时应拒绝发布
 */
export function processTags(raw: string): { tags: string[]; error?: string } {
  const parts = raw.split(/[,，\s]+/).filter(Boolean);
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const part of parts) {
    let tag = part.replace(/^#+/, "").trim();
    if (!tag) continue;

    // 危险字符检查
    if (FORBIDDEN_TAG_CHARS.test(tag)) {
      return { tags: [], error: `标签包含不允许的字符：${tag}` };
    }

    // 单个标签长度限制
    if (tag.length > MAX_TAG_LENGTH) {
      return { tags: [], error: `单个标签最长 ${MAX_TAG_LENGTH} 个字符：${tag}` };
    }

    // 去重
    const lower = tag.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      tags.push(tag);
    }
  }

  // 数量限制
  if (tags.length > MAX_TAGS) {
    return { tags: [], error: `最多添加 ${MAX_TAGS} 个标签` };
  }

  return { tags };
}
