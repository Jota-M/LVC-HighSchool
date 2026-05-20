'use client';
// components/estudiante/asistencia/ResumenAsistencia.tsx

import React, { useState } from 'react';
import {
  Box, Typography, alpha, Skeleton,
  LinearProgress, Chip, Tooltip, Paper,
  Collapse, IconButton, Grid,
} from '@mui/material';
import {
  CheckCircle as OkIcon,
  Cancel as CancelIcon,
  Warning as WarnIcon,
  ExpandMore as ExpandIcon,
  TrendingUp as TrendIcon,
  School as SchoolIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { SinDatos } from './SinDatos';

interface ResumenAsistenciaProps {
  reporte?: any[];
  isLoading: boolean;
  accent: string;
  accentDark?: string;
  isDark: boolean;
}

export const ResumenAsistencia: React.FC<ResumenAsistenciaProps> = ({
  reporte = [],
  isLoading,
  accent,
  accentDark,
  isDark,
}) => {
  const [expandido, setExpandido] = useState<number | null>(null);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} variant="rounded" height={140} sx={{ borderRadius: '14px' }} />
        ))}
      </Box>
    );
  }

  if (!reporte || !reporte.length) {
    return (
      <SinDatos
        accent={accent}
        isDark={isDark}
        mensaje="No hay datos de asistencia para el período seleccionado."
      />
    );
  }

  // Ordenar por porcentaje de asistencia (de menor a mayor para priorizar las que necesitan atención)
  const reporteOrdenado = [...reporte].sort((a, b) => {
    const pctA = calcularPorcentaje(a);
    const pctB = calcularPorcentaje(b);
    return pctA - pctB;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {reporteOrdenado.map((r, idx) => {
        const presentes = Number(r.asistencias_presentes ?? r.presentes ?? 0);
        const ausentes = Number(r.asistencias_ausentes ?? r.ausentes ?? 0);
        const total = Number(r.asistencias_total ?? r.total ?? (presentes + ausentes));
        const pct = total > 0 ? Math.round((presentes / total) * 100) : 0;

        const { color, bgColor, icon, label, borderColor } = getEstadoAsistencia(pct, isDark);
        const isExpandido = expandido === idx;

        return (
          <Paper
            key={idx}
            elevation={0}
            sx={{
              bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
              border: `1.5px solid ${borderColor}`,
              borderRadius: '14px',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px ${alpha(color, 0.15)}`,
                borderColor: color,
              },
            }}
          >
            {/* Contenido principal */}
            <Box sx={{ p: 2.5 }}>
              {/* Fila superior */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                {/* Indicador de color */}
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: r.materia_color || accent,
                    flexShrink: 0,
                    mt: 0.5,
                    boxShadow: `0 0 8px ${alpha(r.materia_color || accent, 0.5)}`,
                  }}
                />

                {/* Información de materia */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body1" fontWeight={700} noWrap sx={{ mb: 0.5 }}>
                    {r.materia_nombre ?? r.asignacion_nombre ?? 'Materia'}
                  </Typography>

                  {(r.docente_nombres || r.docente_apellidos) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {r.docente_nombres ?? ''} {r.docente_apellidos ?? ''}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Badge de porcentaje */}
                <Tooltip title={label} arrow placement="top">
                  <Chip
                    icon={icon}
                    label={`${pct}%`}
                    sx={{
                      bgcolor: bgColor,
                      color,
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      height: 32,
                      minWidth: 70,
                      '& .MuiChip-icon': { color, fontSize: 16 },
                      boxShadow: `0 2px 8px ${alpha(color, 0.2)}`,
                    }}
                  />
                </Tooltip>

                {/* Botón expandir */}
                <IconButton
                  size="small"
                  onClick={() => setExpandido(isExpandido ? null : idx)}
                  sx={{
                    transform: isExpandido ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.3s',
                  }}
                >
                  <ExpandIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Barra de progreso mejorada */}
              <Box sx={{ mb: 1.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                      boxShadow: `0 0 10px ${alpha(color, 0.3)}`,
                    },
                  }}
                />
              </Box>

              {/* Estadísticas rápidas */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <OkIcon sx={{ fontSize: 14, color: '#1D9E75' }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {presentes} presentes
                    </Typography>
                  </Box>

                  {ausentes > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CancelIcon sx={{ fontSize: 14, color: '#D85A30' }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {ausentes} {ausentes === 1 ? 'ausencia' : 'ausencias'}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  <SchoolIcon sx={{ fontSize: 12, mr: 0.3, verticalAlign: 'middle' }} />
                  {total} clases
                </Typography>
              </Box>
            </Box>

            {/* Contenido expandible */}
            <Collapse in={isExpandido} unmountOnExit>
              <Box
                sx={{
                  borderTop: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
                  bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                  p: 2.5,
                }}
              >
                <Grid container spacing={2}>
                  {/* Detalles adicionales */}
                  <Grid size={{xs:6}} >
                    <DetalleItem
                      label="Asistencias"
                      value={presentes}
                      total={total}
                      color="#1D9E75"
                      isDark={isDark}
                    />
                  </Grid>

                  <Grid size={{xs:6}} >
                    <DetalleItem
                      label="Ausencias"
                      value={ausentes}
                      total={total}
                      color="#D85A30"
                      isDark={isDark}
                    />
                  </Grid>

                  {r.horas_semanales && (
                    <Grid size={{xs:6}} >
                      <DetalleItem
                        label="Horas/semana"
                        value={r.horas_semanales}
                        color={accent}
                        isDark={isDark}
                      />
                    </Grid>
                  )}

                  <Grid size={{xs:6}} >
                    <DetalleItem
                      label="Promedio"
                      value={`${pct}%`}
                      color={color}
                      isDark={isDark}
                    />
                  </Grid>
                </Grid>

                {/* Recomendación si el promedio es bajo */}
                {pct < 85 && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(pct < 70 ? '#D85A30' : '#BA7517', isDark ? 0.12 : 0.08),
                      border: `1px solid ${alpha(pct < 70 ? '#D85A30' : '#BA7517', 0.25)}`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                    }}
                  >
                    <WarnIcon sx={{ fontSize: 18, color: pct < 70 ? '#D85A30' : '#BA7517', mt: 0.25 }} />
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: pct < 70 ? '#D85A30' : '#BA7517', display: 'block', mb: 0.5 }}
                        fontWeight={600}
                      >
                        {pct < 70 ? '⚠️ Asistencia crítica' : '⚡ Asistencia en riesgo'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {pct < 70
                          ? 'Tu asistencia está por debajo del mínimo requerido (70%). Contacta con tu docente.'
                          : 'Procura mantener una asistencia regular para no caer por debajo del 70%.'}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Paper>
        );
      })}
    </Box>
  );
};

// ── Helpers ────────────────────────────────────────────────
function calcularPorcentaje(r: any): number {
  const presentes = Number(r.asistencias_presentes ?? r.presentes ?? 0);
  const total = Number(
    r.asistencias_total ?? r.total ?? (presentes + Number(r.asistencias_ausentes ?? r.ausentes ?? 0))
  );
  return total > 0 ? (presentes / total) * 100 : 0;
}

function getEstadoAsistencia(pct: number, isDark: boolean) {
  if (pct >= 85) {
    return {
      color: '#085041',
      bgColor: isDark ? alpha('#1D9E75', 0.2) : '#E1F5EE',
      borderColor: alpha('#1D9E75', 0.3),
      icon: <OkIcon sx={{ fontSize: 16 }} />,
      label: 'Asistencia regular - ¡Excelente!',
    };
  }

  if (pct >= 70) {
    return {
      color: '#633806',
      bgColor: isDark ? alpha('#BA7517', 0.2) : '#FAEEDA',
      borderColor: alpha('#BA7517', 0.3),
      icon: <WarnIcon sx={{ fontSize: 16 }} />,
      label: 'Asistencia en riesgo - Mantén el ritmo',
    };
  }

  return {
    color: '#791F1F',
    bgColor: isDark ? alpha('#D85A30', 0.2) : '#FCEBEB',
    borderColor: alpha('#D85A30', 0.3),
    icon: <CancelIcon sx={{ fontSize: 16 }} />,
    label: 'Asistencia crítica - Requiere atención',
  };
}

// ── Componente de detalle individual ────────────────────────
const DetalleItem: React.FC<{
  label: string;
  value: number | string;
  total?: number;
  color: string;
  isDark: boolean;
}> = ({ label, value, total, color, isDark }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 2,
      bgcolor: alpha(color, isDark ? 0.08 : 0.06),
      border: `1px solid ${alpha(color, 0.15)}`,
    }}
  >
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
      {label}
    </Typography>

    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
      <Typography variant="h6" fontWeight={700} sx={{ color }}>
        {value}
      </Typography>
      {total !== undefined && (
        <Typography variant="caption" color="text.secondary">
          / {total}
        </Typography>
      )}
    </Box>
  </Box>
);