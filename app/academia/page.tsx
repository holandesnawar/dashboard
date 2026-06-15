import Shell from '@/components/Shell';
import Kpi from '@/components/Kpi';
import { getAcademiaOverview } from '@/lib/learnhouse';

export const dynamic = 'force-dynamic';

export default async function AcademiaPage() {
  const res = await getAcademiaOverview();

  if (!res.ok) {
    return (
      <Shell active="/academia" title="Academia" subtitle="Actividad y resultados de la plataforma (LearnHouse).">
        <div className="notice warn">
          <strong>No se pudo cargar la academia.</strong> {res.error}
        </div>
      </Shell>
    );
  }

  const { enrollments, students, lessons, users, activation } = res.data;
  const stamp = new Date(res.data.generated_at).toLocaleString('es-ES');

  return (
    <Shell active="/academia" title="Academia" subtitle="Actividad y resultados de la plataforma (LearnHouse).">
      <div className="section-title">Matrículas</div>
      <div className="grid">
        <Kpi label="Pagadas" value={enrollments.paid} sub={`${enrollments.conversion_rate_pct}% conversión`} accent />
        <Kpi label="Pendientes (sin pagar)" value={enrollments.pending} sub="Reenganche" />
        <Kpi label="Pagadas (30 días)" value={enrollments.paid_last_30d} />
        <Kpi label="Nuevas (7 días)" value={enrollments.new_last_7d} />
        <Kpi label="Abandonadas" value={enrollments.abandoned} />
      </div>

      <div className="section-title">Activación (pagó → empezó)</div>
      <div className="grid">
        <Kpi label="Tasa de activación" value={`${activation.activation_rate_pct}%`} sub="De quien paga, empieza" accent />
        <Kpi label="Crearon cuenta" value={activation.created_account} sub={`de ${activation.paid} pagadas`} />
        <Kpi label="Empezaron la formación" value={activation.started_course} />
        <Kpi label="Onboarding iniciado" value={activation.onboarding_started} />
      </div>

      <div className="section-title">Alumnos y actividad</div>
      <div className="grid">
        <Kpi label="Alumnos (total)" value={students.total} accent />
        <Kpi label="Activos (7 días)" value={students.active_last_7d} />
        <Kpi label="Activos (30 días)" value={students.active_last_30d} />
        <Kpi label="Racha más larga" value={`${students.max_streak} días`} />
        <Kpi label="Racha media" value={`${students.avg_streak} días`} />
        <Kpi label="Tiempo total" value={`${students.total_time_hours} h`} sub="Acumulado de alumnos" />
      </div>

      <div className="section-title">Lecciones</div>
      <div className="grid">
        <Kpi label="Completadas (total)" value={lessons.completions_total} accent />
        <Kpi label="Completadas (7 días)" value={lessons.completions_last_7d} />
        <Kpi label="Tiempo en lecciones" value={`${lessons.time_hours} h`} />
        <Kpi label="Usuarios verificados" value={`${users.verified} / ${users.total}`} />
      </div>

      <div className="section-title soon">Calidad académica y encuestas</div>
      <div className="notice soon">
        <strong>Próximamente.</strong> Cuando creemos las encuestas de alumnos en la plataforma,
        aquí verás satisfacción, valoración de la formación y resultados por módulo.
      </div>

      <div className="stamp" style={{ marginTop: 18 }}>
        Datos actualizados: {stamp}
      </div>
    </Shell>
  );
}
