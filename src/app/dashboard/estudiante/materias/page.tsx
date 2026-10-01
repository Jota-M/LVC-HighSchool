'use client';
// app/dashboard/estudiante/materias/page.tsx

import { useAuth } from '@/context/AuthContext';
import EstudianteMaterias from '@/components/estudiante/materias/EstudianteMaterias';
import { Box, CircularProgress, Container } from '@mui/material';

export default function EstudianteMateriasPage() {
  const { user, loading } = useAuth();

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress sx={{ color: '#0288d1' }} />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 2.5, sm: 4 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <EstudianteMaterias user={user} />
      </Container>
    </Box>
  );
}