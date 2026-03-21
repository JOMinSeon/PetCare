import Link from 'next/link';
import { PawPrint, Building2, Phone, Mail, FileText, MapPin, Globe } from 'lucide-react';

const INFO = [
  { icon: Building2, label: '상호명 (업체명)',        value: '코어넥스트' },
  { icon: FileText,  label: '대표자 성명',            value: '조민성' },
  { icon: MapPin,    label: '사업장 주소',            value: '(주소 기재 예정)' },
  { icon: FileText,  label: '사업자등록번호',          value: '297-66-00726' },
  { icon: FileText,  label: '통신판매업 신고번호',     value: '신청 중' },
  { icon: Phone,     label: '고객센터 전화',          value: '010-2714-7196' },
  { icon: Mail,      label: '고객센터 이메일',        value: 'fjkg33@gmail.com' },
  { icon: Globe,     label: '서비스명',               value: '펫헬스 (pethealth.com)' },
  { icon: FileText,  label: '개인정보보호책임자',      value: '조민성' },
];

export default function BusinessPage() {
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
      <main className="mx-auto max-w-2xl px-6 py-16 lg:px-8">

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">사업자 정보</h1>
          <p className="text-sm" style={{ color: '#4a7c59' }}>
            전자상거래 등에서의 소비자보호에 관한 법률에 따른 사업자 정보 공개
          </p>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid #1E3A2A' }}
        >
          {INFO.map(({ icon: Icon, label, value }, i) => (
            <div
              key={label}
              className="flex items-center gap-4 px-6 py-4"
              style={{
                background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                borderBottom: i < INFO.length - 1 ? '1px solid #1E3A2A' : 'none',
              }}
            >
              <Icon size={16} style={{ color: '#52B788', flexShrink: 0 }} />
              <span className="w-36 text-sm font-medium shrink-0" style={{ color: '#4a7c59' }}>
                {label}
              </span>
              <span className="text-sm text-white">{value}</span>
            </div>
          ))}
        </div>

        <div
          className="mt-8 rounded-xl px-5 py-4 text-xs leading-relaxed"
          style={{ background: 'rgba(45,106,79,0.1)', border: '1px solid #1E3A2A', color: '#4a7c59' }}
        >
          본 서비스(펫헬스)는 코어넥스트가 운영하며, 소비자 분쟁 발생 시 위 연락처로 문의하시기 바랍니다.
          분쟁 해결이 되지 않을 경우 한국소비자원(www.kca.go.kr) 또는 공정거래위원회(www.ftc.go.kr)에
          분쟁조정을 신청할 수 있습니다.
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #1E3A2A' }}>
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs" style={{ color: '#3d6b4a' }}>
            &copy; 2026 펫헬스. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs" style={{ color: '#4a7c59' }}>
            <Link href="/terms" className="hover:text-white transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link>
            <Link href="/refund" className="hover:text-white transition-colors">환불 정책</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
