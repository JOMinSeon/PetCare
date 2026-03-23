export default function RefundPage() {
  return (
    <div style={{ background: '#0D1117', minHeight: '100vh', color: '#e6edf3' }}>
      <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-2">환불 정책</h1>
        <p className="text-sm mb-12" style={{ color: '#4a7c59' }}>최종 업데이트: 2026년 3월 22일</p>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: '#8b949e' }}>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. 환불 원칙</h2>
            <p>
              펫헬스는 고객 만족을 최우선으로 하며, 서비스 이용 중 불편함이 발생한 경우 아래 정책에 따라 환불을 진행합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. 환불 가능 기간</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>결제일로부터 <strong className="text-white">7일 이내</strong> 서비스를 이용하지 않은 경우 전액 환불</li>
              <li>결제일로부터 7일 이내라도 서비스를 이용한 경우 이용 일수에 따라 일할 계산하여 환불</li>
              <li>결제일로부터 7일 초과 시 환불 불가</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. 환불 불가 항목</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>이미 사용된 AI 분석 크레딧</li>
              <li>프로모션·할인 코드 적용 결제건 (별도 안내가 없는 경우)</li>
              <li>서비스 이용 중 회원이 직접 해지한 경우 잔여 기간</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. 환불 신청 방법</h2>
            <p>
              이메일 <a href="mailto:fjkg33@gmail.com" className="text-green-400 hover:underline">fjkg33@gmail.com</a> 또는
              전화 <span className="text-white">010-2714-7196</span>으로 문의해 주세요.
              신청 시 <strong className="text-white">주문번호, 이메일, 환불 사유</strong>를 함께 기재해 주시면 빠르게 처리해 드립니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. 환불 처리 기간</h2>
            <p>
              환불 신청 확인 후 영업일 기준 <strong className="text-white">3~5일</strong> 이내에 결제 수단으로 환불됩니다.
              카드사 정책에 따라 실제 취소까지 추가 시간이 소요될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. 문의</h2>
            <p>
              환불 관련 문의는 이메일{' '}
              <a href="mailto:fjkg33@gmail.com" className="text-green-400 hover:underline">fjkg33@gmail.com</a>
              으로 연락 주시기 바랍니다.
            </p>
          </section>
        </div>

        <div className="mt-16">
          <a
            href="/landing"
            className="text-sm transition-colors hover:text-white"
            style={{ color: '#4a7c59' }}
          >
            ← 홈으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
