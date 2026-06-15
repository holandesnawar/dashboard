export default function BarList({
  title,
  rows,
  alt,
  empty = 'Sin datos todavía.',
}: {
  title?: string;
  rows: { label: string; value: number; suffix?: string }[];
  alt?: boolean;
  empty?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div>
      {title ? <div className="section-title">{title}</div> : null}
      <div className="barlist">
        {rows.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: 13.5 }}>{empty}</div>
        ) : (
          rows.map((r) => (
            <div className="barrow" key={r.label}>
              <div className="top">
                <span>{r.label}</span>
                <span className="n">
                  {r.value}
                  {r.suffix ?? ''}
                </span>
              </div>
              <div className="bartrack">
                <div className={`barfill${alt ? ' alt' : ''}`} style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
