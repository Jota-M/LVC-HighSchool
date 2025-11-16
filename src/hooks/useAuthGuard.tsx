'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export function useAuthGuard(requiredRoles?: string[], redirect: boolean = true) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir si redirect=true
    if (redirect && !loading && !user) {
      router.replace('/login');
      return;
    }

    if (redirect && !loading && user && requiredRoles && requiredRoles.length > 0) {
      const userRoles = user.roles?.map(r => r.nombre) || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        router.replace('/unauthorized');
      }
    }
  }, [loading, user, requiredRoles, redirect, router]);

  return { user, loading };
}
