import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Define the limit: 10 requests per 10 seconds per user
const REQUESTS_PER_WINDOW = 10;
const WINDOW_DURATION = "10 s";

export async function checkRateLimit(identifier: string) {
  // 1. Vercel Free Tier Safety Check
  // If you haven't set up Redis env vars yet, we don't want to crash the site.
  // We simply log a warning and allow the request.
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("⚠️ Rate Limiting is DISABLED. Missing Redis Env Variables.");
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  try {
    const ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(REQUESTS_PER_WINDOW, WINDOW_DURATION),
      analytics: true,
      prefix: "@krama/limit",
    });

    // Check the limit for this specific user/IP
    return await ratelimit.limit(identifier);

  } catch (error) {
    // If Redis is down, don't block the user. Fail open.
    console.error("Rate Limit Error:", error);
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}