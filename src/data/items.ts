export type Item = {
  id: number;
  title: string;
  work: string;
  character: string;
  category: string;
  price: number;
  description: string;
  image: string;
  created_at?: string;
  submitter_id?: string | null;
  visibility?: 'public' | 'private';

  // 新字段：官图 + 实物图
  official_image_url?: string | null;
  real_image_url?: string | null;
  official_image_submitter_id?: string | null;
  real_image_submitter_id?: string | null;
  official_image_created_at?: string | null;
  real_image_created_at?: string | null;

  // 智能导入来源
  source_url?: string | null;
  source_platform?: string | null;
};

/** 智能导入候选图鉴 */
export type ImportCandidate = {
  title: string;
  description?: string;
  imageUrls: string[];
  sourceUrl?: string;
  sourcePlatform?: string;
  confidence?: number;
  work?: string;
  character?: string;
  category?: string;
  price?: number;
  imageType?: 'official' | 'real' | 'unknown';
};

/** 导入限制常量 */
export const MAX_IMPORT_IMAGES = 9;
export const IMPORT_PARSE_TIMEOUT_MS = 8000;
export const IMPORT_MAX_RESPONSE_SIZE = 1 * 1024 * 1024; // 1MB

export type ItemImage = {
  id: number;
  item_id: number;
  image_type: 'official' | 'real';
  image_url: string;
  submitter_id: string | null;
  sort_order: number;
  created_at: string;
};

export type ItemImageWithSubmitter = ItemImage & {
  submitter_name?: string | null;
  submitter_avatar?: string | null;
};

/** 获取商品主图：优先实物图 > 官图 > 旧 image > 占位图 */
export function getItemMainImage(item: Item): string {
  if (item.real_image_url) return item.real_image_url;
  if (item.official_image_url) return item.official_image_url;
  if (item.image) return item.image;
  return "/placeholder.svg";
}

const MAX_OFFICIAL = 3;
const MAX_REAL = 5;

/** 按类型分组图片 */
export function groupItemImagesByType(images: ItemImage[]): {
  official: ItemImage[];
  real: ItemImage[];
} {
  return {
    official: images.filter((img) => img.image_type === "official"),
    real: images.filter((img) => img.image_type === "real"),
  };
}

/** 官图是否还可以添加 */
export function canAddOfficialImage(images: ItemImage[]): boolean {
  return images.filter((img) => img.image_type === "official").length < MAX_OFFICIAL;
}

/** 实物图是否还可以添加 */
export function canAddRealImage(images: ItemImage[]): boolean {
  return images.filter((img) => img.image_type === "real").length < MAX_REAL;
}

/** 获取某类图片的已用数量 */
export function getImageCount(images: ItemImage[], type: 'official' | 'real'): number {
  return images.filter((img) => img.image_type === type).length;
}

export { MAX_OFFICIAL, MAX_REAL };
