-- ============================================================
-- 第十次迁移补充：代购单取消 + 删除 RPC
-- 执行方式：在 Supabase SQL Editor 中手动执行
-- 创建日期：2026-06-23
-- ============================================================

-- ============================================================
-- RPC 1：取消代购单（pending_payment → cancelled）
--   仅允许本人操作，仅限 pending_payment 状态
-- ============================================================
CREATE OR REPLACE FUNCTION cancel_proxy_order(
  p_order_id BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.proxy_orders
  SET status = 'cancelled'
  WHERE id = p_order_id
    AND user_id = auth.uid()
    AND status = 'pending_payment';

  IF NOT FOUND THEN
    RAISE EXCEPTION '订单不存在、不属于你、或不在待付款状态，无法取消'
      USING ERRCODE = '23514';
  END IF;

  INSERT INTO public.proxy_order_logs (order_id, action, old_status, new_status, note)
  VALUES (p_order_id, 'status_change', 'pending_payment', 'cancelled', '用户自行取消');
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_proxy_order(BIGINT) TO authenticated;

COMMENT ON FUNCTION cancel_proxy_order(BIGINT) IS '用户取消待付款代购单：仅允许本人 pending_payment → cancelled';


-- ============================================================
-- RPC 2：删除代购单（仅限 pending_payment 状态）
--   仅允许本人操作，仅限 pending_payment 状态
-- ============================================================
CREATE OR REPLACE FUNCTION delete_proxy_order(
  p_order_id BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_status TEXT;
BEGIN
  -- 先查状态
  SELECT status INTO v_status
  FROM public.proxy_orders
  WHERE id = p_order_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION '订单不存在或不属于你'
      USING ERRCODE = '23514';
  END IF;

  IF v_status != 'pending_payment' THEN
    RAISE EXCEPTION '只能删除待付款状态的订单，当前状态：%', v_status
      USING ERRCODE = '23514';
  END IF;

  DELETE FROM public.proxy_orders
  WHERE id = p_order_id
    AND user_id = auth.uid()
    AND status = 'pending_payment';
END;
$$;

GRANT EXECUTE ON FUNCTION delete_proxy_order(BIGINT) TO authenticated;

COMMENT ON FUNCTION delete_proxy_order(BIGINT) IS '用户删除待付款代购单：仅允许本人删除 pending_payment 订单';
