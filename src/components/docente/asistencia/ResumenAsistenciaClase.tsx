'use client';
// components/docente/asistencia/ResumenAsistenciaClase.tsx
// ✅ VERSIÓN FINAL — incluye exportación PDF y Excel integrada

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Avatar, Chip,
  TextField, InputAdornment, ToggleButton, ToggleButtonGroup,
  Stack, Grid, Skeleton, Button, CircularProgress,
  Tooltip, useTheme, alpha,
} from '@mui/material';
import { keyframes } from '@mui/system';
import CheckCircleRoundedIcon         from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon              from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon          from '@mui/icons-material/AccessTimeRounded';
import VerifiedRoundedIcon            from '@mui/icons-material/VerifiedRounded';
import SearchRoundedIcon              from '@mui/icons-material/SearchRounded';
import TrendingUpIcon                 from '@mui/icons-material/TrendingUp';
import TrendingDownIcon               from '@mui/icons-material/TrendingDown';
import WarningAmberRoundedIcon        from '@mui/icons-material/WarningAmberRounded';
import PeopleAltRoundedIcon           from '@mui/icons-material/PeopleAltRounded';
import CalendarMonthRoundedIcon       from '@mui/icons-material/CalendarMonthRounded';
import EditRoundedIcon                from '@mui/icons-material/EditRounded';
import AutoGraphRoundedIcon           from '@mui/icons-material/AutoGraphRounded';
import PictureAsPdfRoundedIcon        from '@mui/icons-material/PictureAsPdfRounded';
import TableChartRoundedIcon          from '@mui/icons-material/TableChartRounded';

import { EstudianteReporteClase, ResumenClase } from '@/types/asistenciaTypes';
import {
  descargarPaseDia,
  descargarPeriodoClase,
} from '@/services/reportesAsistenciaService';
import { toast } from 'react-hot-toast';

// ──────────────────────────────────────────────
// ANIMACIONES
// ──────────────────────────────────────────────

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const countAnim = keyframes`
  from { opacity: 0; transform: scale(0.7); }
  to   { opacity: 1; transform: scale(1); }
`;

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────

const getPctColor    = (p: number) => p >= 80 ? '#10b981' : p >= 65 ? '#f59e0b' : '#ef4444';
const getPctGradient = (p: number) =>
  p >= 80 ? 'linear-gradient(90deg,#10b981,#34d399)' :
  p >= 65 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' :
            'linear-gradient(90deg,#ef4444,#f87171)';

// ──────────────────────────────────────────────
// BOTÓN DE DESCARGA
// ──────────────────────────────────────────────

const BtnDescarga: React.FC<{
  label:    string;
  icon:     React.ReactNode;
  color:    string;
  gradient: string;
  loading:  boolean;
  onClick:  () => void;
  size?:    'small' | 'medium';
}> = ({ label, icon, color, gradient, loading, onClick, size = 'small' }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Button
      size={size}
      onClick={onClick}
      disabled={loading}
      startIcon={loading
        ? <CircularProgress size={13} sx={{ color: '#fff' }} />
        : icon
      }
      sx={{
        background:    gradient,
        color:         '#fff',
        fontWeight:    800,
        textTransform: 'none',
        borderRadius:  2,
        px:            1.8,
        py:            0.6,
        fontSize:      12,
        boxShadow:     `0 3px 10px ${alpha(color, 0.35)}`,
        whiteSpace:    'nowrap',
        transition:    'all 0.25s ease',
        '&:hover': {
          background: gradient,
          filter:     'brightness(1.1)',
          transform:  'translateY(-2px)',
          boxShadow:  `0 6px 16px ${alpha(color, 0.45)}`,
        },
        '&:active':   { transform: 'scale(0.97)' },
        '&:disabled': {
          background: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
          color:      'text.disabled',
          boxShadow:  'none',
        },
      }}
    >
      {loading ? 'Generando...' : label}
    </Button>
  );
};

// ──────────────────────────────────────────────
// PANEL DE EXPORTACIÓN — Pase del día + Clase
// ──────────────────────────────────────────────

const PanelExportacion: React.FC<{
  asignacionId:  number;
  fechaPaseDia:  string;          // fecha del pase de lista recién guardado
  fechaInicio?:  string;
  fechaFin?:     string;
}> = ({ asignacionId, fechaPaseDia, fechaInicio, fechaFin }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Estado por botón: 'pdf' | 'excel' | null
  const [loadingPase,   setLoadingPase]   = useState<'pdf' | 'excel' | null>(null);
  const [loadingClase,  setLoadingClase]  = useState<'pdf' | 'excel' | null>(null);

  const handlePaseDia = useCallback(async (formato: 'pdf' | 'excel') => {
    setLoadingPase(formato);
    try {
      await descargarPaseDia({ asignacion_docente_id: asignacionId, fecha: fechaPaseDia, formato });
      toast.success(`Pase del día descargado (${formato.toUpperCase()})`);
    } catch {
      toast.error('Error al generar el reporte');
    } finally {
      setLoadingPase(null);
    }
  }, [asignacionId, fechaPaseDia]);

  const handleClase = useCallback(async (formato: 'pdf' | 'excel') => {
    setLoadingClase(formato);
    try {
      await descargarPeriodoClase({
        asignacion_docente_id: asignacionId,
        fecha_inicio: fechaInicio,
        fecha_fin:    fechaFin,
        formato,
      });
      toast.success(`Reporte de clase descargado (${formato.toUpperCase()})`);
    } catch {
      toast.error('Error al generar el reporte');
    } finally {
      setLoadingClase(null);
    }
  }, [asignacionId, fechaInicio, fechaFin]);

  return (
    <Box sx={{
      display: 'flex', flexWrap: 'wrap', gap: 3,
      p: 2.5, borderRadius: 3,
      background: isDark
        ? 'linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))'
        : 'linear-gradient(145deg,#fff,#f9fafb)',
      border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
    }}>

      {/* ── Pase del día ── */}
      <Box>
        <Typography variant="caption" color="text.disabled" fontWeight={700}
          sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 10, display: 'block', mb: 1 }}>
          📋 Pase del día ({fechaPaseDia})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <BtnDescarga
            label="PDF"
            icon={<PictureAsPdfRoundedIcon sx={{ fontSize: 15 }} />}
            color="#ef4444"
            gradient="linear-gradient(135deg,#ef4444,#f87171)"
            loading={loadingPase === 'pdf'}
            onClick={() => handlePaseDia('pdf')}
          />
          <BtnDescarga
            label="Excel"
            icon={<TableChartRoundedIcon sx={{ fontSize: 15 }} />}
            color="#10b981"
            gradient="linear-gradient(135deg,#10b981,#34d399)"
            loading={loadingPase === 'excel'}
            onClick={() => handlePaseDia('excel')}
          />
        </Box>
      </Box>

      {/* Separador vertical */}
      <Box sx={{
        width: 1, alignSelf: 'stretch',
        bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07),
        display: { xs: 'none', sm: 'block' },
      }} />

      {/* ── Clase completa ── */}
      <Box>
        <Typography variant="caption" color="text.disabled" fontWeight={700}
          sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 10, display: 'block', mb: 1 }}>
          📊 Reporte de la clase (período completo)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <BtnDescarga
            label="PDF"
            icon={<PictureAsPdfRoundedIcon sx={{ fontSize: 15 }} />}
            color="#ef4444"
            gradient="linear-gradient(135deg,#ef4444,#f87171)"
            loading={loadingClase === 'pdf'}
            onClick={() => handleClase('pdf')}
          />
          <BtnDescarga
            label="Excel"
            icon={<TableChartRoundedIcon sx={{ fontSize: 15 }} />}
            color="#10b981"
            gradient="linear-gradient(135deg,#10b981,#34d399)"
            loading={loadingClase === 'excel'}
            onClick={() => handleClase('excel')}
          />
        </Box>
      </Box>

    </Box>
  );
};

// ──────────────────────────────────────────────
// STAT CARD
// ──────────────────────────────────────────────

const StatCard: React.FC<{
  label: string; value: number | string; icon: React.ReactNode;
  gradient: string; color: string; delay?: number; badge?: string;
}> = ({ label, value, icon, gradient, color, delay = 0, badge }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card sx={{
      borderRadius: 3,
      animation: `${countAnim} 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both`,
      background: isDark
        ? `linear-gradient(145deg,${alpha(color,0.15)},${alpha(color,0.05)})`
        : `linear-gradient(145deg,${alpha(color,0.08)},#fff)`,
      border: `1px solid ${alpha(color,0.2)}`,
      boxShadow: `0 4px 20px ${alpha(color,0.15)}`,
      position: 'relative', overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 10px 32px ${alpha(color,0.25)}` },
      '&::before': {
        content: '""', position: 'absolute',
        top: 0, left: 0, right: 0, height: 3, background: gradient,
      },
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: gradient, boxShadow: `0 4px 14px ${alpha(color,0.4)}`,
            '& svg': { fontSize: 24, color: '#fff' },
          }}>
            {icon}
          </Box>
          {badge && (
            <Chip label={badge} size="small" sx={{
              bgcolor: alpha(color,0.15), color,
              fontWeight: 800, fontSize: 10, height: 22, borderRadius: 1.5,
              border: `1px solid ${alpha(color,0.3)}`,
            }} />
          )}
        </Box>
        <Typography variant="h4" fontWeight={900} sx={{
          background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: -1, lineHeight: 1, mb: 0.5,
        }}>
          {value}
        </Typography>
        <Typography variant="body2" fontWeight={700} color="text.secondary">{label}</Typography>
      </CardContent>
    </Card>
  );
};

// ──────────────────────────────────────────────
// FILA DE ESTUDIANTE
// ──────────────────────────────────────────────

const FilaEstudiante: React.FC<{
  est:        EstudianteReporteClase;
  index:      number;
  onCorregir?: (est: EstudianteReporteClase) => void;
}> = ({ est, index, onCorregir }) => {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === 'dark';
  const pct     = Number(est.porcentaje_asistencia ?? 0);
  const color   = getPctColor(pct);
  const gradient = getPctGradient(pct);
  const iniciales = `${est.estudiante_nombres[0]}${est.estudiante_apellidos[0]}`;
  const esCritico = pct < 70;

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 2,
      p: 2, borderRadius: 2.5,
      animation: `${slideUp} 0.4s ease-out ${index * 0.04}s both`,
      background: isDark
        ? `linear-gradient(135deg,${alpha(color, esCritico ? 0.12 : 0.06)},${alpha(color,0.02)})`
        : `linear-gradient(135deg,${alpha(color, esCritico ? 0.08 : 0.03)},#fff)`,
      border: `1.5px solid ${alpha(color, esCritico ? 0.3 : 0.12)}`,
      transition: 'all 0.25s ease',
      '&:hover': {
        transform: 'translateX(6px)',
        boxShadow: `0 4px 20px ${alpha(color,0.2)}`,
        '& .btn-acciones': { opacity: 1 },
      },
    }}>
      <Typography variant="caption" fontWeight={800} color="text.disabled"
        sx={{ minWidth: 24, textAlign: 'center' }}>
        {index + 1}
      </Typography>

      <Avatar src={est.estudiante_foto ?? undefined} sx={{
        width: 40, height: 40, fontSize: 13, fontWeight: 800,
        background: gradient,
        border: `2px solid ${alpha(color,0.3)}`,
        boxShadow: `0 2px 10px ${alpha(color,0.3)}`,
      }}>
        {iniciales}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" fontWeight={800} noWrap>
            {est.estudiante_apellidos}, {est.estudiante_nombres}
          </Typography>
          {esCritico && (
            <Tooltip title="Asistencia crítica (< 70%)">
              <WarningAmberRoundedIcon sx={{ fontSize: 16, color: '#ef4444', flexShrink: 0 }} />
            </Tooltip>
          )}
        </Box>
        <Typography variant="caption" color="text.disabled" fontWeight={600}>
          {est.estudiante_codigo}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, alignItems: 'center' }}>
        {[
          { v: est.presentes,    color: '#10b981', icon: <CheckCircleRoundedIcon />,  label: 'Presentes' },
          { v: est.ausentes,     color: '#ef4444', icon: <CancelRoundedIcon />,       label: 'Ausentes' },
          { v: est.tardanzas,    color: '#f59e0b', icon: <AccessTimeRoundedIcon />,   label: 'Tardanzas' },
          { v: est.justificados, color: '#3b82f6', icon: <VerifiedRoundedIcon />,     label: 'Justificados' },
        ].map((s, i) => (
          <Tooltip key={i} title={s.label}>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              px: 1.2, py: 0.5, borderRadius: 1.5,
              bgcolor: alpha(s.color, isDark ? 0.15 : 0.1),
              border: `1px solid ${alpha(s.color,0.25)}`,
              minWidth: 36,
            }}>
              <Box sx={{ '& svg': { fontSize: 13, color: s.color } }}>{s.icon}</Box>
              <Typography variant="caption" fontWeight={800} sx={{ color: s.color, fontSize: 12 }}>
                {s.v}
              </Typography>
            </Box>
          </Tooltip>
        ))}
      </Box>

      <Box sx={{ width: 110, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.disabled" fontWeight={600}>Asistencia</Typography>
          <Typography variant="caption" fontWeight={900} sx={{ color }}>{pct}%</Typography>
        </Box>
        <Box sx={{
          height: 8, borderRadius: 4,
          bgcolor: isDark ? alpha('#fff',0.08) : alpha('#000',0.06),
          overflow: 'hidden',
        }}>
          <Box sx={{
            height: '100%', borderRadius: 4, background: gradient,
            width: `${pct}%`,
            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </Box>
      </Box>

      {onCorregir && (
        <Tooltip title="Ver historial / corregir asistencia" placement="left">
          <Box
            className="btn-acciones"
            onClick={() => onCorregir(est)}
            sx={{
              opacity: 0, transition: 'opacity 0.2s ease',
              width: 32, height: 32, borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: isDark ? alpha('#fbbf24',0.15) : alpha('#3b82f6',0.1),
              border: `1px solid ${isDark ? alpha('#fbbf24',0.3) : alpha('#3b82f6',0.25)}`,
              cursor: 'pointer', flexShrink: 0,
              '&:hover': { transform: 'scale(1.1)' },
            }}
          >
            <EditRoundedIcon sx={{ fontSize: 16, color: isDark ? '#fbbf24' : '#3b82f6' }} />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

// ──────────────────────────────────────────────
// SKELETON
// ──────────────────────────────────────────────

const ResumenSkeleton = () => (
  <Grid container spacing={2}>
    {Array.from({ length: 6 }).map((_, i) => (
      <Grid size={{ xs: 6, sm: 4, md: 2 }} key={i}>
        <Skeleton variant="rounded" height={110} sx={{ borderRadius: 3 }} />
      </Grid>
    ))}
  </Grid>
);

// ──────────────────────────────────────────────
// PROPS
// ──────────────────────────────────────────────

interface Props {
  resumen:      ResumenClase | null;
  estudiantes:  EstudianteReporteClase[];
  isLoading:    boolean;
  materiaNombre?:   string;
  asignacionId:     number;   // ← necesario para exportar
  fechaPaseDia:     string;   // ← fecha del pase recién guardado
  fechaInicio?:     string;
  fechaFin?:        string;
  onCorregirEstudiante?: (est: EstudianteReporteClase) => void;
}

// ──────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────

const ResumenAsistenciaClase: React.FC<Props> = ({
  resumen, estudiantes, isLoading,
  materiaNombre, asignacionId, fechaPaseDia, fechaInicio, fechaFin,
  onCorregirEstudiante,
}) => {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === 'dark';

  const [busqueda, setBusqueda] = useState('');
  const [filtro,   setFiltro]   = useState<'todos' | 'criticos' | 'perfectos'>('todos');

  const estudiantesFiltrados = useMemo(() => {
    let lista = [...estudiantes];
    if (filtro === 'criticos')  lista = lista.filter(e => Number(e.porcentaje_asistencia) < 70);
    if (filtro === 'perfectos') lista = lista.filter(e => Number(e.porcentaje_asistencia) === 100);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(e =>
        `${e.estudiante_nombres} ${e.estudiante_apellidos} ${e.estudiante_codigo}`
          .toLowerCase().includes(q)
      );
    }
    return lista;
  }, [estudiantes, busqueda, filtro]);

  if (isLoading) return <ResumenSkeleton />;
  if (!resumen || estudiantes.length === 0) return null;

  const promedio = Number(resumen.promedio_asistencia ?? 0);

  return (
    <Box sx={{ animation: `${slideUp} 0.5s ease-out` }}>

      {/* ── Encabezado con título + badge promedio ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 2, mb: 3, p: 3, borderRadius: 3,
        background: isDark
          ? 'linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))'
          : 'linear-gradient(145deg,#fff,#f9fafb)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? alpha('#fff',0.08) : alpha('#000',0.05)}`,
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: 2.5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isDark
              ? 'linear-gradient(135deg,#fbbf24,#f59e0b)'
              : 'linear-gradient(135deg,#3b82f6,#2563eb)',
            boxShadow: isDark
              ? '0 4px 16px rgba(251,191,36,0.4)'
              : '0 4px 16px rgba(59,130,246,0.4)',
          }}>
            <AutoGraphRoundedIcon sx={{ color: '#fff', fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={900} sx={{
              background: isDark
                ? 'linear-gradient(135deg,#fbbf24,#f59e0b)'
                : 'linear-gradient(135deg,#3b82f6,#2563eb)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: -0.5,
            }}>
              Resumen{materiaNombre ? ` — ${materiaNombre}` : ''}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {resumen.total_estudiantes} estudiantes · {resumen.total_dias_registrados} días registrados
            </Typography>
          </Box>
        </Box>

        {/* Badge promedio */}
        <Box sx={{
          px: 3, py: 1.5, borderRadius: 3,
          background: getPctGradient(promedio),
          boxShadow: `0 4px 16px ${alpha(getPctColor(promedio),0.4)}`,
        }}>
          <Typography variant="h5" fontWeight={900} sx={{ color: '#fff', lineHeight: 1 }}>
            {Math.round(promedio)}%
          </Typography>
          <Typography variant="caption" sx={{ color: alpha('#fff',0.9), fontWeight: 700, fontSize: 10 }}>
            Promedio clase
          </Typography>
        </Box>
      </Box>

      {/* ── Panel de exportación ── */}
      <Box sx={{ mb: 4 }}>
        <PanelExportacion
          asignacionId={asignacionId}
          fechaPaseDia={fechaPaseDia}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
        />
      </Box>

      {/* ── Tarjetas de totales ── */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard label="Estudiantes" value={resumen.total_estudiantes}
            icon={<PeopleAltRoundedIcon />}
            gradient="linear-gradient(135deg,#3b82f6,#60a5fa)" color="#3b82f6" delay={0} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard label="Días registrados" value={resumen.total_dias_registrados}
            icon={<CalendarMonthRoundedIcon />}
            gradient="linear-gradient(135deg,#8b5cf6,#a78bfa)" color="#8b5cf6" delay={0.05} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard label="Presentes" value={resumen.presentes}
            icon={<CheckCircleRoundedIcon />}
            gradient="linear-gradient(135deg,#10b981,#34d399)" color="#10b981" delay={0.1} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard label="Ausentes" value={resumen.ausentes}
            icon={<CancelRoundedIcon />}
            gradient="linear-gradient(135deg,#ef4444,#f87171)" color="#ef4444" delay={0.15} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard label="Tardanzas" value={resumen.tardanzas}
            icon={<AccessTimeRoundedIcon />}
            gradient="linear-gradient(135deg,#f59e0b,#fbbf24)" color="#f59e0b" delay={0.2} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard label="Críticos (<70%)" value={resumen.estudiantes_criticos}
            icon={<WarningAmberRoundedIcon />}
            gradient="linear-gradient(135deg,#ef4444,#f87171)" color="#ef4444" delay={0.25}
            badge={resumen.estudiantes_criticos > 0 ? '⚠️' : undefined} />
        </Grid>
      </Grid>

      {/* ── Filtros + búsqueda ── */}
      <Box sx={{
        display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center',
        mb: 3, p: 2.5, borderRadius: 3,
        background: isDark ? alpha('#fff',0.02) : alpha('#000',0.01),
        border: `1px solid ${isDark ? alpha('#fff',0.06) : alpha('#000',0.05)}`,
      }}>
        <TextField
          size="small" placeholder="Buscar estudiante..." value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          InputProps={{ startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
            </InputAdornment>
          )}}
          sx={{ flex: 1, minWidth: 200,
            '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontSize: 14 } }}
        />
        <ToggleButtonGroup
          value={filtro} exclusive
          onChange={(_, v) => v && setFiltro(v)}
          size="small"
          sx={{ '& .MuiToggleButton-root': {
            borderRadius: '10px !important', px: 2, fontWeight: 700, fontSize: 12, textTransform: 'none',
          }}}
        >
          <ToggleButton value="todos">Todos ({estudiantes.length})</ToggleButton>
          <ToggleButton value="criticos"
            sx={{ color: '#ef4444', '&.Mui-selected': { bgcolor: alpha('#ef4444',0.15), color: '#ef4444' } }}>
            ⚠️ Críticos ({resumen.estudiantes_criticos})
          </ToggleButton>
          <ToggleButton value="perfectos"
            sx={{ color: '#10b981', '&.Mui-selected': { bgcolor: alpha('#10b981',0.15), color: '#10b981' } }}>
            🏆 100% ({estudiantes.filter(e => Number(e.porcentaje_asistencia) === 100).length})
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* ── Lista de estudiantes ── */}
      {estudiantesFiltrados.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <SearchRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.4, mb: 2 }} />
          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            Sin resultados para "{busqueda}"
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {estudiantesFiltrados.map((est, i) => (
            <FilaEstudiante
              key={est.matricula_id}
              est={est} index={i}
              onCorregir={onCorregirEstudiante}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ResumenAsistenciaClase;