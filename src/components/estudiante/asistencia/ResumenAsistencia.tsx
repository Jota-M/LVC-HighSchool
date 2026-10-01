'use client';
// components/estudiante/asistencia/ResumenAsistencia.tsx
// Resumen de asistencia por materia con diseño institucional enriquecido

import React, { useState } from 'react';
import {
  Box, Typography, alpha, Skeleton,
  LinearProgress, Chip, Tooltip, Paper,
  Collapse, IconButton, Grid,
} from '@mui/material';
import {
  CheckCircleRounded as OkIcon,
  CancelRounded as CancelIcon,
  WarningAmberRounded as WarnIcon,
  ExpandMoreRounded as ExpandIcon,
  SchoolRounded as SchoolIcon,
  PersonRounded as PersonIcon,
  TrendingUpRounded as TrendIcon,
  AccessTimeRounded as TimeIcon,
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
  isDark,
}) => {
  const [expandido, setExpandido] = useState<number | null>(null);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} variant="rounded" height={130} sx={{ borderRadius: '16px' }} />
        ))}
      </Box>
    );
  }

  if (!reporte || !reporte.length) {
    return (
      <SinDatos
        accent={accent}
        isDark={isDark}
        mensaje="No hay registros de asistencia para el período seleccionado."
      />
    );
  }

  // Ordenar por porcentaje de asistencia (de menor a mayor para priorizar materias con riesgo)
  const reporteOrdenado = [...reporte].sort((a, b) => {
    const pctA = calcularPorcentaje(a);
    const pctB = calcularPorcentaje(b);
    return pctA - pctB;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {reporteOrdenado.map((r, idx) => {
        const presentes = Number(r.asistencias_presentes ?? r.presentes ?? 0);
        const ausentes = Number(r.asistencias_ausentes ?? r.ausentes ?? 0);
        const tardanzas = Number(r.asistencias_tardanzas ?? r.tardanzas ?? 0);
        const total = Number(r.asistencias_total ?? r.total ?? (presentes + ausentes));
        const pct = total > 0 ? Math.round((presentes / total) * 100) : 0;

        const estado = getEstadoAsistencia(pct, isDark);
        const isExpandido = expandido === idx;

        return (
          <Paper
            key={idx}
            elevation={0}
            sx={{
              bgcolor: isDark
                ? `linear-gradient(135deg, ${alpha(estado.color, 0.06)} 0%, rgba(15, 23, 42, 0.75) 100%)`
                : `linear-gradient(135deg, ${alpha(estado.color, 0.04)} 0%, #ffffff 100%)`,
              border: `1.5px solid ${alpha(estado.color, isDark ? 0.28 : 0.2)}`,
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: isDark
                ? '0 4px 20px rgba(0,0,0,0.25)'
                : `0 2px 12px ${alpha(estado.color, 0.08)}`,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px ${alpha(estado.color, 0.2)}`,
                borderColor: estado.color,
              },
            }}
          >
            {/* Contenido principal */}
            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
              {/* Fila superior: Materia + Porcentaje + Toggle */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1.8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                  {/* Punto de color de materia */}
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      bgcolor: r.materia_color || accent,
                      flexShrink: 0,
                      boxShadow: `0 0 10px ${alpha(r.materia_color || accent, 0.6)}`,
                    }}
                  />

                  {/* Título de materia y docente */}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ fontSize: '1.05rem', lineHeight: 1.25 }}>
                      {r.materia_nombre ?? r.asignacion_nombre ?? 'Materia Asignada'}
                    </Typography>

                    {(r.docente_nombres || r.docente_apellidos) ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.3 }}>
                        <PersonIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={500} noWrap>
                          {r.docente_nombres ?? ''} {r.docente_apellidos ?? ''}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.72rem' }}>
                        Docente asignado
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Badge de porcentaje y botón de expandir */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  <Tooltip title={estado.label} arrow placement="top">
                    <Chip
                      icon={estado.icon}
                      label={`${pct}%`}
                      sx={{
                        bgcolor: estado.bgColor,
                        color: estado.fgColor,
                        fontWeight: 900,
                        fontSize: '0.88rem',
                        height: 32,
                        borderRadius: '10px',
                        border: `1.5px solid ${alpha(estado.color, 0.35)}`,
                        '& .MuiChip-icon': { color: estado.fgColor, fontSize: 17 },
                        boxShadow: `0 2px 8px ${alpha(estado.color, 0.2)}`,
                      }}
                    />
                  </Tooltip>

                  <IconButton
                    size="small"
                    onClick={() => setExpandido(isExpandido ? null : idx)}
                    sx={{
                      p: 0.8,
                      borderRadius: '10px',
                      bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                      transform: isExpandido ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.25s ease',
                      '&:hover': {
                        bgcolor: alpha(accent, 0.15),
                        color: accent,
                      },
                    }}
                  >
                    <ExpandIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>
              </Box>

              {/* Barra de progreso institucional con degradado */}
              <Box sx={{ mb: 1.8 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.72rem' }}>
                    Nivel de asistencia
                  </Typography>
                  <Typography variant="caption" fontWeight={900} sx={{ color: estado.color, fontSize: '0.75rem' }}>
                    {pct >= 85 ? 'Excelente' : pct >= 70 ? 'Regular' : 'En riesgo'}
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={Math.min(pct, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: `linear-gradient(90deg, ${estado.color} 0%, ${alpha(estado.color, 0.7)} 100%)`,
                      boxShadow: `0 0 10px ${alpha(estado.color, 0.3)}`,
                    },
                  }}
                />
              </Box>

              {/* Estadísticas rápidas en pie de tarjeta */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <OkIcon sx={{ fontSize: 15, color: '#10b981' }} />
                    <Typography variant="caption" color="text.primary" fontWeight={700}>
                      {presentes} <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>presentes</Box>
                    </Typography>
                  </Box>

                  {ausentes > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <CancelIcon sx={{ fontSize: 15, color: '#ef4444' }} />
                      <Typography variant="caption" color="text.primary" fontWeight={700}>
                        {ausentes} <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>{ausentes === 1 ? 'falta' : 'faltas'}</Box>
                      </Typography>
                    </Box>
                  )}

                  {tardanzas > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <TimeIcon sx={{ fontSize: 15, color: '#f59e0b' }} />
                      <Typography variant="caption" color="text.primary" fontWeight={700}>
                        {tardanzas} <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>{tardanzas === 1 ? 'atraso' : 'atrasos'}</Box>
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <SchoolIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {total} clases registradas
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Contenido expandible detallado */}
            <Collapse in={isExpandido} unmountOnExit>
              <Box
                sx={{
                  borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                  bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015),
                  p: { xs: 2, sm: 2.5 },
                }}
              >
                <Grid container spacing={1.5} sx={{ mb: pct < 85 ? 2 : 0 }}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <DetalleItem
                      label="Asistencias"
                      value={presentes}
                      total={total}
                      color="#10b981"
                      isDark={isDark}
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <DetalleItem
                      label="Ausencias"
                      value={ausentes}
                      total={total}
                      color="#ef4444"
                      isDark={isDark}
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <DetalleItem
                      label="Tardanzas"
                      value={tardanzas}
                      total={total}
                      color="#f59e0b"
                      isDark={isDark}
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <DetalleItem
                      label="Efectividad"
                      value={`${pct}%`}
                      color={estado.color}
                      isDark={isDark}
                    />
                  </Grid>
                </Grid>

                {/* Alerta de asistencia baja o en riesgo */}
                {pct < 85 && (
                  <Box
                    sx={{
                      p: 1.6,
                      borderRadius: '13px',
                      bgcolor: isDark ? alpha(estado.color, 0.12) : alpha(estado.color, 0.08),
                      border: `1.5px solid ${alpha(estado.color, 0.3)}`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.2,
                    }}
                  >
                    <WarnIcon sx={{ fontSize: 20, color: estado.color, mt: 0.2 }} />
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: estado.fgColor, display: 'block', mb: 0.3 }}
                        fontWeight={800}
                      >
                        {pct < 70 ? 'Alerta: Asistencia en estado crítico (< 70%)' : 'Aviso: Asistencia en observación (< 85%)'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                        {pct < 70
                          ? 'Tu porcentaje de asistencia se encuentra por debajo del estándar mínimo establecido. Justifica tus faltas o contacta a tu docente.'
                          : 'Procura no acumular inasistencias adicionales en esta materia para mantener tu regularidad académica sin observaciones.'}
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
      color: '#10b981',
      fgColor: isDark ? '#34d399' : '#059669',
      bgColor: isDark ? alpha('#10b981', 0.18) : alpha('#10b981', 0.1),
      icon: <OkIcon sx={{ fontSize: 16 }} />,
      label: 'Asistencia regular - ¡Excelente desempeño!',
    };
  }

  if (pct >= 70) {
    return {
      color: '#f59e0b',
      fgColor: isDark ? '#fbbf24' : '#d97706',
      bgColor: isDark ? alpha('#f59e0b', 0.18) : alpha('#f59e0b', 0.1),
      icon: <WarnIcon sx={{ fontSize: 16 }} />,
      label: 'Asistencia en riesgo - Procura no faltar',
    };
  }

  return {
    color: '#ef4444',
    fgColor: isDark ? '#f87171' : '#dc2626',
    bgColor: isDark ? alpha('#ef4444', 0.18) : alpha('#ef4444', 0.1),
    icon: <CancelIcon sx={{ fontSize: 16 }} />,
    label: 'Asistencia crítica - Requiere justificación inmediata',
  };
}

// ── Componente de detalle individual con estilo moderno ────
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
      borderRadius: '12px',
      bgcolor: alpha(color, isDark ? 0.08 : 0.05),
      border: `1px solid ${alpha(color, isDark ? 0.2 : 0.15)}`,
    }}
  >
    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.3, textTransform: 'uppercase', fontSize: '0.66rem' }}>
      {label}
    </Typography>

    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
      <Typography variant="h6" fontWeight={900} sx={{ color, lineHeight: 1.1 }}>
        {value}
      </Typography>
      {total !== undefined && (
        <Typography variant="caption" color="text.disabled" fontWeight={600}>
          / {total}
        </Typography>
      )}
    </Box>
  </Box>
);

export default ResumenAsistencia;