// Simple in-memory rate limiter for API routes
// For production, consider using Redis or a dedicated rate limiting service

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { maxRequests: 10, windowMs: 60000 }
): RateLimitResult {
  const now = Date.now()
  const entry = store[identifier]

  // If no entry exists or the window has expired, create a new one
  if (!entry || entry.resetTime < now) {
    store[identifier] = {
      count: 1,
      resetTime: now + options.windowMs,
    }
    return {
      success: true,
      remaining: options.maxRequests - 1,
      resetTime: store[identifier].resetTime,
    }
  }

  // Increment the count
  entry.count++

  // Check if rate limit exceeded
  if (entry.count > options.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  return {
    success: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

// Helper to get rate limit identifier from request
export function getRateLimitIdentifier(req: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const cfConnectingIp = req.headers.get('cf-connecting-ip')

  const ip = cfConnectingIp || realIp || forwarded?.split(',')[0] || 'unknown'

  // Combine IP with URL for per-endpoint rate limiting
  const url = new URL(req.url)
  return `${ip}:${url.pathname}`
}
