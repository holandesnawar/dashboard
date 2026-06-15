import { NextResponse, type NextRequest } from 'next/server';
import {
  createSessionToken,
  sessionCookieOptions,
  verifyPassword,
} from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * Rate-limit sencillo en memoria por IP: máx. 8 intentos cada 5 min.
 * En serverless el contador puede reiniciarse entre instancias, pero frena
 * los ataques de fuerza bruta básicos. El honeypot + cookie firmada hacen el
 * resto. (Para algo más robusto, fase 2: rate-limit con Upstash/Redis.)
 */
const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now > rec.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Demasiados intentos.' }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    password?: string;
    website?: string;
  };

  // Honeypot: si viene relleno, es un bot. Respondemos genérico.
  if (body.website && body.website.trim() !== '') {
    return NextResponse.json({ error: 'Contraseña incorrecta.' }, { status: 401 });
  }

  const ok = await verifyPassword(body.password ?? '');
  if (!ok) {
    return NextResponse.json({ error: 'Contraseña incorrecta.' }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...sessionCookieOptions(), value: token });
  return res;
}
