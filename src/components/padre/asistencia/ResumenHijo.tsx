'use client';
// components/padre/asistencia/ResumenHijo.tsx
// Rediseño de las stat cards para igualar el lenguaje visual de BoletinNotas:
// ícono fantasma de fondo, ícono con gradiente + sombra, número grande con
// gradient-clip, label uppercase con letter-spacing, subtítulo descriptivo.
// El resto del archivo (alerta, tarjeta de % global, filas por materia) no cambia.

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  Chip,
  Alert,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import { keyframes } from '@mui/system';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ChecklistRtlRoundedIcon from '@mui/icons-material/ChecklistRtlRounded';

import {
  ResumenAsistenciaHijo,
  ResumenPorMateria,
  getNivelRiesgo,
  getGradientNivel,
  getColorNivel,
} from '@/types/padreAsistenciaTypes';

// ──────────────────────────────────────────────
// ANIMACIONES
// ──────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fillBar = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

// ──────────────────────────────────────────────
// STAT CARD — mismo lenguaje que BoletinNotas: barra superior de color,
// ícono fantasma de fondo, ícono en recuadro propio, número grande con
// gradiente, label uppercase y subtítulo descriptivo.
// ──────────────────────────────────────────────

interface StatCardData {
  label: string;
  value: number;
  subtitle: string;
  color: string;
  gradient: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<{ stat: StatCardData; index: number }> = ({ stat, index }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        animation: `${fadeUp} 0.4s ease-out ${index * 0.07}s both`,
        border: `1px solid ${alpha(stat.color, 0.25)}`,
        background: isDark
          ? `linear-gradient(155deg, ${alpha(stat.color, 0.18)} 0%, ${alpha(stat.color, 0.04)} 55%, transparent 100%)`
          : `linear-gradient(155deg, ${alpha(stat.color, 0.1)} 0%, #fff 60%)`,
        boxShadow: `0 4px 18px ${alpha(stat.color, isDark ? 0.18 : 0.1)}`,
        transition: 'all 0.25s ease',
        '&::before': { content: '""', display: 'block', height: '3px', background: stat.gradient },
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 12px 28px ${alpha(stat.color, 0.32)}`,
        },
      }}
    >
      {/* Ícono fantasma de fondo — llena el espacio vacío a la derecha */}
      <Box sx={{
        position: 'absolute', right: -14, top: -14,
        opacity: isDark ? 0.1 : 0.06,
        transform: 'rotate(-8deg)',
        pointerEvents: 'none',
      }}>
        {React.cloneElement(stat.icon as React.ReactElement, { sx: { color: stat.color, fontSize: 110 } })}
      </Box>

      <CardContent sx={{ p: 2.75, position: 'relative' }}>
        <Typography
          sx={{
            fontSize: 10.5, fontWeight: 800, letterSpacing: '0.09em',
            textTransform: 'uppercase', color: alpha(stat.color, 0.9),
            mb: 1.25,
          }}
        >
          {stat.label}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{
            width: 46, height: 46, borderRadius: '13px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: stat.gradient,
            boxShadow: `0 4px 14px ${alpha(stat.color, 0.45)}`,
          }}>
            {React.cloneElement(stat.icon as React.ReactElement, { sx: { color: '#fff', fontSize: 24 } })}
          </Box>
          <Typography
            variant="h2" fontWeight={900} sx={{
              fontSize: { xs: '2.4rem', sm: '2.75rem' },
              lineHeight: 1, letterSpacing: '-0.02em',
              background: stat.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {stat.value}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: 13, lineHeight: 1.4 }}>
          {stat.subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

// ──────────────────────────────────────────────
// FILA POR MATERIA (sin cambios)
// ──────────────────────────────────────────────

const FilaMateria: React.FC<{ materia: ResumenPorMateria; index: number }> = ({ materia, index }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const nivel = getNivelRiesgo(materia.porcentaje_asistencia);
  const color = getColorNivel(nivel, isDark);
  const gradient = getGradientNivel(nivel);

  return (
    <Box
      sx={{
        animation: `${fadeUp} 0.5s ease-out ${0.1 + index * 0.07}s both`,
        p: 2.5,
        borderRadius: 3,
        background: isDark
          ? alpha(color, 0.08)
          : alpha(color, 0.04),
        border: `1px solid ${alpha(color, materia.en_riesgo ? 0.4 : 0.15)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateX(6px)',
          boxShadow: `0 4px 20px ${alpha(color, 0.15)}`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="body1" fontWeight={800} noWrap>
              {materia.materia_nombre}
            </Typography>
            {materia.en_riesgo && (
              <Chip
                size="small"
                icon={<WarningAmberIcon sx={{ fontSize: '14px !important' }} />}
                label="En riesgo"
                sx={{
                  height: 22,
                  fontSize: 10,
                  fontWeight: 800,
                  bgcolor: alpha('#f59e0b', 0.15),
                  color: isDark ? '#fbbf24' : '#d97706',
                  border: `1px solid ${alpha('#f59e0b', 0.3)}`,
                  borderRadius: 1.5,
                  '& .MuiChip-icon': { color: isDark ? '#fbbf24' : '#d97706' },
                }}
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {materia.total_clases} clases · {materia.presentes} presentes · {materia.ausentes} ausentes
            {materia.tardanzas > 0 && ` · ${materia.tardanzas} tardanzas`}
            {materia.justificados > 0 && ` · ${materia.justificados} justificados`}
          </Typography>
        </Box>

        {/* Porcentaje */}
        <Box
          sx={{
            minWidth: 64,
            height: 64,
            borderRadius: 2.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: gradient,
            boxShadow: `0 4px 16px ${alpha(color, 0.35)}`,
            flexShrink: 0,
          }}
        >
          <Typography variant="h5" fontWeight={900} sx={{ color: '#fff', lineHeight: 1 }}>
            {materia.porcentaje_asistencia}%
          </Typography>
          <Typography variant="caption" sx={{ color: alpha('#fff', 0.9), fontSize: 10, fontWeight: 700 }}>
            asistencia
          </Typography>
        </Box>
      </Box>

      {/* Barra de progreso */}
      <Box
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06),
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${materia.porcentaje_asistencia}%`,
            borderRadius: 4,
            background: gradient,
            transformOrigin: 'left',
            animation: `${fillBar} 1s cubic-bezier(0.4,0,0.2,1) ${0.1 + index * 0.07}s both`,
          }}
        />
      </Box>
    </Box>
  );
};

// ──────────────────────────────────────────────
// PROPS
// ──────────────────────────────────────────────

interface Props {
  resumen: ResumenAsistenciaHijo | null;
  isLoading?: boolean;
}

// ──────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────

const ResumenHijo: React.FC<Props> = ({ resumen, isLoading = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (isLoading) {
    return (
      <Box>
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={i}>
              <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={96} sx={{ borderRadius: 3, mb: 1.5 }} />
        ))}
      </Box>
    );
  }

  if (!resumen) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          borderRadius: 3,
          background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
          border: `2px dashed ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
        }}
      >
        <Typography variant="body1" color="text.secondary" fontWeight={600}>
          No hay registros de asistencia para el período actual
        </Typography>
      </Box>
    );
  }

  const nivel = getNivelRiesgo(resumen.porcentaje_asistencia_global);
  const color = getColorNivel(nivel, isDark);
  const gradient = getGradientNivel(nivel);
  const materiasEnRiesgo = resumen.por_materia.filter(m => m.en_riesgo);
  const totalMaterias = resumen.por_materia.length;

  const stats: StatCardData[] = [
    {
      label: 'Total clases', value: resumen.total_clases, color: '#3b82f6',
      gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)',
      subtitle: `Registradas en ${totalMaterias} materia${totalMaterias !== 1 ? 's' : ''} este período`,
      icon: <ChecklistRtlRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />,
    },
    {
      label: 'Presentes', value: resumen.total_presentes, color: '#10b981',
      gradient: 'linear-gradient(135deg,#10b981,#34d399)',
      subtitle: `${resumen.total_presentes} de ${resumen.total_clases} clases con asistencia`,
      icon: <CheckCircleRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />,
    },
    {
      label: 'Ausentes', value: resumen.total_ausentes, color: '#ef4444',
      gradient: 'linear-gradient(135deg,#ef4444,#f87171)',
      subtitle: resumen.total_ausentes > 0 ? `${resumen.total_ausentes} clase${resumen.total_ausentes > 1 ? 's' : ''} sin justificar` : 'Sin ausencias este período',
      icon: <CancelRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />,
    },
    {
      label: 'Tardanzas', value: resumen.total_tardanzas, color: '#f59e0b',
      gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
      subtitle: resumen.total_tardanzas > 0 ? `${resumen.total_tardanzas} llegada${resumen.total_tardanzas > 1 ? 's' : ''} tarde registradas` : 'Sin tardanzas este período',
      icon: <AccessTimeRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />,
    },
    {
      label: 'Justificados', value: resumen.total_justificados, color: '#8b5cf6',
      gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)',
      subtitle: resumen.total_justificados > 0 ? `${resumen.total_justificados} ausencia${resumen.total_justificados > 1 ? 's' : ''} con justificativo` : 'Ninguna ausencia justificada',
      icon: <VerifiedRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />,
    },
  ];

  return (
    <Box>
      {/* Alerta si hay materias en riesgo */}
      {materiasEnRiesgo.length > 0 && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${alpha('#f59e0b', 0.3)}`,
            background: isDark
              ? `linear-gradient(145deg, ${alpha('#f59e0b', 0.12)} 0%, ${alpha('#f59e0b', 0.04)} 100%)`
              : `linear-gradient(145deg, ${alpha('#f59e0b', 0.06)} 0%, #fff 100%)`,
            '& .MuiAlert-icon': { color: isDark ? '#fbbf24' : '#d97706' },
          }}
          icon={<WarningAmberIcon />}
        >
          <Typography variant="body2" fontWeight={700}>
            {materiasEnRiesgo.length === 1
              ? `La materia "${materiasEnRiesgo[0].materia_nombre}" tiene asistencia por debajo del 75%.`
              : `${materiasEnRiesgo.length} materias tienen asistencia por debajo del 75%. Revisá el detalle abajo.`}
          </Typography>
        </Alert>
      )}

      {/* Estadísticas globales */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {stats.map((stat, i) => (
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={stat.label}>
            <StatCard stat={stat} index={i} />
          </Grid>
        ))}
      </Grid>

      {/* Porcentaje global destacado */}
      <Card
        sx={{
          borderRadius: 3,
          mb: 3,
          animation: `${fadeUp} 0.5s ease-out 0.35s both`,
          background: isDark
            ? `linear-gradient(145deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.05)} 100%)`
            : `linear-gradient(145deg, ${alpha(color, 0.08)} 0%, #fff 100%)`,
          border: `1px solid ${alpha(color, 0.25)}`,
          boxShadow: `0 4px 24px ${alpha(color, 0.15)}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: gradient,
                boxShadow: `0 6px 24px ${alpha(color, 0.4)}`,
                flexShrink: 0,
              }}
            >
              <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', lineHeight: 1 }}>
                {resumen.porcentaje_asistencia_global}%
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                Asistencia global del período
              </Typography>
              <Box
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                  overflow: 'hidden',
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${resumen.porcentaje_asistencia_global}%`,
                    borderRadius: 5,
                    background: gradient,
                    animation: `${fillBar} 1.2s cubic-bezier(0.4,0,0.2,1) 0.4s both`,
                    transformOrigin: 'left',
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={nivel === 'excelente' ? 'Excelente asistencia' : nivel === 'bueno' ? 'Buena asistencia' : nivel === 'riesgo' ? 'En riesgo' : 'Asistencia crítica'}
                  icon={nivel === 'critico' || nivel === 'riesgo' ? <TrendingDownIcon sx={{ fontSize: '14px !important' }} /> : <TrendingUpIcon sx={{ fontSize: '14px !important' }} />}
                  sx={{
                    height: 26,
                    fontWeight: 800,
                    fontSize: 11,
                    bgcolor: alpha(color, 0.15),
                    color,
                    border: `1px solid ${alpha(color, 0.3)}`,
                    borderRadius: 2,
                    '& .MuiChip-icon': { color },
                  }}
                />
                <Chip
                  size="small"
                  label={`${resumen.por_materia.length} materias`}
                  sx={{
                    height: 26,
                    fontWeight: 700,
                    fontSize: 11,
                    bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                    borderRadius: 2,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Desglose por materia */}
      {resumen.por_materia.length > 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
            Por materia
          </Typography>
          <Stack spacing={1.5}>
            {resumen.por_materia.map((m, i) => (
              <FilaMateria key={m.asignacion_id} materia={m} index={i} />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default ResumenHijo;