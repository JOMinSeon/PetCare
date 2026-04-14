# Testing Patterns

**Analysis Date:** 2026-04-14

## Test Framework Status

**No test framework is currently configured.**

- No `jest.config.*` found
- No `vitest.config.*` found
- No test files (`*.test.ts`, `*.spec.ts`, `__tests__/*.ts`) exist in the codebase

## Package.json Test Scripts

The `package.json` contains no test scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "vercel-build": "next build"
  }
}
```

## Testing Recommendations

### Framework Options

For this Next.js 16.1.6 + React 19 + TypeScript codebase, the recommended testing setup would be:

**Option 1: Vitest + React Testing Library**
- Config file: `vitest.config.ts`
- Test command: `vitest`
- Watch mode: `vitest --watch`
- Coverage: `vitest --coverage`

**Option 2: Jest + React Testing Library**
- Config file: `jest.config.js` or `jest.config.ts`
- Test command: `jest`
- Watch mode: `jest --watch`
- Coverage: `jest --coverage`

### Recommended Test Structure

For this codebase with component-based architecture:

```
project/
├── components/
│   ├── __tests__/
│   │   ├── NavLinks.test.tsx
│   │   ├── PetCard.test.tsx
│   │   └── HealthChart.test.tsx
│   └── ...
├── app/
│   ├── __tests__/
│   │   └── page.test.tsx
│   └── ...
└── lib/
    └── __tests__/
        └── utils.test.ts
```

### Test File Naming Convention

Based on the existing file naming patterns:
- PascalCase for component tests (e.g., `PetCard.test.tsx`)
- Co-located with source files or in `__tests__/` directory at same level

### What to Test

**Components (React Testing Library):**
```typescript
// Example: components/__tests__/PetCard.test.tsx
import { render, screen } from '@testing-library/react';
import { PetCard } from '../PetCard';

describe('PetCard', () => {
  it('renders pet name and species', () => {
    const mockPet = {
      id: '1',
      name: '뽀삐',
      species: 'dog',
      age: 3,
      weight: 5.2,
      neutered: true,
    };
    render(<PetCard pet={mockPet} />);
    expect(screen.getByText('뽀삐')).toBeInTheDocument();
  });
});
```

**Utilities/Library Functions:**
```typescript
// Example: lib/__tests__/calculations.test.ts
describe('calculateHealthScore', () => {
  it('returns 95 for logs recorded today', () => {
    const today = new Date().toISOString();
    expect(calculateHealthScore([{ recorded_at: today }])).toBe(95);
  });
});
```

### Mocking Patterns

**Component mocking for external dependencies:**
```typescript
// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  HeartPulse: () => 'HeartPulseIcon',
  MessageCircle: () => 'MessageCircleIcon',
}));
```

**Mock Next.js modules:**
```typescript
jest.mock('next/navigation', () => ({
  usePathname: () => '/pets',
  useSearchParams: () => new URLSearchParams(),
}));
```

**Mock data for components:**
```typescript
const mockPet = {
  id: '1',
  name: '뽀삐',
  species: 'dog',
  breed: 'Retrievier',
  age: 3,
  weight: 5.2,
  neutered: true,
  health_logs: [],
} as const;
```

### Coverage Requirements

Not currently enforced. If implementing tests, consider:
- Minimum 70% line coverage for new code
- 100% coverage for critical paths (payment, auth, data mutations)

### CI Integration

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ci": "vitest --run",
    "coverage": "vitest --coverage"
  }
}
```

---

*Testing analysis: 2026-04-14*
