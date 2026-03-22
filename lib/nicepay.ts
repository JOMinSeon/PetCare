import crypto from 'crypto';

const BASE_URL =
  process.env.NICEPAY_ENV === 'production'
    ? 'https://api.nicepay.co.kr/v1'
    : 'https://sandbox-api.nicepay.co.kr/v1';

function authHeader(): string {
  const creds = Buffer.from(
    `${process.env.NICEPAY_CLIENT_ID}:${process.env.NICEPAY_SECRET_KEY}`
  ).toString('base64');
  return `Basic ${creds}`;
}

// ── 직접 카드 입력 방식 (Server Action용) ──────────────────────────────────

/** 카드 데이터 AES256 암호화 (나이스페이 필수) */
export function encryptCardData(plain: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.NICEPAY_ENCRYPT_KEY!, 'hex'),
    iv
  );
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/** 카드 정보로 빌링키 직접 발급 */
export async function issueBillingKey(params: {
  cardNo: string; expYear: string; expMonth: string;
  idNo: string; cardPwd: string;
}) {
  const plain =
    `cardNo=${params.cardNo}&expYear=${params.expYear}` +
    `&expMonth=${params.expMonth}&idNo=${params.idNo}&cardPwd=${params.cardPwd}`;

  const res = await fetch(`${BASE_URL}/subscribe/regist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader() },
    body: JSON.stringify({
      encData: encryptCardData(plain),
      orderId: `reg_${Date.now()}`,
      encMode: 'A2',
    }),
  });

  const data = await res.json();
  if (data.resultCode !== '0000') throw new Error(data.resultMsg);
  return data.bid as string;
}

/** 빌링키로 결제 (직접 카드 입력 방식) */
export async function chargeWithBillingKey(params: {
  bid: string; amount: number; orderId: string; goodsName: string;
}) {
  const res = await fetch(`${BASE_URL}/subscribe/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader() },
    body: JSON.stringify({
      bid:       params.bid,
      amount:    params.amount,
      orderId:   params.orderId,
      goodsName: params.goodsName,
      cardQuota: '00',
    }),
  });

  const data = await res.json();
  if (data.resultCode !== '0000') throw new Error(data.resultMsg);
  return data as { tid: string; amount: number };
}

// ── NicePay 결제창 방식 (기존 API 라우트용) ────────────────────────────────

/** 빌링키 등록 승인 */
export async function subscribeRegist(encData: string, orderId: string) {
  const res = await fetch(`${BASE_URL}/subscribe/regist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader() },
    body: JSON.stringify({ encData, orderId, returnCharSet: 'utf-8' }),
  });
  return res.json();
}

/** 빌링키로 결제 */
export async function subscribePayments(
  bid: string,
  params: { orderId: string; amount: number; goodsName: string }
) {
  const res = await fetch(`${BASE_URL}/subscribe/${bid}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader() },
    body: JSON.stringify({ ...params, cardQuota: 0, useShopInterest: false }),
  });
  return res.json();
}

/** 빌링키 해제 */
export async function subscribeExpire(bid: string, orderId: string) {
  const res = await fetch(`${BASE_URL}/subscribe/${bid}/expire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader() },
    body: JSON.stringify({ orderId }),
  });
  return res.json();
}

/** 결제 취소 */
export async function paymentsCancel(
  tid: string,
  params: { reason: string; orderId: string; amount: number }
) {
  const res = await fetch(`${BASE_URL}/payments/${tid}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader() },
    body: JSON.stringify(params),
  });
  return res.json();
}
