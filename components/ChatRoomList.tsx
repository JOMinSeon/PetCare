'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

interface Vet {
  id: string;
  name: string;
  avatar_url: string | null;
  specialty: string | null;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
}

interface LastMessage {
  content: string;
  created_at: string;
  sender_role: string;
}

interface Consultation {
  id: string;
  status: string;
  scheduled_at: string;
  chief_complaint: string | null;
  vet: Vet | null;
  pet: Pet | null;
  lastMessage: LastMessage | null;
  unreadCount: number;
}

interface ChatRoomListProps {
  consultations: Consultation[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: '대기중', color: 'var(--color-warning)' },
  confirmed: { label: '확정', color: 'var(--color-info)' },
  chat: { label: '진행중', color: 'var(--color-success)' },
  completed: { label: '완료', color: 'var(--color-text-muted)' },
};

const speciesEmoji: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  bird: '🐦',
  etc: '🐾',
};

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export function ChatRoomList({ consultations }: ChatRoomListProps) {
  if (consultations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageCircle size={48} style={{ color: 'var(--color-text-muted)' }} className="mb-3 opacity-50" />
        <p className="text-base" style={{ color: 'var(--color-text-muted)' }}>
          아직 상담 채팅방이 없습니다
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          병원에서 상담을 예약하면 채팅을 시작할 수 있어요
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
      {consultations.map((consultation) => {
        const status = statusLabels[consultation.status] || statusLabels.pending;
        const emoji = consultation.pet
          ? speciesEmoji[consultation.pet.species] || speciesEmoji.etc
          : speciesEmoji.etc;

        return (
          <Link
            key={consultation.id}
            href={`/chat/${consultation.id}`}
            className="flex items-center gap-3 p-4 transition-colors hover:bg-[var(--color-primary-50)]"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-xl"
              style={{ background: 'var(--color-primary-100)' }}
            >
              {consultation.vet?.avatar_url ? (
                <img
                  src={consultation.vet.avatar_url}
                  alt={consultation.vet.name || '수의사'}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                emoji
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {consultation.vet?.name || '알 수 없는 수의사'}
                </h3>
                {consultation.lastMessage && (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {formatRelativeTime(consultation.lastMessage.created_at)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: status.color + '20', color: status.color }}>
                  {status.label}
                </span>
                {consultation.pet && (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {consultation.pet.name}
                  </span>
                )}
              </div>

              {consultation.lastMessage && (
                <p
                  className="text-xs truncate"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {consultation.lastMessage.sender_role === 'user' ? '나: ' : ''}
                  {consultation.lastMessage.content}
                </p>
              )}

              {consultation.chief_complaint && !consultation.lastMessage && (
                <p
                  className="text-xs truncate"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {consultation.chief_complaint}
                </p>
              )}
            </div>

            {consultation.unreadCount > 0 && (
              <div
                className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white"
                style={{ background: 'var(--color-primary-500)' }}
              >
                {consultation.unreadCount > 99 ? '99+' : consultation.unreadCount}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}