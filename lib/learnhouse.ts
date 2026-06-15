/**
 * Cliente del endpoint de KPIs de la academia (LearnHouse).
 * GET /api/v1/dashboard/overview con la cabecera X-Dashboard-Key.
 */

export type AcademiaOverview = {
  generated_at: string;
  enrollments: {
    total: number;
    pending: number;
    paid: number;
    abandoned: number;
    paid_last_30d: number;
    new_last_7d: number;
    conversion_rate_pct: number;
  };
  students: {
    total: number;
    active_last_7d: number;
    active_last_30d: number;
    max_streak: number;
    avg_streak: number;
    total_time_hours: number;
    onboarding_started: number;
  };
  lessons: {
    completions_total: number;
    completions_last_7d: number;
    time_hours: number;
  };
  users: { total: number; verified: number };
  surveys: { available: boolean; note?: string };
};

export type AcademiaResult =
  | { ok: true; data: AcademiaOverview }
  | { ok: false; error: string };

export async function getAcademiaOverview(): Promise<AcademiaResult> {
  const base = (process.env.LEARNHOUSE_API_BASE ?? '').replace(/\/$/, '');
  const key = process.env.LEARNHOUSE_DASHBOARD_API_KEY ?? '';
  if (!base) return { ok: false, error: 'Falta LEARNHOUSE_API_BASE.' };
  if (!key) return { ok: false, error: 'Falta LEARNHOUSE_DASHBOARD_API_KEY.' };

  try {
    const res = await fetch(`${base}/api/v1/dashboard/overview`, {
      headers: { 'X-Dashboard-Key': key, accept: 'application/json' },
      cache: 'no-store',
    });
    if (res.status === 401) return { ok: false, error: 'Clave de dashboard inválida (revisa que coincida en Railway y Vercel).' };
    if (res.status === 503) return { ok: false, error: 'El endpoint de la academia aún no está configurado en Railway (LEARNHOUSE_DASHBOARD_API_KEY).' };
    if (!res.ok) return { ok: false, error: `La academia respondió ${res.status}.` };
    const data = (await res.json()) as AcademiaOverview;
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: `No se pudo conectar con la academia: ${(e as Error).message}` };
  }
}
