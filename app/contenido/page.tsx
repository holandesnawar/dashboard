import Shell from '@/components/Shell';
import BarList from '@/components/BarList';
import { getAcademiaOverview } from '@/lib/learnhouse';

export const dynamic = 'force-dynamic';

export default async function ContenidoPage() {
  const res = await getAcademiaOverview();

  if (!res.ok) {
    return (
      <Shell active="/contenido" title="Contenido" subtitle="Cómo rinde la formación: módulos, ejercicios y bloqueos.">
        <div className="notice warn"><strong>Academia sin conectar.</strong> {res.error}</div>
      </Shell>
    );
  }

  const c = res.data.content;
  const hasData = c.modules.length > 0 || c.exercise_sections.length > 0;

  return (
    <Shell active="/contenido" title="Contenido de la formación" subtitle="Qué módulos se completan, dónde fallan y dónde se atascan.">
      {!hasData ? (
        <div className="notice">
          Aún no hay actividad suficiente en la formación para mostrar métricas de contenido.
          Aparecerán en cuanto los alumnos completen lecciones y ejercicios.
        </div>
      ) : null}

      <div className="two-col">
        <BarList
          title="Lecciones completadas por módulo"
          rows={c.modules.map((m) => ({ label: m.title, value: m.completions }))}
        />
        <BarList
          title="Alumnos que han tocado cada módulo"
          alt
          rows={c.modules.map((m) => ({ label: m.title, value: m.students }))}
        />
      </div>

      <div className="two-col" style={{ marginTop: 16 }}>
        <BarList
          title="Nota media por tipo de ejercicio"
          rows={c.exercise_sections.map((s) => ({ label: s.label, value: s.avg_score_pct, suffix: '%' }))}
          empty="Sin intentos de ejercicios todavía."
        />
        <BarList
          title="Dónde se atascan ahora (posición actual)"
          alt
          rows={c.stuck.by_module.map((s) => ({ label: s.label, value: s.students }))}
          empty="Nadie con posición guardada aún."
        />
      </div>

      <div className="two-col" style={{ marginTop: 16 }}>
        <BarList
          title="Palabras que más se fallan"
          rows={c.weak_words.map((w) => ({ label: w.label, value: w.fails }))}
          empty="Sin fallos registrados todavía."
        />
        <BarList
          title="Lecciones más completadas"
          alt
          rows={c.top_lessons.map((l) => ({ label: l.lesson_id, value: l.completions }))}
          empty="Sin lecciones completadas todavía."
        />
      </div>

      <div style={{ marginTop: 18 }} className="notice">
        💡 <strong>Cómo leerlo:</strong> si un módulo tiene muchos alumnos pero pocas lecciones
        completadas, es donde la gente se atranca. Las <em>palabras más falladas</em> te dicen qué
        vocabulario reforzar.
      </div>
    </Shell>
  );
}
