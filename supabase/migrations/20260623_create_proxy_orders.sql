-- ============================================================
-- 第十次迁移：日韩代购请求
-- 表：proxy_orders + proxy_order_admin_notes + proxy_order_logs + RPC
-- 执行方式：在 Supabase SQL Editor 中手动执行（一次性粘贴全部）
-- 创建日期：2026-06-23
-- 依赖：auth.users 表（Supabase Auth）
-- ============================================================

-- ============================================================
-- 第 1 步：建表 — 代购单主表
--   admin_notes 已移除，改用 proxy_order_admin_notes 独立表
--   status 流：pending_payment → proof_uploaded → accepted → purchasing → purchased → shipped → delivered
--                                        任意状态 → cancelled / rejected
-- ============================================================
CREATE TABLE IF NOT EXISTS proxy_orders (
  id                BIGSERIAL PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_url          TEXT NOT NULL,
  item_name         TEXT,
  item_price        DECIMAL(10,2),
  user_notes        TEXT,
  status            TEXT NOT NULL DEFAULT 'pending_payment'
                    CHECK (status IN (
                      'pending_payment',  -- 待付款/待上传凭证（管理员不可见）
                      'proof_uploaded',   -- 已上传凭证，等待审核（管理员可见入口）
                      'accepted',         -- 管理员已受理
                      'purchasing',       -- 采购中
                      'purchased',        -- 已购入（待发货）
                      'shipped',          -- 已发货（国际运输中）
                      'delivered',        -- 已完成
                      'cancelled',        -- 已取消（用户可取消 pending_payment 的订单）
                      'rejected'          -- 凭证无效/拒绝受理
                    )),
  payment_proof_url TEXT,               -- 付款凭证截图（Storage URL）
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE proxy_orders IS '日韩代购订单';
COMMENT ON COLUMN proxy_orders.item_url IS '商品链接（乐天/煤炉/推特等）';
COMMENT ON COLUMN proxy_orders.item_name IS '商品名称（用户自填）';
COMMENT ON COLUMN proxy_orders.item_price IS '预估价格（日元/韩元）';
COMMENT ON COLUMN proxy_orders.user_notes IS '用户备注（颜色/尺码/数量）';
COMMENT ON COLUMN proxy_orders.status IS 'pending_payment→proof_uploaded→accepted→purchasing→purchased→shipped→delivered';
COMMENT ON COLUMN proxy_orders.payment_proof_url IS '付款凭证截图 URL，仅通过 upload_payment_proof RPC 写入';


-- ============================================================
-- 第 2 步：建表 — 管理员内部备注（独立表，普通用户无权限）
--   RLS 不给 authenticated 任何权限，仅 service_role 可读写
-- ============================================================
CREATE TABLE IF NOT EXISTS proxy_order_admin_notes (
  id          BIGSERIAL PRIMARY KEY,
  order_id    BIGINT NOT NULL REFERENCES proxy_orders(id) ON DELETE CASCADE,
  admin_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE proxy_order_admin_notes IS '管理员内部备注，普通用户不可见';
COMMENT ON COLUMN proxy_order_admin_notes.order_id IS '关联的代购单';
COMMENT ON COLUMN proxy_order_admin_notes.admin_id IS '添加备注的管理员';
COMMENT ON COLUMN proxy_order_admin_notes.content IS '备注内容';


-- ============================================================
-- 第 3 步：建表 — 操作日志表
--   用户可见自己订单的日志，管理员可见全部日志
--   admin_notes 相关日志记录在 proxy_order_admin_notes 中
-- ============================================================
CREATE TABLE IF NOT EXISTS proxy_order_logs (
  id            BIGSERIAL PRIMARY KEY,
  order_id      BIGINT NOT NULL REFERENCES proxy_orders(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,
  old_status    TEXT,
  new_status    TEXT,
  admin_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE proxy_order_logs IS '代购订单操作日志';
COMMENT ON COLUMN proxy_order_logs.action IS 'status_change / payment_proof_upload / admin_note / order_created';
COMMENT ON COLUMN proxy_order_logs.note IS '操作摘要（不含管理员内部备注内容）';


-- ============================================================
-- 第 4 步：开启 RLS（三张表）
-- ============================================================
ALTER TABLE public.proxy_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proxy_order_admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proxy_order_logs ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 第 5 步：proxy_orders RLS 策略
--   核心原则：authenticated 可 SELECT/INSERT 自己的，不可 UPDATE
-- ============================================================

-- 5a. 普通用户：只能查看自己的代购单
DROP POLICY IF EXISTS "Users can view own orders" ON public.proxy_orders;
CREATE POLICY "Users can view own orders"
  ON public.proxy_orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 5b. 普通用户：只能为自己创建代购单
DROP POLICY IF EXISTS "Users can create own orders" ON public.proxy_orders;
CREATE POLICY "Users can create own orders"
  ON public.proxy_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 5c. 普通用户：不可 UPDATE（上传凭证通过 RPC 函数，状态变更由管理员 Service Role 操作）
--     故意不创建 FOR UPDATE 策略给 authenticated


-- ============================================================
-- 第 6 步：proxy_order_admin_notes RLS 策略
--   authenticated 无任何权限，仅 service_role 访问
-- ============================================================

-- 不给 authenticated 创建任何策略 → 默认拒绝


-- ============================================================
-- 第 7 步：proxy_order_logs RLS 策略
-- ============================================================

-- 7a. 普通用户：只能查看自己订单的日志
DROP POLICY IF EXISTS "Users can view logs of own orders" ON public.proxy_order_logs;
CREATE POLICY "Users can view logs of own orders"
  ON public.proxy_order_logs
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.proxy_orders WHERE user_id = auth.uid()
    )
  );

-- 7b. 不授予 INSERT 给 authenticated（日志由触发器和 Server Action 写入）


-- ============================================================
-- 第 8 步：Schema + 表 + Sequence 授权
--   核心原则：anon 无任何权限，authenticated 仅 SELECT/INSERT
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- proxy_orders：authenticated 可 SELECT + INSERT，不可 UPDATE/DELETE
GRANT SELECT, INSERT ON public.proxy_orders TO authenticated;

-- proxy_order_admin_notes：authenticated 无权限（仅 service_role）
-- （不授予任何权限给 authenticated）

-- proxy_order_logs：authenticated 仅 SELECT
GRANT SELECT ON public.proxy_order_logs TO authenticated;

-- Sequence 授权（仅 authenticated 需要 INSERT 的表）
GRANT USAGE ON SEQUENCE public.proxy_orders_id_seq TO authenticated;
-- proxy_order_admin_notes_id_seq：不授权 authenticated（该表仅 service_role 操作）
-- proxy_order_logs_id_seq：不授权 authenticated（日志由触发器和 service_role 写入）


-- ============================================================
-- 第 9 步：RPC 函数 — 用户上传付款凭证
--   使用 SECURITY DEFINER 以创建者权限运行，绕过 RLS
--   内部自行校验 user_id 和 status，防止越权
-- ============================================================
CREATE OR REPLACE FUNCTION upload_payment_proof(
  p_order_id BIGINT,
  p_proof_url TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 严格校验：仅 pending_payment 状态的本人订单可上传凭证
  -- 注意：SECURITY DEFINER + search_path = ''，所有表必须使用 public. 前缀
  UPDATE public.proxy_orders
  SET payment_proof_url = p_proof_url,
      status = 'proof_uploaded'
  WHERE id = p_order_id
    AND user_id = auth.uid()
    AND status = 'pending_payment';

  IF NOT FOUND THEN
    RAISE EXCEPTION '订单不存在、不属于你、或不在待付款状态'
      USING ERRCODE = '23514';  -- check_violation
  END IF;

  -- 写入操作日志
  INSERT INTO public.proxy_order_logs (order_id, action, old_status, new_status, note)
  VALUES (p_order_id, 'payment_proof_upload', 'pending_payment', 'proof_uploaded', '用户上传付款凭证');
END;
$$;

-- 允许 authenticated 用户调用此 RPC
GRANT EXECUTE ON FUNCTION upload_payment_proof(BIGINT, TEXT) TO authenticated;

COMMENT ON FUNCTION upload_payment_proof(BIGINT, TEXT) IS '用户上传付款凭证：仅允许 pending_payment 状态的本人订单。上传后状态自动变为 proof_uploaded，进入管理员队列';


-- ============================================================
-- 第 10 步：触发器 — 自动更新 updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_proxy_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_proxy_orders_updated_at ON public.proxy_orders;
CREATE TRIGGER trg_proxy_orders_updated_at
  BEFORE UPDATE ON public.proxy_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_proxy_orders_updated_at();


-- ============================================================
-- 第 11 步：触发器 — 状态变更自动写日志
-- ============================================================
CREATE OR REPLACE FUNCTION log_proxy_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.proxy_order_logs (order_id, action, old_status, new_status, admin_id)
    VALUES (NEW.id, 'status_change', OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_proxy_orders_status_log ON public.proxy_orders;
CREATE TRIGGER trg_proxy_orders_status_log
  AFTER UPDATE ON public.proxy_orders
  FOR EACH ROW
  EXECUTE FUNCTION log_proxy_order_status_change();


-- ============================================================
-- 迁移完成
--
-- 表结构（3 张）：
--   proxy_orders           — 代购单（无 admin_notes 字段）
--   proxy_order_admin_notes — 管理员内部备注（独立表，普通用户不可见）
--   proxy_order_logs       — 操作日志
--
-- 状态流：
--   pending_payment → proof_uploaded → accepted → purchasing → purchased → shipped → delivered
--   任意状态 → cancelled / rejected
--
-- 权限矩阵：
--   ┌──────────────┬──────────────────────┬──────────────────────────┐
--   │              │ authenticated        │ service_role             │
--   ├──────────────┼──────────────────────┼──────────────────────────┤
--   │ proxy_orders │ SELECT(自己) INSERT(自己) │ 全部（绕过 RLS）          │
--   │              │ UPDATE 禁止           │                          │
--   ├──────────────┼──────────────────────┼──────────────────────────┤
--   │ admin_notes  │ 无权限               │ 全部                     │
--   ├──────────────┼──────────────────────┼──────────────────────────┤
--   │ logs         │ SELECT(自己订单的)     │ 全部                     │
--   ├──────────────┼──────────────────────┼──────────────────────────┤
--   │ RPC          │ EXECUTE              │ —                        │
--   └──────────────┴──────────────────────┴──────────────────────────┘
--
-- 管理员可见规则：
--   应用层 Server Action 查询时强制 WHERE status != 'pending_payment'
--   只有用户上传凭证（proof_uploaded）的订单才进入管理员后台
-- ============================================================
