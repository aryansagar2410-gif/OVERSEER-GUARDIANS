// Simple in-memory rate limiter using Map. In a multi-instance production environment, 
// a Redis-based solution like @upstash/ratelimit should be used.
type RateLimitEntry = { count: number; expiresAt: number };

const cache = new Map<string, RateLimitEntry>();

export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = cache.get(ip);
  
  if (!entry || now > entry.expiresAt) {
    cache.set(ip, { count: 1, expiresAt: now + windowMs });
    return true;
  }
  
  if (entry.count >= limit) {
    return false;
  }
  
  entry.count += 1;
  return true;
}

// Clean up expired entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    cache.forEach((value, key) => {
      if (now > value.expiresAt) {
        cache.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}
