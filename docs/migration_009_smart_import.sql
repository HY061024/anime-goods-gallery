-- 第九次迁移：智能导入图鉴（可重复执行版本）
-- 执行方式：在 Supabase SQL Editor 中手动执行
-- 如果部分内容已存在，自动跳过

-- ====== 1. 建表 ======
CREATE TABLE IF NOT EXISTS public.import_jobs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source_url TEXT,
  source_platform TEXT,
  import_type TEXT NOT NULL DEFAULT 'link',
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.import_candidates (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT REFERENCES public.import_jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  source_url TEXT,
  source_platform TEXT,
  confidence NUMERIC,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====== 2. items 加来源字段 ======
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS source_platform TEXT;

-- ====== 3. 开 RLS ======
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_candidates ENABLE ROW LEVEL SECURITY;

-- ====== 4. RLS 策略（先删后建，可重复执行） ======

-- import_jobs policies
DROP POLICY IF EXISTS "Users can view own import_jobs" ON public.import_jobs;
CREATE POLICY "Users can view own import_jobs"
  ON public.import_jobs FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own import_jobs" ON public.import_jobs;
CREATE POLICY "Users can insert own import_jobs"
  ON public.import_jobs FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own import_jobs" ON public.import_jobs;
CREATE POLICY "Users can update own import_jobs"
  ON public.import_jobs FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- import_candidates policies
DROP POLICY IF EXISTS "Users can view own import_candidates" ON public.import_candidates;
CREATE POLICY "Users can view own import_candidates"
  ON public.import_candidates FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own import_candidates" ON public.import_candidates;
CREATE POLICY "Users can insert own import_candidates"
  ON public.import_candidates FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own import_candidates" ON public.import_candidates;
CREATE POLICY "Users can update own import_candidates"
  ON public.import_candidates FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own import_candidates" ON public.import_candidates;
CREATE POLICY "Users can delete own import_candidates"
  ON public.import_candidates FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ====== 5. GRANT 授权（可重复执行） ======
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.import_jobs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.import_candidates TO anon, authenticated;
GRANT USAGE ON SEQUENCE public.import_jobs_id_seq TO anon, authenticated;
GRANT USAGE ON SEQUENCE public.import_candidates_id_seq TO anon, authenticated;
