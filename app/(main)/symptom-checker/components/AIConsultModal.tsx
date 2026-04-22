'use client';

import { X, Send, AlertTriangle, Sparkles } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { symptoms } from '../lib/symptoms-data';

interface AIConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSymptomIds: string[];
  animalType: 'dog' | 'cat';
}

const animalName = { dog: '강아지', cat: '고양이' };

export default function AIConsultModal({
  isOpen,
  onClose,
  selectedSymptomIds,
  animalType,
}: AIConsultModalProps) {
  const [input, setInput] = useState('');
  const [initSent, setInitSent] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const symptomNames = (selectedSymptomIds
    .map((id) => symptoms.find((s) => s.id === id)?.name)
    .filter(Boolean)) as string[];

  const initMessage = `반려동물: ${animalName[animalType]}\n증상: ${symptomNames.join(', ')}`;

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai-chat',
      body: {
        petId: 'symptom-consult',
        initContext: initMessage,
      },
    }),
  });

  useEffect(() => {
    if (isOpen && !initSent && initMessage) {
      const timer = setTimeout(() => {
        sendMessage({ text: initMessage });
        setInitSent(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initSent, initMessage, sendMessage]);

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

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-lg h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 px-6 py-4 border-b bg-orange-50">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">AI 상담</h2>
            <p className="text-xs text-gray-500">{animalName[animalType]} · 증상 상담</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 text-xs bg-amber-50 border-b" style={{ color: '#b45309' }}>
          <AlertTriangle size={12} />
          <span>AI 답변은 참고용이며 수의사 상담을 권장합니다</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">증상에 대해 질문해보세요</p>
            </div>
          )}

          {messages.map((m) => {
            const isAI = m.role === 'assistant';
            return (
              <div key={m.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                <div
                  className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                  style={
                    isAI
                      ? { background: '#f3f4f6', color: '#1f2937', borderBottomLeftRadius: 4 }
                      : { background: '#2d6a4f', color: '#fff', borderBottomRightRadius: 4 }
                  }
                >
                  {m.parts.map((part, i) =>
                    part.type === 'text' ? (
                      <span key={i}>
                        {part.text.split('\n').map((line, j, arr) => (
                          <span key={j}>
                            {line}
                            {j < arr.length - 1 && <br />}
                          </span>
                        ))}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div
                className="flex items-center gap-1 rounded-2xl px-4 py-3 bg-gray-100"
                style={{ borderBottomLeftRadius: 4 }}
                aria-label="AI 분석 중"
              >
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex gap-2 px-4 py-3 border-t"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="질문을 입력하세요"
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500"
            style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg transition-opacity disabled:opacity-40"
            style={{ background: '#2d6a4f', color: '#fff' }}
            aria-label="전송"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}