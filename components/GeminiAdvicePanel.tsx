'use client';
import { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Send, AlertTriangle, Sparkles } from 'lucide-react';

export function GeminiAdvicePanel({ petId }: { petId: string }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { petContext: { petId } },
    }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div
      className="rounded-xl border flex flex-col"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        minHeight: '480px',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <Sparkles size={18} style={{ color: 'var(--color-info)' }} />
        <h2 className="font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>
          AI 건강 상담
        </h2>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ maxHeight: '320px' }}
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
            반려동물의 건강에 대해 무엇이든 물어보세요 🐾
          </p>
        )}

        {messages.map((m) => {
          const isAI = m.role === 'assistant';
          return (
            <div key={m.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
              <div
                className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={
                  isAI
                    ? {
                        background: '#eff6ff',
                        color: '#1e40af',
                        borderBottomLeftRadius: 4,
                      }
                    : {
                        background: 'var(--color-primary-500)',
                        color: '#fff',
                        borderBottomRightRadius: 4,
                      }
                }
              >
                {m.parts.map((part, i) =>
                  part.type === 'text' ? <span key={i}>{part.text}</span> : null
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div
              className="flex items-center gap-1 rounded-2xl px-4 py-3"
              style={{ background: '#eff6ff', borderBottomLeftRadius: 4 }}
              aria-label="AI 분석 중"
            >
              <span className="typing-dot h-2 w-2 rounded-full" style={{ background: '#3b82f6' }} />
              <span className="typing-dot h-2 w-2 rounded-full" style={{ background: '#3b82f6' }} />
              <span className="typing-dot h-2 w-2 rounded-full" style={{ background: '#3b82f6' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Disclaimer — always visible */}
      <div
        className="flex items-center gap-2 px-4 py-2 text-xs border-t"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-warning)' }}
      >
        <AlertTriangle size={12} aria-hidden />
        <span>AI 답변은 참고용이며 수의사 상담을 권장합니다</span>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 px-4 py-3 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="질문을 입력하세요"
          disabled={isLoading}
          className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
          style={{
            background: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-opacity disabled:opacity-40"
          style={{ background: 'var(--color-info)', color: '#fff' }}
          aria-label="전송"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
