const BASE_URL = 'https://api.portone.io';

function authHeader(): string {
  return `PortOne ${process.env.PORTONE_API_SECRET}`;
}

async function getAccessToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/login/api-secret`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiSecret: process.env.PORTONE_API_SECRET }),
  });
  const data = await res.json();
  return data.accessToken as string;
}

/** 빌링키로 결제 실행 */
export async function payWithBillingKey(params: {
  paymentId: string;
  billingKey: string;
  orderName: string;
  amount: number;
  customerId: string;
}) {
  const res = await fetch(`${BASE_URL}/payments/${params.paymentId}/billing-key`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      billingKey: params.billingKey,
      orderName: params.orderName,
      amount: { total: params.amount },
      currency: 'KRW',
      customer: { customerId: params.customerId },
    }),
  });
  return res.json() as Promise<{
    status?: string;
    txId?: string;
    paymentId?: string;
    message?: string;
    code?: string;
  }>;
}

/** 빌링키 삭제 */
export async function deleteBillingKey(billingKey: string) {
  const res = await fetch(`${BASE_URL}/billing-keys/${billingKey}`, {
    method: 'DELETE',
    headers: { Authorization: authHeader() },
  });
  return res.json();
}

/** 결제 취소 */
export async function cancelPayment(params: {
  paymentId: string;
  reason: string;
  amount?: number;
}) {
  const body: Record<string, unknown> = { reason: params.reason };
  if (params.amount !== undefined) {
    body.amount = params.amount;
  }

  const res = await fetch(`${BASE_URL}/payments/${params.paymentId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(),
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

/** 결제 단건 조회 */
export async function getPayment(paymentId: string) {
  const res = await fetch(`${BASE_URL}/payments/${paymentId}`, {
    headers: { Authorization: authHeader() },
  });
  return res.json() as Promise<{
    status?: string;
    amount?: { total?: number };
    customer?: { customerId?: string };
    code?: string;
  }>;
}

/** 빌링키 단건 조회 (소유권 검증용) */
export async function getBillingKey(billingKey: string) {
  const res = await fetch(`${BASE_URL}/billing-keys/${billingKey}`, {
    headers: { Authorization: authHeader() },
  });
  return res.json() as Promise<{
    billingKey?: string;
    customer?: { customerId?: string };
    status?: string;
    code?: string;
  }>;
}

/** 카드 정보로 빌링키 직접 발급 (비인증 결제) */
export async function issueBillingKeyWithCard(params: {
  customerId: string;
  email: string;
  phoneNumber: string;
  cardNumber: string;
  expiryYear: string;
  expiryMonth: string;
  birthOrBusinessRegistrationNumber: string;
  passwordTwoDigits: string;
}) {
  const res = await fetch(`${BASE_URL}/billing-keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY,
      customer: {
        id: params.customerId,
        email: params.email,
        phoneNumber: params.phoneNumber,
      },
      method: {
        card: {
          credential: {
            number: params.cardNumber.replace(/\D/g, ''),
            expiryYear: params.expiryYear,
            expiryMonth: params.expiryMonth,
            birthOrBusinessRegistrationNumber: params.birthOrBusinessRegistrationNumber,
            passwordTwoDigits: params.passwordTwoDigits,
          },
        },
      },
    }),
  });
  return res.json() as Promise<{
    billingKey?: string;
    code?: string;
    message?: string;
  }>;
}

export { getAccessToken };
