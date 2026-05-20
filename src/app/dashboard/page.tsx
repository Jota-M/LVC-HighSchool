'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { getRoleBasedRoute } from '../../lib/roleRoutes';
import { Box, CircularProgress } from '@mui/material';

export default function DashboardRootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
  if (loading) return;
  if (!user) {
    router.replace('/login');
    return;
  }

  const roles = user.roles?.map(r => r.nombre) ?? [];
  console.log('🎯 ROLES DEL USUARIO:', roles);
  console.log('🎯 RUTA CALCULADA:', getRoleBasedRoute(roles));
  
  router.replace(getRoleBasedRoute(roles));
}, [user, loading]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress />
    </Box>
  );
}