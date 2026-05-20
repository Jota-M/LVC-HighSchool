'use client';
// app/dashboard/docente/materiales/page.tsx
 
import { useAuth } from '@/context/AuthContext';
import DocenteMateriales from '@/components/materiales/DocenteMateriales';
import { Box, CircularProgress } from '@mui/material';
 
export default function DocenteMaterialesPage() {
  const { user, loading } = useAuth();
 
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: '#0288d1' }} />
      </Box>
    );
  }
 
  return <DocenteMateriales user={user} />;
}
 