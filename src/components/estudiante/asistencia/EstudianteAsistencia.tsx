'use client';
// components/estudiante/asistencia/EstudianteAsistencia.tsx

import React, { useState, useMemo } from 'react';
import {
  Box, Typography, alpha, useTheme, keyframes,
  Fade, Skeleton, Grid, Paper, Chip, IconButton, Tooltip,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  BarChart as ResumenIcon,
  ListAlt as HistorialIcon,
  CheckCircle as OkIcon,
  Cancel as CancelIcon,
  Warning as WarnIcon,
  TrendingUp as TrendIcon,
  School as SchoolIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
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
// import { GraficoTendencias } from './GraficoTendencias';

// ── Animaciones ──────────────────────────────────────────────
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(-2deg); }
  50%       { transform: translateY(-6px) rotate(2deg); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// ── Tabs ─────────────────────────────────────────────────────
type VistaTab = 'resumen' | 'historial' | 'calendario' | 'estadisticas';

const TABS = [
  { key: 'resumen',      label: 'Resumen',      icon: <ResumenIcon sx={{ fontSize: 16 }} /> },
  { key: 'calendario',   label: 'Calendario',   icon: <CalendarIcon sx={{ fontSize: 16 }} /> },
  { key: 'historial',    label: 'Historial',    icon: <HistorialIcon sx={{ fontSize: 16 }} /> },
  { key: 'estadisticas', label: 'Estadísticas', icon: <TrendIcon sx={{ fontSize: 16 }} /> },
];

interface Props {
  user: any;
}

export const EstudianteAsistencia: React.FC<Props> = ({ user }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const accent     = isDark ? '#facc15' : '#0288d1';
  const accentDark = isDark ? '#f59e0b' : '#01579b';
  const gradient   = `linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%)`;

  // ── Estado ────────────────────────────────────────────────
  const [vistaActiva, setVistaActiva] = useState<VistaTab>('resumen');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin]       = useState('');
  const [asignacionId, setAsignacionId] = useState<number | undefined>();
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // ── Hooks ────────────────────────────────────────────────
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

  // ── Estadísticas mejoradas ────────────────────────────────
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

    // Calcular racha de asistencia
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

  const handleRefresh = () => {
    refrescarResumen();
    refrescarDetalle();
  };

  const handleLimpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    setAsignacionId(undefined);
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 4 }}>

      {/* ── Header con acciones ── */}
      <Fade in timeout={300}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CalendarIcon
                sx={{
                  color: accent,
                  fontSize: 36,
                  animation: `${float} 3s ease-in-out infinite`,
                }}
              />
              <Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    background: gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Mi Asistencia
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Seguimiento completo de tu asistencia académica
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Actualizar datos">
                <IconButton 
                  onClick={handleRefresh}
                  disabled={loadingResumen || loadingDetalle}
                  sx={{ 
                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                    '&:hover': { bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06) }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Filtros">
                <IconButton 
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  sx={{ 
                    bgcolor: mostrarFiltros ? alpha(accent, 0.15) : (isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03)),
                    color: mostrarFiltros ? accent : 'text.primary',
                    '&:hover': { bgcolor: alpha(accent, 0.2) }
                  }}
                >
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Filtros colapsables */}
          <Collapse in={mostrarFiltros}>
            <FiltrosAsistencia
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
              asignacionId={asignacionId}
              onFechaInicioChange={setFechaInicio}
              onFechaFinChange={setFechaFin}
              onAsignacionChange={setAsignacionId}
              onLimpiar={handleLimpiarFiltros}
              isDark={isDark}
              accent={accent}
            />
          </Collapse>
        </Box>
      </Fade>

      {/* ── Tarjetas estadísticas mejoradas ── */}
      {loadingResumen ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1,2,3,4,5].map(i => (
            <Grid key={i} size={{xs:6, sm:6, md:3}} >
              <Skeleton variant="rounded" height={120} sx={{ borderRadius: '16px' }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Fade in>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{xs:6, sm:6, md:3}}>
              <StatCard 
                label="Total clases" 
                value={stats.total} 
                color="text.primary" 
                icon={<SchoolIcon sx={{ fontSize: 20 }} />}
                isDark={isDark}
                subtitle="Registradas"
              />
            </Grid>

            <Grid size={{xs:6, sm:6, md:3}}>
              <StatCard 
                label="Presentes" 
                value={stats.presentes} 
                color="#1D9E75" 
                icon={<OkIcon sx={{ fontSize: 20 }} />}
                isDark={isDark}
                percentage={stats.total > 0 ? Math.round((stats.presentes / stats.total) * 100) : 0}
              />
            </Grid>

            <Grid size={{xs:6, sm:6, md:3}}>
              <StatCard 
                label="Ausentes" 
                value={stats.ausentes} 
                color="#D85A30" 
                icon={<CancelIcon sx={{ fontSize: 20 }} />}
                isDark={isDark}
                percentage={stats.total > 0 ? Math.round((stats.ausentes / stats.total) * 100) : 0}
              />
            </Grid>

            <Grid size={{xs:6, sm:6, md:3}}>
              <StatCard
                label="Promedio"
                value={`${stats.promedio}%`}
                color={
                  stats.promedio >= 85
                    ? '#1D9E75'
                    : stats.promedio >= 70
                    ? '#BA7517'
                    : '#D85A30'
                }
                icon={
                  stats.promedio >= 85
                    ? <OkIcon sx={{ fontSize: 20 }} />
                    : stats.promedio >= 70
                    ? <WarnIcon sx={{ fontSize: 20 }} />
                    : <CancelIcon sx={{ fontSize: 20 }} />
                }
                isDark={isDark}
                subtitle={
                  stats.tendencia === 'mejorando' ? '↗ Mejorando' :
                  stats.tendencia === 'empeorando' ? '↘ Bajando' :
                  '→ Estable'
                }
                trend={stats.tendencia}
              />
            </Grid>

            {/* <Grid size={{xs:6, sm:6, md:2.4}}>
              <StatCard 
                label="Racha actual" 
                value={stats.racha} 
                color="#7F77DD" 
                icon={<TrendIcon sx={{ fontSize: 20 }} />}
                isDark={isDark}
                subtitle={stats.racha > 0 ? 'días seguidos' : 'Sin racha'}
                highlight={stats.racha >= 5}
              />
            </Grid> */}
          </Grid>
        </Fade>
      )}

      {/* ── Tabs mejorados ── */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        mb: 3,
        p: 0.5,
        bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
        borderRadius: 3,
        border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
      }}>
        {TABS.map(tab => (
          <Box
            key={tab.key}
            onClick={() => setVistaActiva(tab.key as VistaTab)}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              px: 2,
              py: 1.25,
              borderRadius: 2.5,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              bgcolor: vistaActiva === tab.key 
                ? accent 
                : 'transparent',
              color: vistaActiva === tab.key 
                ? '#fff' 
                : 'text.secondary',
              fontWeight: vistaActiva === tab.key ? 600 : 500,
              fontSize: '0.875rem',
              '&:hover': {
                bgcolor: vistaActiva === tab.key 
                  ? accent 
                  : isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            {tab.icon}
            <Typography 
              variant="body2" 
              fontWeight="inherit"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {tab.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Contenido por vista ── */}
      <Fade in key={vistaActiva}>
        <Box sx={{ animation: `${slideUp} 0.3s ease-out` }}>
          {vistaActiva === 'resumen' && (
            <ResumenAsistencia
              reporte={reporte}
              isLoading={loadingResumen}
              accent={accent}
              accentDark={accentDark}
              isDark={isDark}
            />
          )}

          {vistaActiva === 'calendario' && (
            <CalendarioAsistencia
              detalle={detalle}
              isLoading={loadingDetalle}
              accent={accent}
              isDark={isDark}
            />
          )}

          {vistaActiva === 'historial' && (
            <HistorialAsistencia
              detalle={detalle}
              isLoading={loadingDetalle}
              accent={accent}
              isDark={isDark}
            />
          )}

          {vistaActiva === 'estadisticas' && (
            <EstadisticasAvanzadas
              detalle={detalle}
              reporte={reporte}
              isLoading={loadingDetalle || loadingResumen}
              accent={accent}
              isDark={isDark}
            />
          )}
        </Box>
      </Fade>

    </Box>
  );
};

// ── StatCard mejorado con más detalles ─────────────────────
const StatCard = ({ 
  label, 
  value, 
  color, 
  icon, 
  isDark,
  subtitle,
  percentage,
  trend,
  highlight,
}: any) => {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: isDark
          ? alpha(color === 'text.primary' ? '#fff' : color, 0.08)
          : alpha(color === 'text.primary' ? '#000' : color, 0.06),
        borderRadius: 3,
        p: 2.5,
        border: `1px solid ${alpha(color === 'text.primary' ? (isDark ? '#fff' : '#000') : color, 0.12)}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${alpha(color === 'text.primary' ? (isDark ? '#fff' : '#000') : color, 0.15)}`,
          border: `1px solid ${alpha(color === 'text.primary' ? (isDark ? '#fff' : '#000') : color, 0.25)}`,
        },
        ...(highlight && {
          animation: `${pulse} 2s ease-in-out infinite`,
          background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.15)} 100%)`,
        }),
      }}
    >
      

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {label}
          </Typography>
          <Box 
            sx={{ 
              p: 0.75, 
              borderRadius: 2,
              
            }}
          >
            {React.cloneElement(icon, { sx: { ...icon.props.sx, color } })}
          </Box>
        </Box>

        <Typography 
          variant="h4" 
          fontWeight={700}
          sx={{ 
            color,
            mb: 0.5,
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>

        {(subtitle || percentage !== undefined) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {percentage !== undefined && (
              <Chip
                label={`${percentage}%`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  bgcolor: alpha(color, 0.15),
                  color,
                }}
              />
            )}
            {subtitle && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{
                  ...(trend === 'mejorando' && { color: '#1D9E75' }),
                  ...(trend === 'empeorando' && { color: '#D85A30' }),
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

// Añadir Collapse import
import { Collapse } from '@mui/material';

export default EstudianteAsistencia;