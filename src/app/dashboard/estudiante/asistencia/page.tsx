'use client';
// app/dashboard/estudiante/asistencia/page.tsx

import { useAuth } from '@/context/AuthContext';
import EstudianteAsistencia from '@/components/estudiante/asistencia/EstudianteAsistencia';
import { Box, CircularProgress } from '@mui/material';

export default function EstudianteAsistenciaPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: '#0288d1' }} />
      </Box>
    );
  }

  return <EstudianteAsistencia user={user} />;
}