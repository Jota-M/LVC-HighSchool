'use client';
// components/estudiante/asistencia/EstudianteAsistencia.tsx
// Módulo de Asistencia del estudiante con diseño institucional unificado

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box, Typography, alpha, useTheme, keyframes,
  Fade, Skeleton, Grid, Paper, Chip, IconButton, Tooltip,
  Collapse, Stack,
} from '@mui/material';
import {
  CalendarMonthRounded as CalendarIcon,
  BarChartRounded as ResumenIcon,
  ListAltRounded as HistorialIcon,
  CheckCircleRounded as OkIcon,
  CancelRounded as CancelIcon,
  AccessTimeRounded as TimeIcon,
  TrendingUpRounded as TrendIcon,
  SchoolRounded as SchoolIcon,
  FilterListRounded as FilterIcon,
  RefreshRounded as RefreshIcon,
  VerifiedRounded as VerifiedIcon,
  WarningAmberRounded as WarningIcon,
  AssignmentTurnedInRounded as JustificadoIcon,
  BoltRounded as BoltIcon,
} from '@mui/icons-material';

import {
  useAsistenciaEstudiante,
  useAsistenciaDetalleEstudiante,
} from '@/hooks/useEstudiante';

import { ResumenAsistencia } from './ResumenAsistencia';
import { HistorialAsistencia } from './HistorialAsistencia';
import { FiltrosAsistencia } from './FiltrosAsistencia';
import { EstadisticasAvanzadas } from './Estadisticasavanzadas';
import { CalendarioAsistencia } from './Calendarioasistencia';

// ── Animaciones ──────────────────────────────────────────────
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-5px); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.05); }
`;

// ── Paleta Dinámica Dual (Idéntica a Tareas y Exámenes) ──────
const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = isDark ? '#facc15' : '#0288d1';
  const accentColorEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${accentColor} 0%, ${accentColorEnd} 100%)`;
  const textOnAccent = isDark ? '#000000' : '#ffffff';
  return { isDark, accentColor, accentColorEnd, gradBg, textOnAccent };
};

// ── Tabs Disponibles ─────────────────────────────────────────
type VistaTab = 'resumen' | 'calendario' | 'historial' | 'estadisticas';

interface TabConfig {
  key: VistaTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

const TABS: TabConfig[] = [
  { key: 'resumen',      label: 'Resumen por Materia', icon: ResumenIcon },
  { key: 'calendario',   label: 'Calendario',          icon: CalendarIcon },
  { key: 'historial',    label: 'Historial Detallado', icon: HistorialIcon },
  { key: 'estadisticas', label: 'Estadísticas',        icon: TrendIcon },
];

interface Props {
  user: any;
}

export const EstudianteAsistencia: React.FC<Props> = ({ user }) => {
  const { isDark, accentColor, accentColorEnd, gradBg, textOnAccent } = usePalette();

  // ── Estado de navegación y filtros ──
  const [vistaActiva, setVistaActiva] = useState<VistaTab>('resumen');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin]       = useState('');
  const [asignacionId, setAsignacionId] = useState<number | undefined>();
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // ── Hooks de datos ──
  const { reporte = [], isLoading: loadingResumen, refrescar: refrescarResumen } = useAsistenciaEstudiante({
    asignacion_docente_id: asignacionId,
    fecha_inicio: fechaInicio || undefined,
    fecha_fin:    fechaFin    || undefined,
  });

  const { detalle = [], isLoading: loadingDetalle, refrescar: refrescarDetalle } = useAsistenciaDetalleEstudiante({
    asignacion_docente_id: asignacionId,
    fecha_inicio: fechaInicio || undefined,
    fecha_fin:    fechaFin    || undefined,
  });

  // ── Estadísticas calculadas ──
  const stats = useMemo(() => {
    if (!detalle || !detalle.length) {
      return {
        total: 0,
        presentes: 0,
        ausentes: 0,
        justificados: 0,
        tardanzas: 0,
        promedio: 0,
        tendencia: 'neutral' as 'mejorando' | 'empeorando' | 'neutral',
        racha: 0,
      };
    }

    const total = detalle.length;
    const presentes = detalle.filter(d => d.estado === 'presente').length;
    const ausentes = detalle.filter(d => d.estado === 'ausente').length;
    const justificados = detalle.filter(d => d.estado === 'justificado').length;
    const tardanzas = detalle.filter(d => d.estado === 'tardanza').length;
    const promedio = total > 0 ? Math.round((presentes / total) * 100) : 0;

    // Calcular racha de asistencia consecutiva
    let racha = 0;
    const sorted = [...detalle].sort((a, b) =>
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    for (const item of sorted) {
      if (item.estado === 'presente') racha++;
      else break;
    }

    // Calcular tendencia (últimos 30 días vs anteriores)
    const hoy = new Date();
    const hace30 = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ultimos30 = detalle.filter(d => new Date(d.fecha) >= hace30);
    const anteriores = detalle.filter(d => new Date(d.fecha) < hace30);

    const promedioReciente = ultimos30.length > 0
      ? (ultimos30.filter(d => d.estado === 'presente').length / ultimos30.length) * 100
      : 0;
    const promedioAnterior = anteriores.length > 0
      ? (anteriores.filter(d => d.estado === 'presente').length / anteriores.length) * 100
      : 0;

    let tendencia: 'mejorando' | 'empeorando' | 'neutral' = 'neutral';
    if (promedioReciente > promedioAnterior + 5) tendencia = 'mejorando';
    else if (promedioReciente < promedioAnterior - 5) tendencia = 'empeorando';

    return { total, presentes, ausentes, justificados, tardanzas, promedio, tendencia, racha };
  }, [detalle]);

  const handleRefresh = useCallback(() => {
    refrescarResumen();
    refrescarDetalle();
  }, [refrescarResumen, refrescarDetalle]);

  const handleLimpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    setAsignacionId(undefined);
  };

  const hayFiltrosActivos = Boolean(fechaInicio || fechaFin || asignacionId !== undefined);
  const nombreUsuario = user?.username || user?.nombres || 'Estudiante';

  return (
    <Box sx={{ pb: 4 }}>

      {/* ══ 1. HEADER INSTITUCIONAL ══ */}
      <Fade in timeout={450}>
        <Box sx={{ mb: 3.5 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2.2, md: 0 },
              mb: 3,
            }}
          >
            {/* IZQUIERDA: TÍTULO + SALUDO */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.6 }}>
                <CalendarIcon
                  sx={{
                    color: accentColor,
                    fontSize: { xs: 32, md: 40 },
                    animation: `${bounce} 2s infinite ease-in-out`,
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '1.6rem', sm: '2rem', md: '2.4rem' },
                    fontWeight: 900,
                    background: gradBg,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: -0.6,
                    lineHeight: 1.15,
                  }}
                >
                  Mi Asistencia Académica
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.8, fontWeight: 500 }}>
                Hola, <strong>{nombreUsuario}</strong> — seguimiento en tiempo real de tu puntualidad, asistencias y justificaciones.
              </Typography>
            </Box>

            {/* DERECHA: BADGES DE RESUMEN Y BOTONES DE ACCIÓN */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {/* Badge de Porcentaje Global */}
              {stats.total > 0 && (
                <Chip
                  icon={
                    stats.promedio >= 85
                      ? <VerifiedIcon sx={{ fontSize: '16px !important' }} />
                      : stats.promedio >= 75
                        ? <OkIcon sx={{ fontSize: '16px !important' }} />
                        : <WarningIcon sx={{ fontSize: '16px !important' }} />
                  }
                  label={`${stats.promedio}% Global`}
                  size="small"
                  sx={{
                    height: 34,
                    fontWeight: 800,
                    fontSize: 12.5,
                    bgcolor: stats.promedio >= 80
                      ? (isDark ? alpha('#10b981', 0.18) : alpha('#10b981', 0.12))
                      : stats.promedio >= 70
                        ? (isDark ? alpha('#f59e0b', 0.18) : alpha('#f59e0b', 0.12))
                        : (isDark ? alpha('#ef4444', 0.18) : alpha('#ef4444', 0.12)),
                    color: stats.promedio >= 80
                      ? (isDark ? '#34d399' : '#059669')
                      : stats.promedio >= 70
                        ? (isDark ? '#fbbf24' : '#d97706')
                        : (isDark ? '#f87171' : '#dc2626'),
                    border: `1.5px solid ${alpha(stats.promedio >= 80 ? '#10b981' : stats.promedio >= 70 ? '#f59e0b' : '#ef4444', 0.35)}`,
                    borderRadius: '11px',
                    '& .MuiChip-icon': {
                      color: stats.promedio >= 80
                        ? (isDark ? '#34d399' : '#059669')
                        : stats.promedio >= 70
                          ? (isDark ? '#fbbf24' : '#d97706')
                          : (isDark ? '#f87171' : '#dc2626'),
                    },
                  }}
                />
              )}

              {/* Badge de Racha */}
              {stats.racha >= 3 && (
                <Chip
                  icon={<BoltIcon sx={{ fontSize: '16px !important' }} />}
                  label={`Racha de ${stats.racha} clases`}
                  size="small"
                  sx={{
                    height: 34,
                    fontWeight: 800,
                    fontSize: 12.5,
                    bgcolor: isDark ? alpha('#8b5cf6', 0.18) : alpha('#8b5cf6', 0.12),
                    color: isDark ? '#c084fc' : '#7c3aed',
                    border: `1.5px solid ${alpha('#8b5cf6', 0.35)}`,
                    borderRadius: '11px',
                    '& .MuiChip-icon': { color: isDark ? '#c084fc' : '#7c3aed' },
                  }}
                />
              )}

              {/* Botón de Filtros */}
              <Tooltip title={mostrarFiltros ? 'Ocultar filtros' : 'Abrir filtros de búsqueda'}>
                <IconButton
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  sx={{
                    borderRadius: '14px',
                    border: `1.5px solid ${hayFiltrosActivos ? accentColor : alpha(isDark ? '#fff' : '#000', 0.12)}`,
                    bgcolor: hayFiltrosActivos
                      ? alpha(accentColor, 0.15)
                      : (isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03)),
                    color: hayFiltrosActivos ? accentColor : 'text.primary',
                    p: 1.1,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      bgcolor: alpha(accentColor, 0.18),
                      borderColor: accentColor,
                    },
                  }}
                >
                  <FilterIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>

              {/* Botón de Actualizar */}
              <Tooltip title="Actualizar asistencias">
                <IconButton
                  onClick={handleRefresh}
                  disabled={loadingResumen || loadingDetalle}
                  sx={{
                    borderRadius: '14px',
                    border: `1.5px solid ${alpha(accentColor, 0.3)}`,
                    bgcolor: isDark ? alpha(accentColor, 0.1) : alpha(accentColor, 0.06),
                    color: accentColor,
                    p: 1.1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: alpha(accentColor, 0.2),
                      transform: 'rotate(180deg)',
                    },
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Panel de Filtros Colapsable */}
          <Collapse in={mostrarFiltros}>
            <Box sx={{ mb: 2 }}>
              <FiltrosAsistencia
                fechaInicio={fechaInicio}
                fechaFin={fechaFin}
                asignacionId={asignacionId}
                onFechaInicioChange={setFechaInicio}
                onFechaFinChange={setFechaFin}
                onAsignacionChange={setAsignacionId}
                onLimpiar={handleLimpiarFiltros}
                isDark={isDark}
                accent={accentColor}
              />
            </Box>
          </Collapse>
        </Box>
      </Fade>

      {/* ══ 2. TARJETAS KPI DE ASISTENCIA (ESTILO TAREAS Y EVALUACIONES) ══ */}
      {loadingResumen || loadingDetalle ? (
        <Grid container spacing={2} sx={{ mb: 3.5 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <Grid key={i} size={{ xs: 6, sm: 6, md: 2.4 }}>
              <Skeleton variant="rounded" height={105} sx={{ borderRadius: '16px' }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3.5 }}>
          {/* TOTAL CLASES */}
          <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
            <KpiAsistenciaCard
              label="Clases Totales"
              value={stats.total}
              sublabel="Sesiones computadas"
              color="#6366f1"
              icon={SchoolIcon}
              isDark={isDark}
              delay={0}
            />
          </Grid>

          {/* PRESENTES */}
          <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
            <KpiAsistenciaCard
              label="Asistencias"
              value={stats.presentes}
              sublabel={stats.total > 0 ? `${Math.round((stats.presentes / stats.total) * 100)}% de puntualidad` : 'Sin registros'}
              color="#10b981"
              icon={OkIcon}
              isDark={isDark}
              delay={60}
            />
          </Grid>

          {/* FALTAS / AUSENCIAS */}
          <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
            <KpiAsistenciaCard
              label="Ausencias"
              value={stats.ausentes}
              sublabel={stats.total > 0 ? `${Math.round((stats.ausentes / stats.total) * 100)}% de inasistencia` : 'Sin faltas'}
              color="#ef4444"
              icon={CancelIcon}
              isDark={isDark}
              delay={120}
            />
          </Grid>

          {/* TARDANZAS */}
          <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
            <KpiAsistenciaCard
              label="Tardanzas"
              value={stats.tardanzas}
              sublabel="Ingresos con atraso"
              color="#f59e0b"
              icon={TimeIcon}
              isDark={isDark}
              delay={180}
            />
          </Grid>

          {/* PROMEDIO Y TENDENCIA */}
          <Grid size={{ xs: 12, sm: 12, md: 2.4 }}>
            <KpiAsistenciaCard
              label="Rendimiento Global"
              value={`${stats.promedio}%`}
              sublabel={
                stats.tendencia === 'mejorando' ? '↗ Tendencia favorable' :
                stats.tendencia === 'empeorando' ? '↘ Requiere atención' :
                '→ Asistencia regular'
              }
              color={
                stats.promedio >= 85 ? '#10b981' :
                stats.promedio >= 75 ? '#3b82f6' :
                stats.promedio >= 65 ? '#f59e0b' : '#ef4444'
              }
              icon={TrendIcon}
              isDark={isDark}
              delay={240}
              trend={stats.tendencia === 'mejorando' ? 'up' : stats.tendencia === 'empeorando' ? 'down' : undefined}
            />
          </Grid>
        </Grid>
      )}

      {/* ══ 3. TABS SEGMENTADOS INSTITUCIONALES ══ */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mb: 3,
          p: 0.8,
          borderRadius: '18px',
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.025)',
          border: `1.5px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}`,
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = vistaActiva === tab.key;

          return (
            <Box
              key={tab.key}
              onClick={() => setVistaActiva(tab.key)}
              sx={{
                flex: { xs: '0 0 auto', sm: 1 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                px: { xs: 2.2, sm: 2 },
                py: 1.25,
                borderRadius: '13px',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                bgcolor: isSelected ? accentColor : 'transparent',
                color: isSelected ? textOnAccent : 'text.secondary',
                fontWeight: isSelected ? 800 : 600,
                fontSize: '0.85rem',
                boxShadow: isSelected ? `0 4px 14px ${alpha(accentColor, 0.35)}` : 'none',
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: isSelected
                    ? accentColor
                    : isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
                  color: isSelected ? textOnAccent : 'text.primary',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
              <Typography variant="body2" fontWeight="inherit">
                {tab.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* ══ 4. VISTAS DE CONTENIDO ══ */}
      <Fade in key={vistaActiva} timeout={300}>
        <Box sx={{ animation: `${fadeUp} 0.35s ease-out` }}>
          {vistaActiva === 'resumen' && (
            <ResumenAsistencia
              reporte={reporte}
              isLoading={loadingResumen}
              accent={accentColor}
              accentDark={accentColorEnd}
              isDark={isDark}
            />
          )}

          {vistaActiva === 'calendario' && (
            <CalendarioAsistencia
              detalle={detalle}
              isLoading={loadingDetalle}
              accent={accentColor}
              isDark={isDark}
            />
          )}

          {vistaActiva === 'historial' && (
            <HistorialAsistencia
              detalle={detalle}
              isLoading={loadingDetalle}
              accent={accentColor}
              isDark={isDark}
            />
          )}

          {vistaActiva === 'estadisticas' && (
            <EstadisticasAvanzadas
              detalle={detalle}
              reporte={reporte}
              isLoading={loadingDetalle || loadingResumen}
              accent={accentColor}
              isDark={isDark}
            />
          )}
        </Box>
      </Fade>

    </Box>
  );
};

// ── Tarjeta KPI Reutilizable con estilo consistente ──────────
interface KpiCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  color: string;
  icon: React.ElementType;
  isDark: boolean;
  delay?: number;
  trend?: 'up' | 'down';
}

const KpiAsistenciaCard: React.FC<KpiCardProps> = ({
  label,
  value,
  sublabel,
  color,
  icon: Icon,
  isDark,
  delay = 0,
  trend,
}) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 1.8, sm: 2.2 },
      borderRadius: '16px',
      border: `2px solid ${alpha(color, isDark ? 0.28 : 0.2)}`,
      background: isDark
        ? `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, rgba(15, 23, 42, 0.75) 100%)`
        : `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, #ffffff 100%)`,
      boxShadow: isDark
        ? '0 6px 20px rgba(0,0,0,0.35)'
        : `0 3px 12px ${alpha(color, 0.08)}`,
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: `${fadeUp} 0.4s ease-out ${delay}ms both`,
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-3px)',
        borderColor: color,
        boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: '11px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(color, 0.16),
          color: color,
        }}
      >
        <Icon sx={{ fontSize: 21 }} />
      </Box>

      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {trend === 'up' && <TrendIcon sx={{ fontSize: 20, color: '#10b981' }} />}
          {trend === 'down' && <TrendIcon sx={{ fontSize: 20, color: '#ef4444', transform: 'rotate(90deg)' }} />}
        </Box>
      )}
    </Box>

    <Typography
      sx={{
        fontSize: { xs: '1.75rem', sm: '2.1rem' },
        fontWeight: 900,
        lineHeight: 1.1,
        letterSpacing: '-0.03em',
        color: color,
        mb: 0.35,
      }}
    >
      {value}
    </Typography>

    <Typography
      variant="caption"
      sx={{
        fontWeight: 800,
        fontSize: '0.74rem',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        color: 'text.secondary',
        display: 'block',
      }}
    >
      {label}
    </Typography>

    {sublabel && (
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.68rem',
          color: 'text.disabled',
          fontWeight: 600,
          mt: 0.2,
          display: 'block',
        }}
      >
        {sublabel}
      </Typography>
    )}
  </Paper>
);

export default EstudianteAsistencia;