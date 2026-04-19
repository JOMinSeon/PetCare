# Codebase Concerns

**Analysis Date:** 2026-04-14

## Technical Debt

**In-Memory Rate Limiting**
- Issue: `lib/rate-limit.ts` uses an in-memory Map for rate limiting. This will not work correctly in serverless/edge environments or when scaling to multiple instances.
- Files: `lib/rate-limit.ts`
- Impact: Rate limiting becomes ineffective when the application runs on multiple serverless instances or when serverless functions are stateless.
- Fix approach: Replace with Redis-backed rate limiting for production with multiple instances.

**Sync Token Generation in EMR**
- Issue: `app/api/emr/sync/route.ts` uses a simple random string generator for sync tokens (`generateSyncToken` function at lines 59-65). This is cryptographically weak.
- Files: `app/api/emr/sync/route.ts` (lines 59-65)
- Impact: Sync tokens could be guessed or brute-forced, allowing unauthorized EMR access.
- Fix approach: Use `crypto.randomBytes(32).toString('hex')` or similar cryptographically secure random generation.

**Duplicate Codebase (PetCare Submodule)**
- Issue: The repository contains a `PetCare` submodule that appears to be a duplicate of the main codebase structure. Both have similar files: `proxy.ts`, `lib/supabase.ts`, `lib/supabase-browser.ts`, `lib/rate-limit.ts`, API routes, and components.
- Files: `.gitmodules`, `PetCare/` (entire submodule)
- Impact: Maintenance burden doubles; security fixes must be applied in two places. Risk of divergence between the two codebases.
- Fix approach: Consolidate into a single codebase or clearly document the relationship and synchronization strategy.

## Security Considerations

**Webhook Signature Verification**
- Issue: The LemonSqueezy webhook signature verification in `app/api/lemonsqueezy/webhook/route.ts` uses `crypto.timingSafeEqual` but the implementation has potential issues with the comparison logic (line 15: comparing digest to signature directly without proper hex decoding first).
- Files: `app/api/lemonsqueezy/webhook/route.ts` (lines 9-16)
- Impact: Signature verification may not work correctly, allowing forged webhooks to succeed.
- Fix approach: Ensure both buffers are properly formatted before comparison, and verify the full signature verification flow.

**RLS Policy Gaps in Hospitals Table**
- Issue: The hospitals table has an "Anyone can insert partner hospitals" policy, which could allow anyone to create fake partner hospitals.
- Files: `supabase/migrations/015_hospitals_reservations.sql` (lines 39-41)
- Impact: Malicious users could insert fake partner hospital records, potentially confusing users or bypassing intended access controls.
- Fix approach: Restrict hospital insertions to admin users only.

**Missing Subscription Event Validation**
- Issue: The LemonSqueezy webhook handler updates profiles directly based on webhook data without validating that the `custom_data.user_id` exists or matches the subscription.
- Files: `app/api/lemonsqueezy/webhook/route.ts` (lines 39-114)
- Impact: If webhook data is manipulated or replayed, user subscription status could be incorrectly changed.
- Fix approach: Validate webhook payload more thoroughly, check that subscription_id matches known values, and add idempotency checks.

**No HMAC Verification for Webhook Retry Attacks**
- Issue: The webhook handler does not implement idempotency checks. Retried webhooks (which LemonSqueezy sends) could cause duplicate processing.
- Files: `app/api/lemonsqueezy/webhook/route.ts`
- Impact: Duplicate subscription status updates, duplicate payment records.
- Fix approach: Store processed webhook event IDs and skip duplicates.

**Supabase Service Role Key in Webhook Handler**
- Issue: `app/api/lemonsqueezy/webhook/route.ts` uses `SUPABASE_SERVICE_ROLE_KEY` directly to bypass RLS. While this is necessary for webhook processing, the service role key should be stored securely.
- Files: `app/api/lemonsqueezy/webhook/route.ts` (line 36-37)
- Current mitigation: Service role key is used only in webhook handler, not exposed to client.
- Recommendations: Ensure the service role key is properly secured in environment configuration and not logged anywhere.

**Pets Table RLS Does Not Include User_id Validation on Delete**
- Issue: The pets table has RLS policies but the API routes in `app/actions/pet.ts` perform additional manual `user_id` checks before allowing operations. If RLS policies are misconfigured, data could leak.
- Files: `supabase/migrations/004_pets_table.sql`, `app/actions/pet.ts`
- Impact: If RLS policies are disabled or misconfigured, manual checks may not be comprehensive enough.
- Fix approach: Ensure RLS is enforced at the database level as the primary protection.

## Performance Concerns

**No Pagination on EMR Records**
- Issue: `app/api/emr/records/route.ts` returns all EMR records without pagination (line 34: `.order('visit_date', { ascending: false })`).
- Files: `app/api/emr/records/route.ts`
- Impact: Users with many EMR records will experience slow response times and high memory usage.
- Fix approach: Add pagination with `range()` or `limit()`/`offset()`.

**No Index on emr_records.user_id**
- Issue: The `emr_records` table has RLS using `auth.uid() = user_id` but there is no explicit index on `user_id` for efficient lookups.
- Files: `supabase/migrations/016_emr_system.sql`
- Impact: Slow queries when filtering by user_id, especially with many records.
- Fix approach: Add `CREATE INDEX IF NOT EXISTS emr_records_user_idx ON emr_records (user_id);`

**Missing Composite Index for Chat/Analysis Rate Limits**
- Issue: In-memory rate limiting uses string keys like `chat:${user.id}`. While not a database issue, the pattern suggests lookups happen frequently.
- Files: `lib/rate-limit.ts`, `app/api/chat/route.ts`
- Impact: Memory grows with user count; no persistence across serverless invocations.
- Fix approach: Use Redis with TTL for rate limit state.

## API Design Concerns

**No Request Body Size Limits**
- Issue: API routes like `/api/chat` and `/api/analyze-food` accept user input without strict size limits on the request body. The `messages` array in chat has a count limit (50) but no total size limit.
- Files: `app/api/chat/route.ts` (line 64), `app/api/analyze-food/route.ts`
- Impact: Large payloads could cause memory issues or slow processing.
- Fix approach: Add explicit body size limits using `content-length` checks or streaming parsing.

**Inconsistent Error Response Format**
- Issue: API routes return inconsistent error response formats. Some use `{ error: string }` with status codes, but error details vary (some include `detail` field in development).
- Files: Multiple API routes
- Impact: Client code may have difficulty handling errors consistently.
- Fix approach: Standardize error response format across all API routes.

## Testing Gaps

**No Unit Tests for Rate Limiter**
- Issue: The `lib/rate-limit.ts` module has no tests verifying its behavior under concurrent access or at scale.
- Files: `lib/rate-limit.ts`
- Risk: Rate limiter may not work correctly in production serverless environment.
- Priority: Medium

**No Tests for RLS Policy Enforcement**
- Issue: RLS policies are defined in migrations but not tested to ensure they correctly prevent unauthorized access.
- Files: `supabase/migrations/*.sql`
- Risk: Misconfigured RLS could allow data leakage.
- Priority: High

**No Integration Tests for Webhook Handlers**
- Issue: The LemonSqueezy webhook handler has no automated tests verifying correct handling of different event types.
- Files: `app/api/lemonsqueezy/webhook/route.ts`
- Risk: Changes to webhook logic could break subscription billing.
- Priority: High

## Known Fragile Areas

**Pet Health Summary View**
- Files: `supabase/migrations/016_emr_system.sql` (lines 128-141)
- Why fragile: The `pet_health_summary` view performs multiple JOINs across emr_records, vaccinations, and prescriptions. As data grows, this view will become slow.
- Safe modification: Add appropriate indexes before modifying the view.
- Test coverage: No tests exist for this view.

**FHIR Conversion Functions**
- Files: `lib/emr.ts`
- Why fragile: The FHIR conversion functions (`convertToFHIRPatient`, `convertToFHIRImmunization`, etc.) have no validation of input data and could throw on malformed pet/vaccination records.
- Safe modification: Add input validation and error handling in each conversion function.

**Plans Configuration**
- Files: `lib/plans.ts`
- Why fragile: Plan definitions (feature limits, pricing) are duplicated between `lib/plans.ts` and `supabase/migrations/005_usage_tracking.sql` (plan_limits table). Drift between these could cause inconsistent behavior.
- Safe modification: Ensure changes are made in both places or consolidate to a single source.

## Dependency Risks

**LemonSqueezy SDK Version**
- Risk: Using `@lemonsqueezy/lemonsqueezy.js` without pinned version could cause breaking changes.
- Impact: Subscription billing could break if SDK changes unexpectedly.
- Migration plan: Pin to specific version in package.json and test SDK upgrades before deploying.

**Google AI SDK**
- Risk: `gemini-2.5-flash` model is hardcoded. If Google deprecates or renames this model, AI features will break.
- Files: `app/api/chat/route.ts`, `app/api/analyze-food/route.ts`, `app/api/health-analysis/route.ts`
- Impact: Chat, food analysis, and health analysis features would fail.
- Migration plan: Make model name configurable via environment variable.

## Missing Critical Features

**No Backup/Restore Strategy**
- Problem: There is no documented backup or restore process for the Supabase database.
- Blocks: Disaster recovery, data migration between environments.

**No Subscription Renewal Checks**
- Problem: The system relies entirely on LemonSqueezy webhooks for subscription status. If webhooks fail or are missed, subscription status could become stale.
- Blocks: Accurate subscription enforcement between billing cycles.

**No Audit Logging for Sensitive Operations**
- Problem: There is no comprehensive audit log for sensitive operations (subscription changes, EMR access, profile updates).
- Blocks: Security auditing, compliance requirements.

## Environment/Secret Management

**No .env.example or Documentation**
- Problem: The codebase references many environment variables but there is no `.env.example` file documenting which variables are required.
- Files: All files using `process.env.*`
- Impact: Developers cannot easily set up the project without digging through code.
- Fix approach: Create `.env.example` with all required variables (without values).

---

*Concerns audit: 2026-04-14*
