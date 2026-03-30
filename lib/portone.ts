import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET!;
const PORTONE_API_URL = 'https://api.portone.io';

export async function requestPayment(
  billingKey: string,
  amount: number,
  orderId: string,
  orderName: string,
  customerId?: string,
  customerEmail?: string,
  customerPhone?: string
) {
  const res = await fetch(`${PORTONE_API_URL}/v2/payment/billing`, {
    method: 'POST',
    headers: {
      'Authorization': `PortOne ${PORTONE_API_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      billingKey,
      amount,
      orderId,
      orderName,
      currency: 'KRW',
      customer: customerId ? {
        id: customerId,
        email: customerEmail,
        phoneNumber: customerPhone,
      } : undefined,
    }),
  });
  const body = await res.json();
  return { status: res.status, body };
}

export async function getServerDb() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
