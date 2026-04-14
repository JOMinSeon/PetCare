import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '요금제',
  description: '펫헬스 요금제를 확인하고 반려동물 건강 관리 서비스를 시작하세요.',
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
