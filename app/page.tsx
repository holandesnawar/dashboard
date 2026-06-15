import Shell from '@/components/Shell';
import Kpi from '@/components/Kpi';
import { getAcademiaOverview } from '@/lib/learnhouse';
import { getLeads } from '@/lib/systeme';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const [academia, leads] = await Promise.all([getAcademiaOverview(), getLeads(1, 50)]);

  return (
    <Shell active="/" title="Resumen" subtitle="Vista rápida de leads y academia.">
      {/* Leads */}
      <div className="section-title">Leads (web principal · systeme.io)</div>
      {leads.ok ? (
        <div className="grid">
          <Kpi label="Leads (muestra)" value={leads.total} sub="Contactos en systeme.io" accent />
          <Kpi label="En esta vista" value={leads.leads.length} sub={leads.hasMore ? 'Hay más páginas' : 'Todos cargados'} />
        </div>
      ) : (
        <div className="notice warn">
          <strong>Leads sin conectar.</strong> {leads.error} Configura <code>SYSTEME_API_KEY</code> en Vercel.
        </div>
      )}

      {/* Academia */}
      <div className="section-title">Academia (LearnHouse)</div>
      {academia.ok ? (
        <div className="grid">
          <Kpi label="Matrículas pagadas" value={academia.data.enrollments.paid} sub={`${academia.data.enrollments.conversion_rate_pct}% conversión`} accent />
          <Kpi label="Sin pagar (pendientes)" value={academia.data.enrollments.pending} sub="Candidatos a reenganche" />
          <Kpi label="Alumnos activos (7d)" value={academia.data.students.active_last_7d} sub={`${academia.data.students.total} en total`} />
          <Kpi label="Lecciones completadas" value={academia.data.lessons.completions_total} sub={`${academia.data.lessons.completions_last_7d} esta semana`} />
        </div>
      ) : (
        <div className="notice warn">
          <strong>Academia sin conectar.</strong> {academia.error}
        </div>
      )}

      <div style={{ marginTop: 26 }} className="notice">
        Este es el panel base. Las secciones <strong>Leads</strong> y <strong>Academia</strong> (menú
        izquierdo) tienen el detalle. Las <strong>encuestas y la calidad académica</strong> aparecerán
        cuando creemos las encuestas en la plataforma.
      </div>
    </Shell>
  );
}
