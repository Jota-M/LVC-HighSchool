'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export function useAuthGuard(requiredRoles?: string[]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user && requiredRoles && requiredRoles.length > 0) {
      const userRoles = user.roles?.map(r => r.nombre) || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        router.replace('/unauthorized');
      }
    }
  }, [loading, user, requiredRoles, router]);

  return { user, loading };
}
