import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limit (best-effort only; not shared across instances)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;

// Simple patterns for obvious attack payloads
const SUSPICIOUS_PATTERNS = [
  /powershell/i,
  /cmd\.exe/i,
  /bash/i,
  /wget/i,
  /curl/i,
  /base64/i,
  /eval\(/i,
  /exec\(/i,
  /__proto__/i,
  /constructor/i,
  /\.\.\/\.\.\//,
  /<script/i,
  /javascript:/i,
  /xmrig/i,
  /miner/i,
  /bot/i,
  /aria2c/i,
];

const BOT_PATTERNS = [/masscan/i, /nmap/i, /nikto/i, /sqlmap/i, /acunetix/i, /burp/i, /metasploit/i, /havij/i];

const ALLOW_PATHS = ['/api/health']; // Do not guard the health endpoint

function isIPAddress(host: string): boolean {
  return /^\d+\.\d+\.\d+\.\d+$/.test(host);
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Skip guards for health probes
  if (ALLOW_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  const host = request.headers.get('host') || '';

  // Block direct IP access
  if (isIPAddress(host)) {
    console.warn(`[SECURITY] Blocked direct IP access from ${ip}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Rate limiting
  if (!checkRateLimit(ip)) {
    console.warn(`[SECURITY] Rate limit exceeded for ${ip}`);
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  // Suspicious URL patterns
  const fullUrl = request.url;
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(fullUrl) || pattern.test(pathname)) {
      console.warn(`[SECURITY] Blocked suspicious URL pattern from ${ip}: ${pathname}`);
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  // Suspicious query params
  for (const [key, value] of searchParams.entries()) {
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(key) || pattern.test(value)) {
        console.warn(`[SECURITY] Blocked suspicious query parameter from ${ip}: ${key}=${value}`);
        return new NextResponse('Forbidden', { status: 403 });
      }
    }
  }

  // Bot user agents
  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      console.warn(`[SECURITY] Blocked bot user agent from ${ip}: ${userAgent}`);
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  // Block requests with no user agent
  if (!userAgent) {
    console.warn(`[SECURITY] Blocked request with no user agent from ${ip}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Set security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';"
  );
  response.headers.set(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );

  return response;
}

// Apply to all non-static routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff|woff2)$).*)',
  ],
};

