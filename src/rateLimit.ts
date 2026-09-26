/**
 * Framework-agnostic rate limiter (generic version of the production
 * "consume_rate_limit" helper used by Ecomsia's server functions).
 *
 * Fixed-window counters per bucket+key, with an atomic backend hook so it
 * stays correct on multi-instance serverless deployments when you plug a
 * database or Redis in.
 */

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSec: number };

export interface RateLimitStore {
  /**
   * Atomically increment the counter for `key` in `windowKey` and return the
   * new count. Implementations: SQL `INSERT ... ON CONFLICT ... RETURNING`,
   * Redis `INCR`, or the in-memory store below for single-instance apps.
   */
  increment(key: string, windowKey: string): Promise<number>;
}

/** Simple in-memory store — fine for dev and single-instance deployments. */
export class MemoryRateLimitStore implements RateLimitStore {
  private buckets = new Map<string, number>();

  async increment(key: string, windowKey: string): Promise<number> {
    const composite = `${key}:${windowKey}`;
    const next = (this.buckets.get(composite) ?? 0) + 1;
    this.buckets.set(composite, next);
    return next;
  }
}

export interface RateLimitOptions {
  /** Logical bucket: "login", "product_import", "ai_call"… */
  bucket: string;
  /** Who is being limited: IP, user id, email… */
  key: string;
  /** Max operations per window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
  store?: RateLimitStore;
  /** Injectable clock for tests. */
  now?: () => number;
}

/**
 * Consume one unit from the bucket. Returns `allowed: false` plus the number
 * of seconds to wait (never 0) when the limit is reached.
 */
export async function consumeRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { bucket, key, limit, windowSeconds } = options;
  if (limit <= 0) return { allowed: false, retryAfterSec: windowSeconds };
  const now = options.now?.() ?? Date.now();
  const windowKey = Math.floor(now / (windowSeconds * 1000));
  const store = options.store ?? new MemoryRateLimitStore();
  const count = await store.increment(`${bucket}:${key}`, String(windowKey));
  if (count > limit) {
    // Server/client clock skew or long event-loop pauses can push `now` past
    // the window end: clamp so the retry hint always reflects the real window.
    const windowStart = windowKey * windowSeconds * 1000;
    const windowEnd = windowStart + windowSeconds * 1000;
    const elapsed = Math.min(Math.max(now - windowStart, 0), windowSeconds * 1000);
    const retryAfterSec = Math.max(1, Math.ceil((windowEnd - windowStart - elapsed) / 1000));
    return { allowed: false, retryAfterSec };
  }
  return { allowed: true };
}
