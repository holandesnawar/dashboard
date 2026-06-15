/**
 * Cliente de systeme.io (CRM) para los leads.
 *
 * NOTA: la estructura exacta de la respuesta de systeme.io no se ha podido
 * verificar en vivo desde el sandbox (host bloqueado por la política de red).
 * Este cliente está escrito de forma TOLERANTE: normaliza varias formas
 * posibles de la respuesta. Una vez desplegado en Vercel (sin esa restricción)
 * o tras añadir `api.systeme.io` al allowlist del entorno, validamos y
 * afinamos los nombres de campo si hiciera falta.
 *
 * Tags conocidos (de nawar-web): "Lista de espera", "Matriculado sin pagar".
 * Campos conocidos: cmo_conociste_nawar, nivel_de_neerlands, country, city,
 * first_name / surname, phone.
 */

const BASE = 'https://api.systeme.io/api';

export type Lead = {
  id: string | number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  tags: string[];
  fields: Record<string, string>;
  registeredAt: string;
};

export type LeadsResult =
  | { ok: true; leads: Lead[]; total: number; hasMore: boolean }
  | { ok: false; error: string };

function headers(): Record<string, string> {
  return {
    'X-API-Key': process.env.SYSTEME_API_KEY ?? '',
    accept: 'application/json',
  };
}

/** Normaliza el array `fields` (o un objeto) a un diccionario slug→value. */
function normalizeFields(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(raw)) {
    for (const f of raw as Array<{ slug?: string; fieldName?: string; value?: unknown }>) {
      const slug = f?.slug ?? f?.fieldName;
      if (slug && f.value != null) out[slug] = String(f.value);
    }
  } else if (raw && typeof raw === 'object') {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (v != null) out[k] = String(v);
    }
  }
  return out;
}

function normalizeTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return (raw as Array<{ name?: string } | string>)
    .map((t) => (typeof t === 'string' ? t : t?.name ?? ''))
    .filter(Boolean) as string[];
}

function normalizeLead(c: Record<string, unknown>): Lead {
  const fields = normalizeFields(c.fields);
  return {
    id: (c.id as string | number) ?? '',
    email: String(c.email ?? ''),
    firstName: String(c.firstName ?? fields.first_name ?? ''),
    lastName: String(c.surname ?? fields.surname ?? ''),
    phone: String(c.phone ?? fields.phone ?? ''),
    tags: normalizeTags(c.tags),
    fields,
    registeredAt: String(c.registeredAt ?? c.createdAt ?? c.created_at ?? ''),
  };
}

/**
 * Trae una página de leads (los más recientes que devuelva systeme.io).
 * `limit` por defecto 50.
 */
export async function getLeads(page = 1, limit = 50): Promise<LeadsResult> {
  if (!process.env.SYSTEME_API_KEY) {
    return { ok: false, error: 'Falta SYSTEME_API_KEY.' };
  }
  try {
    const url = `${BASE}/contacts?itemsPerPage=${limit}&page=${page}`;
    const res = await fetch(url, { headers: headers(), cache: 'no-store' });
    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: 'systeme.io rechazó la API key (401/403).' };
    }
    if (!res.ok) return { ok: false, error: `systeme.io respondió ${res.status}.` };

    const data = (await res.json()) as Record<string, unknown>;
    const items: Record<string, unknown>[] = Array.isArray(data.items)
      ? (data.items as Record<string, unknown>[])
      : Array.isArray(data)
        ? (data as Record<string, unknown>[])
        : [];
    const leads = items.map(normalizeLead);

    // systeme.io devuelve metadatos de paginación de forma variable.
    const total =
      (typeof data.totalCount === 'number' && data.totalCount) ||
      (typeof (data as { pagination?: { total?: number } }).pagination?.total === 'number' &&
        (data as { pagination?: { total?: number } }).pagination!.total) ||
      leads.length;
    const hasMore = leads.length >= limit;

    return { ok: true, leads, total: total as number, hasMore };
  } catch (e) {
    return { ok: false, error: `No se pudo conectar con systeme.io: ${(e as Error).message}` };
  }
}

/** Cuenta de tags sobre la muestra recibida (no es el total global de la cuenta). */
export function countByTag(leads: Lead[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const l of leads) {
    for (const t of l.tags) out[t] = (out[t] ?? 0) + 1;
  }
  return out;
}
