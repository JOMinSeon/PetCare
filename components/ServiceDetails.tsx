import { HeartPulse, Zap, Stethoscope, Calendar, Shield, Sparkles, CheckCircle } from 'lucide-react';

interface ServiceDetail {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  features: string[];
  color: string;
}

const services: ServiceDetail[] = [
  {
    icon: HeartPulse,
    title: 'AI 건강 분석',
    subtitle: '스마트한 건강 모니터링',
    features: [
      '매일 아침 건강 상태 자동 체크',
      '평균/최대/최소 값 히스토리 추적',
      '이상 징후 조기 감지 알림',
      '반려동물별 맞춤 건강 지표 설정',
    ],
    color: 'var(--color-secondary-500)',
  },
  {
    icon: Zap,
    title: '실시간 모니터링',
    subtitle: '눈으로 확인하는 건강',
    features: [
      '체중, 칼로리, 활동량 실시간 추적',
      '목표 달성률 직관적 차트',
      '주간/월간 건강 리포트',
      '여러 반려동물 통합 관리',
    ],
    color: 'var(--color-accent-500)',
  },
  {
    icon: Stethoscope,
    title: 'AI 수의사 상담',
    subtitle: '24시간 전문가 도움',
    features: [
      '증상 기반 즉시 상담',
      '응급 상황 판단 가이드',
      '최근 진료 이력 참고',
      '병명/처방 정보 조회',
    ],
    color: 'var(--color-info)',
  },
  {
    icon: Calendar,
    title: '스마트 일정',
    subtitle: '놓치지 않는 관리',
    features: [
      '예방접종 자동 알림',
      '정기검진 리마인더',
      '약물 복용 시간 알림',
      '병원 예약 관리',
    ],
    color: 'var(--color-primary-500)',
  },
  {
    icon: Shield,
    title: '건강 기록',
    subtitle: '안전한 데이터 보관',
    features: [
      '진료 기록 자동 저장',
      '검사 결과 PDF 관리',
      '의료 증거서류 보관',
      '병원 공유용 데이터 내보내기',
    ],
    color: 'var(--color-danger)',
  },
  {
    icon: Sparkles,
    title: '사료 분석',
    subtitle: '지능형 영양 관리',
    features: [
      '사료 라벨 사진 분석',
      '성분별 영양 균형 평가',
      '급여량 맞춤 추천',
      '알레르기 성분 체크',
    ],
    color: 'var(--color-secondary-400)',
  },
];

interface ServiceDetailCardProps {
  service: ServiceDetail;
  index: number;
}

function ServiceDetailCard({ service, index }: ServiceDetailCardProps) {
  const Icon = service.icon;

  return (
    <div
      className="rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl shrink-0"
          style={{ background: `${service.color}15` }}
        >
          <Icon size={24} style={{ color: service.color }} />
        </div>
        <div>
          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            {service.title}
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {service.subtitle}
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {service.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <CheckCircle size={16} className="shrink-0 mt-0.5" style={{ color: service.color }} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ServiceDetails() {
  return (
    <section className="py-24 sm:py-32" style={{ background: 'var(--color-surface-2)' }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="section-badge mb-4">서비스 상세</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            고민할 수 있는 기능
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            반려동물 건강을 위한 모든 것이 하나의 앱에
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceDetailCard key={service.title} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
