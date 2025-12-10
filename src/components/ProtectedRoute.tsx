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

export default function ProtectedRoute({
  children,
  requiredRoles,
  requiredPermissions,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 🔍 DEBUG: Ver qué está pasando
  useEffect(() => {
    console.log('🔍 ProtectedRoute Debug:', {
      pathname,
      loading,
      user: user ? 'Usuario existe' : 'No hay usuario',
      userRoles: user?.roles?.map(r => r.nombre),
    });
  }, [pathname, loading, user]);

  useEffect(() => {
    // Solo redirigir cuando NO está cargando
    if (!loading && !user) {
      console.log('❌ No hay usuario → Redirigiendo a /login');
      router.push(`/login?redirect=${pathname}`);
    }
  }, [user, loading, router, pathname]);

  // Mostrar loading
  if (loading) {
    console.log('⏳ Cargando usuario...');
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Si no hay usuario, no mostrar nada (está redirigiendo)
  if (!user) {
    console.log('🚫 No hay usuario, retornando null');
    return null;
  }

  // Verificar roles si se requieren
  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = user.roles?.map(r => r.nombre) || [];
    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      console.log('⚠️ Usuario no tiene roles requeridos:', requiredRoles);
      router.push('/dashboard');
      return null;
    }
  }

  // Verificar permisos si se requieren
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some((permission) =>
      user.permisos?.some((p) => p.nombre === permission)
    );

    if (!hasPermission) {
      console.log('⚠️ Usuario no tiene permisos requeridos:', requiredPermissions);
      router.push('/dashboard');
      return null;
    }
  }

  // ✅ Todo OK → Mostrar contenido
  console.log('✅ Usuario autenticado, mostrando contenido');
  return <>{children}</>;
}