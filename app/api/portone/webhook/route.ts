import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPayment } from '@/lib/portone';
import crypto from 'crypto';

/**
 * PortOne v2 웹훅 서명 검증 (Svix 포맷)
 * payload = "{webhook-id}.{webhook-timestamp}.{rawBody}"
 * signature = HMAC-SHA256(secret, payload) → base64
 */
function verifyWebhookSignature(
  rawBody: string,
  msgId: string,
  msgTimestamp: string,
  msgSignature: string,
  secret: string,
): boolean {
  // 재전송 공격 방지: 5분 이상 경과한 요청 거부
  const ts = parseInt(msgTimestamp, 10);
  if (isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const payload = `${msgId}.${msgTimestamp}.${rawBody}`;
  const secretBytes = secret.startsWith('whsec_')
    ? Buffer.from(secret.slice(6), 'base64')
    : Buffer.from(secret);
  const expected = crypto
    .createHmac('sha256', secretBytes)
    .update(payload)
    .digest('base64');

  // 서명 헤더는 공백으로 구분된 여러 서명을 포함할 수 있음 (예: "v1,sig1 v1,sig2")
  for (const sig of msgSignature.split(' ')) {
    const commaIdx = sig.indexOf(',');
    if (commaIdx === -1) continue;
    const version = sig.slice(0, commaIdx);
    const value = sig.slice(commaIdx + 1);
    if (version !== 'v1') continue;
    try {
      const vBuf = Buffer.from(value);
      const eBuf = Buffer.from(expected);
      if (vBuf.length === eBuf.length && crypto.timingSafeEqual(vBuf, eBuf)) {
        return true;
      }
    } catch {
      // 길이 불일치 → false
    }
  }
  return false;
}

// 포트원 웹훅: 결제 상태 변경 시 호출됨
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.PORTONE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[PortOne Webhook] PORTONE_WEBHOOK_SECRET 환경변수가 설정되지 않았습니다.');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const rawBody = await req.text();
  const msgId = req.headers.get('webhook-id') ?? '';
  const msgTimestamp = req.headers.get('webhook-timestamp') ?? '';
  const msgSignature = req.headers.get('webhook-signature') ?? '';

  if (!verifyWebhookSignature(rawBody, msgId, msgTimestamp, msgSignature, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let body: { type?: string; data?: { paymentId?: string } };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { type, data } = body;

  // 결제 완료/실패 이벤트만 처리
  if (type !== 'Transaction.Paid' && type !== 'Transaction.Failed') {
    return NextResponse.json({ ok: true });
  }

  const paymentId: string = data?.paymentId ?? '';
  if (!paymentId) return NextResponse.json({ ok: true });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 중복 처리 방지: 이미 처리된 이벤트인지 확인
  if (msgId) {
    const { data: existing } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', msgId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true });
    }
  }

  // 포트원 API로 결제 상태 검증
  const payment = await getPayment(paymentId);

  // paymentId 형식: pay-{planId}-{cycle}-{userId}-{timestamp} 또는 renewal-{userId}-{timestamp}
  const match = paymentId.match(/^(?:pay-\w+-\w+-|renewal-)([a-f0-9]{32})-\d+$/);
  if (!match) return NextResponse.json({ ok: true });

  const rawUserId = match[1];
  // UUID 복원: 8-4-4-4-12
  const userId = [
    rawUserId.slice(0, 8),
    rawUserId.slice(8, 12),
    rawUserId.slice(12, 16),
    rawUserId.slice(16, 20),
    rawUserId.slice(20),
  ].join('-');

  let eventStatus: 'processed' | 'skipped' | 'error' = 'processed';

  if (payment.status === 'PAID') {
    // 프로필에서 플랜 및 결제 주기 조회
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan, billing_cycle')
      .eq('user_id', userId)
      .single();

    // plan_limits에서 가격 조회 (billing_cycle 기준으로 검증)
    const { data: planLimit } = await supabase
      .from('plan_limits')
      .select('monthly_price, yearly_price')
      .eq('plan_type', profile?.subscription_plan ?? '')
      .single();

    const cycle = profile?.billing_cycle ?? 'monthly';
    const expectedAmount = cycle === 'yearly'
      ? planLimit?.yearly_price
      : planLimit?.monthly_price;

    if (!expectedAmount || payment.amount?.total !== expectedAmount) {
      console.error('[PortOne Webhook] 결제 금액 불일치', {
        userId,
        cycle,
        expected: expectedAmount,
        actual: payment.amount?.total,
      });
      eventStatus = 'error';
    } else {
      await supabase
        .from('profiles')
        .update({
          plan_started_at: new Date().toISOString(),
          subscription_status: 'active',
        })
        .eq('user_id', userId);
    }
  } else if (payment.status === 'FAILED') {
    await supabase
      .from('profiles')
      .update({ subscription_status: 'payment_failed' })
      .eq('user_id', userId);
  } else {
    eventStatus = 'skipped';
  }

  // 처리 결과 기록 (중복 방지용 — UNIQUE(event_id) 제약으로 보호됨)
  if (msgId) {
    try {
      await supabase.from('webhook_events').insert({
        event_id: msgId,
        event_type: type,
        payment_id: paymentId,
        status: eventStatus,
        payload: body,
      });
    } catch {
      // 극히 드문 동시성 충돌(race condition) — 이미 처리된 것으로 간주
    }
  }

  if (eventStatus === 'error') {
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
