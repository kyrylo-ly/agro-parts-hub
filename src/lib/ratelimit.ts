import { headers } from "next/headers";

/**
 * Basic Fixed Window Rate Limiter using Vercel KV (Upstash Redis) REST API natively.
 */
async function checkRateLimit(action: string, limit: number, windowSeconds: number) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.warn("KV_REST_API_URL or KV_REST_API_TOKEN is missing. Rate limiting is disabled.");
    return true; // Fail open if not configured
  }

  const headersList = headers();
  // Get IP from standard headers or fallback
  const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "127.0.0.1";
  
  const windowId = Math.floor(Date.now() / (windowSeconds * 1000));
  const redisKey = `ratelimit:${action}:${ip}:${windowId}`;

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // Using pipeline to send multiple commands in one HTTP request
      body: JSON.stringify([
        ["INCR", redisKey],
        ["EXPIRE", redisKey, windowSeconds],
      ]),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("KV rate limit fetch failed:", await res.text());
      return true; // Fail open
    }

    const data = await res.json();
    // data is an array of results for each command in the pipeline
    // e.g. [{ result: 1 }, { result: 1 }]
    const currentCount = data[0].result as number;

    return currentCount <= limit;
  } catch (error) {
    console.error("Rate limiter error:", error);
    return true; // Fail open
  }
}

export async function rateLimitSearch() {
  // 30 requests per 10 seconds
  const allowed = await checkRateLimit("search", 30, 10);
  if (!allowed) {
    throw new Error("Too many search requests. Please try again later.");
  }
}

export async function rateLimitOrder() {
  // 5 requests per 60 seconds
  const allowed = await checkRateLimit("order", 5, 60);
  if (!allowed) {
    throw new Error("Занадто багато спроб замовлення. Спробуйте пізніше.");
  }
}

export async function rateLimitUpload() {
  // 50 requests per hour (3600 seconds)
  const allowed = await checkRateLimit("upload", 50, 3600);
  if (!allowed) {
    throw new Error("Перевищено ліміт завантажень зображень. Спробуйте пізніше.");
  }
}
