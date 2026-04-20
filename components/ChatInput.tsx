'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  consultationId: string;
  onSend?: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ consultationId, onSend, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending || disabled) return;

    const content = input.trim();
    setInput('');
    setIsSending(true);

    try {
      if (onSend) {
        onSend(content);
      } else {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consultation_id: consultationId, content }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || '메시지 전송에 실패했습니다.');
        }
      }
    } catch (err) {
      console.error('[ChatInput] Send error:', err);
      setInput(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 px-4 py-3 border-t"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요..."
        disabled={isSending || disabled}
        maxLength={1000}
        rows={1}
        className="flex-1 resize-none rounded-lg border px-3 py-2.5 text-base outline-none transition-colors"
        style={{
          background: 'var(--color-bg)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)',
          maxHeight: '120px',
        }}
      />
      <button
        type="submit"
        disabled={isSending || !input.trim() || disabled}
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg transition-all disabled:opacity-40"
        style={{
          background: 'var(--color-primary-500)',
          color: '#fff',
        }}
        aria-label="전송"
      >
        <Send size={18} />
      </button>
    </form>
  );
}