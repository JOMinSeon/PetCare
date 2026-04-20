'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { getBrowserDb } from '@/lib/supabase-browser';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { VetOnlineStatus } from '@/components/VetOnlineStatus';

interface Message {
  id: string;
  consultation_id: string;
  sender_id: string;
  sender_role: 'user' | 'vet' | 'system';
  content: string;
  attachment_url: string | null;
  created_at: string;
}

interface ConsultationDetails {
  id: string;
  status: string;
  scheduled_at: string;
  chief_complaint: string | null;
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
}

interface RealtimePayload {
  new: Message;
}

const speciesEmoji: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  bird: '🐦',
  etc: '🐾',
};

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const consultationId = params.consultationId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const db = getBrowserDb();
    db.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${consultationId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '메시지를 불러오는데 실패했습니다.');
      }
      const result = await res.json();
      setMessages(result.messages || []);
      setConsultation(result.consultation);
    } catch (err) {
      console.error('[ChatRoom] Error:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [consultationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const db = getBrowserDb();
    const channel = db
      .channel(`chat:${consultationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'consultation_messages',
          filter: `consultation_id=eq.${consultationId}`,
        },
        (payload: RealtimePayload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, [consultationId]);

  const handleSend = (content: string) => {
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      consultation_id: consultationId,
      sender_id: currentUserId || '',
      sender_role: 'user',
      content,
      attachment_url: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    fetchMessages();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div
          className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-primary-500)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] px-4">
        <p className="text-center mb-4" style={{ color: 'var(--color-error)' }}>
          {error || '채팅방을 찾을 수 없습니다.'}
        </p>
        <Link
          href="/chat"
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--color-primary-500)', color: '#fff' }}
        >
          채팅방 목록으로
        </Link>
      </div>
    );
  }

  const emoji = consultation.pet
    ? speciesEmoji[consultation.pet.species] || speciesEmoji.etc
    : speciesEmoji.etc;

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: '대기중', color: 'var(--color-warning)' },
    confirmed: { label: '확정', color: 'var(--color-info)' },
    chat: { label: '진행중', color: 'var(--color-success)' },
    completed: { label: '완료', color: 'var(--color-text-muted)' },
  };
  const status = statusLabels[consultation.status] || statusLabels.pending;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <header
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/chat')}
            className="p-2 rounded-full transition-colors hover:bg-[var(--color-bg-secondary)]"
            style={{ color: 'var(--color-text-primary)' }}
            aria-label="뒤로 가기"
          >
            <ArrowLeft size={20} />
          </button>

          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
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

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {consultation.vet?.name || '알 수 없는 수의사'}
              </h2>
              {consultation.vet && <VetOnlineStatus vetId={consultation.vet.id} size="sm" />}
            </div>
            <div className="flex items-center gap-2">
              {consultation.pet && (
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {consultation.pet.name}
                </span>
              )}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: status.color + '20', color: status.color }}
              >
                {status.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-full transition-colors hover:bg-[var(--color-bg-secondary)]"
            style={{ color: 'var(--color-text-primary)' }}
            aria-label="전화"
          >
            <Phone size={18} />
          </button>
          <button
            className="p-2 rounded-full transition-colors hover:bg-[var(--color-bg-secondary)]"
            style={{ color: 'var(--color-text-primary)' }}
            aria-label="영상통화"
          >
            <Video size={18} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full transition-colors hover:bg-[var(--color-bg-secondary)]"
              style={{ color: 'var(--color-text-primary)' }}
              aria-label="메뉴"
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div
                className="absolute right-0 top-full mt-1 py-1 rounded-lg border shadow-lg z-10 min-w-[140px]"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                {consultation.status !== 'completed' && (
                  <button
                    onClick={async () => {
                      setShowMenu(false);
                      try {
                        await fetch('/api/chat', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ consultation_id: consultationId, status: 'completed' }),
                        });
                        router.push('/chat');
                      } catch (err) {
                        console.error('[ChatRoom] Complete error:', err);
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-bg-secondary)]"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    상담 종료
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {consultation.chief_complaint && (
        <div
          className="px-4 py-2 text-sm border-b"
          style={{
            background: 'var(--color-bg-secondary)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span className="font-medium">상담 목적: </span>
          {consultation.chief_complaint}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              아직 메시지가 없습니다
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              첫 메시지를 보내보세요!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwn={message.sender_id === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {consultation.status !== 'completed' && (
        <div style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <ChatInput consultationId={consultationId} onSend={handleSend} />
        </div>
      )}

      {consultation.status === 'completed' && (
        <div
          className="px-4 py-3 text-center text-sm"
          style={{
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text-muted)',
          }}
        >
          상담이 종료된 채팅방입니다
        </div>
      )}
    </div>
  );
}