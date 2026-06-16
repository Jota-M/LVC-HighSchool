'use client';
// app/dashboard/docente/materiales/detalle/[id]/page.tsx

import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import MaterialDetalleView from '../../../../../../components/materiales/Materialdetalleview';
import { Box, CircularProgress } from '@mui/material';

export default function MaterialDetallePage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const materialId = params?.id ? Number(params.id) : null;

  if (loading || !materialId || isNaN(materialId)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: '#0288d1' }} />
      </Box>
    );
  }

  return (
    <MaterialDetalleView
      materialId={materialId}
      esDocente={true}
    />
  );
}