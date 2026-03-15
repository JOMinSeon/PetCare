기술 스택의 진화 (Next.js 16+ & React 19)
1인 개발자에게 가장 중요한 것은 '도구의 통합'과 '코드 양의 최소화'입니다. 아래 스택은 이 원칙을 최대한 반영하여 선정되었습니다.

구분
최신 스택
도입 이유 및 1인 기업의 이점
Framework
Next.js 16 (Stable)
React Compiler 적용으로 useMemo, useCallback 없이도 최적 성능 보장
Data Fetching
Server Components
API 레이어 없이 서버에서 직접 DB(Supabase) 호출, 보안 및 속도 향상
Mutations
Server Actions
클라이언트-서버 통신 로직을 함수 하나로 해결 (Zustand 필요성 감소)
Rendering
PPR (Partial Prerendering)
정적 콘텐츠는 즉시 노출, 동적 데이터(건강 지표)는 스트리밍으로 전송
AI Integration
Vercel AI SDK + Gemini
Gemini 1.5 Pro API를 스트리밍 방식으로 연결하여 대화형 상담 기능 구현
AI 모델
Gemini 1.5 Pro / Flash
멀티모달(텍스트+이미지) 지원으로 사료 사진 분석, 건강 이상 징후 감지 가능
패키지 관리
pnpm + Turbopack
빠른 빌드 속도와 의존성 관리 최적화, 개발 생산성 극대화
배포
Vercel Edge Runtime
서버리스 + 엣지 함수로 글로벌 저지연 서비스 제공

주요 코드 구조 (Next.js 16 기준)
3-1. 반려동물 상세 페이지 (Server Component)
Next.js 15부터 params, searchParams가 Promise 타입으로 변경되었습니다.

// app/pets/[id]/page.tsx
import { db } from '@/lib/supabase';
 
export default async function PetDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // Next.js 15: await 필수
  const { data: pet } = await db
    .from('pets')
    .select('*, health_logs(*)')
    .eq('id', id)
    .single();
 
  return (
    <div>
      <h1>{pet.name}의 건강 대시보드</h1>
      <HealthChart data={pet.health_logs} />
      <GeminiAdvicePanel petId={id} />  {/* AI 상담 패널 */}
    </div>
  );
}

3-2. 건강 기록 저장 (Server Action)
// app/actions/health.ts
'use server'
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/supabase';
 
export async function saveHealthLog(formData: FormData) {
  const weight = Number(formData.get('weight'));
  const petId = formData.get('petId') as string;
 
  // RER/MER 계산 로직 (서버에서만 실행 → 보안 우수)
  const rer = 70 * Math.pow(weight, 0.75);
  const mer = rer * 1.6; // 평균 활동 계수
 
  await db.from('health_logs').insert({
    pet_id: petId, weight, rer, mer,
    recorded_at: new Date().toISOString(),
  });
 
  revalidatePath(`/pets/${petId}`);  // 캐시 즉시 갱신
}

3-3. Gemini AI 스트리밍 채팅 구현 (핵심 신규 추가)
Vercel AI SDK의 useChat 훅과 Gemini 1.5 Pro를 연동하여 스트리밍 응답을 구현합니다.

// app/api/chat/route.ts  (Route Handler)
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
 
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});
 
export async function POST(req: Request) {
  const { messages, petContext } = await req.json();
 
  const result = streamText({
    model: google('gemini-1.5-pro'),
    system: `당신은 반려동물 건강 전문가입니다.
      현재 반려동물 정보: ${JSON.stringify(petContext)}
      항상 수의사 상담을 권고하며, 근거 기반 조언을 제공하세요.`,
    messages,
  });
 
  return result.toDataStreamResponse();
}

// components/GeminiAdvicePanel.tsx  (Client Component)
'use client'
import { useChat } from 'ai/react';
 
export function GeminiAdvicePanel({ petId }: { petId: string }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ api: '/api/chat', body: { petContext: { petId } } });
 
  return (
    <div className='rounded-2xl border p-4'>
      <div className='space-y-2'>
        {messages.map(m => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span className='inline-block rounded-lg px-3 py-1 bg-blue-50'>
              {m.content}
            </span>
          </div>
        ))}
        {isLoading && <span>AI 분석 중...</span>}
      </div>
      <form onSubmit={handleSubmit} className='mt-4 flex gap-2'>
        <input value={input} onChange={handleInputChange}
          placeholder='반려동물 건강 질문을 입력하세요' />
        <button type='submit'>전송</button>
      </form>
    </div>
  );
}

3-4. Gemini 멀티모달 (사료 사진 분석)
Gemini 1.5 Pro의 멀티모달 기능을 활용하여 사료 성분 사진을 분석합니다. 기존 기획서에 구체적 구현 코드가 없어 추가합니다.

// app/api/analyze-food/route.ts
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
 
export async function POST(req: Request) {
  const formData = await req.formData();
  const image = formData.get('image') as File;
  const petInfo = JSON.parse(formData.get('petInfo') as string);
 
  const imageBytes = await image.arrayBuffer();
  const base64 = Buffer.from(imageBytes).toString('base64');
 
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY
  });
 
  const { text } = await generateText({
    model: google('gemini-1.5-pro'),
    messages: [{
      role: 'user',
      content: [
        { type: 'image', image: base64, mimeType: image.type },
        { type: 'text', text: `이 사료가 ${petInfo.species}(${petInfo.age}세,
          ${petInfo.weight}kg)에게 적합한지 분석해주세요.` }
      ]
    }]
  });
 
  return Response.json({ analysis: text });

주요 서비스 기능 (Core Features)
기능명
기획 의도 및 가치
기술적 구현 포인트
AI 사료 성분 분석기
사료 뒷면 사진 한 장으로 우리 아이 체중/나이 대비 적합도 분석.
Gemini 1.5 Pro 멀티모달 분석
스마트 대시보드
체중 변화 및 활동 성취율 시각화로 건강 이상 징후 조기 발견.
Recharts 및 PPR 기반 고속 렌더링
RER/MER 자동 계산
수의학 공식을 기반으로 개별 맞춤 권장 칼로리 제안.
Server Actions 내 보안 로직 처리
24/7 AI 건강 상담
밤늦은 시간 갑작스러운 증상에 대해 근거 기반 조언 제공(수의사 상담 권고 포함).
Vercel AI SDK 기반 스트리밍 채팅

