# Security Vulnerability Report

**Project:** PetCare/Vet Clinic Application  
**Review Date:** 2026-04-15  
**Reviewer:** GSD Code Reviewer (Security Analysis)  
**Depth:** Standard

---

## Executive Summary

This security review identified **9 vulnerabilities** spanning from Critical to Low severity. The most critical issues involve **hardcoded API keys and secrets** committed to the repository, a **cryptographically weak token generator**, and a **potential SQL injection** via Supabase's `.ilike()` with unsanitized user input. Immediate remediation is required for the critical and high severity findings.

**Status:** issues_found

---

## Critical Issues

### CR-01: Hardcoded Secrets and API Keys in Source Code

**CVSS Score:** 9.1 (Critical)  
**File(s):** `.env.local`, `PetCare/.env.local`

**Issue:**  
Multiple sensitive API keys and secrets are hardcoded in `.env.local` files and committed to the repository:

| Secret | Exposure Risk |
|--------|--------------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public but grants access to Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | **Full database admin access** - can bypass RLS |
| `GEMINI_API_KEY` | AI API with billing implications |
| `LEMONSQUEEZY_API_KEY` | Payment processing API |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Webhook signature verification |
| `PORTONE_API_SECRET` | Payment gateway secret |
| `VERCEL_OIDC_TOKEN` | Vercel deployment credentials |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | Third-party API key |

**CIA Impact:**
- **Confidentiality:** HIGH - Service role key exposes entire database
- **Integrity:** HIGH - Payment APIs can be abused
- **Availability:** MEDIUM - API keys can be exhausted

**PoC:**  
```bash
# Anyone with repository access can extract secrets
grep -E "(API_KEY|SECRET|TOKEN)" .env.local
```

**Remediation:**
1. Remove `.env.local` from git tracking immediately
2. Use Vercel Environment Variables or a secrets manager (e.g., HashiCorp Vault, AWS Secrets Manager)
3. Rotate all exposed keys immediately
4. Add `.env.local` to `.gitignore`:
   ```
   .env.local
   .env*.local
   ```

---

## High Severity Issues

### HR-01: Weak Random Token Generation for EMR Sync

**CVSS Score:** 7.5 (High)  
**File:** `app/api/emr/sync/route.ts:59-65`

**Issue:**  
The `generateSyncToken()` function uses `Math.random()` which is **not cryptographically secure**:

```typescript
function generateSyncToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
```

`Math.random()` produces predictable values that can be guessed by attackers. This token is used for EMR (Electronic Medical Records) sync authentication.

**CIA Impact:**
- **Confidentiality:** HIGH - Unauthorized access to pet medical records
- **Integrity:** HIGH - Attacker can modify medical records
- **Availability:** MEDIUM - Denial of service on EMR sync

**PoC:**  
```javascript
// Attacker can predict token generation
// With 62^32 possible values but Math.random() has limited entropy (~50 bits)
// This makes brute-force feasible in targeted attacks
```

**Remediation:**  
Replace with `crypto.randomBytes()` or `crypto.randomUUID()`:

```typescript
import crypto from 'crypto';

function generateSyncToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}

// Or use UUID v4
import { randomUUID } from 'crypto';
function generateSyncToken(): string {
  return randomUUID();
}
```

---

### HR-02: SQL Injection via Supabase `.ilike()` with User Input

**CVSS Score:** 7.5 (High)  
**File:** `app/api/hospitals/search/route.ts:29`

**Issue:**  
User input from the `search` parameter is directly interpolated into a Supabase `.or()` query without sanitization:

```typescript
if (search) {
  query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
}
```

While Supabase uses parameterized queries, the `.ilike` pattern with string interpolation can potentially be exploited depending on how Supabase's PostgREST handles special characters (e.g., `%`, `_`, `\`) which have wildcard meaning in ILIKE patterns.

**CIA Impact:**
- **Confidentiality:** MEDIUM - Could extract hospital data
- **Integrity:** LOW - No write capability
- **Availability:** LOW - Query manipulation possible

**PoC:**  
```
GET /api/hospitals/search?search=%test%25
# The %25 encodes a literal %, potentially bypassing filters
```

**Remediation:**  
Sanitize the search input before interpolation:

```typescript
if (search) {
  // Escape special SQL LIKE characters
  const escaped = search
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
  query = query.or(`name.ilike.%${escaped}%,address.ilike.%${escaped}%`);
}
```

Or use Supabase's text search (tsvector) which is safer and more performant:

```typescript
// Use full-text search instead
if (search) {
  query = query.textSearch('name', search, { type: 'websearch' });
}
```

---

### HR-03: Missing Security Headers

**CVSS Score:** 6.5 (Medium)  
**File(s):** `app/layout.tsx` (missing configuration)

**Issue:**  
No security headers are configured for the application:

| Header | Protection |
|--------|-----------|
| `Content-Security-Policy` | Prevents XSS and injection attacks |
| `X-Frame-Options` | Prevents clickjacking |
| `X-Content-Type-Options` | Prevents MIME sniffing |
| `Strict-Transport-Security` | Enforces HTTPS |
| `Referrer-Policy` | Controls referrer information |

**CIA Impact:**
- **Confidentiality:** MEDIUM - XSS attacks possible
- **Integrity:** HIGH - Injection attacks executable
- **Availability:** LOW - Clickjacking attacks

**Remediation:**  
Add security headers via `next.config.ts`:

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com;"
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

module.exports = {
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders }
    ];
  }
};
```

---

## Medium Severity Issues

### MR-01: In-Memory Rate Limiting Not Production-Ready

**CVSS Score:** 5.3 (Medium)  
**File:** `lib/rate-limit.ts`

**Issue:**  
Rate limiting uses an in-memory `Map` store which does not persist across multiple server instances:

```typescript
const store = new Map<string, Entry>();
```

In a serverless or multi-instance deployment (e.g., Vercel), each instance has its own memory, making rate limiting ineffective against distributed attacks.

**CIA Impact:**
- **Confidentiality:** LOW - Information access unchanged
- **Integrity:** LOW - No data integrity risk
- **Availability:** MEDIUM - DoS possible via distributed request flooding

**Remediation:**  
Use Redis-backed rate limiting (e.g., `ioredis` with Upstash) for production:

```typescript
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`;
  
  const current = await redis.incr(windowKey);
  if (current === 1) {
    await redis.pexpire(windowKey, windowMs);
  }
  
  return current <= limit;
}
```

---

### MR-02: Missing Event Name Validation in Webhook Handler

**CVSS Score:** 5.9 (Medium)  
**File:** `app/api/lemonsqueezy/webhook/route.ts:39`

**Issue:**  
The webhook handler processes events based on `eventName` from headers without validating against known events:

```typescript
switch (eventName) {
  case 'subscription_created':
  case 'subscription_updated': {
    // process subscription
  }
  // ... other cases
}
```

If an attacker sends a crafted request with an unexpected `x-event-name`, it may cause unexpected behavior or bypass business logic.

**CIA Impact:**
- **Confidentiality:** LOW - Unchanged
- **Integrity:** MEDIUM - Could trigger unintended state changes
- **Availability:** LOW - Unlikely to impact availability

**Remediation:**  
Add explicit allowlist validation:

```typescript
const ALLOWED_EVENTS = new Set([
  'subscription_created',
  'subscription_updated',
  'subscription_cancelled',
  'subscription_expired',
  'subscription_payment_success',
  'subscription_payment_failed'
]);

// In POST handler:
if (!ALLOWED_EVENTS.has(eventName)) {
  console.warn(`Unknown webhook event: ${eventName}`);
  return NextResponse.json({ error: 'Unknown event' }, { status: 400 });
}
```

---

### MR-03: No Idempotency Protection on EMR Sync

**CVSS Score:** 5.9 (Medium)  
**File:** `app/api/emr/sync/route.ts:31-41`

**Issue:**  
EMR sync endpoint creates a new sync record on every request without checking if a sync is already in progress:

```typescript
const { data: syncRecord, error } = await db
  .from('emr_sync_log')
  .insert({
    user_id: user.id,
    hospital_id,
    sync_token: syncToken,
    status: 'pending',
    records_count: 0,
  })
  .select()
  .single();
```

An attacker or network issue could trigger duplicate sync operations.

**CIA Impact:**
- **Confidentiality:** LOW - Duplicate syncs don't leak more data
- **Integrity:** MEDIUM - Duplicate records could cause confusion
- **Availability:** LOW - Minor impact

**Remediation:**  
Check for existing pending sync before creating new one:

```typescript
// Check for existing pending sync
const { data: existing } = await db
  .from('emr_sync_log')
  .select('id')
  .eq('user_id', user.id)
  .eq('hospital_id', hospital_id)
  .eq('status', 'pending')
  .single();

if (existing) {
  return NextResponse.json({ 
    error: 'Sync already in progress',
    sync_id: existing.id 
  }, { status: 409 });
}
```

---

## Low Severity Issues

### LR-01: Verbose Error Messages in Development Mode

**CVSS Score:** 3.7 (Low)  
**File(s):** Multiple API routes

**Issue:**  
Error details are exposed to clients in development mode:

```typescript
const detail = process.env.NODE_ENV === 'development' 
  ? (err?.message ?? String(error)) 
  : undefined;
return Response.json({ error: '...', detail }, { status: 500 });
```

While this is controlled by `NODE_ENV`, production deployments should never expose internal error details.

**CIA Impact:**
- **Confidentiality:** LOW - May reveal internal paths/structures
- **Integrity:** LOW - No direct impact
- **Availability:** LOW - No impact

**Remediation:**  
Log details server-side only; never send to client:

```typescript
// Always log, never expose
console.error('Food analysis error:', error);
return Response.json({ error: '분석 중 오류가 발생했습니다.' }, { status: 500 });
```

---

### LR-02: No Input Validation on Geographic Coordinates

**CVSS Score:** 3.3 (Low)  
**File:** `app/api/hospitals/search/route.ts:41-49`

**Issue:**  
Latitude/longitude parameters are accepted without validation of valid ranges:

```typescript
const userLat = parseFloat(lat);
const userLng = parseFloat(lng);

results = results.map(h => ({
  ...h,
  distance: h.latitude && h.longitude
    ? calculateDistance(userLat, userLng, parseFloat(h.latitude), parseFloat(h.longitude))
    : null
}));
```

Invalid coordinates (e.g., latitude > 90 or < -90) could cause unexpected behavior in distance calculations.

**CIA Impact:**
- **Confidentiality:** NONE
- **Integrity:** LOW - Incorrect search results possible
- **Availability:** LOW - Calculation errors

**Remediation:**  
Add coordinate validation:

```typescript
function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

if (lat && lng) {
  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  
  if (!isValidCoordinate(userLat, userLng)) {
    return Response.json({ error: '유효하지 않은 좌표입니다.' }, { status: 400 });
  }
  // ... rest of code
}
```

---

## Findings Summary

| ID | Severity | CVSS | Category | File(s) |
|----|----------|------|----------|---------|
| CR-01 | Critical | 9.1 | Hardcoded Secrets | `.env.local` |
| HR-01 | High | 7.5 | Weak Random | `emr/sync/route.ts` |
| HR-02 | High | 7.5 | SQL Injection | `hospitals/search/route.ts` |
| HR-03 | High | 6.5 | Missing Headers | `layout.tsx` |
| MR-01 | Medium | 5.3 | Rate Limiting | `rate-limit.ts` |
| MR-02 | Medium | 5.9 | Webhook Validation | `lemonsqueezy/webhook/route.ts` |
| MR-03 | Medium | 5.9 | Idempotency | `emr/sync/route.ts` |
| LR-01 | Low | 3.7 | Error Messages | Multiple |
| LR-02 | Low | 3.3 | Input Validation | `hospitals/search/route.ts` |

**Total: 9 findings**
- Critical: 1
- High: 3
- Medium: 3
- Low: 2

---

## Remediation Priority

| Priority | Timeline | Issues |
|----------|----------|--------|
| **P0 - Critical** | Immediate (24h) | CR-01 |
| **P1 - High** | Within 7 days | HR-01, HR-02, HR-03 |
| **P2 - Medium** | Within 30 days | MR-01, MR-02, MR-03 |
| **P3 - Low** | Next sprint | LR-01, LR-02 |

---

## Recommendations

1. **Immediate:** Rotate all exposed API keys and remove hardcoded secrets from repository
2. **Immediate:** Implement proper CORS configuration for API routes
3. **Short-term:** Replace `Math.random()` with `crypto.randomBytes()` in security-critical paths
4. **Short-term:** Add comprehensive security headers to all responses
5. **Medium-term:** Implement Redis-backed rate limiting for production
6. **Medium-term:** Add webhook event validation allowlist
7. **Ongoing:** Conduct regular security audits and dependency updates

---

_Reviewed: 2026-04-15T00:00:00Z_  
_Reviewer: GSD Code Reviewer (Security Analysis)_  
_Depth: standard_
