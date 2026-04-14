import { Phone, MessageCircle } from 'lucide-react';

interface ContactCTAProps {
  phone?: string;
  kakaoUrl?: string;
  compact?: boolean;
}

export function ContactCTA({
  phone = '0507-1305-7196',
  kakaoUrl = 'http://pf.kakao.com/_xlpqxlxb',
  compact = false
}: ContactCTAProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <a
          href={`tel:${phone.replace(/-/g, '')}`}
          className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ color: 'var(--color-secondary-600)' }}
        >
          <Phone size={14} />
          <span>{phone}</span>
        </a>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-8 text-center"
      style={{
        background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-surface) 100%)',
        border: '1px solid var(--color-border)',
      }}
    >
      <h3
        className="text-2xl font-bold mb-4"
        style={{ color: 'var(--color-text-primary)' }}
      >
        반려동물 고민이 있으신가요?
      </h3>
      <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        전문 수의사팀이 친절하게 상담해드립니다
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href={`tel:${phone.replace(/-/g, '')}`}
          className="btn-primary inline-flex items-center justify-center gap-2"
        >
          <Phone size={18} />
          전화 상담
        </a>
        <a
          href={kakaoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-3 transition-all hover:scale-105"
          style={{
            background: '#FFE812',
            color: '#1A1A1A',
            border: '1px solid #E5E500',
          }}
        >
          <MessageCircle size={18} />
          카카오톡 상담
        </a>
      </div>
    </div>
  );
}
