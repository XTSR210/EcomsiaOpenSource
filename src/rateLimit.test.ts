import { describe, expect, it, vi, afterEach } from "vitest";
import { consumeRateLimit, MemoryRateLimitStore } from "./rateLimit.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("consumeRateLimit", () => {
  it("allows up to the limit then refuses with a wait time", async () => {
    const store = new MemoryRateLimitStore();
    const options = {
      bucket: "product_import",
      key: "user-42",
      limit: 3,
      windowSeconds: 60,
      store,
      now: () => 1_700_000_000_000,
    };
    expect(await consumeRateLimit(options)).toEqual({ allowed: true });
    expect(await consumeRateLimit(options)).toEqual({ allowed: true });
    expect(await consumeRateLimit(options)).toEqual({ allowed: true });
    const refused = await consumeRateLimit(options);
    // t=20s dans la fenêtre de 60s -> il reste 40s
    expect(refused).toEqual({ allowed: false, retryAfterSec: 40 });
  });

  it("opens a fresh window after the previous one expires", async () => {
    const store = new MemoryRateLimitStore();
    let now = 1_700_000_000_000;
    const options = {
      bucket: "ai",
      key: "user-7",
      limit: 1,
      windowSeconds: 30,
      store,
      now: () => now,
    };
    await consumeRateLimit(options);
    expect(await consumeRateLimit(options)).toEqual({ allowed: false, retryAfterSec: 10 });
    now += 30_000;
    expect(await consumeRateLimit(options)).toEqual({ allowed: true });
  });

  it("isolates keys and buckets", async () => {
    const store = new MemoryRateLimitStore();
    const base = { limit: 1, windowSeconds: 60, store, now: () => 0 };
    await consumeRateLimit({ ...base, bucket: "login", key: "a" });
    expect(await consumeRateLimit({ ...base, bucket: "login", key: "b" })).toEqual({
      allowed: true,
    });
    expect(await consumeRateLimit({ ...base, bucket: "signup", key: "a" })).toEqual({
      allowed: true,
    });
  });
});
