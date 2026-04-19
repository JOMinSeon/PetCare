# Technology Stack

**Analysis Date:** 2026-04-14

## Languages

**Primary:**
- TypeScript 5 - All source code
- JavaScript (JSX/TSX) - React components

**Styling:**
- CSS with Tailwind CSS 4

## Runtime

**Environment:**
- Node.js (via Next.js)

**Package Manager:**
- npm (package-lock.json not detected)

## Frameworks

**Core:**
- Next.js 16.1.6 - React framework with App Router

**AI Integration:**
- Vercel AI SDK 6.0.158 - AI API integration
- @ai-sdk/react 3.0.118 - React hooks for AI
- @ai-sdk/google 3.0.43 - Google generative AI
- @ai-sdk/google-vertex 4.0.108 - Google Vertex AI
- @anthropic-ai/sdk 0.80.0 - Anthropic Claude

**UI:**
- React 19.2.3
- lucide-react 0.577.0 - Icons
- recharts 3.8.0 - Charts
- @types/recharts 1.8.29

**Theming:**
- next-themes 0.4.6 - Dark mode support

## Database

**Primary:**
- Supabase 2.99.1 - PostgreSQL database
- @supabase/ssr 0.9.0 - Server-side Supabase client
- @supabase/supabase-js 2.99.1 - Supabase client library

## Payments

**Billing:**
- @lemonsqueezy/lemonsqueezy.js 4.0.0 - Subscription management

**Payments Processing:**
- @portone/browser-sdk 0.1.3 - Korean payment gateway (PortOne)

## Infrastructure

**Deployment:**
- Vercel - Hosting platform
- vercel-build script in package.json

**Maps:**
- Kakao Maps - NEXT_PUBLIC_KAKAO_MAP_KEY

## Configuration

**Environment:**
- .env.local - Environment variables (Supabase, LemonSqueezy, Gemini, PortOne, Kakao)

**Build:**
- next.config.ts - Next.js configuration with security headers, compression, optimized package imports
- tsconfig.json - TypeScript configuration
- tailwind.config (via @tailwindcss/postcss) - Tailwind CSS 4

**Lint:**
- ESLint 9 with eslint-config-next 16.1.6

## Key Dependencies Summary

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.6 | React framework |
| react | 19.2.3 | UI library |
| @supabase/supabase-js | 2.99.1 | Database client |
| @lemonsqueezy/lemonsqueezy.js | 4.0.0 | Payments |
| ai | 6.0.158 | AI SDK |
| lucide-react | 0.577.0 | Icons |
| recharts | 3.8.0 | Charts |
| @portone/browser-sdk | 0.1.3 | Korean payments |

---

*Stack analysis: 2026-04-14*