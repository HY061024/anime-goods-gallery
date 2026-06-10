-- 第八次迁移：灵感区图片多图支持
-- 为 inspiration_posts 增加 image_urls 数组字段
-- 执行方式：在 Supabase SQL Editor 中手动执行

ALTER TABLE inspiration_posts ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

COMMENT ON COLUMN inspiration_posts.image_urls IS '多图 URL 数组，最多 9 张。cover_url 保留兼容，自动设为第一张';
