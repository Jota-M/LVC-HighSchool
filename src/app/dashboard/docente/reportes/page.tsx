'use client';
// app/dashboard/docente/reportes/page.tsx
// Módulo de reportes completo — Asistencia + Notas

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardActionArea,
  CardContent, Chip, Button, TextField, Stack, Divider,
  CircularProgress, Alert, Fade, Tabs, Tab, Autocomplete,
  Select, MenuItem, FormControl, InputLabel,
  useTheme, alpha,
} from '@mui/material';
import { keyframes } from '@mui/system';

// Iconos asistencia
import EventAvailableRoundedIcon    from '@mui/icons-material/EventAvailableRounded';
import CalendarTodayRoundedIcon     from '@mui/icons-material/CalendarTodayRounded';
import DateRangeRoundedIcon         from '@mui/icons-material/DateRangeRounded';
import AccountTreeRoundedIcon       from '@mui/icons-material/AccountTreeRounded';
import PersonSearchRoundedIcon      from '@mui/icons-material/PersonSearchRounded';
import EmojiEventsRoundedIcon       from '@mui/icons-material/EmojiEventsRounded';
import CompareArrowsRoundedIcon     from '@mui/icons-material/CompareArrowsRounded';
// Iconos notas
import GradeRoundedIcon             from '@mui/icons-material/GradeRounded';
import AssignmentRoundedIcon        from '@mui/icons-material/AssignmentRounded';
import PieChartRoundedIcon          from '@mui/icons-material/PieChartRounded';
import BarChartRoundedIcon          from '@mui/icons-material/BarChartRounded';
import PersonRoundedIcon            from '@mui/icons-material/PersonRounded';
import SummarizeRoundedIcon         from '@mui/icons-material/SummarizeRounded';
// Iconos comunes
import MenuBookRoundedIcon          from '@mui/icons-material/MenuBookRounded';
import PictureAsPdfRoundedIcon      from '@mui/icons-material/PictureAsPdfRounded';
import TableChartRoundedIcon        from '@mui/icons-material/TableChartRounded';
import ArrowBackRoundedIcon         from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon       from '@mui/icons-material/CheckCircleRounded';
import AssessmentRoundedIcon        from '@mui/icons-material/AssessmentRounded';
import GroupsRoundedIcon            from '@mui/icons-material/GroupsRounded';

// Servicios asistencia
import { asistenciaService }                      from '@/services/asistenciaService';
import {
  descargarPaseDia, descargarPeriodoClase,
  descargarTrimestresClase, descargarTrimestresEstudiante,
  descargarReporteEstudiante,
} from '@/services/reportesAsistenciaService';
// Servicios notas
import useReportesNotas                           from '@/hooks/useReportesNotas';
import { periodosEvaluacionService }              from '@/services/notasService';
import { dimensionesService }                     from '@/services/notasService';
import { evaluacionesService }                    from '@/services/notasService';
import { AsignacionDocente }                      from '@/services/asistenciaService';
import { PeriodoEvaluacion, DimensionEvaluacion, Evaluacion } from '@/types/notasTypes';
import { useAuth }                                from '@/context/AuthContext';
import { toast }                                  from 'react-hot-toast';

// ─────────────────────────────────────────────
// ANIMACIONES
// ─────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.93); }
  to   { opacity: 1; transform: scale(1); }
`;
const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
`;

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type ModuloReporte = 'asistencia' | 'notas';

type TipoReporteAsistencia =
  | 'pase_dia' | 'periodo_completo' | 'trimestres_clase'
  | 'estudiante_individual' | 'resumen_anual' | 'comparativo_materias';

type TipoReporteNotas =
  | 'boletin' | 'por_evaluacion' | 'por_dimension'
  | 'comparativo_trimestral' | 'estudiante_notas' | 'resumen_clase';

type TipoReporte = TipoReporteAsistencia | TipoReporteNotas;

interface DefReporte {
  tipo:        TipoReporte;
  modulo:      ModuloReporte;
  titulo:      string;
  descripcion: string;
  icon:        React.ReactNode;
  color:       string;
  gradient:    string;
  badge?:      string;
  filtros:     Array<'fecha' | 'rango_fechas' | 'estudiante' | 'trimestre' | 'dimension' | 'evaluacion'>;
}

// ─────────────────────────────────────────────
// CATÁLOGO DE REPORTES
// ─────────────────────────────────────────────

const REPORTES_ASISTENCIA: DefReporte[] = [
  { tipo: 'pase_dia',           modulo: 'asistencia', titulo: 'Pase del Día',           descripcion: 'Lista completa con estado de asistencia de una fecha.',                      icon: <CalendarTodayRoundedIcon />, color: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', filtros: ['fecha'] },
  { tipo: 'periodo_completo',   modulo: 'asistencia', titulo: 'Período Completo',        descripcion: 'Todos los días registrados con presentes, ausentes y porcentaje.',           icon: <DateRangeRoundedIcon />,     color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#34d399)', filtros: ['rango_fechas'] },
  { tipo: 'trimestres_clase',   modulo: 'asistencia', titulo: 'Comparativo Trimestral',  descripcion: 'Vista T1/T2/T3 de asistencia de toda la clase.',                            icon: <AccountTreeRoundedIcon />,   color: '#8b5cf6', gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', badge: 'Nuevo', filtros: [] },
  { tipo: 'estudiante_individual', modulo: 'asistencia', titulo: 'Estudiante Individual',  descripcion: 'Historial completo de asistencia de un alumno.',                           icon: <PersonSearchRoundedIcon />,  color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)', filtros: ['estudiante', 'rango_fechas'] },
  { tipo: 'resumen_anual',      modulo: 'asistencia', titulo: 'Resumen Anual',            descripcion: 'Totales acumulados del año incluyendo los 3 trimestres.',                   icon: <EmojiEventsRoundedIcon />,   color: '#ef4444', gradient: 'linear-gradient(135deg,#ef4444,#f87171)', filtros: [] },
  { tipo: 'comparativo_materias', modulo: 'asistencia', titulo: 'Comparativo Materias',  descripcion: 'Asistencia de un estudiante en todas sus materias.',                        icon: <CompareArrowsRoundedIcon />, color: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#22d3ee)', filtros: ['estudiante'] },
];

const REPORTES_NOTAS: DefReporte[] = [
  { tipo: 'boletin',            modulo: 'notas', titulo: 'Boletín de Notas',        descripcion: 'Nota Ser/Saber/Hacer/Auto + nota final de cada estudiante en un trimestre.',   icon: <GradeRoundedIcon />,         color: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', filtros: ['trimestre'] },
  { tipo: 'por_evaluacion',     modulo: 'notas', titulo: 'Por Evaluación',           descripcion: 'Notas de todos los estudiantes para una evaluación específica.',               icon: <AssignmentRoundedIcon />,    color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#34d399)', filtros: ['evaluacion'] },
  { tipo: 'por_dimension',      modulo: 'notas', titulo: 'Por Dimensión',            descripcion: 'Detalle de notas dentro de Ser, Saber, Hacer o Autoevaluación.',              icon: <PieChartRoundedIcon />,      color: '#8b5cf6', gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', filtros: ['trimestre', 'dimension'] },
  { tipo: 'comparativo_trimestral', modulo: 'notas', titulo: 'Comparativo Trimestral', descripcion: 'Notas finales T1/T2/T3 por estudiante con desglose por dimensión.',         icon: <BarChartRoundedIcon />,      color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)', badge: 'Nuevo', filtros: [] },
  { tipo: 'estudiante_notas',   modulo: 'notas', titulo: 'Estudiante Individual',    descripcion: 'Detalle completo de evaluaciones, dimensiones y nota final de un alumno.',    icon: <PersonRoundedIcon />,        color: '#ef4444', gradient: 'linear-gradient(135deg,#ef4444,#f87171)', filtros: ['trimestre', 'estudiante'] },
  { tipo: 'resumen_clase',      modulo: 'notas', titulo: 'Resumen de la Clase',      descripcion: 'Nota final de cada estudiante con desglose Ser/Saber/Hacer.',                 icon: <SummarizeRoundedIcon />,     color: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#22d3ee)', filtros: ['trimestre'] },
];

// ─────────────────────────────────────────────
// COMPONENTE: BTN DESCARGA
// ─────────────────────────────────────────────

const BtnDescarga: React.FC<{
  label: string; icon: React.ReactNode; color: string;
  gradient: string; loading: boolean; onClick: () => void; disabled?: boolean;
}> = ({ label, icon, color, gradient, loading, onClick, disabled }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Button size="medium" onClick={onClick} disabled={loading || disabled}
      startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : icon}
      sx={{
        background: gradient, color: '#fff', fontWeight: 800,
        textTransform: 'none', borderRadius: 2.5, px: 3, py: 1,
        boxShadow: `0 4px 14px ${alpha(color, 0.35)}`,
        transition: 'all 0.25s ease', whiteSpace: 'nowrap',
        '&:hover': { background: gradient, filter: 'brightness(1.1)', transform: 'translateY(-2px)' },
        '&:active': { transform: 'scale(0.97)' },
        '&:disabled': { background: isDark ? alpha('#fff',0.08) : alpha('#000',0.06), color: 'text.disabled', boxShadow: 'none' },
      }}
    >
      {loading ? 'Generando...' : label}
    </Button>
  );
};

// ─────────────────────────────────────────────
// COMPONENTE: CARD DE REPORTE
// ─────────────────────────────────────────────

const ReporteCard: React.FC<{
  def: DefReporte; seleccionado: boolean; onClick: () => void; delay: number;
}> = ({ def, seleccionado, onClick, delay }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Card sx={{
      borderRadius: 3,
      animation: `${scaleIn} 0.4s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both`,
      border: `2px solid ${seleccionado ? def.color : isDark ? alpha('#fff',0.08) : alpha('#000',0.06)}`,
      background: seleccionado
        ? isDark ? `linear-gradient(145deg,${alpha(def.color,0.2)},${alpha(def.color,0.06)})` : `linear-gradient(145deg,${alpha(def.color,0.1)},#fff)`
        : isDark ? 'linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))' : 'linear-gradient(145deg,#fff,#f9fafb)',
      boxShadow: seleccionado ? `0 8px 32px ${alpha(def.color,0.3)},0 0 0 4px ${alpha(def.color,0.1)}` : isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      position: 'relative', overflow: 'hidden',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 36px ${alpha(def.color,0.25)}`, border: `2px solid ${def.color}` },
      '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: def.gradient, opacity: seleccionado ? 1 : 0, transition: 'opacity 0.3s ease' },
    }}>
      <CardActionArea onClick={onClick}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{
              width: 46, height: 46, borderRadius: 2.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: seleccionado ? def.gradient : isDark ? alpha(def.color,0.15) : alpha(def.color,0.1),
              boxShadow: seleccionado ? `0 4px 14px ${alpha(def.color,0.4)}` : 'none',
              transition: 'all 0.3s ease',
              '& svg': { fontSize: 22, color: seleccionado ? '#fff' : def.color },
            }}>
              {def.icon}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
              {def.badge && <Chip label={def.badge} size="small" sx={{ bgcolor: alpha(def.color,0.15), color: def.color, fontWeight: 800, fontSize: 10, height: 20, borderRadius: 1, border: `1px solid ${alpha(def.color,0.3)}` }} />}
              {seleccionado && <CheckCircleRoundedIcon sx={{ fontSize: 20, color: def.color }} />}
            </Box>
          </Box>
          <Typography variant="body2" fontWeight={800} sx={{ mb: 0.5, color: seleccionado ? def.color : 'text.primary', transition: 'color 0.3s ease' }}>
            {def.titulo}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, display: 'block', fontWeight: 500 }}>
            {def.descripcion}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

// ─────────────────────────────────────────────
// COMPONENTE: CARD DE MATERIA
// ─────────────────────────────────────────────

const MateriaCard: React.FC<{
  a: AsignacionDocente; seleccionada: boolean; onClick: () => void; index: number;
}> = ({ a, seleccionada, onClick, index }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#6366f1'];
  const color  = a.materia_color ?? COLORS[index % COLORS.length];
  return (
    <Card sx={{
      borderRadius: 2.5,
      animation: `${fadeUp} 0.4s ease-out ${index * 0.06}s both`,
      border: `2px solid ${seleccionada ? color : isDark ? alpha('#fff',0.08) : alpha('#000',0.06)}`,
      background: seleccionada
        ? isDark ? `linear-gradient(145deg,${alpha(color,0.2)},${alpha(color,0.06)})` : `linear-gradient(145deg,${alpha(color,0.08)},#fff)`
        : isDark ? 'rgba(255,255,255,0.03)' : '#fff',
      boxShadow: seleccionada ? `0 6px 24px ${alpha(color,0.3)}` : 'none',
      transition: 'all 0.25s ease',
      '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 8px 28px ${alpha(color,0.2)}`, border: `2px solid ${color}` },
    }}>
      <CardActionArea onClick={onClick}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg,${color},${alpha(color,0.7)})`,
              boxShadow: `0 3px 10px ${alpha(color,0.4)}`,
              '& svg': { fontSize: 20, color: '#fff' },
            }}>
              <MenuBookRoundedIcon />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={800} noWrap sx={{ color: seleccionada ? color : 'text.primary' }}>
                {a.materia_nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {a.grado_nombre} "{a.paralelo_nombre}" · {a.turno_nombre}
              </Typography>
            </Box>
            {seleccionada && <CheckCircleRoundedIcon sx={{ fontSize: 18, color, flexShrink: 0 }} />}
          </Box>
          <Chip icon={<GroupsRoundedIcon />} label={`${a.total_estudiantes} est.`} size="small" sx={{ mt: 1.5, height: 22, fontSize: 10, fontWeight: 700, bgcolor: isDark ? alpha('#fff',0.06) : alpha('#000',0.04), '& .MuiChip-icon': { fontSize: 12, color } }} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

// ─────────────────────────────────────────────
// COMPONENTE: PANEL DE FILTROS + DESCARGA
// ─────────────────────────────────────────────

const PanelDescarga: React.FC<{
  def:          DefReporte;
  asignacion:   AsignacionDocente;
  periodos:     PeriodoEvaluacion[];
  dimensiones:  DimensionEvaluacion[];
  evaluaciones: Evaluacion[];
  estudiantes:  { matricula_id: number; codigo: string; nombres: string; apellidos: string }[];
  loadingEst:   boolean;
}> = ({ def, asignacion, periodos, dimensiones, evaluaciones, estudiantes, loadingEst }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const hoy    = new Date().toISOString().slice(0, 10);

  // Estado local de filtros
  const [fecha,         setFecha]         = useState(hoy);
  const [fechaInicio,   setFechaInicio]   = useState('');
  const [fechaFin,      setFechaFin]      = useState('');
  const [trimestreId,   setTrimestreId]   = useState<number | ''>('');
  const [dimensionId,   setDimensionId]   = useState<number | ''>('');
  const [evaluacionId,  setEvaluacionId]  = useState<number | ''>('');
  const [estudianteSel, setEstudianteSel] = useState<{ matricula_id: number; codigo: string; nombres: string; apellidos: string } | null>(null);

  const [loadingPdf,   setLoadingPdf]   = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const notasHook = useReportesNotas();
  const aid       = asignacion.asignacion_id;
  const matCodigo = asignacion.materia_codigo;

  const puedeDescargar = () => {
    if (def.filtros.includes('fecha')     && !fecha)           return false;
    if (def.filtros.includes('trimestre') && !trimestreId)     return false;
    if (def.filtros.includes('dimension') && !dimensionId)     return false;
    if (def.filtros.includes('evaluacion')&& !evaluacionId)    return false;
    if (def.filtros.includes('estudiante')&& !estudianteSel)   return false;
    return true;
  };

  const ejecutarDescarga = async (formato: 'pdf' | 'excel') => {
    const set = formato === 'pdf' ? setLoadingPdf : setLoadingExcel;
    set(true);
    try {
      // ── ASISTENCIA ──
      if (def.modulo === 'asistencia') {
        switch (def.tipo as TipoReporteAsistencia) {
          case 'pase_dia':
            await descargarPaseDia({ asignacion_docente_id: aid, fecha, formato }); break;
          case 'periodo_completo':
            await descargarPeriodoClase({ asignacion_docente_id: aid, fecha_inicio: fechaInicio || undefined, fecha_fin: fechaFin || undefined, formato }); break;
          case 'trimestres_clase':
            await descargarTrimestresClase({ asignacion_docente_id: aid, formato }); break;
          case 'estudiante_individual':
            await descargarReporteEstudiante({ matricula_id: estudianteSel!.matricula_id, asignacion_docente_id: aid, fecha_inicio: fechaInicio || undefined, fecha_fin: fechaFin || undefined, codigo_estudiante: estudianteSel!.codigo, formato }); break;
          case 'resumen_anual':
            await descargarTrimestresClase({ asignacion_docente_id: aid, formato }); break;
        }
      }
      // ── NOTAS ──
      else {
        switch (def.tipo as TipoReporteNotas) {
          case 'boletin':
            await notasHook.exportarBoletin({ asignacion_docente_id: aid, periodo_evaluacion_id: trimestreId as number, materia_codigo: matCodigo }, formato); break;
          case 'por_evaluacion':
            await notasHook.exportarEvaluacion({ evaluacion_id: evaluacionId as number }, formato); break;
          case 'por_dimension':
            await notasHook.exportarDimension({ asignacion_docente_id: aid, periodo_evaluacion_id: trimestreId as number, dimension_id: dimensionId as number, dimension_codigo: dimensiones.find(d => d.id === dimensionId)?.codigo }, formato); break;
          case 'comparativo_trimestral':
            await notasHook.exportarComparativoTrimestral({ asignacion_docente_id: aid, materia_codigo: matCodigo }, formato); break;
          case 'estudiante_notas':
            await notasHook.exportarEstudiante({ asignacion_docente_id: aid, matricula_id: estudianteSel!.matricula_id, periodo_evaluacion_id: trimestreId as number, codigo_estudiante: estudianteSel!.codigo }, formato); break;
          case 'resumen_clase':
            await notasHook.exportarResumenClase({ asignacion_docente_id: aid, periodo_evaluacion_id: trimestreId as number, materia_codigo: matCodigo }, formato); break;
        }
      }
      toast.success(`Reporte descargado (${formato.toUpperCase()})`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al generar el reporte');
    } finally {
      set(false);
    }
  };

  const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 14 } };

  return (
    <Box sx={{
      p: 3, borderRadius: 3,
      background: isDark ? `linear-gradient(145deg,${alpha(def.color,0.1)},${alpha(def.color,0.03)})` : `linear-gradient(145deg,${alpha(def.color,0.06)},#fff)`,
      border: `1.5px solid ${alpha(def.color,0.2)}`,
    }}>
      <Typography variant="body2" fontWeight={800} sx={{ color: def.color, mb: 2.5 }}>
        ⚙️ Configurar y descargar
      </Typography>

      <Stack spacing={2}>
        {/* Fecha única */}
        {def.filtros.includes('fecha') && (
          <TextField label="Fecha" type="date" size="small" fullWidth value={fecha}
            onChange={e => setFecha(e.target.value)} inputProps={{ max: hoy }}
            InputLabelProps={{ shrink: true }} sx={fieldSx} />
        )}

        {/* Rango de fechas */}
        {def.filtros.includes('rango_fechas') && (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField label="Desde" type="date" size="small" fullWidth value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)} inputProps={{ max: hoy }}
              InputLabelProps={{ shrink: true }} sx={fieldSx} />
            <TextField label="Hasta" type="date" size="small" fullWidth value={fechaFin}
              onChange={e => setFechaFin(e.target.value)} inputProps={{ max: hoy }}
              InputLabelProps={{ shrink: true }} sx={fieldSx} />
          </Box>
        )}

        {/* Selector de trimestre */}
        {def.filtros.includes('trimestre') && (
          <FormControl size="small" fullWidth>
            <InputLabel>Trimestre</InputLabel>
            <Select value={trimestreId} label="Trimestre" onChange={e => setTrimestreId(e.target.value as number)}
              sx={{ borderRadius: 2 }}>
              {periodos.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Selector de dimensión */}
        {def.filtros.includes('dimension') && (
          <FormControl size="small" fullWidth>
            <InputLabel>Dimensión</InputLabel>
            <Select value={dimensionId} label="Dimensión" onChange={e => setDimensionId(e.target.value as number)}
              sx={{ borderRadius: 2 }}>
              {dimensiones.map(d => (
                <MenuItem key={d.id} value={d.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color ?? '#9ca3af' }} />
                    {d.nombre} ({d.porcentaje_ponderacion}%)
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Selector de evaluación */}
        {def.filtros.includes('evaluacion') && (
          <FormControl size="small" fullWidth>
            <InputLabel>Evaluación</InputLabel>
            <Select value={evaluacionId} label="Evaluación" onChange={e => setEvaluacionId(e.target.value as number)}
              sx={{ borderRadius: 2 }}>
              {evaluaciones.map(ev => (
                <MenuItem key={ev.id} value={ev.id}>
                  {ev.nombre} — {ev.dimension_codigo} · {ev.periodo_nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Selector de estudiante */}
        {def.filtros.includes('estudiante') && (
          <Autocomplete size="small" loading={loadingEst} options={estudiantes}
            getOptionLabel={e => `${e.apellidos}, ${e.nombres} (${e.codigo})`}
            onChange={(_, v) => setEstudianteSel(v)}
            renderInput={params => (
              <TextField {...params} label="Estudiante" placeholder="Buscar por nombre o código..." sx={fieldSx}
                InputProps={{ ...params.InputProps, endAdornment: <>{loadingEst ? <CircularProgress size={16}/> : null}{params.InputProps.endAdornment}</> }} />
            )} />
        )}

        {/* Sin filtros */}
        {def.filtros.length === 0 && (
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Este reporte incluye todos los datos disponibles. No requiere filtros adicionales.
          </Typography>
        )}
      </Stack>

      {/* Botones */}
      <Box sx={{ display: 'flex', gap: 1.5, mt: 3, flexWrap: 'wrap' }}>
        <BtnDescarga label="Descargar PDF" icon={<PictureAsPdfRoundedIcon />} color="#ef4444"
          gradient="linear-gradient(135deg,#ef4444,#f87171)" loading={loadingPdf}
          disabled={!puedeDescargar() || loadingExcel} onClick={() => ejecutarDescarga('pdf')} />
        <BtnDescarga label="Descargar Excel" icon={<TableChartRoundedIcon />} color="#10b981"
          gradient="linear-gradient(135deg,#10b981,#34d399)" loading={loadingExcel}
          disabled={!puedeDescargar() || loadingPdf} onClick={() => ejecutarDescarga('excel')} />
      </Box>

      {!puedeDescargar() && (
        <Typography variant="caption" sx={{ color: alpha(def.color,0.8), mt: 1.5, display: 'block', fontWeight: 600 }}>
          {def.filtros.includes('fecha')      && !fecha          && '⚠️ Seleccioná una fecha.'}
          {def.filtros.includes('trimestre')  && !trimestreId    && '⚠️ Seleccioná un trimestre.'}
          {def.filtros.includes('dimension')  && !dimensionId    && '⚠️ Seleccioná una dimensión.'}
          {def.filtros.includes('evaluacion') && !evaluacionId   && '⚠️ Seleccioná una evaluación.'}
          {def.filtros.includes('estudiante') && !estudianteSel  && '⚠️ Seleccioná un estudiante.'}
        </Typography>
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────

export default function ReportesPage() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useAuth();

  // Estado global del wizard
  const [modulo,        setModulo]        = useState<ModuloReporte>('asistencia');
  const [paso,          setPaso]          = useState<0 | 1 | 2>(0);
  const [asignaciones,  setAsignaciones]  = useState<AsignacionDocente[]>([]);
  const [loadingMat,    setLoadingMat]    = useState(true);
  const [asignacionSel, setAsignacionSel] = useState<AsignacionDocente | null>(null);
  const [tipoSel,       setTipoSel]       = useState<TipoReporte | null>(null);

  // Datos auxiliares para filtros
  const [periodos,     setPeriodos]     = useState<PeriodoEvaluacion[]>([]);
  const [dimensiones,  setDimensiones]  = useState<DimensionEvaluacion[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [estudiantes,  setEstudiantes]  = useState<any[]>([]);
  const [loadingEst,   setLoadingEst]   = useState(false);

  // Cargar materias
  useEffect(() => {
    asistenciaService.getMisAsignaciones()
      .then(r => setAsignaciones(r.data.asignaciones))
      .catch(() => toast.error('Error al cargar materias'))
      .finally(() => setLoadingMat(false));
  }, []);

  // Cuando se selecciona materia: cargar estudiantes, períodos, dimensiones, evaluaciones
  useEffect(() => {
    if (!asignacionSel) return;
    const aid = asignacionSel.asignacion_id;
    const pid = asignacionSel.periodo_academico_id;

    // Estudiantes
    setLoadingEst(true);
    asistenciaService.getListaDia(aid, new Date().toISOString().slice(0,10))
      .then(r => setEstudiantes(r.data.lista.map((e: any) => ({
        matricula_id: e.matricula_id, codigo: e.estudiante_codigo,
        nombres: e.estudiante_nombres, apellidos: e.estudiante_apellidos,
      }))))
      .catch(() => {})
      .finally(() => setLoadingEst(false));

    // Períodos de evaluación
    periodosEvaluacionService.listar(pid, true)
      .then(r => setPeriodos(r.data.periodos))
      .catch(() => {});

    // Dimensiones
    dimensionesService.listar()
      .then(r => setDimensiones(r.data.dimensiones))
      .catch(() => {});

    // Evaluaciones de la asignación
    evaluacionesService.listar({ asignacion_docente_id: aid, activo: true, limit: 200 })
      .then(r => setEvaluaciones(r.data.evaluaciones))
      .catch(() => {});

  }, [asignacionSel]);

  const reportesActuales = modulo === 'asistencia' ? REPORTES_ASISTENCIA : REPORTES_NOTAS;
  const defSel = [...REPORTES_ASISTENCIA, ...REPORTES_NOTAS].find(r => r.tipo === tipoSel) ?? null;

  const handleSelMateria = (a: AsignacionDocente) => {
    setAsignacionSel(a);
    setPaso(1);
    setTipoSel(null);
  };

  const handleSelTipo = (tipo: TipoReporte) => {
    setTipoSel(tipo);
    setPaso(2);
  };

  const handleReset = () => {
    setPaso(0); setAsignacionSel(null); setTipoSel(null);
  };

  // Indicadores del stepper
  const steps = [
    { label: 'Materia',  done: paso >= 1 },
    { label: 'Reporte',  done: paso >= 2 },
    { label: 'Descargar',done: false },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: isDark
        ? 'radial-gradient(ellipse at top right,rgba(139,92,246,0.08),transparent 60%),radial-gradient(ellipse at bottom left,rgba(59,130,246,0.06),transparent 60%)'
        : 'radial-gradient(ellipse at top right,rgba(139,92,246,0.04),transparent 60%),radial-gradient(ellipse at bottom left,rgba(59,130,246,0.03),transparent 60%)',
    }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>

        {/* ══ HEADER ══ */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 2, p: { xs: 3, md: 4 }, borderRadius: 4,
              background: isDark ? 'linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))' : 'linear-gradient(145deg,#fff,#f8fafc)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? alpha('#fff',0.1) : alpha('#000',0.06)}`,
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.07)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Shimmer */}
              <Box sx={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(90deg,transparent,${alpha('#fff', isDark ? 0.04 : 0.08)},transparent)`,
                backgroundSize: '600px 100%', animation: `${shimmer} 4s linear infinite`, pointerEvents: 'none',
              }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
                <Box sx={{
                  width: 58, height: 58, borderRadius: 3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg,#8b5cf6,#a78bfa)',
                  boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
                }}>
                  <AssessmentRoundedIcon sx={{ fontSize: 30, color: '#fff' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={900} sx={{
                    background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -1,
                  }}>
                    Reportes
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {user?.username} · Asistencia y Notas — PDF y Excel
                  </Typography>
                </Box>
              </Box>

              {/* Stepper compacto */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
                {steps.map((s, i) => (
                  <React.Fragment key={i}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{
                        width: 30, height: 30, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: paso === i ? 'linear-gradient(135deg,#8b5cf6,#a78bfa)' : s.done ? 'linear-gradient(135deg,#10b981,#34d399)' : isDark ? alpha('#fff',0.08) : alpha('#000',0.06),
                        boxShadow: paso === i ? '0 3px 12px rgba(139,92,246,0.4)' : 'none',
                        transition: 'all 0.3s ease',
                      }}>
                        {s.done
                          ? <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#fff' }} />
                          : <Typography variant="caption" fontWeight={900} sx={{ color: paso === i ? '#fff' : 'text.disabled', fontSize: 11 }}>{i + 1}</Typography>
                        }
                      </Box>
                      <Typography variant="caption" fontWeight={700} sx={{ color: paso === i ? '#8b5cf6' : s.done ? '#10b981' : 'text.disabled', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                        {s.label}
                      </Typography>
                    </Box>
                    {i < 2 && <Box sx={{ width: 28, height: 2, borderRadius: 1, mb: 2.5, background: s.done ? 'linear-gradient(90deg,#10b981,#34d399)' : isDark ? alpha('#fff',0.1) : alpha('#000',0.08), transition: 'background 0.4s ease' }} />}
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          </Box>
        </Fade>

        <Grid container spacing={4}>

          {/* ── Sidebar contextual ── */}
          {(asignacionSel || defSel) && (
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ position: { md: 'sticky' }, top: 24, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {asignacionSel && (
                  <Fade in timeout={300}>
                    <Card sx={{
                      borderRadius: 3, overflow: 'hidden',
                      border: `1px solid ${isDark ? alpha('#fff',0.08) : alpha('#000',0.06)}`,
                      background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
                    }}>
                      <Box sx={{ height: 4, background: asignacionSel.materia_color ?? 'linear-gradient(90deg,#8b5cf6,#3b82f6)' }} />
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 10 }}>
                          Materia
                        </Typography>
                        <Typography variant="body1" fontWeight={800} sx={{ mt: 0.5, mb: 0.25 }}>{asignacionSel.materia_nombre}</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{asignacionSel.grado_nombre} "{asignacionSel.paralelo_nombre}"</Typography>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">👥 {asignacionSel.total_estudiantes} estudiantes</Typography>
                          <Typography variant="caption" color="text.secondary">🕐 {asignacionSel.turno_nombre}</Typography>
                          <Typography variant="caption" color="text.secondary">📅 {asignacionSel.periodo_nombre}</Typography>
                        </Stack>
                        <Button size="small" fullWidth onClick={handleReset} startIcon={<ArrowBackRoundedIcon />}
                          sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: 12 }}>
                          Cambiar materia
                        </Button>
                      </CardContent>
                    </Card>
                  </Fade>
                )}

                {defSel && (
                  <Fade in timeout={300}>
                    <Card sx={{
                      borderRadius: 3,
                      border: `1.5px solid ${alpha(defSel.color,0.25)}`,
                      background: isDark ? `linear-gradient(145deg,${alpha(defSel.color,0.12)},${alpha(defSel.color,0.04)})` : `linear-gradient(145deg,${alpha(defSel.color,0.07)},#fff)`,
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 10 }}>
                          Reporte
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                          <Box sx={{ width: 34, height: 34, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: defSel.gradient, '& svg': { fontSize: 16, color: '#fff' } }}>
                            {defSel.icon}
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={800} sx={{ color: defSel.color }}>{defSel.titulo}</Typography>
                            <Chip label={defSel.modulo === 'asistencia' ? 'Asistencia' : 'Notas'} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 700, mt: 0.25 }} />
                          </Box>
                        </Box>
                        <Button size="small" fullWidth onClick={() => { setPaso(1); setTipoSel(null); }} startIcon={<ArrowBackRoundedIcon />}
                          sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: 12 }}>
                          Cambiar tipo
                        </Button>
                      </CardContent>
                    </Card>
                  </Fade>
                )}
              </Box>
            </Grid>
          )}

          {/* ── Contenido principal ── */}
          <Grid size={{ xs: 12, md: (asignacionSel || defSel) ? 9 : 12 }}>

            {/* PASO 0: Elegir materia */}
            {paso === 0 && (
              <Fade in timeout={400}>
                <Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={900} sx={{ mb: 0.5, letterSpacing: -0.5 }}>Paso 1 — Elegí una materia</Typography>
                    <Typography variant="body2" color="text.secondary">Seleccioná la materia sobre la que querés generar el reporte.</Typography>
                  </Box>
                  {loadingMat ? (
                    <Grid container spacing={2}>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
                          <Box sx={{ height: 100, borderRadius: 2.5, bgcolor: isDark ? alpha('#fff',0.05) : alpha('#000',0.04) }} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : asignaciones.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 3 }}>No tenés materias asignadas para el período actual.</Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {asignaciones.map((a, i) => (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={a.asignacion_id}>
                          <MateriaCard a={a} seleccionada={asignacionSel?.asignacion_id === a.asignacion_id} onClick={() => handleSelMateria(a)} index={i} />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </Fade>
            )}

            {/* PASO 1: Elegir tipo de reporte */}
            {paso === 1 && (
              <Fade in timeout={400}>
                <Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={900} sx={{ mb: 0.5, letterSpacing: -0.5 }}>Paso 2 — Tipo de reporte</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      ¿Qué querés exportar de <Box component="span" sx={{ color: '#8b5cf6', fontWeight: 800 }}>{asignacionSel?.materia_nombre}</Box>?
                    </Typography>
                    {/* Tabs Asistencia / Notas */}
                    <Tabs value={modulo} onChange={(_, v) => setModulo(v)} sx={{
                      mb: 3,
                      '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: 14, borderRadius: 2 },
                      '& .Mui-selected': { color: '#8b5cf6' },
                      '& .MuiTabs-indicator': { bgcolor: '#8b5cf6', height: 3, borderRadius: 2 },
                    }}>
                      <Tab value="asistencia" label="📋 Asistencia" />
                      <Tab value="notas"      label="📝 Notas" />
                    </Tabs>
                  </Box>
                  <Grid container spacing={2}>
                    {reportesActuales.map((r, i) => (
                      <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={r.tipo}>
                        <ReporteCard def={r} seleccionado={tipoSel === r.tipo} onClick={() => handleSelTipo(r.tipo)} delay={i * 0.06} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Fade>
            )}

            {/* PASO 2: Filtros + Descarga */}
            {paso === 2 && defSel && asignacionSel && (
              <Fade in timeout={400}>
                <Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={900} sx={{ mb: 0.5, letterSpacing: -0.5 }}>Paso 3 — Configurar y descargar</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {defSel.filtros.length > 0 ? 'Completá los filtros y elegí el formato.' : 'Este reporte no requiere filtros. Descargá directamente.'}
                    </Typography>
                  </Box>

                  <PanelDescarga
                    def={defSel}
                    asignacion={asignacionSel}
                    periodos={periodos}
                    dimensiones={dimensiones}
                    evaluaciones={evaluaciones}
                    estudiantes={estudiantes}
                    loadingEst={loadingEst}
                  />

                  {/* Info adicional */}
                  <Box sx={{ mt: 3, p: 2.5, borderRadius: 3, bgcolor: isDark ? alpha('#fff',0.03) : alpha('#000',0.02), border: `1px solid ${isDark ? alpha('#fff',0.06) : alpha('#000',0.05)}` }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 10, display: 'block', mb: 1 }}>
                      ℹ️ Sobre este reporte
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {defSel.descripcion}
                    </Typography>
                    {defSel.tipo === 'comparativo_trimestral' && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                        El Excel incluye 2 hojas: Notas finales por trimestre · Desglose Ser/Saber/Hacer/Auto.
                      </Typography>
                    )}
                    {defSel.tipo === 'boletin' && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                        Incluye nota de cada dimensión (Ser 10% · Saber 40% · Hacer 45% · Auto 5%) y la nota final ponderada.
                      </Typography>
                    )}
                    {defSel.tipo === 'trimestres_clase' && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                        El Excel incluye 3 hojas: Comparativo trimestral · Detalle por estudiante · Atención requerida (asistencia crítica).
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Fade>
            )}

          </Grid>
        </Grid>

      </Container>
    </Box>
  );
}