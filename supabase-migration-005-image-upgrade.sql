-- ============================================================
-- 第五次迁移：图鉴图片结构升级 — 官图 + 实物图
-- 执行方式：在 Supabase SQL Editor 中手动执行本文件
-- 日期：2026-05-21
-- ============================================================

-- 1. 新增图片字段
ALTER TABLE items ADD COLUMN IF NOT EXISTS official_image_url TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS real_image_url TEXT;

-- 2. 新增上传者字段（记录谁上传了哪种图）
ALTER TABLE items ADD COLUMN IF NOT EXISTS official_image_submitter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE items ADD COLUMN IF NOT EXISTS real_image_submitter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. 新增上传时间字段
ALTER TABLE items ADD COLUMN IF NOT EXISTS official_image_created_at TIMESTAMPTZ;
ALTER TABLE items ADD COLUMN IF NOT EXISTS real_image_created_at TIMESTAMPTZ;

-- 4. 索引（方便按上传者查询）
CREATE INDEX IF NOT EXISTS idx_items_official_submitter ON items(official_image_submitter_id);
CREATE INDEX IF NOT EXISTS idx_items_real_submitter ON items(real_image_submitter_id);
