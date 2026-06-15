import Sidebar from './Sidebar';
import LogoutButton from './LogoutButton';

export default function Shell({
  active,
  title,
  subtitle,
  children,
}: {
  active: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="app">
      <Sidebar active={active} />
      <main className="content">
        <div className="topbar">
          <div className="page-head">
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <LogoutButton />
        </div>
        {children}
      </main>
    </div>
  );
}
