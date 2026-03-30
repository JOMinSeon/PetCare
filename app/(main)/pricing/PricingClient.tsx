'use client';
import { useRouter } from 'next/navigation';
import { PLANS } from '@/lib/plans';
import { PricingCard } from '@/components/pricing/PricingCard';

interface Props {
  currentPlanId?: string;
  currentCycle?: string;
}

export default function PricingClient({ currentPlanId, currentCycle }: Props) {
  const router = useRouter();

  const handleSelect = (planId: string) => {
    if (planId === 'free') {
      router.push('/auth/login');
      return;
    }
    router.push(`/subscribe?planId=${planId}`);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {PLANS.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          currentPlanId={currentPlanId}
          currentCycle={currentCycle}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
