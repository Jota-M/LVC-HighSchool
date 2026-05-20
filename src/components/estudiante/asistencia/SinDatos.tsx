'use client';
// components/estudiante/asistencia/SinDatos.tsx

import React from 'react';
import { Box, Typography, alpha, Paper } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';

interface SinDatosProps {
  accent: string;
  isDark: boolean;
  mensaje?: string;
  icono?: React.ReactNode;
}

export const SinDatos: React.FC<SinDatosProps> = ({
  accent,
  isDark,
  mensaje = 'No hay datos disponibles',
  icono,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
        border: `1px dashed ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
        borderRadius: '14px',
        p: 6,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          p: 3,
          borderRadius: '50%',
          bgcolor: alpha(accent, 0.1),
          mb: 2,
        }}
      >
        {icono || <InboxIcon sx={{ fontSize: 48, color: accent, opacity: 0.5 }} />}
      </Box>

      <Typography variant="h6" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
        Sin datos
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {mensaje}
      </Typography>
    </Paper>
  );
};