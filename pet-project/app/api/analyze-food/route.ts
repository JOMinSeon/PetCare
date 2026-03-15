export const runtime = 'nodejs';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const image = formData.get('image') as File;
  const petInfo = JSON.parse(formData.get('petInfo') as string);

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
}
