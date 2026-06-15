import Shell from '@/components/Shell';
import Kpi from '@/components/Kpi';
import { getAcademiaOverview } from '@/lib/learnhouse';
import { getLeads } from '@/lib/systeme';

export const dynamic = 'force-dynamic';

function pct(part: number, whole: number): string {
  if (!whole) return '—';
  return `${Math.round((part / whole) * 1000) / 10}%`;
}

function FunnelStep({ n, name, sub }: { n: number; name: string; sub?: string }) {
  return (
    <div className="funnel-step">
      <div className="left">
        <span className="bignum">{n}</span>
        <span className="name">{name}</span>
      </div>
      {sub ? <span className="pct">{sub}</span> : null}
    </div>
  );
}

export default async function EmbudoPage() {
  const [academia, leads] = await Promise.all([getAcademiaOverview(), getLeads(1, 100)]);

  if (!academia.ok) {
    return (
      <Shell active="/embudo" title="Embudo" subtitle="De visita a alumno: dónde ganas y dónde pierdes.">
        <div className="notice warn"><strong>Academia sin conectar.</strong> {academia.error}</div>
      </Shell>
    );
  }

  const a = academia.data;
  const leadCount = leads.ok ? leads.total : null;
  const matriculas = a.funnel.matriculas;
  const pagadas = a.funnel.pagadas;

  return (
    <Shell active="/embudo" title="Embudo" subtitle="De lead a alumno: conversión paso a paso.">
      <div className="section-title">Captación → Venta</div>
      <div className="funnel">
        <FunnelStep
          n={leadCount ?? matriculas}
          name={leadCount != null ? 'Leads (systeme.io)' : 'Leads — conecta systeme.io'}
        />
        <div className="funnel-arrow">↓ {leadCount ? pct(matriculas, leadCount) : ''} pasan a matrícula</div>
        <FunnelStep n={matriculas} name="Matrículas iniciadas" sub={leadCount ? `de ${leadCount} leads` : undefined} />
        <div className="funnel-arrow">↓ {pct(pagadas, matriculas)} pagan</div>
        <FunnelStep n={pagadas} name="Matrículas pagadas ✓" sub={`${a.funnel.conversion_matricula_pago_pct}% conversión`} />
      </div>

      <div className="section-title">Conversión y fugas</div>
      <div className="grid">
        <Kpi label="Conversión matrícula→pago" value={`${a.enrollments.conversion_rate_pct}%`} accent />
        <Kpi label="Carritos abandonados" value={a.enrollments.carts_abandoned_24h} sub="Pendientes >24h" />
        <Kpi label="Pendientes (sin pagar)" value={a.enrollments.pending} sub="Reenganche" />
        <Kpi label="Nuevas matrículas (7d)" value={a.enrollments.new_last_7d} />
        <Kpi label="Pagadas (30d)" value={a.enrollments.paid_last_30d} />
      </div>

      <div className="section-title">Activación (pagó → empezó de verdad)</div>
      <div className="funnel">
        <FunnelStep n={a.activation.paid} name="Pagaron" />
        <div className="funnel-arrow">↓ {pct(a.activation.created_account, a.activation.paid)} crean cuenta</div>
        <FunnelStep n={a.activation.created_account} name="Crearon cuenta" />
        <div className="funnel-arrow">↓ {pct(a.activation.started_course, a.activation.paid)} empiezan</div>
        <FunnelStep
          n={a.activation.started_course}
          name="Empezaron la formación"
          sub={`${a.activation.activation_rate_pct}% activación`}
        />
      </div>

      {a.activation.paid > 0 && a.activation.activation_rate_pct < 60 ? (
        <div style={{ marginTop: 16 }} className="notice warn">
          <strong>Ojo a la activación.</strong> Solo el {a.activation.activation_rate_pct}% de quien paga
          empieza la formación. Un email de bienvenida más claro o un recordatorio puede subir mucho este número.
        </div>
      ) : null}
    </Shell>
  );
}
