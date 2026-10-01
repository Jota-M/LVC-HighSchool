'use client';
// app/dashboard/estudiante/materiales/page.tsx

import { useAuth } from '@/context/AuthContext';
import { Box, CircularProgress, Container } from '@mui/material';
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

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 2.5, sm: 4 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <MateriasSelector user={user} />
      </Container>
    </Box>
  );
}