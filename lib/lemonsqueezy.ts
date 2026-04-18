import { lemonSqueezySetup, createCheckout, getSubscription, cancelSubscription } from '@lemonsqueezy/lemonsqueezy.js';
import type { PlanId, BillingCycle } from './plans';

const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const API_KEY = process.env.LEMONSQUEEZY_API_KEY;

console.log('LemonSqueezy config:', { STORE_ID, hasApiKey: !!API_KEY });

lemonSqueezySetup({
  apiKey: API_KEY!,
  onError: (error) => console.error('LemonSqueezy error:', error),
});

export interface CheckoutOptions {
  planId: PlanId;
  billingCycle: BillingCycle;
  userId: string;
  userEmail: string;
  userName: string;
  variantId: string;
}

export async function createLemonSqueezyCheckout(options: CheckoutOptions) {
  const { planId, billingCycle, userId, userEmail, userName, variantId } = options;

  if (!variantId) {
    throw new Error(`Plan ${planId} does not have a LemonSqueezy variant ID configured`);
  }

  if (!STORE_ID) {
    throw new Error('LEMONSQUEEZY_STORE_ID is not configured');
  }

  const orderName = billingCycle === 'yearly' ? `${planId} 플랜 (연간)` : `${planId} 플랜`;

  console.log('Creating checkout with:', { storeId: STORE_ID, variantId, orderName });

  const checkout = await createCheckout(Number(STORE_ID), variantId, {
    checkoutData: {
      email: userEmail,
      name: userName,
      custom: {
        user_id: userId,
        plan_id: planId,
        billing_cycle: billingCycle,
      },
    },
    productOptions: {
      name: orderName,
      description: `${planId} 플랜`,
    },
    checkoutOptions: {
      embed: false,
      media: true,
      logo: true,
    },
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });

  console.log('Checkout result:', JSON.stringify(checkout));

  return checkout;
}

export async function getLemonSqueezySubscription(subscriptionId: string) {
  return await getSubscription(subscriptionId);
}

export async function cancelLemonSqueezySubscription(subscriptionId: string) {
  return await cancelSubscription(subscriptionId);
}

export { lemonSqueezySetup };