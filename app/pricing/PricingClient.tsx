'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PLANS, type BillingCycle } from '@/lib/plans';
import { BillingToggle } from '@/components/pricing/BillingToggle';
import { PricingCard } from '@/components/pricing/PricingCard';

interface Props {
  currentPlanId?: string;
  currentCycle?: BillingCycle;
}

export default function PricingClient({ currentPlanId, currentCycle }: Props) {
  const router = useRouter();
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  const handleSelect = (planId: string) => {
    if (planId === 'free') {
      router.push('/auth/login');
      return;
    }
    router.push(`/subscribe?planId=${planId}&cycle=${cycle}`);
  };

  return (
    <>
      <BillingToggle value={cycle} onChange={setCycle} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            cycle={cycle}
            currentPlanId={currentPlanId}
            currentCycle={currentCycle}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </>
  );
}
