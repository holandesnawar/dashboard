'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <button className="logout" onClick={logout} disabled={loading}>
      {loading ? 'Saliendo…' : 'Cerrar sesión'}
    </button>
  );
}
