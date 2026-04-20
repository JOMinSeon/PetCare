'use client';

interface Message {
  id: string;
  sender_id: string;
  sender_role: 'user' | 'vet' | 'system';
  content: string;
  created_at: string;
}

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  showTime?: boolean;
}

export function ChatMessage({ message, isOwn, showTime = true }: ChatMessageProps) {
  const isSystem = message.sender_role === 'system';
  const isVet = message.sender_role === 'vet';

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours < 12 ? '오전' : '오후';
      const hour12 = hours % 12 || 12;
      return `${ampm} ${hour12}:${minutes}`;
    } catch {
      return '';
    }
  };

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div
          className="text-xs px-3 py-1 rounded-full"
          style={{
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text-muted)',
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex my-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
        style={
          isOwn
            ? {
                background: 'var(--color-primary-500)',
                color: '#fff',
                borderBottomRightRadius: 4,
              }
            : isVet
            ? {
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderBottomLeftRadius: 4,
              }
            : {
                background: 'var(--chat-ai-bg)',
                color: 'var(--chat-ai-text)',
                borderBottomLeftRadius: 4,
              }
        }
      >
        <p className="whitespace-pre-wrap break-words">
          {escapeHtml(message.content)}
        </p>
        {showTime && (
          <div
            className="text-[10px] mt-1 opacity-70"
            style={isOwn ? { color: '#fff' } : { color: 'var(--color-text-muted)' }}
          >
            {formatTime(message.created_at)}
          </div>
        )}
      </div>
    </div>
  );
}