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
};

/** 获取商品主图：优先实物图 > 官图 > 旧 image > 占位图 */
export function getItemMainImage(item: Item): string {
  if (item.real_image_url) return item.real_image_url;
  if (item.official_image_url) return item.official_image_url;
  if (item.image) return item.image;
  return "/placeholder.svg";
}
