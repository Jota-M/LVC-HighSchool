'use client';
// components/estudiante/materiales/ProgresoEstudianteView.tsx

import React from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip,
  alpha, Skeleton, Fade, LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useProgresoEstudiante } from '@/hooks/useEstudiante';
import type { MateriaResumen } from '@/services/estudianteService';

interface ProgresoEstudianteViewProps {
  materia:    MateriaResumen;
  accent:     string;
  accentDark: string;
  isDark:     boolean;
}

// Constantes de estados (deberías moverlas a un archivo de constantes)
const ESTADOS_PROGRESO = [
  { value: 'no_iniciado', label: 'No iniciado', icon: '⚪', color: '#9ca3af', bgColor: '#f3f4f6' },
  { value: 'en_progreso', label: 'En progreso', icon: '🔵', color: '#2563eb', bgColor: '#dbeafe' },
  { value: 'completado',  label: 'Completado',  icon: '✅', color: '#16a34a', bgColor: '#dcfce7' },
  { value: 'revisando',   label: 'Revisando',   icon: '🔄', color: '#d97706', bgColor: '#fed7aa' },
];

export const ProgresoEstudianteView: React.FC<ProgresoEstudianteViewProps> = ({
  materia, accent, accentDark, isDark,
}) => {
  const {
    progreso, 
    isLoading,
    porcentajeGeneral, 
    completados, 
    totalTemas,
  } = useProgresoEstudiante(materia.grado_materia_id);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rounded" height={70} sx={{ borderRadius: '12px' }} />
        ))}
      </Box>
    );
  }

  if (progreso.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, color: 'text.disabled' }}>
        <TrendingUpIcon sx={{ fontSize: 56, color: alpha(accent, 0.3), mb: 2 }} />
        <Typography variant="h6" color="text.secondary">Sin datos de progreso</Typography>
        <Typography variant="body2" color="text.disabled">
          Comienza a estudiar los temas para ver tu avance aquí.
        </Typography>
      </Box>
    );
  }

  // Contadores por estado
  const contadores = ESTADOS_PROGRESO.map(e => ({
    ...e,
    count: progreso.filter(p => p.estado === e.value).length,
  }));

  return (
    <Box>
      {/* Tarjeta de resumen */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '18px',
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          background: `linear-gradient(135deg, ${alpha(accent, 0.08)}, ${alpha(accentDark, 0.04)})`,
          p: 3, mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>Progreso General</Typography>
            <Typography variant="body2" color="text.secondary">
              {materia.materia_nombre}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h3" fontWeight={800} sx={{ color: accent, lineHeight: 1 }}>
              {porcentajeGeneral}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {completados}/{totalTemas} temas
            </Typography>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={porcentajeGeneral}
          sx={{
            height: 10, borderRadius: 5,
            bgcolor: alpha(accent, 0.15),
            '& .MuiLinearProgress-bar': { bgcolor: accent, borderRadius: 5 },
          }}
        />

        {/* Contadores por estado */}
        <Grid container spacing={1.5} sx={{ mt: 2 }}>
          {contadores.map(c => (
            <Grid key={c.value} size={{ xs: 6, sm: 3 }}>
              <Box
                sx={{
                  p: 1.5, borderRadius: '12px',
                  bgcolor: alpha(c.color, 0.08),
                  border: `1px solid ${alpha(c.color, 0.15)}`,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h5" fontWeight={800} sx={{ color: c.color, lineHeight: 1 }}>
                  {c.count}
                </Typography>
                <Typography variant="caption" sx={{ color: c.color, fontWeight: 600 }}>
                  {c.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* Lista de temas con progreso */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {progreso.map(p => {
          const estadoInfo = ESTADOS_PROGRESO.find(e => e.value === p.estado);
          return (
            <Card
              key={p.tema_id}
              elevation={0}
              sx={{
                borderRadius: '12px',
                border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
                p: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Indicador de estado */}
                <Box
                  sx={{
                    width: 10, height: 10,
                    borderRadius: '50%',
                    bgcolor: estadoInfo?.color ?? '#9ca3af',
                    flexShrink: 0,
                    boxShadow: `0 0 0 3px ${alpha(estadoInfo?.color ?? '#9ca3af', 0.2)}`,
                  }}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>
                      {p.tema_titulo ?? `Tema ${p.tema_id}`}
                    </Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ color: accent, ml: 1, flexShrink: 0 }}>
                      {p.porcentaje_avance}%
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={Number(p.porcentaje_avance)}
                    sx={{
                      height: 5, borderRadius: 3,
                      bgcolor: alpha(estadoInfo?.color ?? accent, 0.12),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: estadoInfo?.color ?? accent,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>

                <Chip
                  label={estadoInfo?.label ?? 'No iniciado'}
                  size="small"
                  sx={{
                    height: 20, fontSize: '0.62rem', fontWeight: 600, flexShrink: 0,
                    bgcolor: estadoInfo?.bgColor ?? '#f3f4f6',
                    color:   estadoInfo?.color   ?? '#6b7280',
                  }}
                />
              </Box>

              {/* Tiempo dedicado */}
              {p.tiempo_dedicado > 0 && (
                <Typography variant="caption" color="text.disabled" sx={{ pl: 3, mt: 0.5, display: 'block' }}>
                  {Math.round(p.tiempo_dedicado / 60)} min estudiados
                </Typography>
              )}
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default ProgresoEstudianteView;