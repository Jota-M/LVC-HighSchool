'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      router.push('/login');
      return;
    }

    if (role !== 'admin') {
      router.push('/no-autorizado'); // puedes crear esta página o redirigir a login
      return;
    }

    setAuthorized(true);
    setLoading(false);
  }, [router]);

  if (loading) return <p className="text-white p-8">Cargando...</p>;

  if (!authorized) return null;

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Bienvenido, Administrador 👑</h1>
      <p>Esta es tu área administrativa exclusiva.</p>
    </div>
  );
}
