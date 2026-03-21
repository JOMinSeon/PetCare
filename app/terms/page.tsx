import Link from 'next/link';
import { PawPrint } from 'lucide-react';

export default function TermsPage() {
  return (
    <div style={{ background: '#0D1117', minHeight: '100vh', color: '#e6edf3' }}>

      {/* ── Header ── */}
      <header
        style={{
          background: 'rgba(13,17,23,0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid #1E3A2A',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: '#52B788' }}>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, #2D6A4F, #52B788)' }}
            >
              <PawPrint size={16} />
            </div>
            펫헬스
          </Link>
          <Link
            href="/"
            className="text-sm transition-colors hover:text-white"
            style={{ color: '#4a7c59' }}
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">이용약관</h1>
          <p className="text-sm" style={{ color: '#4a7c59' }}>최종 업데이트: 2026년 3월 22일</p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: '#8b949e' }}>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제1조 (목적)</h2>
            <p>
              본 약관은 펫헬스(사업자등록번호: 297-66-00726, 이하 &quot;회사&quot;)가 운영하는 AI 기반 반려동물 건강 관리 서비스
              &quot;펫헬스&quot;(이하 &quot;서비스&quot;)를 이용함에 있어 회사와 회원 간의 권리·의무 및 책임사항, 기타 필요한 사항을
              규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제2조 (정의)</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-white">&quot;서비스&quot;</strong>란 회사가 제공하는 반려동물 건강 기록, AI 식품 분석, 건강 달력, 커뮤니티 등 플랫폼 기능 일체를 말합니다.</li>
              <li><strong className="text-white">&quot;회원&quot;</strong>이란 본 약관에 동의하고 서비스에 가입하여 이용하는 자를 말합니다.</li>
              <li><strong className="text-white">&quot;유료 서비스&quot;</strong>란 회사가 유료로 제공하는 구독 플랜 및 추가 기능을 말합니다.</li>
              <li><strong className="text-white">&quot;콘텐츠&quot;</strong>란 회원이 서비스 내에 등록·업로드한 텍스트, 이미지, 반려동물 정보 등 모든 자료를 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제3조 (약관의 효력 및 변경)</h2>
            <ol className="space-y-2 list-decimal list-inside">
              <li>본 약관은 서비스 화면 게시 또는 이메일 공지로 효력이 발생합니다.</li>
              <li>회사는 관련 법령을 위반하지 않는 범위에서 약관을 개정할 수 있으며, 중요 사항 변경 시 최소 <strong className="text-white">7일 전</strong> 공지합니다.</li>
              <li>회원이 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다. 공지 후 계속 이용 시 변경 약관에 동의한 것으로 간주합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제4조 (회원 가입)</h2>
            <ol className="space-y-2 list-decimal list-inside">
              <li>서비스는 만 <strong className="text-white">14세 이상</strong>이면 누구나 가입할 수 있습니다.</li>
              <li>회원 가입은 이용자가 약관에 동의하고 소정의 가입 양식을 작성한 후, 회사가 이를 승낙함으로써 성립됩니다.</li>
              <li>회사는 다음 각 호의 경우 가입을 거부하거나 사후 해지할 수 있습니다.
                <ul className="space-y-1 list-disc list-inside ml-4 mt-2">
                  <li>타인의 정보를 도용하거나 허위 정보를 기재한 경우</li>
                  <li>이전에 서비스 이용 계약이 해지된 이력이 있는 경우</li>
                  <li>기타 회사가 정한 이용 기준에 부합하지 않는 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제5조 (서비스 이용)</h2>
            <ol className="space-y-2 list-decimal list-inside">
              <li>서비스는 <strong className="text-white">연중무휴 24시간</strong> 제공함을 원칙으로 합니다. 단, 시스템 점검·장애·천재지변 등의 사유로 일시 중단될 수 있으며 사전 공지합니다.</li>
              <li>무료 플랜은 AI 분석 횟수 등 일부 기능에 제한이 있을 수 있습니다.</li>
              <li>유료 플랜은 결제 완료 즉시 해당 기능이 활성화되며, 구독 기간 만료 시 무료 플랜으로 전환됩니다.</li>
              <li>회사는 서비스 개선을 위해 기능을 추가·변경·종료할 수 있으며, 중요 변경 사항은 사전에 공지합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제6조 (회원의 의무)</h2>
            <p className="mb-3">회원은 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>타인의 계정 정보 도용 또는 부정 사용</li>
              <li>서비스를 이용하여 불법 정보·음란물·허위 정보 유포</li>
              <li>회사 또는 제3자의 지식재산권 침해</li>
              <li>자동화 수단(봇, 크롤러 등)을 이용한 무단 데이터 수집</li>
              <li>서비스 운영을 방해하는 행위 또는 고의적 서버 부하 유발</li>
              <li>기타 관계 법령 및 본 약관에 위반되는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제7조 (유료 서비스 및 결제)</h2>
            <ol className="space-y-2 list-decimal list-inside">
              <li>유료 서비스 이용 요금은 서비스 내 요금제 페이지에 명시된 금액을 따릅니다.</li>
              <li>결제는 신용카드, 간편결제 등 회사가 지정한 수단으로 진행됩니다.</li>
              <li>구독형 요금제는 이용 기간 만료 전 자동 결제되며, 갱신 3일 전까지 해지 신청 시 다음 결제가 청구되지 않습니다.</li>
              <li>환불은 별도의 <Link href="/refund" className="text-green-400 hover:underline">환불 정책</Link>에 따릅니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제8조 (콘텐츠 및 지식재산권)</h2>
            <ol className="space-y-2 list-decimal list-inside">
              <li>회원이 서비스에 등록한 콘텐츠의 저작권은 해당 회원에게 귀속됩니다.</li>
              <li>회원은 자신의 콘텐츠를 서비스 내에서 사용·표시할 수 있도록 회사에 비독점적 라이선스를 부여합니다.</li>
              <li>서비스 자체 UI, 로고, 소프트웨어 등 회사가 제작한 모든 콘텐츠의 지식재산권은 회사에 귀속됩니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제9조 (AI 분석 서비스 면책)</h2>
            <ol className="space-y-2 list-decimal list-inside">
              <li>펫헬스의 AI 건강 분석 및 식품 분석 결과는 <strong className="text-white">참고용 정보</strong>이며, 수의학적 진단을 대체하지 않습니다.</li>
              <li>AI 분석 결과를 근거로 한 행동(투약, 식이 변경 등)에 대한 책임은 회원 본인에게 있습니다.</li>
              <li>반려동물의 건강 이상 징후 발견 시 반드시 전문 수의사와 상담하시기 바랍니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제10조 (서비스 이용 제한 및 계약 해지)</h2>
            <ol className="space-y-2 list-decimal list-inside">
              <li>회원은 언제든지 설정 메뉴를 통해 탈퇴할 수 있으며, 탈퇴 즉시 개인정보는 삭제됩니다(법령 보존 의무 항목 제외).</li>
              <li>회사는 회원이 제6조를 위반한 경우 사전 통보 없이 이용을 제한하거나 계약을 해지할 수 있습니다.</li>
              <li>이용 제한으로 인한 손해에 대해 회사는 책임을 지지 않습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제11조 (책임 제한)</h2>
            <ol className="space-y-2 list-decimal list-inside">
              <li>회사는 천재지변, 전쟁, 해킹 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
              <li>회원의 귀책사유로 인한 서비스 이용 장애에 대해 회사는 책임을 지지 않습니다.</li>
              <li>회사의 고의 또는 중대한 과실이 없는 한, 손해배상 범위는 해당 월 결제 금액을 초과하지 않습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제12조 (분쟁 해결)</h2>
            <ol className="space-y-2 list-decimal list-inside">
              <li>서비스 이용과 관련한 분쟁은 대한민국 법률을 적용합니다.</li>
              <li>분쟁 발생 시 먼저 이메일(<a href="mailto:fjkg33@gmail.com" className="text-green-400 hover:underline">fjkg33@gmail.com</a>)을 통해 협의를 시도합니다.</li>
              <li>협의가 이루어지지 않을 경우 회사 소재지를 관할하는 법원을 전속 관할 법원으로 합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제13조 (문의)</h2>
            <ul className="space-y-1">
              <li>상호명: 코어넥스트</li>
              <li>대표자: 조민성</li>
              <li>사업자등록번호: 297-66-00726</li>
              <li>전화: 010-2714-7196</li>
              <li>이메일: <a href="mailto:fjkg33@gmail.com" className="text-green-400 hover:underline">fjkg33@gmail.com</a></li>
            </ul>
          </section>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #1E3A2A' }}>
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs" style={{ color: '#3d6b4a' }}>
            &copy; 2026 펫헬스. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs" style={{ color: '#4a7c59' }}>
            <Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link>
            <Link href="/refund" className="hover:text-white transition-colors">환불 정책</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
