'use client';
// components/estudiante/materiales/AsistenciaEstudianteView.tsx

import React, { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, alpha,
  Skeleton, Fade, Grid, Tooltip, ToggleButtonGroup,
  ToggleButton, LinearProgress,
} from '@mui/material';
import {
  EventAvailable as PresenteIcon,
  EventBusy as AusenteIcon,
  EventNote as TardanzaIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as LateIcon,
  CalendarMonth as CalIcon,
  BarChart as ChartIcon,
  List as ListIcon,
  TrendingUp as TrendIcon,
} from '@mui/icons-material';
import { useAsistenciaEstudiante, useAsistenciaDetalleEstudiante } from '@/hooks/useEstudiante';
import type { MateriaResumen } from '@/services/estudianteService';

interface AsistenciaEstudianteViewProps {
  materia:    MateriaResumen;
  accent:     string;
  accentDark: string;
  isDark:     boolean;
}

type Vista = 'resumen' | 'calendario' | 'lista';

// ── Configuración de estados de asistencia ────────────────────
const ESTADOS_ASISTENCIA = {
  presente:  { label: 'Presente',  color: '#16a34a', bg: '#dcfce7', icon: <CheckIcon sx={{ fontSize: 14 }} /> },
  ausente:   { label: 'Ausente',   color: '#dc2626', bg: '#fee2e2', icon: <CancelIcon sx={{ fontSize: 14 }} /> },
  tardanza:  { label: 'Tardanza',  color: '#d97706', bg: '#fef3c7', icon: <LateIcon   sx={{ fontSize: 14 }} /> },
  justificado:{ label: 'Justificado', color: '#2563eb', bg: '#dbeafe', icon: <CheckIcon sx={{ fontSize: 14 }} /> },
};

// ── Utilidades ────────────────────────────────────────────────
const getNombreMes = (mes: number) =>
  ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][mes - 1] ?? '';

const getDiaSemana = (fecha: string) => {
  const d = new Date(fecha + 'T12:00:00');
  return ['D','L','M','X','J','V','S'][d.getDay()];
};

export const AsistenciaEstudianteView: React.FC<AsistenciaEstudianteViewProps> = ({
  materia, accent, accentDark, isDark,
}) => {
  const [vista, setVista] = useState<Vista>('resumen');

  // Cargamos resumen global filtrado por asignacion_docente_id
  const { reporte, isLoading: loadingResumen } = useAsistenciaEstudiante({
    asignacion_docente_id: materia.asignacion_docente_id,
  });

  // Detalle de registros individuales
  const { detalle, isLoading: loadingDetalle } = useAsistenciaDetalleEstudiante({
    asignacion_docente_id: materia.asignacion_docente_id,
  });

  const isLoading = loadingResumen || loadingDetalle;

  // ── Calcular estadísticas del resumen ────────────────────────
  const stats = useMemo(() => {
    // Priorizar datos del resumen de materia si están disponibles
    const total    = materia.asistencias_total    ?? 0;
    const presente = materia.asistencias_presentes ?? 0;
    const ausente  = materia.asistencias_ausentes  ?? 0;
    const porcentaje = total > 0 ? Math.round((presente / total) * 100) : 0;

    // Contar tardanzas y justificados desde el detalle
    const tardanzas   = detalle.filter(d => d.estado === 'tardanza').length;
    const justificados = detalle.filter(d => d.estado === 'justificado').length;

    return { total, presente, ausente, tardanzas, justificados, porcentaje };
  }, [materia, detalle]);

  // ── Agrupar detalle por mes para el calendario ───────────────
  const porMes = useMemo(() => {
    const mapa: Record<string, typeof detalle> = {};
    detalle.forEach(d => {
      const fecha = new Date(d.fecha ?? d.created_at ?? '');
      if (isNaN(fecha.getTime())) return;
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      if (!mapa[key]) mapa[key] = [];
      mapa[key].push(d);
    });
    return Object.entries(mapa).sort(([a], [b]) => a.localeCompare(b));
  }, [detalle]);

  // ── Estado de alerta ─────────────────────────────────────────
  const alertColor = stats.porcentaje >= 80
    ? '#16a34a'
    : stats.porcentaje >= 60
    ? '#d97706'
    : '#dc2626';

  const alertLabel = stats.porcentaje >= 80
    ? 'Excelente asistencia'
    : stats.porcentaje >= 60
    ? 'Asistencia regular'
    : 'Asistencia crítica';

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="rounded" height={160} sx={{ borderRadius: '18px' }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map(i => (
            <Grid key={i} size={{ xs: 6, sm: 3 }}>
              <Skeleton variant="rounded" height={90} sx={{ borderRadius: '14px' }} />
            </Grid>
          ))}
        </Grid>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: '12px' }} />
        ))}
      </Box>
    );
  }

  return (
    <Fade in timeout={300}>
      <Box>

        {/* ── Tarjeta de resumen principal ── */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
            overflow: 'hidden',
            mb: 3,
          }}
        >
          {/* Encabezado con gradiente */}
          <Box
            sx={{
              p: 3,
              background: `linear-gradient(135deg, ${alpha(alertColor, 0.12)}, ${alpha(alertColor, 0.04)})`,
              borderBottom: `1px solid ${alpha(alertColor, 0.15)}`,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <CalIcon sx={{ color: alertColor, fontSize: 20 }} />
                  <Typography variant="h6" fontWeight={800}>
                    Asistencia — {materia.materia_nombre}
                  </Typography>
                </Box>
                <Chip
                  label={alertLabel}
                  size="small"
                  sx={{
                    bgcolor: alpha(alertColor, 0.12),
                    color: alertColor,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    height: 24,
                  }}
                />
              </Box>

              {/* Porcentaje grande */}
              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  variant="h2"
                  fontWeight={900}
                  sx={{ color: alertColor, lineHeight: 1 }}
                >
                  {stats.porcentaje}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  de asistencia
                </Typography>
              </Box>
            </Box>

            {/* Barra de progreso */}
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={stats.porcentaje}
                sx={{
                  height: 12, borderRadius: 6,
                  bgcolor: alpha(alertColor, 0.12),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: alertColor,
                    borderRadius: 6,
                    background: `linear-gradient(90deg, ${alertColor}, ${alpha(alertColor, 0.7)})`,
                  },
                }}
              />
              {/* Línea de mínimo requerido (75%) */}
              <Box sx={{ position: 'relative', mt: 0.5 }}>
                <Box
                  sx={{
                    position: 'absolute',
                    left: '75%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ width: 1, height: 6, bgcolor: alpha('#000', 0.2) }} />
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.disabled', whiteSpace: 'nowrap' }}>
                    mín. 75%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* ── 4 métricas ── */}
          <Box sx={{ p: 2 }}>
            <Grid container spacing={1.5}>
              {[
                {
                  label: 'Presentes',
                  value: stats.presente,
                  color: '#16a34a',
                  bg: '#dcfce7',
                  icon: <PresenteIcon sx={{ fontSize: 20 }} />,
                },
                {
                  label: 'Ausentes',
                  value: stats.ausente,
                  color: '#dc2626',
                  bg: '#fee2e2',
                  icon: <AusenteIcon sx={{ fontSize: 20 }} />,
                },
                {
                  label: 'Tardanzas',
                  value: stats.tardanzas,
                  color: '#d97706',
                  bg: '#fef3c7',
                  icon: <TardanzaIcon sx={{ fontSize: 20 }} />,
                },
                {
                  label: 'Total clases',
                  value: stats.total,
                  color: accent,
                  bg: alpha(accent, 0.1),
                  icon: <CalIcon sx={{ fontSize: 20 }} />,
                },
              ].map(m => (
                <Grid key={m.label} size={{ xs: 6, sm: 3 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '14px',
                      bgcolor: isDark ? alpha(m.color, 0.12) : m.bg,
                      border: `1px solid ${alpha(m.color, 0.2)}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Box sx={{ color: m.color }}>{m.icon}</Box>
                    <Typography variant="h4" fontWeight={900} sx={{ color: m.color, lineHeight: 1 }}>
                      {m.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: m.color, fontWeight: 600, textAlign: 'center' }}>
                      {m.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Card>

        {/* ── Selector de vista ── */}
        {detalle.length > 0 && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Registro detallado
              </Typography>
              <ToggleButtonGroup
                value={vista}
                exclusive
                onChange={(_, v) => { if (v) setVista(v); }}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                    borderRadius: '8px !important',
                    px: 1.5, py: 0.5,
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      bgcolor: alpha(accent, 0.12),
                      color: accent,
                      fontWeight: 700,
                    },
                  },
                  gap: 0.5,
                }}
              >
                <ToggleButton value="resumen">
                  <Tooltip title="Vista resumen">
                    <ChartIcon sx={{ fontSize: 18 }} />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="calendario">
                  <Tooltip title="Vista calendario">
                    <CalIcon sx={{ fontSize: 18 }} />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="lista">
                  <Tooltip title="Vista lista">
                    <ListIcon sx={{ fontSize: 18 }} />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* ── Vista Resumen (barras por mes) ── */}
            {vista === 'resumen' && (
              <Fade in timeout={250}>
                <Box>
                  <BarrasMensuales
                    porMes={porMes}
                    accent={accent}
                    isDark={isDark}
                  />
                  <TendenciaAsistencia
                    porMes={porMes}
                    accent={accent}
                    isDark={isDark}
                  />
                </Box>
              </Fade>
            )}

            {/* ── Vista Calendario ── */}
            {vista === 'calendario' && (
              <Fade in timeout={250}>
                <Box>
                  {porMes.map(([key, registros]) => {
                    const [anio, mes] = key.split('-').map(Number);
                    return (
                      <CalendarioDotsMes
                        key={key}
                        anio={anio}
                        mes={mes}
                        registros={registros}
                        isDark={isDark}
                        accent={accent}
                      />
                    );
                  })}
                </Box>
              </Fade>
            )}

            {/* ── Vista Lista ── */}
            {vista === 'lista' && (
              <Fade in timeout={250}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {detalle.map((d, i) => {
                    const estadoKey = (d.estado ?? 'presente') as keyof typeof ESTADOS_ASISTENCIA;
                    const estado    = ESTADOS_ASISTENCIA[estadoKey] ?? ESTADOS_ASISTENCIA.presente;
                    const fecha     = d.fecha ?? d.created_at ?? '';
                    const diaSem    = fecha ? getDiaSemana(fecha) : '';

                    return (
                      <Card
                        key={i}
                        elevation={0}
                        sx={{
                          borderRadius: '12px',
                          border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                          overflow: 'hidden',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5 }}>
                          {/* Indicador color */}
                          <Box
                            sx={{
                              width: 4,
                              alignSelf: 'stretch',
                              bgcolor: estado.color,
                              borderRadius: 2,
                              flexShrink: 0,
                            }}
                          />

                          {/* Día de semana pill */}
                          <Box
                            sx={{
                              width: 32, height: 32, borderRadius: '8px',
                              bgcolor: alpha(estado.color, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Typography variant="caption" fontWeight={800} sx={{ color: estado.color }}>
                              {diaSem}
                            </Typography>
                          </Box>

                          {/* Fecha */}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {fecha
                                ? new Date(fecha + 'T12:00:00').toLocaleDateString('es-BO', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                  })
                                : 'Fecha no disponible'}
                            </Typography>
                            {d.observacion && (
                              <Typography variant="caption" color="text.secondary">
                                {d.observacion}
                              </Typography>
                            )}
                          </Box>

                          {/* Estado badge */}
                          <Chip
                            icon={estado.icon}
                            label={estado.label}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              bgcolor: isDark ? alpha(estado.color, 0.15) : estado.bg,
                              color: estado.color,
                              '& .MuiChip-icon': { color: estado.color },
                            }}
                          />
                        </Box>
                      </Card>
                    );
                  })}
                </Box>
              </Fade>
            )}
          </>
        )}

        {/* Sin datos */}
        {!isLoading && detalle.length === 0 && stats.total === 0 && (
          <Box
            sx={{
              textAlign: 'center', py: 8,
              borderRadius: '18px',
              border: `2px dashed ${alpha(accent, 0.2)}`,
            }}
          >
            <CalIcon sx={{ fontSize: 56, color: alpha(accent, 0.3), mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Sin registros de asistencia
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Tu docente aún no ha registrado asistencias para esta materia.
            </Typography>
          </Box>
        )}
      </Box>
    </Fade>
  );
};

// ── Sub-componente: Barras mensuales ─────────────────────────
const BarrasMensuales: React.FC<{
  porMes: [string, any[]][];
  accent: string;
  isDark: boolean;
}> = ({ porMes, accent, isDark }) => {
  if (porMes.length === 0) return null;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
        p: 2.5, mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ChartIcon sx={{ color: accent, fontSize: 18 }} />
        <Typography variant="subtitle2" fontWeight={700}>
          Asistencia por mes
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        {porMes.map(([key, registros]) => {
          const [, mes] = key.split('-').map(Number);
          const presentes  = registros.filter(r => r.estado === 'presente' || r.estado === 'justificado').length;
          const total      = registros.length;
          const pct        = total > 0 ? Math.round((presentes / total) * 100) : 0;
          const barColor   = pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';
          const barH       = Math.max(8, pct * 0.9); // px máx ~90

          return (
            <Box key={key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: barColor }}>
                {pct}%
              </Typography>
              <Tooltip title={`${presentes}/${total} clases`}>
                <Box
                  sx={{
                    width: 32,
                    height: barH,
                    bgcolor: barColor,
                    borderRadius: '6px 6px 2px 2px',
                    opacity: 0.85,
                    transition: 'all 0.3s ease',
                    cursor: 'default',
                    '&:hover': { opacity: 1, transform: 'scaleY(1.05)', transformOrigin: 'bottom' },
                  }}
                />
              </Tooltip>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {getNombreMes(mes)}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Leyenda */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
        {[
          { label: '≥ 80%', color: '#16a34a' },
          { label: '60-79%', color: '#d97706' },
          { label: '< 60%', color: '#dc2626' },
        ].map(l => (
          <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, bgcolor: l.color, borderRadius: '3px' }} />
            <Typography variant="caption" color="text.secondary">{l.label}</Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
};

// ── Sub-componente: Tendencia ────────────────────────────────
const TendenciaAsistencia: React.FC<{
  porMes: [string, any[]][];
  accent: string;
  isDark: boolean;
}> = ({ porMes, accent, isDark }) => {
  if (porMes.length < 2) return null;

  const datos = porMes.map(([key, registros]) => {
    const [, mes] = key.split('-').map(Number);
    const presentes = registros.filter(r => r.estado === 'presente' || r.estado === 'justificado').length;
    const total     = registros.length;
    return {
      mes: getNombreMes(mes),
      pct: total > 0 ? Math.round((presentes / total) * 100) : 0,
    };
  });

  const ultimo   = datos[datos.length - 1].pct;
  const penultimo = datos[datos.length - 2].pct;
  const tendencia = ultimo - penultimo;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
        p: 2.5, mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <TrendIcon sx={{ color: tendencia >= 0 ? '#16a34a' : '#dc2626', fontSize: 18 }} />
        <Typography variant="subtitle2" fontWeight={700}>
          Tendencia reciente
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {datos.slice(-4).map((d, i) => (
          <Box key={i} sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
            <Typography variant="caption" color="text.secondary">{d.mes}</Typography>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ color: d.pct >= 80 ? '#16a34a' : d.pct >= 60 ? '#d97706' : '#dc2626' }}
            >
              {d.pct}%
            </Typography>
          </Box>
        ))}
        <Box sx={{ ml: 'auto', textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary">vs mes anterior</Typography>
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{ color: tendencia >= 0 ? '#16a34a' : '#dc2626' }}
          >
            {tendencia >= 0 ? '+' : ''}{tendencia}%
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

// ── Sub-componente: Calendario de puntos ─────────────────────
const CalendarioDotsMes: React.FC<{
  anio:      number;
  mes:       number;
  registros: any[];
  isDark:    boolean;
  accent:    string;
}> = ({ anio, mes, registros, isDark, accent }) => {
  const nombreMes = new Date(anio, mes - 1, 1).toLocaleDateString('es-BO', { month: 'long', year: 'numeric' });

  // Mapear fecha → estado
  const mapaFechas: Record<string, string> = {};
  registros.forEach(r => {
    const f = r.fecha ?? r.created_at ?? '';
    if (f) mapaFechas[f.slice(0, 10)] = r.estado ?? 'presente';
  });

  // Días del mes
  const primerDia = new Date(anio, mes - 1, 1).getDay(); // 0=Dom
  const totalDias = new Date(anio, mes, 0).getDate();
  const dias: (number | null)[] = [...Array(primerDia).fill(null), ...Array.from({ length: totalDias }, (_, i) => i + 1)];
  // Completar hasta múltiplo de 7
  while (dias.length % 7 !== 0) dias.push(null);

  const DIAS_SEM = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
        p: 2.5, mb: 2,
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'capitalize', mb: 2 }}>
        {nombreMes}
      </Typography>

      {/* Cabecera días semana */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
          mb: 1,
        }}
      >
        {DIAS_SEM.map(d => (
          <Typography
            key={d}
            variant="caption"
            sx={{ textAlign: 'center', color: 'text.disabled', fontSize: '0.65rem', fontWeight: 600 }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* Grilla de días */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
        }}
      >
        {dias.map((dia, idx) => {
          if (!dia) return <Box key={idx} />;

          const key = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
          const estadoKey = (mapaFechas[key] ?? null) as keyof typeof ESTADOS_ASISTENCIA | null;
          const estado    = estadoKey ? ESTADOS_ASISTENCIA[estadoKey] : null;

          return (
            <Tooltip
              key={idx}
              title={estado ? `${dia}: ${estado.label}` : `${dia}`}
              placement="top"
              arrow
            >
              <Box
                sx={{
                  aspectRatio: '1',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: estado ? 'default' : 'default',
                  bgcolor: estado
                    ? (isDark ? alpha(estado.color, 0.25) : alpha(estado.color, 0.15))
                    : isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
                  border: `1px solid ${estado
                    ? alpha(estado.color, 0.35)
                    : isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
                  transition: 'transform 0.15s',
                  '&:hover': estado ? { transform: 'scale(1.15)' } : {},
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: estado ? 700 : 400,
                    color: estado ? estado.color : 'text.disabled',
                  }}
                >
                  {dia}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Leyenda del mes */}
      <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, flexWrap: 'wrap' }}>
        {Object.entries(ESTADOS_ASISTENCIA).map(([key, val]) => {
          const count = registros.filter(r => (r.estado ?? 'presente') === key).length;
          if (count === 0) return null;
          return (
            <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: val.color, borderRadius: '2px' }} />
              <Typography variant="caption" color="text.secondary">
                {val.label}: {count}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
};

export default AsistenciaEstudianteView;