// In-memory rate limiter (per-user, sliding window)
// For production with multiple instances, replace with Redis-backed solution.

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// 만료된 항목 정리 (메모리 누수 방지)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5분마다
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, CLEANUP_INTERVAL_MS);

/**
 * Returns true if the request is allowed, false if rate limit exceeded.
 * @param key      Unique key (e.g. `chat:userId`)
 * @param limit    Max requests per window
 * @param windowMs Window size in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}
