export const INSPIRATION_TYPES = ["video", "note", "material", "question"] as const;
export type InspirationType = (typeof INSPIRATION_TYPES)[number];

export type InspirationPost = {
  id: number;
  user_id: string;
  type: InspirationType;
  title: string;
  content: string;
  cover_url: string | null;
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
