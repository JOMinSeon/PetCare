'use client';

import { useEffect, useState } from 'react';
import { getBrowserDb } from '@/lib/supabase-browser';
import { ChatRoomList } from '@/components/ChatRoomList';
import { MessageCircle } from 'lucide-react';

interface Consultation {
  id: string;
  status: string;
  scheduled_at: string;
  chief_complaint: string | null;
  updated_at: string;
  vet: {
    id: string;
    name: string;
    avatar_url: string | null;
    specialty: string | null;
  } | null;
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
  } | null;
  lastMessage: {
    content: string;
    created_at: string;
    sender_role: string;
  } | null;
  unreadCount: number;
}

export default function ChatListPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const db = getBrowserDb();
        const { data: { user } } = await db.auth.getUser();

        if (!user) {
          setError('로그인이 필요합니다.');
          setIsLoading(false);
          return;
        }

        const res = await fetch('/api/chat');
        if (!res.ok) {
          throw new Error('채팅방 목록을 불러오는데 실패했습니다.');
        }

        const data = await res.json();
        setConsultations(data.consultations || []);
      } catch (err) {
        console.error('[ChatList] Error:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary-500)', borderTopColor: 'transparent' }}
          />
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            채팅방 목록을 불러오는 중...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="text-center mb-4" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle size={24} style={{ color: 'var(--color-primary-500)' }} />
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          상담 채팅
        </h1>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <ChatRoomList consultations={consultations} />
      </div>
    </div>
  );
}