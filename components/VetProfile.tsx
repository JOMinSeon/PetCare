'use client';

import { Star, Award, MessageCircle, Clock, MapPin } from 'lucide-react';
import { VetOnlineStatus } from './VetOnlineStatus';

interface VetProfileProps {
  vet: {
    id: string;
    name: string;
    avatar_url: string | null;
    specialty: string | null;
    hospital_name?: string;
    years_experience?: number;
    rating?: number;
    review_count?: number;
  };
  isOnline?: boolean;
  onStartChat?: () => void;
  onClose?: () => void;
}

export function VetProfileMockup({
  vet,
  isOnline = false,
  onStartChat,
  onClose,
}: VetProfileProps) {
  const mockData = {
    bio: '20년 이상 반려동물 진료 경력을 보유한 수의사입니다. 특히犬猫的专业 질환 진단 및 치료에 전문化了多年的临床经验，擅长小动物内科和外科。',
    education: '서울대학교 수의과대학 졸업',
    certifications: ['수의内科전문의', '수의 imaging专科医生'],
    languages: ['한국어', 'English'],
    consultationFee: 30000,
  };

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div
        className="h-24 relative"
        style={{ background: 'linear-gradient(135deg, var(--color-primary-400), var(--color-secondary-500))' }}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/30 transition-colors"
            aria-label="닫기"
          >
            ✕
          </button>
        )}
      </div>

      <div className="px-5 pb-5">
        <div className="flex items-end -mt-10 mb-3">
          <div
            className="w-20 h-20 rounded-full border-4 overflow-hidden"
            style={{ borderColor: 'var(--color-surface)', background: 'var(--color-bg-secondary)' }}
          >
            {vet.avatar_url ? (
              <img src={vet.avatar_url} alt={vet.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                🐾
              </div>
            )}
          </div>
          <div className="ml-3 mb-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {vet.name}
              </h2>
              <VetOnlineStatus vetId={vet.id} size="sm" />
            </div>
            {vet.specialty && (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {vet.specialty}
              </p>
            )}
          </div>
        </div>

        {vet.hospital_name && (
          <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            <MapPin size={12} />
            {vet.hospital_name}
          </div>
        )}

        <div className="flex items-center gap-4 mb-4">
          {vet.rating && (
            <div className="flex items-center gap-1">
              <Star size={14} style={{ color: 'var(--color-warning)' }} fill="var(--color-warning)" />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {vet.rating.toFixed(1)}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                ({vet.review_count || 0}件のレビュー)
              </span>
            </div>
          )}
          {vet.years_experience && (
            <div className="flex items-center gap-1">
              <Award size={14} style={{ color: 'var(--color-primary-500)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {vet.years_experience}年経験
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              自己紹介
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {mockData.bio}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              学歴・資格
            </h3>
            <div className="space-y-1">
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                🎓 {mockData.education}
              </p>
              {mockData.certifications.map((cert, i) => (
                <p key={i} className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  📜 {cert}
                </p>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              対応言語
            </h3>
            <div className="flex gap-2">
              {mockData.languages.map((lang) => (
                <span
                  key={lang}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                診察料金
              </span>
              <p className="text-lg font-bold" style={{ color: 'var(--color-primary-500)' }}>
                ₩{mockData.consultationFee.toLocaleString()}~
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <Clock size={12} />
              約15分
            </div>
          </div>
        </div>

        {onStartChat && (
          <button
            onClick={onStartChat}
            className="w-full mt-4 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: 'var(--color-primary-500)' }}
          >
            <MessageCircle size={16} />
            チャットで相談する
          </button>
        )}
      </div>
    </div>
  );
}

export function VetProfileSkeleton() {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="h-24 animate-pulse" style={{ background: 'var(--color-bg-secondary)' }} />
      <div className="px-5 pb-5">
        <div className="flex items-end -mt-10 mb-3">
          <div
            className="w-20 h-20 rounded-full border-4 animate-pulse"
            style={{ borderColor: 'var(--color-surface)', background: 'var(--color-bg-secondary)' }}
          />
          <div className="ml-3 mb-1">
            <div className="h-5 w-24 rounded animate-pulse mb-1" style={{ background: 'var(--color-bg-secondary)' }} />
            <div className="h-3 w-16 rounded animate-pulse" style={{ background: 'var(--color-bg-secondary)' }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded animate-pulse" style={{ background: 'var(--color-bg-secondary)' }} />
          <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: 'var(--color-bg-secondary)' }} />
        </div>
      </div>
    </div>
  );
}