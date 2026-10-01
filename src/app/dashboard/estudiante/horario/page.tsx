'use client';
// app/dashboard/estudiante/horario/page.tsx

import { useAuth } from '@/context/AuthContext';
import EstudianteHorario from '@/components/estudiante/horario/EstudianteHorario';
import { Box, Container, CircularProgress, useTheme } from '@mui/material';

export default function EstudianteHorarioPage() {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = isDark ? '#facc15' : '#0288d1';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: accentColor }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <EstudianteHorario user={user} />
      </Container>
    </Box>
  );
}