import LoginForm from './LoginForm';

export const metadata = { title: 'Acceso · Panel Holandés Nawar' };

export default function LoginPage() {
  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>Panel Holandés Nawar</h1>
        <p className="sub">Acceso privado. Introduce la contraseña de administrador.</p>
        <LoginForm />
      </div>
    </div>
  );
}
