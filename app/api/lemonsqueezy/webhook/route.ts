import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ALLOWED_EVENTS = new Set([
  'subscription_created',
  'subscription_updated',
  'subscription_cancelled',
  'subscription_expired',
  'subscription_payment_success',
  'subscription_payment_failed',
]);

function verifySignature(payload: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest('hex');
  
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('x-signature');
    const eventName = headersList.get('x-event-name');

    if (!eventName || !ALLOWED_EVENTS.has(eventName)) {
      console.error('Unknown webhook event:', eventName);
      return NextResponse.json({ error: 'Unknown event' }, { status: 400 });
    }

    if (!signature || !verifySignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(body);
    
    console.log('LemonSqueezy webhook received:', eventName, payload);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      SERVICE_ROLE_KEY!
    );

    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated': {
        const { data } = payload;
        const subscriptionId = data.data.id;
        const userId = data.meta.custom_data.user_id;
        const planId = data.meta.custom_data.plan_id;
        const status = data.data.attributes.status;
        const renewsAt = data.data.attributes.renews_at;

        if (status === 'active' || status === 'past_due') {
          await supabase
            .from('profiles')
            .update({
              subscription_plan: planId,
              subscription_status: 'active',
              subscription_id: subscriptionId.toString(),
              plan_started_at: new Date().toISOString(),
              next_billing_date: renewsAt,
            })
            .eq('id', userId);
        }
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        const { data } = payload;
        const userId = data.meta.custom_data.user_id;

        await supabase
          .from('profiles')
          .update({
            subscription_plan: 'free',
            subscription_status: 'inactive',
            subscription_id: null,
            plan_started_at: null,
            next_billing_date: null,
          })
          .eq('id', userId);
        break;
      }

      case 'subscription_payment_success': {
        const { data } = payload;
        const subscriptionId = data.data.id;
        const renewsAt = data.data.attributes.renews_at;

        await supabase
          .from('payment_history')
          .insert({
            payment_id: subscriptionId.toString(),
            user_id: data.meta.custom_data.user_id,
            plan: data.meta.custom_data.plan_id,
            amount: data.data.attributes.unit_price / 100,
            status: 'success',
            type: 'subscribe',
          });

        await supabase
          .from('profiles')
          .update({ next_billing_date: renewsAt })
          .eq('subscription_id', subscriptionId.toString());
        break;
      }

      case 'subscription_payment_failed': {
        const { data } = payload;
        const subscriptionId = data.data.id;

        await supabase
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('subscription_id', subscriptionId.toString());
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}