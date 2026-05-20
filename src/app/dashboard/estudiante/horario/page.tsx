'use client';
// app/dashboard/estudiante/horario/page.tsx

import { useAuth } from '@/context/AuthContext';
import EstudianteHorario from '@/components/estudiante/horario/EstudianteHorario';
import { Box, CircularProgress } from '@mui/material';

export default function EstudianteHorarioPage() {
  const { user, loading } = useAuth();

  if (loading) return (
    <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <CircularProgress sx={{ color:'#6366F1' }} />
    </Box>
  );

  return <EstudianteHorario user={user} />;
}