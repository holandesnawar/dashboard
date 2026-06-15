import Link from 'next/link';

type Item = { href: string; label: string; icon: string };

const ITEMS: Item[] = [
  { href: '/', label: 'Resumen', icon: '◈' },
  { href: '/embudo', label: 'Embudo', icon: '⧗' },
  { href: '/leads', label: 'Leads', icon: '◉' },
  { href: '/academia', label: 'Academia', icon: '◆' },
  { href: '/contenido', label: 'Contenido', icon: '▤' },
];

export default function Sidebar({ active }: { active: string }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="dot" /> Holandés Nawar
      </div>
      <nav>
        {ITEMS.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={`nav-link${active === it.href ? ' active' : ''}`}
          >
            <span aria-hidden>{it.icon}</span> {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
