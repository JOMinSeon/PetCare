# External Integrations

**Analysis Date:** 2026-04-14

## APIs & External Services

**AI Providers:**
- Google Gemini - GEMINI_API_KEY configured
- Google Vertex AI - @ai-sdk/google-vertex
- Anthropic Claude - via @anthropic-ai/sdk

**Maps:**
- Kakao Maps - NEXT_PUBLIC_KAKAO_MAP_KEY

## Data Storage

**Primary Database:**
- Supabase (PostgreSQL)
  - Connection: NEXT_PUBLIC_SUPABASE_URL
  - Anon Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Service Role: SUPABASE_SERVICE_ROLE_KEY
  - Project: susmktciuntkykajvcod.supabase.co

## Payments & Billing

**Subscription Platform:**
- Lemon Squeezy
  - API Key: LEMONSQUEEZY_API_KEY
  - Store ID: LEMONSQUEEZY_STORE_ID (336866)
  - Webhook Secret: LEMONSQUEEZY_WEBHOOK_SECRET

**Plans via Lemon Squeezy:**
- Premium Plan: LEMONSQUEEZY_PREMIUM_VARIANT_ID (1500153)
- Clinic Plan: LEMONSQUEEZY_CLINIC_VARIANT_ID (1501953)

**Payment Gateway:**
- PortOne (Korean payment gateway)
  - Channel Key: NEXT_PUBLIC_PORTONE_CHANNEL_KEY
  - Store ID: NEXT_PUBLIC_PORTONE_STORE_ID
  - API Secret: PORTONE_API_SECRET

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built into Supabase)
  - JWT-based authentication
  - Service role key for admin operations

## Monitoring & Observability

**Logging:**
- Console logging (no external service detected)

**Error Tracking:**
- Not detected

## CI/CD & Deployment

**Hosting:**
- Vercel - NEXT_PUBLIC_SITE_URL (https://petcare.pe.kr)
  - OIDC Token: VERCEL_OIDC_TOKEN configured

**Build Pipeline:**
- Vercel automatic deployments
- vercel-build script: next build

## Environment Configuration

**Required env vars:**
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SITE_URL
- GEMINI_API_KEY
- LEMONSQUEEZY_API_KEY
- LEMONSQUEEZY_STORE_ID
- LEMONSQUEEZY_WEBHOOK_SECRET
- LEMONSQUEEZY_PREMIUM_VARIANT_ID
- LEMONSQUEEZY_CLINIC_VARIANT_ID
- NEXT_PUBLIC_PORTONE_CHANNEL_KEY
- NEXT_PUBLIC_PORTONE_STORE_ID
- PORTONE_API_SECRET
- NEXT_PUBLIC_KAKAO_MAP_KEY

**Secrets location:**
- .env.local (local development)
- Vercel environment variables (production)

## Webhooks & Callbacks

**Incoming:**
- Lemon Squeezy webhooks - LEMONSQUEEZY_WEBHOOK_SECRET configured

**Outgoing:**
- PortOne payment callbacks
- Lemon Squeezy subscription events

---

*Integration audit: 2026-04-14*