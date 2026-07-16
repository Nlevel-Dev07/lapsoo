import type { VercelRequest } from "@vercel/node"

const hits = new Map<string, number[]>()

/** Best-effort in-memory rate limit (per warm serverless instance). Not a substitute for edge/WAF-level protection. */
export function isRateLimited(req: VercelRequest, key: string, limit: number, windowMs: number): boolean {
  const forwarded = req.headers["x-forwarded-for"]
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0].trim() ?? req.socket?.remoteAddress ?? "unknown"
  const bucketKey = `${key}:${ip}`
  const now = Date.now()
  const timestamps = (hits.get(bucketKey) ?? []).filter((t) => now - t < windowMs)
  if (timestamps.length >= limit) {
    hits.set(bucketKey, timestamps)
    return true
  }
  timestamps.push(now)
  hits.set(bucketKey, timestamps)
  return false
}
