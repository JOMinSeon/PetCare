import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  const { messages, petContext } = await req.json();

  const result = streamText({
    model: google('gemini-2.0-flash'),
    system: `당신은 반려동물 건강 전문가입니다.
      현재 반려동물 정보: ${JSON.stringify(petContext)}
      항상 수의사 상담을 권고하며, 근거 기반 조언을 제공하세요.`,
    messages,
  });

  return result.toUIMessageStreamResponse();
}
