import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET!;
const PORTONE_API_URL = 'https://api.portone.io';

export async function issueBillingKey(billingKey: string) {
  const res = await fetch(`${PORTONE_API_URL}/v2/billing-key/${billingKey}`, {
    headers: {
      'Authorization': `PortOne ${PORTONE_API_SECRET}`,
    },
  });
  return res.json();
}

export async function requestPayment(billingKey: string, amount: number, orderId: string, orderName: string) {
  const res = await fetch(`${PORTONE_API_URL}/v2/payment/billing`, {
    method: 'POST',
    headers: {
      'Authorization': `Portone ${PORTONE_API_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      billingKey,
      amount,
      orderId,
      orderName,
      currency: 'KRW',
    }),
  });
  return res.json();
}

export async function cancelPayment(transactionId: string, reason?: string) {
  const res = await fetch(`${PORTONE_API_URL}/v2/payment/${transactionId}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `PortOne ${PORTONE_API_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason,
    }),
  });
  return res.json();
}

export async function getPaymentStatus(paymentId: string) {
  const res = await fetch(`${PORTONE_API_URL}/v2/payment/${paymentId}`, {
    headers: {
      'Authorization': `PortOne ${PORTONE_API_SECRET}`,
    },
  });
  return res.json();
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

export function getAdminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
