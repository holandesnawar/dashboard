export default function Kpi({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="card kpi">
      <div className="label">{label}</div>
      <div className={`value${accent ? ' accent' : ''}`}>{value}</div>
      {sub ? <div className="sub">{sub}</div> : null}
    </div>
  );
}
