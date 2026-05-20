'use client';
// app/dashboard/estudiante/materias/page.tsx

import { useAuth } from '@/context/AuthContext';
import EstudianteMaterias from '@/components/estudiante/materias/EstudianteMaterias';
import { Box, CircularProgress } from '@mui/material';

export default function EstudianteMateriasPage() {
  const { user, loading } = useAuth();

  if (loading) return (
    <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <CircularProgress sx={{ color:'#6366F1' }} />
    </Box>
  );

  return <EstudianteMaterias user={user} />;
}