export default function PrivacyPage() {
  return (
    <div style={{ background: '#0D1117', minHeight: '100vh', color: '#e6edf3' }}>
      <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-2">개인정보처리방침</h1>
        <p className="text-sm mb-12" style={{ color: '#4a7c59' }}>최종 업데이트: 2026년 3월 22일</p>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: '#8b949e' }}>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. 수집하는 개인정보 항목</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-white">필수</strong>: 이메일 주소, 비밀번호(암호화 저장)</li>
              <li><strong className="text-white">선택</strong>: 닉네임, 프로필 사진</li>
              <li><strong className="text-white">자동 수집</strong>: 서비스 이용 기록, 접속 IP, 쿠키</li>
              <li><strong className="text-white">반려동물 정보</strong>: 이름, 종, 나이, 체중, 건강 기록, 사진</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. 개인정보 수집 및 이용 목적</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>회원 가입 및 본인 확인</li>
              <li>AI 기반 반려동물 건강 분석 서비스 제공</li>
              <li>서비스 개선 및 신규 기능 개발</li>
              <li>고객 문의 응대 및 분쟁 처리</li>
              <li>서비스 관련 공지 및 안내 발송</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. 개인정보 보유 및 이용 기간</h2>
            <p>
              회원 탈퇴 시 즉시 삭제함을 원칙으로 합니다. 단, 관련 법령에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 보관합니다.
            </p>
            <ul className="space-y-2 list-disc list-inside mt-3">
              <li>계약·청약철회 기록: 5년 (전자상거래법)</li>
              <li>소비자 불만·분쟁 기록: 3년 (전자상거래법)</li>
              <li>접속 로그: 3개월 (통신비밀보호법)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. 개인정보 제3자 제공</h2>
            <p>
              회사는 원칙적으로 회원의 개인정보를 제3자에게 제공하지 않습니다.
              다만, 법령에 의한 경우 또는 회원의 사전 동의가 있는 경우에는 예외로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. 개인정보 처리 위탁</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-white">Supabase Inc.</strong>: 데이터베이스 및 인증 서비스 운영</li>
              <li><strong className="text-white">Google LLC</strong>: AI 분석 서비스 제공</li>
              <li><strong className="text-white">Vercel Inc.</strong>: 서비스 호스팅 및 배포</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. 이용자의 권리</h2>
            <p>회원은 언제든지 아래 권리를 행사할 수 있습니다.</p>
            <ul className="space-y-2 list-disc list-inside mt-3">
              <li>개인정보 열람 요청</li>
              <li>개인정보 수정·삭제 요청</li>
              <li>개인정보 처리 정지 요청</li>
              <li>회원 탈퇴 및 동의 철회</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. 쿠키 사용</h2>
            <p>
              서비스는 로그인 유지 및 사용자 경험 개선을 위해 쿠키를 사용합니다.
              브라우저 설정에서 쿠키 사용을 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. 개인정보 보호 책임자</h2>
            <ul className="space-y-1">
              <li>책임자: 조민성</li>
              <li>이메일: <a href="mailto:fjkg33@gmail.com" className="text-green-400 hover:underline">fjkg33@gmail.com</a></li>
              <li>전화: 010-2714-7196</li>
            </ul>
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
