import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = '펫헬스 - 반려동물 건강 관리';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0D1117',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            marginBottom: 24,
          }}
        >
          <svg width={40} height={40} viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </div>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: '#22c55e',
            marginBottom: 16,
          }}
        >
          펫헬스
        </h1>
        <p
          style={{
            fontSize: 28,
            color: '#8b949e',
            marginBottom: 8,
          }}
        >
          반려동물 건강 관리
        </p>
        <p
          style={{
            fontSize: 24,
            color: '#4a5568',
          }}
        >
          AI 기반 반려동물 건강 관리 서비스
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
