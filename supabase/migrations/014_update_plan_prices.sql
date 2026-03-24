-- ============================================================
-- 구독 가격 변경
--   premium : 14,900 → 30,000원/월 / 149,000 → 300,000원/연
--   clinic  : 49,000 → 99,000원/월 / 490,000 → 990,000원/연
--   clinic label: '병원용 플랜' → '병원전용 플랜'
-- ============================================================

UPDATE plan_limits SET
  monthly_price = 30000,
  yearly_price  = 300000,
  order_name    = '프리미엄 플랜'
WHERE plan_type = 'premium';

UPDATE plan_limits SET
  monthly_price = 99000,
  yearly_price  = 990000,
  order_name    = '병원전용 플랜'
WHERE plan_type = 'clinic';
