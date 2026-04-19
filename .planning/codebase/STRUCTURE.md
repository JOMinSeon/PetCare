# Codebase Structure

**Analysis Date:** 2026-04-14

## Directory Layout

```
project-root/
├── app/                    # Next.js App Router
│   ├── (main)/            # Authenticated routes (pets, tracking, calendar, etc.)
│   ├── (public)/          # Public routes (landing, auth, terms, privacy)
│   ├── api/               # API route handlers
│   ├── actions/           # Server Actions (if used)
│   ├── layout.tsx         # Root layout
│   └── hospitals/         # Hospital-related pages
├── components/            # React components
├── lib/                   # Utilities and integrations
├── supabase/             # Database migrations
├── public/               # Static assets
├── types/                # TypeScript type declarations
├── .claude/              # Claude agent configs and skills
└── configuration files   # next.config.ts, tsconfig.json, etc.
```

## Directory Purposes

**App Router (`app/`):**
- Purpose: All routes, pages, layouts, and API handlers
- Contains: Route groups `(main)` and `(public)`, API routes, layouts
- Key files: `layout.tsx`, `(main)/layout.tsx`, `(public)/layout.tsx`

**Main Routes (`app/(main)/`):**
- Purpose: Authenticated application pages
- Contains: `pets/`, `tracking/`, `calendar/`, `settings/`, `pricing/`, `subscription/`, `hospitals-page/`, `community/`, `analyze-food/`
- Requires: Authentication via `getServerDb().auth.getUser()`

**Public Routes (`app/(public)/`):**
- Purpose: Unauthenticated public pages
- Contains: `landing/`, `auth/login/`, `auth/signup/`, `business/`, `terms/`, `privacy/`, `refund/`
- Layout: `app/(public)/layout.tsx` (minimal wrapper)

**API Routes (`app/api/`):**
- Purpose: Backend endpoints and webhooks
- Contains: `chat/`, `emr/`, `health-analysis/`, `hospitals/`, `lemonsqueezy/`, `analyze-food/`
- Structure: Each endpoint has its own folder with `route.ts`

**Components (`components/`):**
- Purpose: Reusable React UI components
- Contains: 20+ components (NavBar, PetCard, HealthChart, FoodAnalyzer, etc.)
- Pattern: Named exports (e.g., `export function PetCard`)

**Lib (`lib/`):**
- Purpose: Business logic and external service integrations
- Contains: `supabase.ts`, `supabase-server.ts`, `supabase-browser.ts`, `emr.ts`, `plans.ts`, `lemonsqueezy.ts`, `rate-limit.ts`

**Supabase Migrations (`supabase/migrations/`):**
- Purpose: Database schema migrations
- Contains: 18+ migration files numbered sequentially
- Key tables: profiles, pets, health_logs, subscriptions, schedule_events, hospitals, reservations, vet_consultations, health_records

**Public Assets (`public/`):**
- Purpose: Static files served directly
- Contains: SVG icons (next.svg, vercel.svg, globe.svg, etc.), ads.txt

**Type Declarations (`types/`):**
- Purpose: TypeScript type declarations for external modules
- Contains: `kakao.maps.d.ts`

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout with ThemeProvider, fonts, metadata
- `app/page.tsx`: Redirects to landing page via `app/(public)/page.tsx`

**Configuration:**
- `next.config.ts`: Next.js configuration with security headers and optimized package imports
- `tsconfig.json`: TypeScript configuration
- `package.json`: Dependencies and scripts
- `eslint.config.mjs`: ESLint configuration
- `postcss.config.mjs`: PostCSS for Tailwind

**Core Logic:**
- `lib/supabase.ts`: Browser Supabase client singleton
- `lib/supabase-server.ts`: Server Supabase client with SSR cookie handling
- `lib/supabase-browser.ts`: Browser client factory
- `lib/emr.ts`: FHIR EMR export types and functions
- `lib/plans.ts`: Subscription plan definitions
- `lib/lemonsqueezy.ts`: LemonSqueezy checkout and subscription management
- `lib/rate-limit.ts`: In-memory rate limiter

**Authentication:**
- `app/(public)/auth/login/page.tsx` and `LoginForm.tsx`
- `app/(public)/auth/signup/page.tsx` and `SignupForm.tsx`
- `components/AuthButton.tsx`: Auth state UI
- `components/AuthWatcher.tsx`: Auth state monitoring
- `components/GoogleAuthButton.tsx`: Google OAuth button
- `components/LogoutButton.tsx`: Logout action

## Naming Conventions

**Files:**
- React components: PascalCase (e.g., `PetCard.tsx`, `NavBar.tsx`)
- Route handlers: kebab-case (e.g., `route.ts`, `health-analysis/route.ts`)
- Lib utilities: kebab-case or camelCase (e.g., `supabase.ts`, `emr.ts`)
- Type declarations: kebab-case (e.g., `kakao.maps.d.ts`)

**Directories:**
- Route groups: lowercase with parentheses `(main)`, `(public)`
- API routes: kebab-case (`lemonsqueezy`, `health-analysis`)
- Feature folders: kebab-case (`hospitals-page`, `analyze-food`)

**Exports:**
- Components: Named exports (`export function PetCard`)
- Lib functions: Named exports (`export function getDb`, `export async function createLemonSqueezyCheckout`)

## Where to Add New Code

**New Feature Page:**
- Primary code: `app/(main)/[feature-name]/page.tsx`
- Layout: `app/(main)/layout.tsx` (already wraps all main routes)
- Tests: Add alongside component tests in `components/`

**New API Endpoint:**
- Handler: `app/api/[endpoint-name]/route.ts`
- For nested endpoints: `app/api/[category]/[action]/route.ts`

**New Component:**
- Implementation: `components/[ComponentName].tsx`
- Follow existing pattern: named export, TypeScript interface for props
- Tests: `components/[ComponentName].test.tsx` (if testing pattern exists)

**New Lib Utility:**
- Implementation: `lib/[utility-name].ts`
- Export functions and types for external use

**New Database Migration:**
- Location: `supabase/migrations/[number]_[migration_name].sql`
- Follow existing naming pattern with sequential numbers

## Special Directories

**Supabase Migrations:**
- Purpose: Database schema version control
- Naming: Sequential numbers (004_, 005_, etc.) with descriptive names
- Example: `004_pets_table.sql`, `016_emr_system.sql`

**Clade Agent Files (`.claude/`):**
- Purpose: Claude Code agent configurations and skills
- Contains: Agent definition files and skill documents
- Not committed to production code

**Vercel Configuration (`.vercel/`):**
- Purpose: Vercel deployment configuration
- Generated: Yes
- Committed: Yes (for deployment consistency)

---

*Structure analysis: 2026-04-14*
