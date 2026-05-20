'use client';

import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

export default function ProtectedRoute({ children, requiredRoles, requiredPermissions }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?redirect=${pathname}`);
    }
  }, [user, loading]); // ← sin router/pathname en deps para evitar loops

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return null;

  // Verificar roles
  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = user.roles?.map(r => r.nombre) ?? [];
    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    if (!hasRole) return null; // dashboard/page.tsx ya redirigió al lugar correcto
  }

  // Verificar permisos
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(p =>
      user.permisos?.some(up => up.nombre === p)
    );
    if (!hasPermission) return null;
  }

  return <>{children}</>;
}