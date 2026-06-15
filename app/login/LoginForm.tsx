'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, website }),
      });
      if (res.ok) {
        router.replace('/');
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) setError('Demasiados intentos. Espera un momento.');
      else setError(data?.error ?? 'Contraseña incorrecta.');
    } catch {
      setError('No se pudo conectar. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} autoComplete="off">
      {/* honeypot anti-bots: invisible para humanos */}
      <input
        className="hp"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        aria-hidden="true"
      />
      <div className="field">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
        />
      </div>
      <button className="btn" type="submit" disabled={loading}>
        {loading ? 'Entrando…' : 'Entrar'}
      </button>
      {error ? <div className="error-msg">{error}</div> : null}
    </form>
  );
}
