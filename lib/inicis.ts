import crypto from 'crypto';

const INICIS_BASE_URL = 'https://iniapi.inicis.com';

const INICIS_API_KEY = process.env.INICIS_API_KEY;
const INICIS_SIGN_KEY = process.env.INICIS_SIGN_KEY;
const INICIS_MID = process.env.INICIS_MID;

export const INICIS_RESULT_CODE = {
  SUCCESS: '00',
  USER_CANCEL: '01',
  INVALID_PARAMS: '02',
} as const;

export interface InicisResponse {
  resultCode: string;
  resultMsg?: string;
  tid?: string;
  [key: string]: string | undefined;
}

export interface SignatureParams {
  orderId: string;
  amount: number;
  timestamp: string;
  mid: string;
}

export interface PaymentRequestParams {
  billKey: string;
  orderId: string;
  amount: number;
  goodsName: string;
  customerName?: string;
  customerEmail?: string;
  customerTel?: string;
}

export interface PaymentResult {
  success: boolean;
  tid?: string;
  errorCode?: string;
  errorMsg?: string;
}

function validateInicisConfig(): void {
  if (!INICIS_API_KEY || !INICIS_SIGN_KEY || !INICIS_MID) {
    throw new Error('이니시스 환경 설정이 누락되었습니다.');
  }
}

function hashSignKey(signKey: string): string {
  return crypto.createHash('sha256').update(signKey).digest('hex');
}

export function generateSignature(params: SignatureParams, signKey: string): string {
  const { orderId, amount, timestamp } = params;
  const signatureBase = `oid=${orderId}&price=${amount}&timestamp=${timestamp}`;
  return crypto.createHmac('sha256', signKey).update(signatureBase).digest('hex');
}

export function verifySignature(params: Omit<SignatureParams, 'mid'>, receivedSignature: string): boolean {
  if (!INICIS_SIGN_KEY || !INICIS_MID) {
    throw new Error('이니시스 SignKey가 환경 변수에 설정되지 않았습니다.');
  }
  const expected = generateSignature({ ...params, mid: INICIS_MID }, INICIS_SIGN_KEY);
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(receivedSignature, 'hex'));
}

export function parseInicisResponse(responseText: string): InicisResponse {
  const result: InicisResponse = { resultCode: '', resultMsg: undefined, tid: undefined };
  try {
    const params = new URLSearchParams(responseText);
    params.forEach((value, key) => {
      result[key] = value;
    });
  } catch {
    console.error('Failed to parse Inicis response');
  }
  return result;
}

export async function requestRecurringPayment(params: PaymentRequestParams): Promise<PaymentResult> {
  validateInicisConfig();

  const timestamp = Date.now().toString();
  const signatureBase = `mid=${INICIS_MID}&money=0&price=${params.amount}&timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', INICIS_SIGN_KEY!).update(signatureBase).digest('hex');

  const requestBody = new URLSearchParams({
    type: 'card',
    paymethod: 'BILL',
    mid: INICIS_MID!,
    billkey: params.billKey,
    orderId: params.orderId,
    price: params.amount.toString(),
    goodsName: params.goodsName,
    timestamp,
    signature,
    ...(params.customerName && { buyername: params.customerName }),
    ...(params.customerEmail && { buyeremail: params.customerEmail }),
    ...(params.customerTel && { buyertel: params.customerTel }),
  });

  try {
    const response = await fetch(`${INICIS_BASE_URL}/v1/billing/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${INICIS_API_KEY}`,
      },
      body: requestBody.toString(),
    });

    const result = await response.text();
    const parsed = parseInicisResponse(result);

    if (parsed.resultCode === INICIS_RESULT_CODE.SUCCESS) {
      return { success: true, tid: parsed.tid };
    }
    return { success: false, errorCode: parsed.resultCode, errorMsg: parsed.resultMsg || '정기 결제 실패' };
  } catch (error) {
    console.error('Inicis recurring payment error:', error);
    return { success: false, errorCode: 'NETWORK_ERROR', errorMsg: error instanceof Error ? error.message : '네트워크 오류' };
  }
}

export async function revokeBillKey(billKey: string, orderId: string): Promise<PaymentResult> {
  validateInicisConfig();

  const timestamp = Date.now().toString();
  const requestBody = new URLSearchParams({ mid: INICIS_MID!, billkey: billKey, orderId, timestamp });

  try {
    const response = await fetch(`${INICIS_BASE_URL}/v1/billing/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${INICIS_API_KEY}`,
      },
      body: requestBody.toString(),
    });

    const result = await response.text();
    const parsed = parseInicisResponse(result);

    if (parsed.resultCode === INICIS_RESULT_CODE.SUCCESS) {
      return { success: true };
    }
    return { success: false, errorCode: parsed.resultCode, errorMsg: parsed.resultMsg || '빌키 해제 실패' };
  } catch (error) {
    console.error('Inicis BillKey revoke error:', error);
    return { success: false, errorCode: 'NETWORK_ERROR', errorMsg: error instanceof Error ? error.message : '네트워크 오류' };
  }
}

export function getMKey(): string {
  if (!INICIS_SIGN_KEY) {
    throw new Error('이니시스 SignKey가 환경 변수에 설정되지 않았습니다.');
  }
  return hashSignKey(INICIS_SIGN_KEY);
}

export function getMid(): string {
  if (!INICIS_MID) {
    throw new Error('이니시스 MID가 환경 변수에 설정되지 않았습니다.');
  }
  return INICIS_MID;
}