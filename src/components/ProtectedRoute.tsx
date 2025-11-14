'use client';

import { useAuthGuard } from '../hooks/useAuthGuard';
import { Box, CircularProgress } from '@mui/material';

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
  const { user, loading } = useAuthGuard(requiredRoles);

  if (loading) {
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

  // Verificar permisos si se requieren
  if (requiredPermissions && requiredPermissions.length > 0 && user) {
    const hasPermission = requiredPermissions.some((permission) =>
      user.permisos.some((p) => p.nombre === permission)
    );

    if (!hasPermission) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <h2>Acceso Denegado</h2>
          <p>No tienes los permisos necesarios para acceder a esta página.</p>
        </Box>
      );
    }
  }

  return <>{children}</>;
}