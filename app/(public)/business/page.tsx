import Link from 'next/link';
import { ArrowLeft, Building2, Phone, Mail, FileText, MapPin, Globe } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '사업자 정보',
  description: '펫헬스 사업자 정보입니다.',
};

const INFO = [
  { icon: Building2, label: '상호명 (업체명)',        value: '코어넥스트' },
  { icon: FileText,  label: '대표자 성명',            value: '조민성' },
  { icon: MapPin,    label: '사업장 주소',            value: '경기도 시흥시 마유로423번길 20-7' },
  { icon: FileText,  label: '사업자등록번호',          value: '297-66-00726' },
  { icon: FileText,  label: '통신판매업 신고번호',     value: '신청 중' },
  { icon: Phone,     label: '고객센터 전화',          value: '0507-1305-7196' },
  { icon: Mail,      label: '고객센터 이메일',        value: 'help@petcare.pe.kr' },
  { icon: Globe,     label: '서비스명',               value: 'PetCare' },
  { icon: FileText,  label: '개인정보보호책임자',      value: '조민성' },
];

export default function BusinessPage() {
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

      <main className="mx-auto max-w-2xl px-6 py-16 lg:px-8">

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">사업자 정보</h1>
          <p className="text-sm text-gray-500">
            전자상거래 등에서의 소비자보호에 관한 법률에 따른 사업자 정보 공개
          </p>
        </div>

        <div
          className="rounded-2xl overflow-hidden border border-gray-200"
        >
          {INFO.map(({ icon: Icon, label, value }, i) => (
            <div
              key={label}
              className="flex items-center gap-4 px-6 py-4"
              style={{
                background: i % 2 === 0 ? '#FAFAFA' : 'white',
                borderBottom: i < INFO.length - 1 ? '1px solid #F0F0F0' : 'none',
              }}
            >
              <Icon size={16} className="text-orange-500 flex-shrink-0" />
              <span className="w-36 text-sm font-medium text-gray-500 shrink-0">
                {label}
              </span>
              <span className="text-sm text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        <div
          className="mt-8 rounded-xl px-5 py-4 text-xs leading-relaxed bg-orange-50 border border-orange-100 text-gray-600"
        >
          본 서비스(PetCare)는 코어넥스트가 운영하며, 소비자 분쟁 발생 시 위 연락처로 문의하시기 바랍니다.
          분쟁 해결이 되지 않을 경우 한국소비자원(www.kca.go.kr) 또는 공정거래위원회(www.ftc.go.kr)에
          분쟁조정을 신청할 수 있습니다.
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
            <Link href="/refund" className="hover:text-orange-500 transition-colors">환불 정책</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}