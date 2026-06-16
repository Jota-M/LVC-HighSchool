'use client';
// app/dashboard/estudiante/materiales/page.tsx

import { useAuth } from '@/context/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import MateriasSelector from '@/components/estudiante/materiales/MateriasSelector';

export default function EstudianteMaterialesPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: '#0288d1' }} />
      </Box>
    );
  }

  return <MateriasSelector user={user} />;
}