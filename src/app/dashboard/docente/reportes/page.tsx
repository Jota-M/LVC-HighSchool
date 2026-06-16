'use client';
// app/dashboard/docente/reportes/page.tsx
// Restiada al sistema brand/brandEnd/gradBg — mismo patrón que notas y seguimiento.
// Funcionalidad 100% intacta.

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box, Container, Typography, Grid, Chip, Button, TextField, Stack, Divider,
  CircularProgress, Alert, Fade, Tabs, Tab, Autocomplete,
  Select, MenuItem, FormControl, InputLabel,
  useTheme, alpha,
} from '@mui/material';
import { keyframes } from '@mui/system';

import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import DateRangeRoundedIcon from '@mui/icons-material/DateRangeRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import GradeRoundedIcon from '@mui/icons-material/GradeRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { asistenciaService } from '@/services/asistenciaService';
import {
  descargarPaseDia, descargarPeriodoClase,
  descargarTrimestresClase, descargarTrimestresEstudiante,
  descargarReporteEstudiante,
} from '@/services/reportesAsistenciaService';
import useReportesNotas from '@/hooks/useReportesNotas';
import { periodosEvaluacionService } from '@/services/notasService';
import { dimensionesService } from '@/services/notasService';
import { evaluacionesService } from '@/services/notasService';
import { AsignacionDocente } from '@/services/asistenciaService';
import { PeriodoEvaluacion, DimensionEvaluacion, Evaluacion } from '@/types/notasTypes';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

// ── animaciones ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const bounceIcon = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
`;

// ── tipos (sin cambios) ───────────────────────────────────────────────────────

type ModuloReporte = 'asistencia' | 'notas';
type TipoReporteAsistencia =
  | 'pase_dia' | 'periodo_completo' | 'trimestres_clase'
  | 'estudiante_individual' | 'resumen_anual' | 'comparativo_materias';
type TipoReporteNotas =
  | 'boletin' | 'por_evaluacion' | 'por_dimension'
  | 'comparativo_trimestral' | 'estudiante_notas' | 'resumen_clase';
type TipoReporte = TipoReporteAsistencia | TipoReporteNotas;

interface DefReporte {
  tipo: TipoReporte;
  modulo: ModuloReporte;
  titulo: string;
  descripcion: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  badge?: string;
  filtros: Array<'fecha' | 'rango_fechas' | 'estudiante' | 'trimestre' | 'dimension' | 'evaluacion'>;
}

// ── catálogo (sin cambios) ────────────────────────────────────────────────────

const REPORTES_ASISTENCIA: DefReporte[] = [
  { tipo: 'pase_dia', modulo: 'asistencia', titulo: 'Pase del Día', descripcion: 'Lista completa con estado de asistencia de una fecha.', icon: <CalendarTodayRoundedIcon />, color: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', filtros: ['fecha'] },
  { tipo: 'periodo_completo', modulo: 'asistencia', titulo: 'Período Completo', descripcion: 'Todos los días registrados con presentes, ausentes y porcentaje.', icon: <DateRangeRoundedIcon />, color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#34d399)', filtros: ['rango_fechas'] },
  { tipo: 'trimestres_clase', modulo: 'asistencia', titulo: 'Comparativo Trimestral', descripcion: 'Vista T1/T2/T3 de asistencia de toda la clase.', icon: <AccountTreeRoundedIcon />, color: '#8b5cf6', gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', badge: 'Nuevo', filtros: [] },
  { tipo: 'estudiante_individual', modulo: 'asistencia', titulo: 'Estudiante Individual', descripcion: 'Historial completo de asistencia de un alumno.', icon: <PersonSearchRoundedIcon />, color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)', filtros: ['estudiante', 'rango_fechas'] },
  { tipo: 'resumen_anual', modulo: 'asistencia', titulo: 'Resumen Anual', descripcion: 'Totales acumulados del año incluyendo los 3 trimestres.', icon: <EmojiEventsRoundedIcon />, color: '#ef4444', gradient: 'linear-gradient(135deg,#ef4444,#f87171)', filtros: [] },
  { tipo: 'comparativo_materias', modulo: 'asistencia', titulo: 'Comparativo Materias', descripcion: 'Asistencia de un estudiante en todas sus materias.', icon: <CompareArrowsRoundedIcon />, color: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#22d3ee)', filtros: ['estudiante'] },
];
const REPORTES_NOTAS: DefReporte[] = [
  { tipo: 'boletin', modulo: 'notas', titulo: 'Boletín de Notas', descripcion: 'Nota Ser/Saber/Hacer/Auto + nota final de cada estudiante en un trimestre.', icon: <GradeRoundedIcon />, color: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', filtros: ['trimestre'] },
  { tipo: 'por_evaluacion', modulo: 'notas', titulo: 'Por Evaluación', descripcion: 'Notas de todos los estudiantes para una evaluación específica.', icon: <AssignmentRoundedIcon />, color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#34d399)', filtros: ['evaluacion'] },
  { tipo: 'por_dimension', modulo: 'notas', titulo: 'Por Dimensión', descripcion: 'Detalle de notas dentro de Ser, Saber, Hacer o Autoevaluación.', icon: <PieChartRoundedIcon />, color: '#8b5cf6', gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', filtros: ['trimestre', 'dimension'] },
  { tipo: 'comparativo_trimestral', modulo: 'notas', titulo: 'Comparativo Trimestral', descripcion: 'Notas finales T1/T2/T3 por estudiante con desglose por dimensión.', icon: <BarChartRoundedIcon />, color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)', badge: 'Nuevo', filtros: [] },
  { tipo: 'estudiante_notas', modulo: 'notas', titulo: 'Estudiante Individual', descripcion: 'Detalle completo de evaluaciones, dimensiones y nota final de un alumno.', icon: <PersonRoundedIcon />, color: '#ef4444', gradient: 'linear-gradient(135deg,#ef4444,#f87171)', filtros: ['trimestre', 'estudiante'] },
  { tipo: 'resumen_clase', modulo: 'notas', titulo: 'Resumen de la Clase', descripcion: 'Nota final de cada estudiante con desglose Ser/Saber/Hacer.', icon: <SummarizeRoundedIcon />, color: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#22d3ee)', filtros: ['trimestre'] },
];

// ─────────────────────────────────────────────────────────────────────────────
// CARD DE MATERIA — estilo imagen 2
// ─────────────────────────────────────────────────────────────────────────────

const PALETA = [
  { primary: '#3b82f6', secondary: '#60a5fa' },
  { primary: '#8b5cf6', secondary: '#a78bfa' },
  { primary: '#10b981', secondary: '#34d399' },
  { primary: '#f59e0b', secondary: '#fbbf24' },
  { primary: '#ef4444', secondary: '#f87171' },
  { primary: '#06b6d4', secondary: '#22d3ee' },
  { primary: '#ec4899', secondary: '#f472b6' },
  { primary: '#6366f1', secondary: '#818cf8' },
];
const PALETA_DARK = [
  { primary: '#60a5fa', secondary: '#93c5fd' },
  { primary: '#a78bfa', secondary: '#c4b5fd' },
  { primary: '#34d399', secondary: '#6ee7b7' },
  { primary: '#fbbf24', secondary: '#fcd34d' },
  { primary: '#f87171', secondary: '#fca5a5' },
  { primary: '#22d3ee', secondary: '#67e8f9' },
  { primary: '#f472b6', secondary: '#f9a8d4' },
  { primary: '#818cf8', secondary: '#a5b4fc' },
];

const getIniciales = (nombre: string) =>
  nombre.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

const MateriaCard: React.FC<{
  a: AsignacionDocente; seleccionada: boolean; onClick: () => void; index: number;
}> = ({ a, seleccionada, onClick, index }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cs = (isDark ? PALETA_DARK : PALETA)[index % PALETA.length];
  const iniciales = getIniciales(a.materia_nombre);
  const borderColor = isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07);

  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: '16px',
        border: seleccionada ? `2px solid ${cs.primary}` : `1.5px solid ${borderColor}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: seleccionada
          ? `0 4px 20px ${alpha(cs.primary, 0.22)}`
          : isDark ? 'none' : '0 1px 8px rgba(0,0,0,0.05)',
        transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
        animation: `${fadeUp} 0.35s ease-out ${index * 0.07}s both`,
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: alpha(cs.primary, 0.55),
          boxShadow: isDark
            ? `0 4px 20px ${alpha(cs.primary, 0.15)}`
            : `0 6px 24px ${alpha(cs.primary, 0.18)}`,
        },
        '&::before': {
          content: '""',
          display: 'block',
          height: '3px',
          background: `linear-gradient(90deg, ${cs.primary}, ${cs.secondary})`,
          borderRadius: '16px 16px 0 0',
          marginTop: '-1.5px',
        },
      }}
    >
      {/* Cabecera */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 46, height: 46, borderRadius: '12px', flexShrink: 0,
          background: `linear-gradient(135deg, ${cs.primary}, ${cs.secondary})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${alpha(cs.primary, 0.35)}`,
        }}>
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem', letterSpacing: 0.5 }}>
            {iniciales}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" fontWeight={800} sx={{
            lineHeight: 1.2, color: seleccionada ? cs.primary : 'text.primary',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {a.materia_nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {a.grado_nombre} "{a.paralelo_nombre}" · {a.turno_nombre}
          </Typography>
        </Box>

        <ChevronRightIcon sx={{ fontSize: 18, color: alpha(cs.primary, 0.6), flexShrink: 0 }} />
      </Box>

      {/* Stats */}
      <Box sx={{ px: 2.5, pb: 1.5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <Box sx={{ bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#f8f9fa', 0.9), borderRadius: '10px', p: 1.2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
            <GroupsRoundedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>Estudiantes</Typography>
          </Box>
          <Typography variant="body2" fontWeight={800}>{a.total_estudiantes}</Typography>
        </Box>

        <Box sx={{ bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#f8f9fa', 0.9), borderRadius: '10px', p: 1.2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
            <AssessmentRoundedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>Código</Typography>
          </Box>
          <Typography variant="body2" fontWeight={800}>{a.materia_codigo}</Typography>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{
        px: 2.5, py: 1.25,
        borderTop: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
          {a.turno_nombre} · {a.periodo_nombre ?? ''}
        </Typography>
        {seleccionada && (
          <CheckCircleRoundedIcon sx={{ fontSize: 16, color: cs.primary }} />
        )}
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD DE REPORTE — mismo estilo que las materias pero con icono SVG
// ─────────────────────────────────────────────────────────────────────────────

const ReporteCard: React.FC<{
  def: DefReporte; seleccionado: boolean; onClick: () => void; delay: number;
}> = ({ def, seleccionado, onClick, delay }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const borderColor = isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07);

  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: '16px',
        border: seleccionado ? `2px solid ${def.color}` : `1.5px solid ${borderColor}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: seleccionado
          ? `0 4px 20px ${alpha(def.color, 0.22)}`
          : isDark ? 'none' : '0 1px 8px rgba(0,0,0,0.05)',
        transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
        animation: `${fadeUp} 0.35s ease-out ${delay}s both`,
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: alpha(def.color, 0.5),
          boxShadow: isDark
            ? `0 4px 20px ${alpha(def.color, 0.15)}`
            : `0 6px 24px ${alpha(def.color, 0.18)}`,
        },
        '&::before': {
          content: '""',
          display: 'block',
          height: '3px',
          background: def.gradient,
          borderRadius: '16px 16px 0 0',
          marginTop: '-1.5px',
        },
      }}
    >
      {/* Cabecera */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 46, height: 46, borderRadius: '12px', flexShrink: 0,
          background: seleccionado ? def.gradient : alpha(def.color, isDark ? 0.15 : 0.1),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: seleccionado ? `0 4px 12px ${alpha(def.color, 0.35)}` : 'none',
          transition: 'all 0.2s',
          '& svg': { fontSize: 22, color: seleccionado ? '#fff' : def.color },
        }}>
          {def.icon}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" fontWeight={800} sx={{
            lineHeight: 1.2,
            color: seleccionado ? def.color : 'text.primary',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {def.titulo}
          </Typography>
          {def.badge && (
            <Chip label={def.badge} size="small" sx={{
              height: 18, fontSize: '0.6rem', fontWeight: 700, mt: 0.3,
              bgcolor: alpha(def.color, 0.12), color: def.color,
              border: `1px solid ${alpha(def.color, 0.25)}`,
            }} />
          )}
        </Box>

        {seleccionado
          ? <CheckCircleRoundedIcon sx={{ fontSize: 18, color: def.color, flexShrink: 0 }} />
          : <ChevronRightIcon sx={{ fontSize: 18, color: alpha(def.color, 0.5), flexShrink: 0 }} />
        }
      </Box>

      {/* Descripción */}
      <Box sx={{ px: 2.5, pb: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, fontWeight: 500 }}>
          {def.descripcion}
        </Typography>
      </Box>

      {/* Footer */}
      <Box sx={{
        px: 2.5, py: 1.25,
        borderTop: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
        display: 'flex', alignItems: 'center',
      }}>
        <Chip
          label={def.modulo === 'asistencia' ? 'Asistencia' : 'Notas'}
          size="small"
          sx={{
            height: 20, fontSize: '0.62rem', fontWeight: 700,
            bgcolor: alpha(def.color, 0.08), color: def.color,
            border: `1px solid ${alpha(def.color, 0.2)}`,
          }}
        />
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// BTN DESCARGA — sin cambios
// ─────────────────────────────────────────────────────────────────────────────

const BtnDescarga: React.FC<{
  label: string; icon: React.ReactNode; color: string;
  gradient: string; loading: boolean; onClick: () => void; disabled?: boolean;
}> = ({ label, icon, color, gradient, loading, onClick, disabled }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Button size="medium" onClick={onClick} disabled={loading || disabled}
      startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : icon}
      sx={{
        background: gradient, color: '#fff', fontWeight: 800,
        textTransform: 'none', borderRadius: '10px', px: 3, py: 1,
        boxShadow: `0 4px 14px ${alpha(color, 0.35)}`,
        transition: 'all 0.2s',
        '&:hover': { background: gradient, filter: 'brightness(1.08)', transform: 'translateY(-2px)' },
        '&:disabled': { background: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06), color: 'text.disabled', boxShadow: 'none' },
      }}
    >
      {loading ? 'Generando...' : label}
    </Button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PANEL DESCARGA — sin cambios funcionales, solo restiado
// ─────────────────────────────────────────────────────────────────────────────

const PanelDescarga: React.FC<{
  def: DefReporte; asignacion: AsignacionDocente;
  periodos: PeriodoEvaluacion[]; dimensiones: DimensionEvaluacion[];
  evaluaciones: Evaluacion[];
  estudiantes: { matricula_id: number; codigo: string; nombres: string; apellidos: string }[];
  loadingEst: boolean;
}> = ({ def, asignacion, periodos, dimensiones, evaluaciones, estudiantes, loadingEst }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const brand = isDark ? '#facc15' : '#0288d1';
  const hoy = new Date().toISOString().slice(0, 10);

  const [fecha, setFecha] = useState(hoy);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [trimestreId, setTrimestreId] = useState<number | ''>('');
  const [dimensionId, setDimensionId] = useState<number | ''>('');
  const [evaluacionId, setEvaluacionId] = useState<number | ''>('');
  const [estudianteSel, setEstudianteSel] = useState<{ matricula_id: number; codigo: string; nombres: string; apellidos: string } | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const notasHook = useReportesNotas();
  const aid = asignacion.asignacion_id;
  const matCodigo = asignacion.materia_codigo;

  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const R = '12px';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R, background: bgField,
      '& fieldset': { borderColor: borderField, borderRadius: R },
      '&:hover fieldset': { borderColor: alpha(def.color, 0.5) },
      '&.Mui-focused fieldset': { borderColor: def.color, borderWidth: '1.5px' },
      '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(def.color, 0.1)}` },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: def.color },
  };

  const puedeDescargar = () => {
    if (def.filtros.includes('fecha') && !fecha) return false;
    if (def.filtros.includes('trimestre') && !trimestreId) return false;
    if (def.filtros.includes('dimension') && !dimensionId) return false;
    if (def.filtros.includes('evaluacion') && !evaluacionId) return false;
    if (def.filtros.includes('estudiante') && !estudianteSel) return false;
    return true;
  };

  const ejecutarDescarga = async (formato: 'pdf' | 'excel') => {
    const set = formato === 'pdf' ? setLoadingPdf : setLoadingExcel;
    set(true);
    try {
      if (def.modulo === 'asistencia') {
        switch (def.tipo as TipoReporteAsistencia) {
          case 'pase_dia': await descargarPaseDia({ asignacion_docente_id: aid, fecha, formato }); break;
          case 'periodo_completo': await descargarPeriodoClase({ asignacion_docente_id: aid, fecha_inicio: fechaInicio || undefined, fecha_fin: fechaFin || undefined, formato }); break;
          case 'trimestres_clase': await descargarTrimestresClase({ asignacion_docente_id: aid, formato }); break;
          case 'estudiante_individual': await descargarReporteEstudiante({ matricula_id: estudianteSel!.matricula_id, asignacion_docente_id: aid, fecha_inicio: fechaInicio || undefined, fecha_fin: fechaFin || undefined, codigo_estudiante: estudianteSel!.codigo, formato }); break;
          case 'resumen_anual': await descargarTrimestresClase({ asignacion_docente_id: aid, formato }); break;
        }
      } else {
        switch (def.tipo as TipoReporteNotas) {
          case 'boletin': await notasHook.exportarBoletin({ asignacion_docente_id: aid, periodo_evaluacion_id: trimestreId as number, materia_codigo: matCodigo }, formato); break;
          case 'por_evaluacion': await notasHook.exportarEvaluacion({ evaluacion_id: evaluacionId as number }, formato); break;
          case 'por_dimension': await notasHook.exportarDimension({ asignacion_docente_id: aid, periodo_evaluacion_id: trimestreId as number, dimension_id: dimensionId as number, dimension_codigo: dimensiones.find(d => d.id === dimensionId)?.codigo }, formato); break;
          case 'comparativo_trimestral': await notasHook.exportarComparativoTrimestral({ asignacion_docente_id: aid, materia_codigo: matCodigo }, formato); break;
          case 'estudiante_notas': await notasHook.exportarEstudiante({ asignacion_docente_id: aid, matricula_id: estudianteSel!.matricula_id, periodo_evaluacion_id: trimestreId as number, codigo_estudiante: estudianteSel!.codigo }, formato); break;
          case 'resumen_clase': await notasHook.exportarResumenClase({ asignacion_docente_id: aid, periodo_evaluacion_id: trimestreId as number, materia_codigo: matCodigo }, formato); break;
        }
      }
      toast.success(`Reporte descargado (${formato.toUpperCase()})`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al generar el reporte');
    } finally {
      set(false);
    }
  };

  return (
    <Box sx={{
      p: 3, borderRadius: '16px',
      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      border: `1.5px solid ${alpha(def.color, 0.2)}`,
      boxShadow: isDark ? 'none' : '0 1px 8px rgba(0,0,0,0.05)',
      '&::before': {
        content: '""', display: 'block', height: '3px',
        background: def.gradient, borderRadius: '16px 16px 0 0',
        marginTop: '-3px', marginLeft: '-1.5px', marginRight: '-1.5px',
      },
    }}>
      <Typography variant="body2" fontWeight={800} sx={{ color: def.color, mb: 2.5 }}>
        Configurar y descargar
      </Typography>

      <Stack spacing={2}>
        {def.filtros.includes('fecha') && (
          <TextField label="Fecha" type="date" size="small" fullWidth value={fecha}
            onChange={e => setFecha(e.target.value)} inputProps={{ max: hoy }}
            InputLabelProps={{ shrink: true }} sx={fieldSx} />
        )}
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
        {def.filtros.includes('trimestre') && (
          <FormControl size="small" fullWidth sx={fieldSx}>
            <InputLabel>Trimestre</InputLabel>
            <Select value={trimestreId} label="Trimestre" onChange={e => setTrimestreId(e.target.value as number)}>
              {periodos.map(p => <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>)}
            </Select>
          </FormControl>
        )}
        {def.filtros.includes('dimension') && (
          <FormControl size="small" fullWidth sx={fieldSx}>
            <InputLabel>Dimensión</InputLabel>
            <Select value={dimensionId} label="Dimensión" onChange={e => setDimensionId(e.target.value as number)}>
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
        {def.filtros.includes('evaluacion') && (
          <FormControl size="small" fullWidth sx={fieldSx}>
            <InputLabel>Evaluación</InputLabel>
            <Select value={evaluacionId} label="Evaluación" onChange={e => setEvaluacionId(e.target.value as number)}>
              {evaluaciones.map(ev => (
                <MenuItem key={ev.id} value={ev.id}>{ev.nombre} — {ev.dimension_codigo} · {ev.periodo_nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {def.filtros.includes('estudiante') && (
          <Autocomplete size="small" loading={loadingEst} options={estudiantes}
            getOptionLabel={e => `${e.apellidos}, ${e.nombres} (${e.codigo})`}
            onChange={(_, v) => setEstudianteSel(v)}
            renderInput={params => (
              <TextField {...params} label="Estudiante" placeholder="Buscar por nombre o código..." sx={fieldSx}
                InputProps={{ ...params.InputProps, endAdornment: <>{loadingEst ? <CircularProgress size={16} /> : null}{params.InputProps.endAdornment}</> }} />
            )} />
        )}
        {def.filtros.length === 0 && (
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Este reporte incluye todos los datos disponibles. No requiere filtros adicionales.
          </Typography>
        )}
      </Stack>

      <Box sx={{ display: 'flex', gap: 1.5, mt: 3, flexWrap: 'wrap' }}>
        <BtnDescarga label="Descargar PDF" icon={<PictureAsPdfRoundedIcon />} color="#ef4444" gradient="linear-gradient(135deg,#ef4444,#f87171)" loading={loadingPdf} disabled={!puedeDescargar() || loadingExcel} onClick={() => ejecutarDescarga('pdf')} />
        <BtnDescarga label="Descargar Excel" icon={<TableChartRoundedIcon />} color="#10b981" gradient="linear-gradient(135deg,#10b981,#34d399)" loading={loadingExcel} disabled={!puedeDescargar() || loadingPdf} onClick={() => ejecutarDescarga('excel')} />
      </Box>

      {!puedeDescargar() && (
        <Typography variant="caption" sx={{ color: alpha(def.color, 0.8), mt: 1.5, display: 'block', fontWeight: 600 }}>
          {def.filtros.includes('fecha') && !fecha && '⚠️ Seleccioná una fecha.'}
          {def.filtros.includes('trimestre') && !trimestreId && '⚠️ Seleccioná un trimestre.'}
          {def.filtros.includes('dimension') && !dimensionId && '⚠️ Seleccioná una dimensión.'}
          {def.filtros.includes('evaluacion') && !evaluacionId && '⚠️ Seleccioná una evaluación.'}
          {def.filtros.includes('estudiante') && !estudianteSel && '⚠️ Seleccioná un estudiante.'}
        </Typography>
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function ReportesPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useAuth();

  const brand = isDark ? '#facc15' : '#0288d1';
  const brandEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${brand} 0%, ${brandEnd} 100%)`;

  const [modulo, setModulo] = useState<ModuloReporte>('asistencia');
  const [paso, setPaso] = useState<0 | 1 | 2>(0);
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [loadingMat, setLoadingMat] = useState(true);
  const [asignacionSel, setAsignacionSel] = useState<AsignacionDocente | null>(null);
  const [tipoSel, setTipoSel] = useState<TipoReporte | null>(null);
  const [periodos, setPeriodos] = useState<PeriodoEvaluacion[]>([]);
  const [dimensiones, setDimensiones] = useState<DimensionEvaluacion[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [loadingEst, setLoadingEst] = useState(false);

  useEffect(() => {
    asistenciaService.getMisAsignaciones()
      .then(r => setAsignaciones(r.data.asignaciones))
      .catch(() => toast.error('Error al cargar materias'))
      .finally(() => setLoadingMat(false));
  }, []);

  useEffect(() => {
    if (!asignacionSel) return;
    const aid = asignacionSel.asignacion_id;
    const pid = asignacionSel.periodo_academico_id;
    setLoadingEst(true);
    asistenciaService.getListaDia(aid, new Date().toISOString().slice(0, 10))
      .then(r => setEstudiantes(r.data.lista.map((e: any) => ({
        matricula_id: e.matricula_id, codigo: e.estudiante_codigo,
        nombres: e.estudiante_nombres, apellidos: e.estudiante_apellidos,
      }))))
      .catch(() => { }).finally(() => setLoadingEst(false));
    periodosEvaluacionService.listar(pid, true).then(r => setPeriodos(r.data.periodos)).catch(() => { });
    dimensionesService.listar().then(r => setDimensiones(r.data.dimensiones)).catch(() => { });
    evaluacionesService.listar({ asignacion_docente_id: aid, activo: true, limit: 200 }).then(r => setEvaluaciones(r.data.evaluaciones)).catch(() => { });
  }, [asignacionSel]);

  const reportesActuales = modulo === 'asistencia' ? REPORTES_ASISTENCIA : REPORTES_NOTAS;
  const defSel = [...REPORTES_ASISTENCIA, ...REPORTES_NOTAS].find(r => r.tipo === tipoSel) ?? null;

  const handleSelMateria = (a: AsignacionDocente) => { setAsignacionSel(a); setPaso(1); setTipoSel(null); };
  const handleSelTipo = (tipo: TipoReporte) => { setTipoSel(tipo); setPaso(2); };
  const handleReset = () => { setPaso(0); setAsignacionSel(null); setTipoSel(null); };

  const steps = [
    { label: 'Materia', done: paso >= 1 },
    { label: 'Reporte', done: paso >= 2 },
    { label: 'Descargar', done: false },
  ];

  const borderField = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* ══ HEADER ══ */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
            }}>
              {/* Título */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <AssessmentRoundedIcon sx={{
                    color: brand, fontSize: 36,
                    animation: `${bounceIcon} 1.5s ease-in-out infinite`,
                  }} />
                  <Typography variant="h1" sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    fontWeight: 800,
                    background: gradBg,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Reportes
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Hola, <strong>{user?.username}</strong> — Asistencia y Notas · PDF y Excel
                </Typography>
              </Box>

              {/* Stepper compacto */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {steps.map((s, i) => (
                  <React.Fragment key={i}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{
                        width: 30, height: 30, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: paso === i ? gradBg : s.done ? 'linear-gradient(135deg,#10b981,#34d399)' : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                        boxShadow: paso === i ? `0 3px 12px ${alpha(brand, 0.4)}` : 'none',
                        transition: 'all 0.3s',
                      }}>
                        {s.done
                          ? <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#fff' }} />
                          : <Typography variant="caption" fontWeight={900} sx={{ color: paso === i ? (isDark ? '#000' : '#fff') : 'text.disabled', fontSize: 11 }}>{i + 1}</Typography>
                        }
                      </Box>
                      <Typography variant="caption" fontWeight={700} sx={{
                        color: paso === i ? brand : s.done ? '#10b981' : 'text.disabled',
                        fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8,
                      }}>
                        {s.label}
                      </Typography>
                    </Box>
                    {i < 2 && (
                      <Box sx={{
                        width: 28, height: 2, borderRadius: 1, mb: 2.5,
                        background: s.done ? 'linear-gradient(90deg,#10b981,#34d399)' : borderField,
                        transition: 'background 0.4s',
                      }} />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          </Box>
        </Fade>

        <Grid container spacing={3}>

          {/* ── Sidebar ── */}
          {(asignacionSel || defSel) && (
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ position: { md: 'sticky' }, top: 24, display: 'flex', flexDirection: 'column', gap: 2 }}>

                {asignacionSel && (
                  <Fade in timeout={300}>
                    <Box sx={{
                      borderRadius: '16px', overflow: 'hidden',
                      border: `1.5px solid ${borderField}`,
                      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                      boxShadow: isDark ? 'none' : '0 1px 8px rgba(0,0,0,0.05)',
                    }}>
                      <Box sx={{ height: 3, background: gradBg }} />
                      <Box sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 10 }}>
                          Materia seleccionada
                        </Typography>
                        <Typography variant="body1" fontWeight={800} sx={{ mt: 0.5, mb: 0.25, color: brand }}>{asignacionSel.materia_nombre}</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{asignacionSel.grado_nombre} "{asignacionSel.paralelo_nombre}"</Typography>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">👥 {asignacionSel.total_estudiantes} estudiantes</Typography>
                          <Typography variant="caption" color="text.secondary">🕐 {asignacionSel.turno_nombre}</Typography>
                          <Typography variant="caption" color="text.secondary">📅 {asignacionSel.periodo_nombre}</Typography>
                        </Stack>
                        <Button size="small" fullWidth onClick={handleReset} startIcon={<ArrowBackRoundedIcon />}
                          sx={{
                            mt: 2, borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 12,
                            border: `1px solid ${alpha(brand, 0.3)}`, color: brand,
                            '&:hover': { bgcolor: alpha(brand, 0.06), borderColor: brand },
                          }}>
                          Cambiar materia
                        </Button>
                      </Box>
                    </Box>
                  </Fade>
                )}

                {defSel && (
                  <Fade in timeout={300}>
                    <Box sx={{
                      borderRadius: '16px', overflow: 'hidden',
                      border: `1.5px solid ${alpha(defSel.color, 0.25)}`,
                      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                    }}>
                      <Box sx={{ height: 3, background: defSel.gradient }} />
                      <Box sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 10 }}>
                          Reporte seleccionado
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                          <Box sx={{
                            width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
                            background: defSel.gradient,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            '& svg': { fontSize: 16, color: '#fff' },
                          }}>
                            {defSel.icon}
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={800} sx={{ color: defSel.color }}>{defSel.titulo}</Typography>
                            <Chip label={defSel.modulo === 'asistencia' ? 'Asistencia' : 'Notas'} size="small"
                              sx={{ height: 18, fontSize: 10, fontWeight: 700, mt: 0.25, bgcolor: alpha(defSel.color, 0.1), color: defSel.color }} />
                          </Box>
                        </Box>
                        <Button size="small" fullWidth onClick={() => { setPaso(1); setTipoSel(null); }} startIcon={<ArrowBackRoundedIcon />}
                          sx={{
                            mt: 2, borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 12,
                            border: `1px solid ${alpha(defSel.color, 0.3)}`, color: defSel.color,
                            '&:hover': { bgcolor: alpha(defSel.color, 0.06), borderColor: defSel.color },
                          }}>
                          Cambiar tipo
                        </Button>
                      </Box>
                    </Box>
                  </Fade>
                )}
              </Box>
            </Grid>
          )}

          {/* ── Contenido principal ── */}
          <Grid size={{ xs: 12, md: (asignacionSel || defSel) ? 9 : 12 }}>

            {/* PASO 0 */}
            {paso === 0 && (
              <Fade in timeout={400}>
                <Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={900} sx={{ mb: 0.5 }}>Paso 1 — Elegí una materia</Typography>
                    <Typography variant="body2" color="text.secondary">Seleccioná la materia sobre la que querés generar el reporte.</Typography>
                  </Box>
                  {loadingMat ? (
                    <Grid container spacing={2}>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
                          <Box sx={{ height: 160, borderRadius: '16px', bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03) }} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : asignaciones.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: '12px' }}>No tenés materias asignadas para el período actual.</Alert>
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

            {/* PASO 1 */}
            {paso === 1 && (
              <Fade in timeout={400}>
                <Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={900} sx={{ mb: 0.5 }}>Paso 2 — Tipo de reporte</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      ¿Qué querés exportar de <Box component="span" sx={{ color: brand, fontWeight: 800 }}>{asignacionSel?.materia_nombre}</Box>?
                    </Typography>
                    <Tabs value={modulo} onChange={(_, v) => setModulo(v)} sx={{
                      mb: 3,
                      '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: 14, borderRadius: '8px' },
                      '& .Mui-selected': { color: brand },
                      '& .MuiTabs-indicator': { bgcolor: brand, height: 3, borderRadius: 2 },
                    }}>
                      <Tab value="asistencia" label="📋 Asistencia" />
                      <Tab value="notas" label="📝 Notas" />
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

            {/* PASO 2 */}
            {paso === 2 && defSel && asignacionSel && (
              <Fade in timeout={400}>
                <Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={900} sx={{ mb: 0.5 }}>Paso 3 — Configurar y descargar</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {defSel.filtros.length > 0 ? 'Completá los filtros y elegí el formato.' : 'Este reporte no requiere filtros. Descargá directamente.'}
                    </Typography>
                  </Box>

                  <PanelDescarga
                    def={defSel} asignacion={asignacionSel}
                    periodos={periodos} dimensiones={dimensiones}
                    evaluaciones={evaluaciones} estudiantes={estudiantes}
                    loadingEst={loadingEst}
                  />

                  <Box sx={{ mt: 3, p: 2.5, borderRadius: '12px', bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02), border: `1px solid ${borderField}` }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 10, display: 'block', mb: 1 }}>
                      Sobre este reporte
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{defSel.descripcion}</Typography>
                    {defSel.tipo === 'comparativo_trimestral' && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>El Excel incluye 2 hojas: Notas finales por trimestre · Desglose Ser/Saber/Hacer/Auto.</Typography>}
                    {defSel.tipo === 'boletin' && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>Incluye nota de cada dimensión (Ser 10% · Saber 40% · Hacer 45% · Auto 5%) y la nota final ponderada.</Typography>}
                    {defSel.tipo === 'trimestres_clase' && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>El Excel incluye 3 hojas: Comparativo trimestral · Detalle por estudiante · Atención requerida.</Typography>}
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