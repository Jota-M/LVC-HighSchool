import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';

export const PageHeader: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: isDark
            ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
          mb: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
      >
        <SchoolIcon sx={{ fontSize: 48, color: isDark ? '#000' : '#667eea' }} />
      </Box>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 800,
          color: '#fff',
          mb: 1,
          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
        }}
      >
        Portal de Matrícula
      </Typography>
      <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
        Sistema de Auto-Matriculación para Estudiantes
      </Typography>
    </Box>
  );
};