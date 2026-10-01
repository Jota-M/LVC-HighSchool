'use client';
// app/dashboard/estudiante/materiales/detalle/[id]/page.tsx

import React from 'react';
import { useParams } from 'next/navigation';
import { usePerfilEstudiante } from '@/hooks/useEstudiante';
import MaterialDetalleView from '@/components/materiales/Materialdetalleview';
import { Box, CircularProgress } from '@mui/material';

export default function EstudianteMaterialDetallePage() {
  const { perfil, isLoading: loadingPerfil } = usePerfilEstudiante();
  const params = useParams();
  const materialId = params?.id ? Number(params.id) : null;

  if (loadingPerfil || !materialId || isNaN(materialId)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: '#0288d1' }} />
      </Box>
    );
  }

  return (
    <MaterialDetalleView
      materialId={materialId}
      esDocente={false}
      matriculaId={perfil?.matricula_id}
    />
  );
}