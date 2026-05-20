'use client';
// components/padre/asistencia/ResumenHijo.tsx

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  Chip,
  LinearProgress,
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
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

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
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fillBar = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 currentColor; }
  50%       { box-shadow: 0 0 0 8px transparent; }
`;

// ──────────────────────────────────────────────
// TARJETA ESTADÍSTICA
// ──────────────────────────────────────────────

interface StatProps {
  label: string;
  value: number;
  color: string;
  gradient: string;
  icon: React.ReactNode;
  delay?: number;
}

const StatCard: React.FC<StatProps> = ({ label, value, color, gradient, icon, delay = 0 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        borderRadius: 3,
        animation: `${fadeUp} 0.5s ease-out ${delay}s both`,
        position: 'relative',
        overflow: 'hidden',
        background: isDark
          ? `linear-gradient(145deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.05)} 100%)`
          : `linear-gradient(145deg, ${alpha(color, 0.08)} 0%, #fff 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        boxShadow: `0 4px 20px ${alpha(color, 0.12)}`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 32px ${alpha(color, 0.25)}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: gradient,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: gradient,
              boxShadow: `0 4px 16px ${alpha(color, 0.4)}`,
              '& svg': { fontSize: 24, color: '#fff' },
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="h4"
            fontWeight={900}
            sx={{
              background: gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
        </Box>
        <Typography variant="body2" fontWeight={700} color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
};

// ──────────────────────────────────────────────
// FILA POR MATERIA
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
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Grid size={{xs:6, sm:4, md:2.4}}  key={i}>
              <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
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
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{xs:6, sm:4, md:2.4}} >
          <StatCard
            label="Total clases"
            value={resumen.total_clases}
            color="#3b82f6"
            gradient="linear-gradient(135deg, #3b82f6, #60a5fa)"
            icon={<CheckCircleRoundedIcon />}
            delay={0}
          />
        </Grid>
        <Grid size={{xs:6, sm:4, md:2.4}} >
          <StatCard
            label="Presentes"
            value={resumen.total_presentes}
            color="#10b981"
            gradient="linear-gradient(135deg, #10b981, #34d399)"
            icon={<CheckCircleRoundedIcon />}
            delay={0.07}
          />
        </Grid>
        <Grid size={{xs:6, sm:4, md:2.4}} >
          <StatCard
            label="Ausentes"
            value={resumen.total_ausentes}
            color="#ef4444"
            gradient="linear-gradient(135deg, #ef4444, #f87171)"
            icon={<CancelRoundedIcon />}
            delay={0.14}
          />
        </Grid>
        <Grid size={{xs:6, sm:4, md:2.4}} >
          <StatCard
            label="Tardanzas"
            value={resumen.total_tardanzas}
            color="#f59e0b"
            gradient="linear-gradient(135deg, #f59e0b, #fbbf24)"
            icon={<AccessTimeRoundedIcon />}
            delay={0.21}
          />
        </Grid>
        <Grid size={{xs:6, sm:4, md:2.4}} >
          <StatCard
            label="Justificados"
            value={resumen.total_justificados}
            color="#8b5cf6"
            gradient="linear-gradient(135deg, #8b5cf6, #a78bfa)"
            icon={<VerifiedRoundedIcon />}
            delay={0.28}
          />
        </Grid>
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