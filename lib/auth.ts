/**
 * Sesión del panel: una sola contraseña de admin + cookie firmada (HMAC-SHA256).
 *
 * Sin base de datos ni dependencias externas. El token de sesión es:
 *     `${exp}.${hmac(exp)}`
 * donde `exp` es el timestamp (ms) de caducidad y la firma se hace con
 * DASHBOARD_SESSION_SECRET. Se verifica firma + caducidad en cada petición
 * (middleware). Usa Web Crypto, por lo que funciona tanto en el runtime edge
 * (middleware) como en Node (route handlers).
 */

export const SESSION_COOKIE = 'dash_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 horas

function getSecret(): string {
  return process.env.DASHBOARD_SESSION_SECRET ?? '';
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacHex(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return toHex(sig);
}

/** Comparación en tiempo constante de dos cadenas hex de igual longitud. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Comprueba la contraseña enviada contra DASHBOARD_PASSWORD (tiempo ~constante). */
export async function verifyPassword(input: string): Promise<boolean> {
  const expected = process.env.DASHBOARD_PASSWORD ?? '';
  if (!expected) return false;
  // Hasheamos ambas para comparar en longitud fija y evitar fugas por timing.
  const secret = getSecret() || 'fallback-compare-salt';
  const [a, b] = await Promise.all([
    hmacHex(input, secret),
    hmacHex(expected, secret),
  ]);
  return timingSafeEqual(a, b);
}

export async function createSessionToken(): Promise<string> {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = String(exp);
  const sig = await hmacHex(payload, getSecret());
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token?: string | null): Promise<boolean> {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;

  const idx = token.lastIndexOf('.');
  if (idx <= 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);

  const expected = await hmacHex(payload, secret);
  if (!timingSafeEqual(sig, expected)) return false;

  const exp = Number(payload);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  return true;
}

/** Atributos de la cookie. SameSite=None+Secure para que viaje dentro del
 *  iframe de Nextcloud (contexto cross-site). */
export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  };
}
