import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

/**
 * (Next 16: convención "proxy", antes "middleware".)
 * Protege todo el panel. Sin sesión válida:
 *  - páginas  → redirige a /login
 *  - rutas /api → responde 401
 *
 * Rutas públicas: /login y /api/login (el propio formulario de acceso).
 */
const PUBLIC_PATHS = ['/login', '/api/login'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token);
  if (valid) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const loginUrl = new URL('/login', req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Ejecuta el middleware en todo salvo estáticos de Next y favicon.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
};
