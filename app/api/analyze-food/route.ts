export const runtime = 'nodejs';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { getServerDb } from '@/lib/supabase-server';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: Request) {
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();
    if (!user) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get('image') as File | null;
    const petInfoRaw = formData.get('petInfo') as string | null;

    if (!image || !petInfoRaw) {
      return Response.json({ error: '이미지와 반려동물 정보가 필요합니다.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(image.type)) {
      return Response.json({ error: 'JPG, PNG, WEBP, GIF 형식만 지원합니다.' }, { status: 400 });
    }

    if (image.size > MAX_FILE_SIZE) {
      return Response.json({ error: '파일 크기는 5MB 이하여야 합니다.' }, { status: 400 });
    }

    const petInfo = JSON.parse(petInfoRaw);
    const imageBytes = await image.arrayBuffer();
    const base64 = Buffer.from(imageBytes).toString('base64');

    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', image: base64 },
            {
              type: 'text',
              text: `이 사료가 ${petInfo.species}(${petInfo.age}세, ${petInfo.weight}kg)에게 적합한지 분석해주세요.`,
            },
          ],
        },
      ],
    });

    return Response.json({ analysis: text });
  } catch (error) {
    console.error('Food analysis error:', error);
    return Response.json({ error: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
  }
}
