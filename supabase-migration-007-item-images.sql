-- ============================================================
-- 第七次迁移：商品多图轮播（item_images 表）
-- 执行方式：在 Supabase SQL Editor 中手动执行
-- 日期：2026-05-30
-- ============================================================

-- 1. 建表
CREATE TABLE IF NOT EXISTS item_images (
  id BIGSERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL CHECK (image_type IN ('official', 'real')),
  image_url TEXT NOT NULL,
  submitter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ii_item ON item_images(item_id, image_type, sort_order);

-- ============================================================
-- 2. RLS 开启
-- ============================================================
ALTER TABLE item_images ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. 访问策略
-- ============================================================
-- 所有人可查看
DROP POLICY IF EXISTS "Anyone can read item_images" ON item_images;
CREATE POLICY "Anyone can read item_images" ON item_images
  FOR SELECT
  USING (true);

-- 登录用户可上传图片
DROP POLICY IF EXISTS "Authenticated users can insert item_images" ON item_images;
CREATE POLICY "Authenticated users can insert item_images" ON item_images
  FOR INSERT
  WITH CHECK (auth.uid() = submitter_id);

-- 上传者可删除自己上传的图片
DROP POLICY IF EXISTS "Users can delete own item_images" ON item_images;
CREATE POLICY "Users can delete own item_images" ON item_images
  FOR DELETE
  USING (auth.uid() = submitter_id);

-- ============================================================
-- 4-5-6. Supabase 2026-05-30 安全授权
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON item_images TO anon, authenticated;
GRANT USAGE ON SEQUENCE item_images_id_seq TO anon, authenticated;
