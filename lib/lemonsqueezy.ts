import { lemonSqueezySetup, createCheckout, getSubscription, cancelSubscription } from '@lemonsqueezy/lemonsqueezy.js';
import type { PlanId, BillingCycle } from './plans';

const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const API_KEY = process.env.LEMONSQUEEZY_API_KEY;

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

  const orderName = billingCycle === 'yearly' ? `${planId} 플랜 (연간)` : `${planId} 플랜`;

  const checkout = await createCheckout(STORE_ID!, variantId, {
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

  return checkout;
}

export async function getLemonSqueezySubscription(subscriptionId: string) {
  return await getSubscription(subscriptionId);
}

export async function cancelLemonSqueezySubscription(subscriptionId: string) {
  return await cancelSubscription(subscriptionId);
}

export { lemonSqueezySetup };