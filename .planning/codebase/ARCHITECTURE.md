# Architecture

**Analysis Date:** 2026-04-14

## Pattern Overview

**Overall:** Next.js App Router with Server Components and Supabase Backend-as-a-Service

**Key Characteristics:**
- React Server Components (RSC) for data fetching in `app/` directory
- Route groups using `(main)` and `(public)` conventions for layout partitioning
- Server-side authentication with Supabase SSR
- AI integrations via Google Generative AI and Anthropic
- Subscription management via LemonSqueezy
- FHIR-compliant EMR (Electronic Medical Record) data export

## Layers

**UI Layer (Components):**
- Purpose: Render user interface and handle client interactions
- Location: `components/`
- Contains: Reusable React components (PetCard, NavBar, HealthChart, etc.)
- Depends on: `lib/` utilities, Next.js, lucide-react icons
- Used by: `app/` pages and layouts

**Page/Route Layer (App Router):**
- Purpose: Define routes and compose page layouts with Server Components
- Location: `app/`
- Contains: Route pages (`page.tsx`), layouts (`layout.tsx`), API routes (`api/`)
- Depends on: `components/`, `lib/`, Supabase client
- Used by: Next.js router

**API Layer (Route Handlers):**
- Purpose: Handle backend operations, webhooks, and external integrations
- Location: `app/api/`
- Contains: Route handlers for chat, EMR, hospitals, LemonSqueezy, health analysis, food analysis
- Depends on: `lib/lemonsqueezy.ts`, `lib/emr.ts`, Supabase, AI SDKs
- Used by: Client components via fetch

**Data Layer (Lib/Utilities):**
- Purpose: Provide data access, business logic, and external service integrations
- Location: `lib/`
- Contains: `supabase.ts`, `supabase-server.ts`, `supabase-browser.ts`, `emr.ts`, `plans.ts`, `lemonsqueezy.ts`, `rate-limit.ts`
- Depends on: Supabase client, external service SDKs
- Used by: API routes, Server Components, Client Components

**Database Layer (Supabase):**
- Purpose: PostgreSQL database with RLS (Row Level Security), auth, and realtime
- Location: `supabase/migrations/`
- Contains: Schema migrations for profiles, pets, health_logs, subscriptions, EMR, hospitals, reservations
- Used by: `lib/supabase.ts`, `lib/supabase-server.ts`

## Data Flow

**Authentication Flow:**

1. User accesses protected route in `(main)` layout
2. Server Component calls `getServerDb()` from `lib/supabase-server.ts`
3. Supabase SSR client validates session cookie via `auth.getUser()`
4. If unauthenticated, redirect to `/auth/login`
5. Client components use `createBrowserClient()` from `lib/supabase-browser.ts`

**Pet Management Flow:**

1. User views `/pets` - Server Component fetches pets with health_logs
2. User adds pet via `/pets/new` - form posts to Supabase directly
3. User views pet detail `/pets/[id]` - fetches full pet data with related records
4. User edits pet via `/pets/[id]/edit` - updates via Supabase client

**AI Chat Flow:**

1. Client sends message to `/api/chat` route handler
2. Rate limiter checks `checkRateLimit()` from `lib/rate-limit.ts`
3. AI SDK (Google Generative AI or Anthropic) processes message
4. Response streamed back to client using Vercel AI SDK

**Subscription Flow:**

1. User selects plan on `/pricing`
2. Checkout request to `/api/lemonsqueezy/checkout`
3. `createLemonSqueezyCheckout()` creates checkout session
4. LemonSqueezy webhook at `/api/lemonsqueezy/webhook` confirms subscription
5. Subscription status checked via `getLemonSqueezySubscription()`

## Key Abstractions

**Supabase Client (Singleton):**
- Purpose: Database access abstraction
- Examples: `lib/supabase.ts` (browser), `lib/supabase-server.ts` (server)
- Pattern: Singleton pattern with lazy initialization

**Plan/Pricing:**
- Purpose: Define subscription tiers (free, premium, clinic)
- Examples: `lib/plans.ts`
- Pattern: Static configuration with TypeScript types

**EMR Export:**
- Purpose: FHIR-compliant medical record export
- Examples: `lib/emr.ts`
- Pattern: Data transformation functions (toFHIRPatient, toFHIRImmunization, etc.)

**Rate Limiting:**
- Purpose: Prevent API abuse
- Examples: `lib/rate-limit.ts`
- Pattern: In-memory sliding window (note: not suitable for multi-instance deployment)

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Every page request
- Responsibilities: Theme provider, fonts, metadata, Google Ads script

**Public Layout:**
- Location: `app/(public)/layout.tsx`
- Triggers: Landing, auth, terms, privacy pages
- Responsibilities: No auth requirement, minimal wrapper

**Main Layout:**
- Location: `app/(main)/layout.tsx`
- Triggers: All authenticated routes (pets, tracking, calendar, hospitals, etc.)
- Responsibilities: NavBar, AuthWatcher for auth state management

**API Routes:**
- Location: `app/api/*/route.ts`
- Triggers: Client fetch requests and webhooks
- Responsibilities: Business logic, external API calls, database operations

## Error Handling

**Strategy:** Redirect-based error handling with fallbacks

**Patterns:**
- Server Components use `redirect()` for auth errors
- API routes return JSON error responses with appropriate status codes
- Client components handle errors with try/catch and display inline
- Rate limit exceeded returns 429 status

## Cross-Cutting Concerns

**Styling:** Tailwind CSS v4 with CSS custom properties for theming

**Icons:** Lucide React

**AI Integration:** Vercel AI SDK (`ai` package) with Google and Anthropic providers

**Charts:** Recharts for health data visualization

**Theme:** next-themes for dark/light mode support

---

*Architecture analysis: 2026-04-14*
