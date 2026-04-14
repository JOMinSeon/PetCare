# Coding Conventions

**Analysis Date:** 2026-04-14

## Technology Stack

**Framework:**
- Next.js 16.1.6 with App Router
- React 19.2.3

**Language:**
- TypeScript 5

**Styling:**
- Tailwind CSS 4
- CSS custom properties for theming (e.g., `var(--color-primary-50)`)

**Linting:**
- ESLint 9 with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Strict mode enabled in TypeScript

**Path Alias:**
- `@/*` maps to `./` (defined in `tsconfig.json`)

## Naming Conventions

### Files
- Components: PascalCase (e.g., `NavLinks.tsx`, `PetCard.tsx`, `HealthChart.tsx`)
- Regular TypeScript files: camelCase or PascalCase depending on content

### Components
- PascalCase for exported component functions (e.g., `export function NavLinks()`)
- Use named exports, not default exports for components

### Interfaces and Types
- PascalCase (e.g., `interface Pet`, `interface HealthLog`)
- Prefixed with descriptive names (e.g., `Pet`, `HealthLog`, `HealthScoreRing`)

### Variables and Functions
- camelCase for variables and functions (e.g., `const pathname`, `const active`)
- Descriptive Korean labels in data objects (e.g., `{ href: '/pets', label: '반려동물' }`)

## Code Style

### React Components

**Client Components:**
- Use `'use client'` directive at the top of files that need client-side interactivity
- Example from `components/NavLinks.tsx`:
  ```typescript
  'use client';
  import Link from 'next/link';
  import { Settings, Crown } from 'lucide-react';
  ```

**Server vs Client Boundary:**
- Keep `'use client'` at component tree leaf nodes when possible
- Components without interactivity do not need `'use client'`

### Component Structure (from `components/PetCard.tsx`)

1. Imports (external libraries first, then internal)
2. Interface/type definitions
3. Helper components (nested inside file or exported)
4. Main exported component
5. Skeleton/loading variants (exported separately)

Example:
```typescript
interface Pet {
  id: string;
  name: string;
  species: string;
  // ...
}

function HealthScoreRing({ score }: { score: number }) {
  // Helper component
}

export function PetCard({ pet }: { pet: Pet }) {
  // Main component logic
}

/* Skeleton loader */
export function PetCardSkeleton() {
  // Loading state variant
}
```

### CSS Styling Approach

**Inline styles with CSS custom properties:**
```typescript
style={{
  background: 'var(--color-primary-50)',
  color: 'var(--color-text-secondary)',
}}
```

**Tailwind utility classes:**
```typescript
className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all"
```

**CSS custom properties used:**
- `--color-primary-*` (50, 100, 500, etc.)
- `--color-secondary-*`
- `--color-accent-*`
- `--color-text-*` (primary, secondary, muted)
- `--color-surface-*`
- `--color-border-*`
- `--color-danger`

## Import Organization

1. External libraries (Next.js, React, icons from `lucide-react`, etc.)
2. Internal imports (other components, utilities)
3. Type imports

Example from `components/HealthChart.tsx`:
```typescript
'use client';
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
```

## TypeScript Patterns

### Interface Definitions
```typescript
interface HealthLog {
  id: string;
  weight: number;
  rer: number;
  mer: number;
  recorded_at: string;
}
```

### Props with Type Annotations
```typescript
export function PetCard({ pet }: { pet: Pet }) {
export function HealthChart({ data }: { data: HealthLog[] }) {
```

### CSS Properties Typing
```typescript
const axisStyle = { fontSize: 11, fill: 'var(--color-text-muted)' } as const;
```

### Conditional Styling
```typescript
const color =
  score >= 80 ? '#10b981' :
  score >= 55 ? '#f59e0b' : '#ef4444';
```

## Accessibility Patterns

**ARIA attributes:**
```typescript
role="img"
aria-label={`건강 점수 ${score}점 — ${scoreLabel}`}
aria-current={active ? 'page' : undefined}
```

**Semantic HTML:**
```typescript
<Link> instead of <a>
<button> for interactive elements
```

## Next.js Specific Patterns

**Client-side state with useEffect (hydration-safe):**
```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);

if (!mounted) return null;
```

**URL utilities:**
```typescript
import { usePathname, useSearchParams } from 'next/navigation';
const pathname = usePathname();
const searchParams = useSearchParams();
```

**Dynamic routes:**
```typescript
href={`/pets/${pet.id}`}
href={`/pets/${pet.id}?tab=chat`}
```

## Data Patterns

### Pet Species Display
```typescript
const speciesEmoji = pet.species === 'dog' ? '🐕' : '🐈';
const speciesLabel = pet.species === 'dog' ? '강아지' : '고양이';
```

### Date Formatting
```typescript
new Date(log.recorded_at).toLocaleDateString('ko-KR', {
  month: 'short',
  day: 'numeric',
})
```

### Computed Values
```typescript
const sorted = [...logs].sort(
  (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
);
const latest = sorted[sorted.length - 1];
```

## ESLint Configuration

Located in `eslint.config.mjs`:
```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
```

**Linting command:**
```bash
npm run lint
```

## TypeScript Configuration

Located in `tsconfig.json`:
- Target: ES2017
- Strict mode: enabled
- JSX: react-jsx
- Module resolution: bundler
- Path alias: `@/*` maps to `./*`

---

*Convention analysis: 2026-04-14*
