import Link from 'next/link';
import { HeartPulse, Calendar, Stethoscope } from 'lucide-react';
import LoginForm from './LoginForm';

const features = [
  { icon: HeartPulse, label: 'AI 기반 건강 분석으로 조기 발견' },
  { icon: Calendar, label: '24/7 실시간 건강 모니터링' },
  { icon: Stethoscope, label: '전문 수의사 온라인 상담' },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Marketing Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-indigo-600 p-12 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 -z-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 80%, #a78bfa 0%, transparent 50%), radial-gradient(circle at 80% 20%, #818cf8 0%, transparent 50%)',
          }}
        />
        <Link href="/" className="relative text-2xl font-bold tracking-tight">
          펫헬스
        </Link>
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold leading-tight">
              반려동물의 건강을<br />지키세요
            </h2>
            <p className="mt-4 text-indigo-200 text-lg">
              AI 기반 건강 분석과 실시간 모니터링으로 당신의 소중한 반려동물을 더 오래 함께하세요.
            </p>
          </div>
          <ul className="space-y-4">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-indigo-100">{label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative border-t border-indigo-500 pt-8">
          <p className="text-indigo-100 italic">
            &ldquo;AI 건강 분석 덕분에 조기에 심장 문제를 발견했어요. 정말 감사합니다!&rdquo;
          </p>
          <p className="mt-2 text-sm text-indigo-300">— 김지은, 골든 리트리버 맥스 보호자</p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex items-center justify-center bg-gray-50 px-6 py-12">
        <LoginForm />
      </div>
    </div>
  );
}
