'use client';
// components/materiales/detalle/EstadisticasPanel.tsx

import React from 'react';
import {
  Box, Typography, LinearProgress, alpha, Skeleton, Grid,
} from '@mui/material';
import {
  RemoveRedEye as EyeIcon,
  CloudDownload as DownloadIcon,
  Favorite as FavIcon,
  Chat as ChatIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Timer as TimerIcon,
  CheckCircle as CompletedIcon,
} from '@mui/icons-material';
import { useEstadisticasMaterial } from '@/hooks/useMaterial';

interface EstadisticasPanelProps {
  materialId: number;
  accent:     string;
  isDark:     boolean;
}

export const EstadisticasPanel: React.FC<EstadisticasPanelProps> = ({
  materialId, accent, isDark,
}) => {
  const { estadisticas, isLoading } = useEstadisticasMaterial(materialId);

  if (isLoading) {
    return (
      <Grid container spacing={1.5}>
        {[1,2,3,4,5,6,7,8].map(i => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
            <Skeleton variant="rounded" height={80} sx={{ borderRadius: '10px' }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!estadisticas) return null;

  const maxVal = Math.max(
    estadisticas.total_vistas,
    estadisticas.total_descargas,
    estadisticas.total_favoritos,
    estadisticas.total_comentarios,
    1,
  );

  const formatDuracion = (seg: number) => {
    if (!seg) return '—';
    if (seg < 60) return `${seg}s`;
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${m}m ${s > 0 ? ` ${s}s` : ''}`;
  };

  const items = [
    { label: 'Visualizaciones', value: estadisticas.total_vistas,      icon: <EyeIcon       sx={{ fontSize: 14 }} />, color: '#0288d1' },
    { label: 'Descargas',       value: estadisticas.total_descargas,   icon: <DownloadIcon  sx={{ fontSize: 14 }} />, color: '#16a34a' },
    { label: 'Favoritos',       value: estadisticas.total_favoritos,   icon: <FavIcon       sx={{ fontSize: 14 }} />, color: '#ef4444' },
    { label: 'Comentarios',     value: estadisticas.total_comentarios, icon: <ChatIcon      sx={{ fontSize: 14 }} />, color: '#f59e0b' },
    { label: 'Compartidos',     value: estadisticas.total_compartidos, icon: <ShareIcon     sx={{ fontSize: 14 }} />, color: '#8b5cf6' },
    { label: 'Impresiones',     value: estadisticas.total_impresiones, icon: <PrintIcon     sx={{ fontSize: 14 }} />, color: '#64748b' },
    { label: 'Completados',     value: estadisticas.total_completados, icon: <CompletedIcon sx={{ fontSize: 14 }} />, color: '#16a34a' },
    {
      label: 'Tiempo promedio',
      value: formatDuracion(estadisticas.promedio_duracion_segundos),
      icon: <TimerIcon sx={{ fontSize: 14 }} />,
      color: accent,
      isText: true,
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'text.disabled',
            mb: 0.5,
          }}
        >
          Estadísticas de uso
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
          Interacciones totales de los estudiantes con este material.
        </Typography>
      </Box>

      <Grid container spacing={1.5}>
        {items.map(item => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={item.label}>
            <Box
              sx={{
                p: 1.75,
                borderRadius: '10px',
                border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
                bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              }}
            >
              {/* Icono + label */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                <Box sx={{ color: item.color, display: 'flex' }}>
                  {item.icon}
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.65rem',
                    color: 'text.secondary',
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>

              {/* Valor */}
              <Typography
                sx={{
                  fontSize: item.isText ? '1rem' : '1.4rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: item.color,
                  lineHeight: 1,
                  mb: item.isText ? 0 : 1,
                }}
              >
                {item.isText ? item.value : Number(item.value).toLocaleString()}
              </Typography>

              {/* Barra de progreso */}
              {!item.isText && (
                <LinearProgress
                  variant="determinate"
                  value={Math.min((Number(item.value) / maxVal) * 100, 100)}
                  sx={{
                    height: 3,
                    borderRadius: 2,
                    bgcolor: alpha(item.color, 0.1),
                    '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 2 },
                  }}
                />
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Total resumen */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          borderRadius: '10px',
          bgcolor: alpha(accent, 0.04),
          border: `1px solid ${alpha(accent, 0.12)}`,
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
        }}
      >
        {[
          { label: 'Total de interacciones', val: estadisticas.total_vistas + estadisticas.total_descargas + estadisticas.total_comentarios },
          { label: 'Tasa de descarga', val: estadisticas.total_vistas > 0 ? `${Math.round((estadisticas.total_descargas / estadisticas.total_vistas) * 100)}%` : '—' },
          { label: 'Tasa de completado', val: estadisticas.total_vistas > 0 ? `${Math.round((estadisticas.total_completados / estadisticas.total_vistas) * 100)}%` : '—' },
        ].map(({ label, val }) => (
          <Box key={label}>
            <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', fontWeight: 600, mb: 0.25, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: accent, letterSpacing: '-0.02em' }}>
              {typeof val === 'number' ? val.toLocaleString() : val}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default EstadisticasPanel;