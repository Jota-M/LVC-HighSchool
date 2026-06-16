'use client';

import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

export default function ProtectedRoute({ children, requiredRoles, requiredPermissions }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    if (!user) {
      router.replace(`/login?redirect=${pathname}`);
    }
  }, [user, loading, mounted]);

  // Before hydration completes, render nothing (matches server output)
  if (!mounted) return null;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return null;

  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = user.roles?.map(r => r.nombre) ?? [];
    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    if (!hasRole) return null;
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(p =>
      user.permisos?.some(up => up.nombre === p)
    );
    if (!hasPermission) return null;
  }

  return <>{children}</>;
}