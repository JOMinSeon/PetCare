import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '환불 정책',
  description: '펫헬스 환불 정책입니다.',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">

      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
              <span className="text-white text-xl">🐾</span>
            </div>
            PetCare
          </Link>
          <Link
            href="/landing"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft size={16} />
            홈으로 돌아가기
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">환불 정책</h1>
          <p className="text-sm text-gray-500">최종 업데이트: 2026년 3월 22일</p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-gray-600">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. 환불 원칙</h2>
            <p>
              펫헬스는 고객 만족을 최우선으로 하며, 서비스 이용 중 불편함이 발생한 경우 아래 정책에 따라 환불을 진행합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. 환불 가능 기간</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>결제일로부터 <strong className="text-gray-900">7일 이내</strong> 서비스를 이용하지 않은 경우 전액 환불</li>
              <li>결제일로부터 7일 이내라도 서비스를 이용한 경우 이용 일수에 따라 일할 계산하여 환불</li>
              <li>결제일로부터 7일 초과 시 환불 불가</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. 환불 불가 항목</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>이미 사용된 AI 분석 크레딧</li>
              <li>프로모션·할인 코드 적용 결제건 (별도 안내가 없는 경우)</li>
              <li>서비스 이용 중 회원이 직접 해지한 경우 잔여 기간</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. 환불 신청 방법</h2>
            <p>
              이메일 <a href="mailto:fjkg33@gmail.com" className="text-orange-500 hover:underline">fjkg33@gmail.com</a> 또는
              전화 <span className="text-gray-900">010-2714-7196</span>으로 문의해 주세요.
              신청 시 <strong className="text-gray-900">주문번호, 이메일, 환불 사유</strong>를 함께 기재해 주시면 빠르게 처리해 드립니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. 환불 처리 기간</h2>
            <p>
              환불 신청 확인 후 영업일 기준 <strong className="text-gray-900">3~5일</strong> 이내에 결제 수단으로 환불됩니다.
              카드사 정책에 따라 실제 취소까지 추가 시간이 소요될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. 문의</h2>
            <p>
              환불 관련 문의는 이메일{' '}
              <a href="mailto:fjkg33@gmail.com" className="text-orange-500 hover:underline">fjkg33@gmail.com</a>
              으로 연락 주시기 바랍니다.
            </p>
          </section>

        </div>

        <div className="mt-16">
          <Link
            href="/landing"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft size={16} />
            홈으로 돌아가기
          </Link>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © 2026 PetCare. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link href="/terms" className="hover:text-orange-500 transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-orange-500 transition-colors">개인정보처리방침</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}