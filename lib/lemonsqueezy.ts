import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';
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

  if (!STORE_ID || !API_KEY) {
    throw new Error('LemonSqueezy configuration missing');
  }

  const orderName = billingCycle === 'yearly' ? `${planId} 플랜 (연간)` : `${planId} 플랜`;

  console.log('Creating checkout with:', { storeId: STORE_ID, variantId, orderName });

  const response = await fetch(`https://api.lemonsqueezy.com/v1/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: userEmail,
            name: userName,
            custom: {
              user_id: userId,
              plan_id: planId,
              billing_cycle: billingCycle,
            },
          },
          product_options: {
            name: orderName,
            description: `${planId} 플랜`,
          },
          checkout_options: {
            embed: false,
            media: true,
            logo: true,
          },
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: STORE_ID,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId,
            },
          },
        },
      },
    }),
  });

  const result = await response.json();

  console.log('Checkout response status:', response.status);
  console.log('Checkout result:', JSON.stringify(result));

  if (!response.ok) {
    throw new Error(result.errors?.[0]?.detail || 'Checkout creation failed');
  }

  return {
    error: null,
    data: {
      data: {
        attributes: {
          url: result.data?.attributes?.url,
        },
      },
    },
  };
}

export async function getLemonSqueezySubscription(subscriptionId: string) {
  const response = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/vnd.api+json',
    },
  });
  return await response.json();
}

export async function cancelLemonSqueezySubscription(subscriptionId: string) {
  const response = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/vnd.api+json',
    },
  });
  return await response.json();
}

export { lemonSqueezySetup };