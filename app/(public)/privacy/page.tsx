import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '펫헬스 개인정보처리방침입니다.',
};

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-3">개인정보처리방침</h1>
          <p className="text-sm text-gray-500">최종 업데이트: 2026년 3월 22일</p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-gray-600">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. 수집하는 개인정보 항목</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-gray-900">필수</strong>: 이메일 주소, 비밀번호(암호화 저장)</li>
              <li><strong className="text-gray-900">선택</strong>: 닉네임, 프로필 사진</li>
              <li><strong className="text-gray-900">자동 수집</strong>: 서비스 이용 기록, 접속 IP, 쿠키</li>
              <li><strong className="text-gray-900">반려동물 정보</strong>: 이름, 종, 나이, 체중, 건강 기록, 사진</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. 개인정보 수집 및 이용 목적</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>회원 가입 및 본인 확인</li>
              <li>AI 기반 반려동물 건강 분석 서비스 제공</li>
              <li>서비스 개선 및 신규 기능 개발</li>
              <li>고객 문의 응대 및 분쟁 처리</li>
              <li>서비스 관련 공지 및 안내 발송</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. 개인정보 보유 및 이용 기간</h2>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. 개인정보 제3자 제공</h2>
            <p>
              회사는 원칙적으로 회원의 개인정보를 제3자에게 제공하지 않습니다.
              다만, 법령에 의한 경우 또는 회원의 사전 동의가 있는 경우에는 예외로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. 개인정보 처리 위탁</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-gray-900">Supabase Inc.</strong>: 데이터베이스 및 인증 서비스 운영</li>
              <li><strong className="text-gray-900">Google LLC</strong>: AI 분석 서비스 제공</li>
              <li><strong className="text-gray-900">Vercel Inc.</strong>: 서비스 호스팅 및 배포</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. 이용자의 권리</h2>
            <p>회원은 언제든지 아래 권리를 행사할 수 있습니다.</p>
            <ul className="space-y-2 list-disc list-inside mt-3">
              <li>개인정보 열람 요청</li>
              <li>개인정보 수정·삭제 요청</li>
              <li>개인정보 처리 정지 요청</li>
              <li>회원 탈퇴 및 동의 철회</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. 쿠키 사용</h2>
            <p>
              서비스는 로그인 유지 및 사용자 경험 개선을 위해 쿠키를 사용합니다.
              브라우저 설정에서 쿠키 사용을 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. 개인정보 보호 책임자</h2>
            <ul className="space-y-1">
              <li>책임자: 조민성</li>
              <li>이메일: <a href="mailto:fjkg33@gmail.com" className="text-orange-500 hover:underline">fjkg33@gmail.com</a></li>
              <li>전화: 010-2714-7196</li>
            </ul>
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
            <Link href="/refund" className="hover:text-orange-500 transition-colors">환불 정책</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}