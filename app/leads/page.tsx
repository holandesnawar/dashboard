import Shell from '@/components/Shell';
import Kpi from '@/components/Kpi';
import { countByTag, getLeads } from '@/lib/systeme';

export const dynamic = 'force-dynamic';

function fmtDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function LeadsPage() {
  const res = await getLeads(1, 100);

  if (!res.ok) {
    return (
      <Shell active="/leads" title="Leads" subtitle="Lista de espera y matrículas desde la web principal.">
        <div className="notice warn">
          <strong>No se pudieron cargar los leads.</strong> {res.error}
          <br />
          Revisa <code>SYSTEME_API_KEY</code> en las variables de Vercel.
        </div>
      </Shell>
    );
  }

  const tags = countByTag(res.leads);
  const espera = tags['Lista de espera'] ?? 0;
  const sinPagar = tags['Matriculado sin pagar'] ?? 0;

  return (
    <Shell active="/leads" title="Leads" subtitle="Lista de espera y matrículas desde la web principal (systeme.io).">
      <div className="grid">
        <Kpi label="Contactos (total)" value={res.total} accent />
        <Kpi label="Lista de espera" value={espera} sub="En esta muestra" />
        <Kpi label="Matriculado sin pagar" value={sinPagar} sub="Reenganche" />
        <Kpi label="Cargados aquí" value={res.leads.length} sub={res.hasMore ? 'Hay más' : 'Completo'} />
      </div>

      <div className="section-title">Últimos leads</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Nombre</th>
              <th>Nivel</th>
              <th>Cómo nos conoció</th>
              <th>País / Ciudad</th>
              <th>Etiquetas</th>
              <th>Alta</th>
            </tr>
          </thead>
          <tbody>
            {res.leads.map((l) => (
              <tr key={String(l.id)}>
                <td>{l.email || '—'}</td>
                <td>{[l.firstName, l.lastName].filter(Boolean).join(' ') || '—'}</td>
                <td>{l.fields['nivel_de_neerlands'] ?? '—'}</td>
                <td>{l.fields['cmo_conociste_nawar'] ?? '—'}</td>
                <td>{[l.fields['country'], l.fields['city']].filter(Boolean).join(' · ') || '—'}</td>
                <td>
                  {l.tags.length
                    ? l.tags.map((t) => (
                        <span key={t} className={`badge${t === 'Matriculado sin pagar' ? ' pending' : ''}`}>
                          {t}
                        </span>
                      ))
                    : '—'}
                </td>
                <td>{fmtDate(l.registeredAt)}</td>
              </tr>
            ))}
            {res.leads.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ color: 'var(--muted)' }}>
                  Aún no hay leads.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 18 }} className="notice">
        Nota: los nombres exactos de algunos campos de systeme.io se confirmarán al conectar en vivo;
        si alguna columna sale vacía, la ajustamos en un minuto.
      </div>
    </Shell>
  );
}
