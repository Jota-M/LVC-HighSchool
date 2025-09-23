// hooks/useAuthGuard.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthGuard(requiredRole?: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
      router.replace('/login');
      return;
    }

    if (requiredRole && userRole !== requiredRole) {
      router.replace('/no-autorizado'); 
      return;
    }

    setRole(userRole);
    setAuthorized(true);
    setLoading(false);
  }, [requiredRole, router]);

  return { loading, authorized, role };
}
