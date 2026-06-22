-- ============================================================
-- 第六次迁移：照影灵感社区功能
-- 执行方式：在 Supabase SQL Editor 中手动执行
-- 日期：2026-05-23
-- ============================================================

-- 1. 灵感帖子表
CREATE TABLE IF NOT EXISTS inspiration_posts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('video', 'note', 'material', 'question')),
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover_url TEXT,
  video_url TEXT,
  material_url TEXT,
  work TEXT DEFAULT '',
  character TEXT DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  related_item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  favorite_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ip_type ON inspiration_posts(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ip_user ON inspiration_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ip_work ON inspiration_posts(work);
CREATE INDEX IF NOT EXISTS idx_ip_visible ON inspiration_posts(visibility, created_at DESC);

-- 2. 评论表
CREATE TABLE IF NOT EXISTS inspiration_comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES inspiration_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ic_post ON inspiration_comments(post_id, created_at ASC);

-- 3. 点赞表
CREATE TABLE IF NOT EXISTS inspiration_likes (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES inspiration_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_il_post ON inspiration_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_il_user ON inspiration_likes(user_id);

-- 4. 收藏表
CREATE TABLE IF NOT EXISTS inspiration_favorites (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES inspiration_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_if_post ON inspiration_favorites(post_id);
CREATE INDEX IF NOT EXISTS idx_if_user ON inspiration_favorites(user_id);

-- ============================================================
-- RLS
-- ============================================================

-- inspiration_posts
ALTER TABLE inspiration_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read public posts" ON inspiration_posts;
CREATE POLICY "Anyone can read public posts" ON inspiration_posts FOR SELECT USING (visibility = 'public');
DROP POLICY IF EXISTS "Users can read own posts" ON inspiration_posts;
CREATE POLICY "Users can read own posts" ON inspiration_posts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create posts" ON inspiration_posts;
CREATE POLICY "Users can create posts" ON inspiration_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own posts" ON inspiration_posts;
CREATE POLICY "Users can update own posts" ON inspiration_posts FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own posts" ON inspiration_posts;
CREATE POLICY "Users can delete own posts" ON inspiration_posts FOR DELETE USING (auth.uid() = user_id);

-- inspiration_comments
ALTER TABLE inspiration_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read comments" ON inspiration_comments;
CREATE POLICY "Anyone can read comments" ON inspiration_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create comments" ON inspiration_comments;
CREATE POLICY "Users can create comments" ON inspiration_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own comments" ON inspiration_comments;
CREATE POLICY "Users can delete own comments" ON inspiration_comments FOR DELETE USING (auth.uid() = user_id);

-- inspiration_likes
ALTER TABLE inspiration_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read likes" ON inspiration_likes;
CREATE POLICY "Anyone can read likes" ON inspiration_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own likes" ON inspiration_likes;
CREATE POLICY "Users can manage own likes" ON inspiration_likes FOR ALL USING (auth.uid() = user_id);

-- inspiration_favorites
ALTER TABLE inspiration_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read favorites" ON inspiration_favorites;
CREATE POLICY "Anyone can read favorites" ON inspiration_favorites FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own favorites" ON inspiration_favorites;
CREATE POLICY "Users can manage own favorites" ON inspiration_favorites FOR ALL USING (auth.uid() = user_id);
