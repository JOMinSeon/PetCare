import { NextRequest, NextResponse } from 'next/server';
import { generateSignature, getMid } from '@/lib/inicis';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, goodsName, buyerName, buyerEmail, buyerTel } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'orderId와 amount는 필수입니다.' }, { status: 400 });
    }

    let mid: string;
    let signKey: string;

    try {
      mid = getMid();
      signKey = process.env.INICIS_SIGN_KEY!;
    } catch {
      return NextResponse.json({ error: '결제 설정 오류가 발생했습니다.' }, { status: 500 });
    }

    const timestamp = Date.now().toString();
    const signature = generateSignature({ orderId, amount, timestamp, mid }, signKey);

    return NextResponse.json({
      signature,
      timestamp,
      mid,
      oid: orderId,
      goodsName: goodsName || `${amount}원 결제`,
      buyerName,
      buyerEmail,
      buyerTel,
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    return NextResponse.json({ error: '서명 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}