'use client';
// app/dashboard/docente/reportes/page.tsx
// Restiada al sistema brand/brandEnd/gradBg — mismo patrón que notas y seguimiento.
// Funcionalidad 100% intacta.

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box, Container, Typography, Grid, Chip, Button, TextField, Stack, Divider,
  CircularProgress, Alert, Fade, Tabs, Tab, Autocomplete,
  Select, MenuItem, FormControl, InputLabel, InputAdornment,
  Card, CardContent, Avatar, Badge, Skeleton, Tooltip,
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
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

const SearchIcon = SearchRoundedIcon;
const SchoolIcon = SchoolRoundedIcon;

import { asistenciaService } from '@/services/asistenciaService';
import {
  descargarPaseDia, descargarPeriodoClase,
  descargarTrimestresClase, descargarTrimestresEstudiante,
  descargarReporteEstudiante,
} from '@/services/reportesAsistenciaService';
import useReportesNotas from '@/hooks/useReportesNotas';
import { inicialService } from '@/services/inicialService';
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

// ── tipos ─────────────────────────────────────────────────────────────────────

type ModuloReporte = 'asistencia' | 'notas';
type TipoReporteAsistencia =
  | 'pase_dia' | 'periodo_completo' | 'trimestres_clase'
  | 'estudiante_individual' | 'resumen_anual' | 'comparativo_materias';
type TipoReporteNotas =
  | 'boletin' | 'por_evaluacion' | 'por_dimension'
  | 'comparativo_trimestral' | 'estudiante_notas' | 'resumen_clase';
type TipoReporteInicial =
  | 'cotejo_matriz' | 'libreta_individual' | 'centralizador_informes' | 'practicas_formativas';
type TipoReporte = TipoReporteAsistencia | TipoReporteNotas | TipoReporteInicial;

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

// ── catálogo de reportes ──────────────────────────────────────────────────────

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

const REPORTES_INICIAL: DefReporte[] = [
  {
    tipo: 'cotejo_matriz',
    modulo: 'notas',
    titulo: 'Matriz de Listas de Cotejo',
    descripcion: 'Cuadrícula oficial de la clase con valoración de logros (ED, DA, DO, DP) en cada indicador curricular.',
    icon: <FactCheckRoundedIcon />,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)',
    badge: 'Oficial',
    filtros: ['trimestre'],
  },
  {
    tipo: 'libreta_individual',
    modulo: 'notas',
    titulo: 'Libreta Cualitativa del Estudiante',
    descripcion: 'Boletín individual oficial con la evaluación de los campos de saberes e informe pedagógico descriptivo.',
    icon: <ChildCareRoundedIcon />,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)',
    badge: 'Para Familias',
    filtros: ['trimestre', 'estudiante'],
  },
  {
    tipo: 'centralizador_informes',
    modulo: 'notas',
    titulo: 'Reporte General de Informes',
    descripcion: 'Consolidado general de aula con la redacción y texto cualitativo completo de cada estudiante cargado al sistema.',
    icon: <DescriptionRoundedIcon />,
    color: '#10b981',
    gradient: 'linear-gradient(135deg,#10b981,#34d399)',
    badge: 'Texto del Sistema',
    filtros: ['trimestre'],
  },
  {
    tipo: 'practicas_formativas',
    modulo: 'notas',
    titulo: 'Registro de Prácticas Formativas',
    descripcion: 'Reporte cualitativo de actividades y hojas de trabajo prácticas (Muy bien, Bien, Regular, Necesita apoyo).',
    icon: <AutoAwesomeRoundedIcon />,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
    filtros: ['evaluacion'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// CARD DE MATERIA — Estilo unificado Temario / Calificaciones
// ─────────────────────────────────────────────────────────────────────────────

const MateriaCard: React.FC<{
  a: AsignacionDocente;
  seleccionada: boolean;
  onClick: () => void;
  accentColor: string;
  gradBg: string;
  isDark: boolean;
}> = ({ a, seleccionada, onClick, accentColor, gradBg, isDark }) => {
  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          height: '100%',
          borderRadius: '18px',
          border: seleccionada
            ? `2px solid ${accentColor}`
            : `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          bgcolor: seleccionada
            ? isDark
              ? alpha(accentColor, 0.06)
              : alpha(accentColor, 0.04)
            : isDark
              ? alpha('#fff', 0.02)
              : '#fff',
          boxShadow: seleccionada
            ? `0 8px 24px ${alpha(accentColor, 0.28)}`
            : isDark
              ? 'none'
              : '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: `0 10px 22px ${alpha(accentColor, 0.2)}`,
            borderColor: accentColor,
            '& .btn-gestionar': {
              backgroundColor: alpha(accentColor, 0.15),
              borderColor: accentColor,
              transform: 'translateX(2px)',
            },
          },
        }}
        onClick={onClick}
      >
        {/* Badge de Paralelo arriba a la izquierda */}
        <Chip
          label={a.materia_codigo === 'GENERAL-INICIAL' ? `⭐ Aula General · Par. "${a.paralelo_nombre}"` : `Paralelo "${a.paralelo_nombre}"`}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1,
            fontWeight: 700,
            fontSize: '0.68rem',
            height: 22,
            backgroundColor: isDark ? alpha(accentColor, 0.18) : alpha(accentColor, 0.12),
            color: accentColor,
            border: `1px solid ${alpha(accentColor, 0.3)}`,
          }}
        />

        {/* Chip de Selección / Turno arriba a la derecha */}
        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
          {seleccionada ? (
            <Chip
              icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important', color: `${accentColor} !important` }} />}
              label="Elegida"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 22,
                backgroundColor: isDark ? alpha(accentColor, 0.2) : alpha(accentColor, 0.12),
                color: accentColor,
                border: `1px solid ${accentColor}`,
              }}
            />
          ) : (
            <Chip
              label={a.turno_nombre || 'Regular'}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '0.65rem',
                height: 22,
                backgroundColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                color: 'text.secondary',
              }}
            />
          )}
        </Box>

        <CardContent sx={{ p: 2.2, pt: 4.5, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Avatar mediano centrado con badge de nivel */}
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                a.nivel_nombre ? (
                  <Tooltip title={`Nivel: ${a.nivel_nombre}`}>
                    <Chip
                      icon={<SchoolIcon sx={{ fontSize: 11 }} />}
                      label={a.nivel_nombre}
                      size="small"
                      sx={{
                        height: 20,
                        fontWeight: 700,
                        fontSize: '0.6rem',
                        bgcolor: accentColor,
                        color: isDark ? '#000' : '#fff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        '& .MuiChip-icon': { ml: 0.4, color: isDark ? '#000' : '#fff' },
                      }}
                    />
                  </Tooltip>
                ) : null
              }
            >
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  margin: '0 auto',
                  bgcolor: accentColor,
                  color: isDark ? '#000' : '#fff',
                  border: `3px solid ${alpha(accentColor, 0.2)}`,
                  boxShadow: seleccionada
                    ? `0 6px 16px ${alpha(accentColor, 0.4)}`
                    : `0 6px 14px ${alpha(accentColor, 0.2)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AssessmentRoundedIcon sx={{ fontSize: 36, color: '#fff' }} />
              </Avatar>
            </Badge>
          </Box>

          {/* Nombre de la Materia */}
          <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ fontSize: '1.02rem', lineHeight: 1.25, mb: 0.3 }}>
            {a.materia_nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={600} sx={{ fontSize: '0.78rem' }}>
            {a.grado_nombre}
          </Typography>

          {/* Chip de Código / Aula */}
          <Box sx={{ my: 0.8 }}>
            <Chip
              label={
                a.materia_codigo === 'GENERAL-INICIAL'
                  ? '⭐ Consolidado General de Aula'
                  : (a.nivel_nombre?.toLowerCase().includes('inicial')
                    ? `Campo: ${a.materia_codigo || 'Inicial'}`
                    : (a.materia_codigo ? `Código: ${a.materia_codigo}` : 'Asignatura'))
              }
              size="small"
              sx={{
                fontFamily: a.materia_codigo === 'GENERAL-INICIAL' ? 'inherit' : 'monospace',
                fontWeight: 700,
                fontSize: '0.68rem',
                height: 22,
                backgroundColor: isDark ? alpha(accentColor, 0.1) : alpha(accentColor, 0.08),
                color: accentColor,
              }}
            />
          </Box>

          {/* Botón de acción directo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
            <Button
              className="btn-gestionar"
              size="small"
              variant={seleccionada ? 'contained' : 'outlined'}
              endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.74rem',
                px: 1.8,
                py: 0.4,
                borderColor: alpha(accentColor, 0.35),
                color: seleccionada ? (isDark ? '#000' : '#fff') : accentColor,
                bgcolor: seleccionada ? accentColor : 'transparent',
              }}
            >
              {seleccionada
                ? (a.materia_codigo === 'GENERAL-INICIAL' ? 'Aula General Seleccionada' : 'Materia Seleccionada')
                : (a.materia_codigo === 'GENERAL-INICIAL' ? 'Ver Reportes Generales' : (a.nivel_nombre?.toLowerCase().includes('inicial') ? 'Ver Cotejo de este Campo' : 'Seleccionar'))}
            </Button>
          </Box>

          {/* Footer stats */}
          <Box
            sx={{
              mt: 'auto',
              pt: 1.5,
              borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.8,
              textAlign: 'left',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <GroupsRoundedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Estudiantes:
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                {a.total_estudiantes ?? 0}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <CalendarTodayRoundedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Período:
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                {a.periodo_nombre || 'Actual'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD DE REPORTE — Estilo unificado
// ─────────────────────────────────────────────────────────────────────────────

const ReporteCard: React.FC<{
  def: DefReporte;
  seleccionado: boolean;
  onClick: () => void;
  accentColor: string;
  isDark: boolean;
}> = ({ def, seleccionado, onClick, accentColor, isDark }) => {
  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          height: '100%',
          borderRadius: '18px',
          border: seleccionado
            ? `2px solid ${def.color}`
            : `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          bgcolor: seleccionado
            ? isDark
              ? alpha(def.color, 0.08)
              : alpha(def.color, 0.04)
            : isDark
              ? alpha('#fff', 0.02)
              : '#fff',
          boxShadow: seleccionado
            ? `0 8px 24px ${alpha(def.color, 0.28)}`
            : isDark
              ? 'none'
              : '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: `0 10px 22px ${alpha(def.color, 0.25)}`,
            borderColor: def.color,
            '& .btn-gestionar': {
              backgroundColor: alpha(def.color, 0.15),
              borderColor: def.color,
              transform: 'translateX(2px)',
            },
          },
        }}
        onClick={onClick}
      >
        <Chip
          label={def.modulo === 'asistencia' ? 'Asistencia' : 'Notas'}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1,
            fontWeight: 700,
            fontSize: '0.68rem',
            height: 22,
            backgroundColor: alpha(def.color, isDark ? 0.18 : 0.12),
            color: def.color,
            border: `1px solid ${alpha(def.color, 0.3)}`,
          }}
        />

        {def.badge && (
          <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
            <Chip
              label={def.badge}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 22,
                backgroundColor: alpha(def.color, 0.15),
                color: def.color,
                border: `1px solid ${alpha(def.color, 0.3)}`,
              }}
            />
          </Box>
        )}

        <CardContent sx={{ p: 2.2, pt: 4.5, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                margin: '0 auto',
                background: def.gradient,
                color: '#fff',
                border: `3px solid ${alpha(def.color, 0.25)}`,
                boxShadow: `0 6px 16px ${alpha(def.color, 0.35)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '& svg': { fontSize: 30, color: '#fff' },
              }}
            >
              {def.icon}
            </Avatar>
          </Box>

          <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ fontSize: '1.02rem', lineHeight: 1.25, mb: 0.5 }}>
            {def.titulo}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', lineHeight: 1.4, mb: 1.5, flex: 1 }}>
            {def.descripcion}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
            <Button
              className="btn-gestionar"
              size="small"
              variant={seleccionado ? 'contained' : 'outlined'}
              endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.74rem',
                px: 2,
                py: 0.5,
                borderColor: alpha(def.color, 0.4),
                color: seleccionado ? '#fff' : def.color,
                bgcolor: seleccionado ? def.color : 'transparent',
              }}
            >
              {seleccionado ? 'Reporte Elegido' : 'Configurar Reporte'}
            </Button>
          </Box>

          <Box
            sx={{
              mt: 'auto',
              pt: 1.2,
              borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Chip
              label="PDF"
              size="small"
              sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04) }}
            />
            <Chip
              label="EXCEL"
              size="small"
              sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04) }}
            />
          </Box>
        </CardContent>
      </Card>
    </Fade>
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
  esInicial?: boolean;
}> = ({ def, asignacion, periodos, dimensiones, evaluaciones, estudiantes, loadingEst, esInicial }) => {
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
  const [informesAula, setInformesAula] = useState<any[]>([]);
  const [loadingInformes, setLoadingInformes] = useState(false);
  const [busquedaTexto, setBusquedaTexto] = useState('');

  useEffect(() => {
    if (def.tipo === 'centralizador_informes' && trimestreId && asignacion.paralelo_id) {
      setLoadingInformes(true);
      inicialService.getInformesParalelo(asignacion.paralelo_id, trimestreId as number)
        .then(data => setInformesAula(data || []))
        .catch(() => { })
        .finally(() => setLoadingInformes(false));
    }
  }, [def.tipo, trimestreId, asignacion.paralelo_id]);

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
      } else if (def.tipo === 'cotejo_matriz') {
        const isGeneral = asignacion.materia_codigo === 'GENERAL-INICIAL';
        const params = isGeneral ? undefined : {
          materiaCodigo: asignacion.materia_codigo,
          gradoMateriaId: asignacion.grado_materia_id,
        };
        const blob = await inicialService.descargarMatrizCotejoReporte(
          asignacion.paralelo_id,
          trimestreId as number,
          formato,
          params
        );
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const nombreSufijo = isGeneral ? 'General' : (asignacion.materia_codigo || 'Campo');
        a.download = `matriz-cotejo-${asignacion.paralelo_nombre}-${nombreSufijo}-T${trimestreId}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (def.tipo === 'libreta_individual') {
        const blob = await inicialService.descargarBoletin(estudianteSel!.matricula_id, trimestreId as number, formato);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `libreta-inicial-${estudianteSel!.apellidos}_${estudianteSel!.nombres}-T${trimestreId}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (def.tipo === 'centralizador_informes') {
        const blob = await inicialService.descargarCentralizadorInformesReporte(asignacion.paralelo_id, trimestreId as number, formato);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `centralizador-informes-${asignacion.paralelo_nombre}-T${trimestreId}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (def.tipo === 'practicas_formativas') {
        await notasHook.exportarEvaluacion({ evaluacion_id: evaluacionId as number }, formato);
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
      <Typography variant="body2" fontWeight={800} sx={{ color: def.color, mb: 1.5 }}>
        Configurar y descargar
      </Typography>

      {def.tipo === 'cotejo_matriz' && (
        <Alert
          severity="info"
          icon={<FactCheckRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{ mb: 2, borderRadius: '12px', fontSize: '0.78rem', py: 0.5 }}
        >
          {asignacion.materia_codigo === 'GENERAL-INICIAL'
            ? '📋 Generando matriz completa consolidada con todos los campos de saberes del aula.'
            : `📋 Generando lista de cotejo exclusiva para el campo: ${asignacion.materia_nombre}.`}
        </Alert>
      )}

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
            <InputLabel>{esInicial ? 'Práctica Formativa' : 'Evaluación'}</InputLabel>
            <Select value={evaluacionId} label={esInicial ? 'Práctica Formativa' : 'Evaluación'} onChange={e => setEvaluacionId(e.target.value as number)}>
              {evaluaciones.map(ev => (
                <MenuItem key={ev.id} value={ev.id}>
                  {ev.nombre} {esInicial ? '' : `— ${ev.dimension_codigo}`} · {ev.periodo_nombre}
                </MenuItem>
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

      {def.tipo === 'centralizador_informes' && Boolean(trimestreId) && (
        <Box sx={{ mt: 3, pt: 2.5, borderTop: `1px solid ${borderField}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: def.color }}>
                👁️ Vista Previa del Texto Registrado en el Sistema
              </Typography>
              <Chip
                label={`${informesAula.filter(i => i.texto?.trim()).length} de ${informesAula.length} con informe`}
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: alpha(def.color, 0.12), color: def.color }}
              />
            </Box>
            <TextField
              size="small"
              placeholder="Buscar estudiante o texto..."
              value={busquedaTexto}
              onChange={e => setBusquedaTexto(e.target.value)}
              sx={{ width: { xs: '100%', sm: 240 }, ...fieldSx }}
              InputProps={{ startAdornment: <SearchIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} /> }}
            />
          </Box>

          {loadingInformes ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} sx={{ color: def.color }} />
            </Box>
          ) : informesAula.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              No hay estudiantes inscritos o no se encontraron datos para este trimestre.
            </Typography>
          ) : (
            <Box sx={{ maxHeight: 380, overflowY: 'auto', pr: 0.5, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {informesAula
                .filter(inf => {
                  if (!busquedaTexto.trim()) return true;
                  const q = busquedaTexto.toLowerCase();
                  return (
                    (inf.apellidos && inf.apellidos.toLowerCase().includes(q)) ||
                    (inf.nombres && inf.nombres.toLowerCase().includes(q)) ||
                    (inf.codigo_rude && inf.codigo_rude.includes(q)) ||
                    (inf.texto && inf.texto.toLowerCase().includes(q))
                  );
                })
                .map((inf, idx) => (
                  <Box
                    key={inf.matricula_id || idx}
                    sx={{
                      p: 1.5, borderRadius: '12px',
                      border: `1px solid ${borderField}`,
                      bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: alpha(def.color, 0.05), borderColor: alpha(def.color, 0.3) }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8, flexWrap: 'wrap', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 26, height: 26, fontSize: 11, fontWeight: 700, bgcolor: def.color }}>
                          {inf.nombres?.charAt(0) || 'P'}
                        </Avatar>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.82rem' }}>
                          {inf.apellidos}, {inf.nombres}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                          · RUDE: {inf.codigo_rude || '—'}
                        </Typography>
                      </Box>
                      <Chip
                        label={inf.estado === 'publicado' ? 'Publicado' : (inf.texto ? 'Borrador' : 'Sin Texto')}
                        size="small"
                        sx={{
                          height: 20, fontSize: '0.65rem', fontWeight: 800,
                          bgcolor: inf.estado === 'publicado' ? alpha('#16a34a', 0.15) : (inf.texto ? alpha('#f59e0b', 0.15) : alpha('#94a3b8', 0.15)),
                          color: inf.estado === 'publicado' ? '#16a34a' : (inf.texto ? '#f59e0b' : '#94a3b8'),
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color={inf.texto ? 'text.primary' : 'text.secondary'}
                      sx={{
                        fontSize: '0.78rem',
                        lineHeight: 1.45,
                        fontStyle: inf.texto ? 'normal' : 'italic',
                        bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.7)',
                        p: 1.2, borderRadius: '8px', border: `1px solid ${borderField}`
                      }}
                    >
                      {inf.texto || 'No hay informe redactado o cargado en el sistema.'}
                    </Typography>
                  </Box>
                ))}
            </Box>
          )}
        </Box>
      )}

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

  const [searchTerm, setSearchTerm] = useState('');
  const [gradoFilter, setGradoFilter] = useState('');

  useEffect(() => {
    asistenciaService.getMisAsignaciones()
      .then(r => setAsignaciones(r.data.asignaciones))
      .catch(() => toast.error('Error al cargar materias'))
      .finally(() => setLoadingMat(false));
  }, []);

  useEffect(() => {
    if (!asignacionSel) return;
    const realAsignacion = asignaciones.find(x => x.paralelo_id === asignacionSel.paralelo_id && x.asignacion_id > 0);
    const aid = (asignacionSel.asignacion_id > 0) ? asignacionSel.asignacion_id : (realAsignacion?.asignacion_id || 0);
    const pid = asignacionSel.periodo_academico_id;
    if (aid > 0) {
      setLoadingEst(true);
      asistenciaService.getListaDia(aid, new Date().toISOString().slice(0, 10))
        .then(r => setEstudiantes(r.data.lista.map((e: any) => ({
          matricula_id: e.matricula_id, codigo: e.estudiante_codigo,
          nombres: e.estudiante_nombres, apellidos: e.estudiante_apellidos,
        }))))
        .catch(() => { }).finally(() => setLoadingEst(false));
      evaluacionesService.listar({ asignacion_docente_id: aid, activo: true, limit: 200 }).then(r => setEvaluaciones(r.data.evaluaciones)).catch(() => { });
    }
    periodosEvaluacionService.listar(pid, true).then(r => setPeriodos(r.data.periodos)).catch(() => { });
    dimensionesService.listar().then(r => setDimensiones(r.data.dimensiones)).catch(() => { });
  }, [asignacionSel, asignaciones]);

  // Grados disponibles
  const gradosDisponibles = useMemo(() => {
    const setG = new Set<string>();
    asignaciones.forEach((a) => {
      if (a.grado_nombre) setG.add(a.grado_nombre);
    });
    return Array.from(setG).sort();
  }, [asignaciones]);

  // Asignaciones filtradas
  const asignacionesFiltradas = useMemo(() => {
    return asignaciones.filter((a) => {
      const matchGrado = !gradoFilter || a.grado_nombre === gradoFilter;
      const matchSearch =
        !searchTerm ||
        a.materia_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.grado_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.paralelo_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.materia_codigo?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchGrado && matchSearch;
    });
  }, [asignaciones, gradoFilter, searchTerm]);

  // Agrupar asignaciones para Inicial:
  // Mostramos 1 tarjeta de "Evaluación General de Aula" más las tarjetas de cada materia / campo de saberes
  const asignacionesFinales = useMemo(() => {
    const list: AsignacionDocente[] = [];
    const paralelosInicialVistos = new Set<number>();

    for (const a of asignacionesFiltradas) {
      const aEsInicial = a.nivel_nombre?.toLowerCase().includes('inicial');
      if (aEsInicial && a.paralelo_id) {
        if (!paralelosInicialVistos.has(a.paralelo_id)) {
          paralelosInicialVistos.add(a.paralelo_id);
          list.push({
            ...a,
            asignacion_id: -Number(a.paralelo_id),
            materia_nombre: `Evaluación General de Aula`,
            materia_codigo: 'GENERAL-INICIAL',
          });
        }
        list.push(a);
      } else {
        list.push(a);
      }
    }
    return list;
  }, [asignacionesFiltradas]);

  const esInicial = asignacionSel?.nivel_nombre?.toLowerCase().includes('inicial') ?? false;
  const reportesActuales = modulo === 'asistencia'
    ? REPORTES_ASISTENCIA
    : (esInicial ? REPORTES_INICIAL : REPORTES_NOTAS);
  const defSel = [...REPORTES_ASISTENCIA, ...REPORTES_NOTAS, ...REPORTES_INICIAL].find(r => r.tipo === tipoSel) ?? null;

  const handleSelMateria = (a: AsignacionDocente) => {
    setAsignacionSel(a);
    setPaso(1);
    setTipoSel(null);
    if (a.nivel_nombre?.toLowerCase().includes('inicial')) {
      setModulo('notas');
    }
  };
  const handleSelTipo = (tipo: TipoReporte) => { setTipoSel(tipo); setPaso(2); };
  const handleReset = () => { setPaso(0); setAsignacionSel(null); setTipoSel(null); };

  const steps = [
    { label: esInicial ? 'Aula' : 'Materia', done: paso >= 1 },
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
                            <Chip label={defSel.modulo === 'asistencia' ? 'Asistencia' : (esInicial ? 'Inicial Cualitativo' : 'Notas')} size="small"
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
                    <Typography variant="h5" fontWeight={900} sx={{ mb: 0.5 }}>
                      Paso 1 — Elegí tu aula o materia
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Seleccioná el aula o materia para acceder a los reportes disponibles.
                    </Typography>
                  </Box>

                  {/* BARRA DE FILTROS PASO 0 */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      p: 2,
                      mb: 3,
                      borderRadius: '16px',
                      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                      border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                    }}
                  >
                    <TextField
                      placeholder="Buscar por materia, grado o paralelo..."
                      size="small"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{
                        flex: { xs: '1 1 100%', sm: '1 1 280px' },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
                      <InputLabel>Filtrar por Grado</InputLabel>
                      <Select
                        value={gradoFilter}
                        label="Filtrar por Grado"
                        onChange={(e) => setGradoFilter(e.target.value)}
                        sx={{ borderRadius: '12px' }}
                      >
                        <MenuItem value="">Todos los grados</MenuItem>
                        {gradosDisponibles.map((g) => (
                          <MenuItem key={g} value={g}>
                            {g}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {loadingMat ? (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(auto-fill, minmax(260px, 1fr))',
                          md: 'repeat(auto-fill, minmax(270px, 1fr))',
                          lg: 'repeat(auto-fill, minmax(280px, 1fr))',
                        },
                        gap: 2.5,
                      }}
                    >
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={260} sx={{ borderRadius: '18px' }} />
                      ))}
                    </Box>
                  ) : asignaciones.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: '12px' }}>No tenés materias asignadas para el período actual.</Alert>
                  ) : asignacionesFinales.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Typography variant="body1" fontWeight={700} color="text.secondary">
                        No se encontraron materias con ese filtro.
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(auto-fill, minmax(260px, 1fr))',
                          md: 'repeat(auto-fill, minmax(270px, 1fr))',
                          lg: 'repeat(auto-fill, minmax(280px, 1fr))',
                        },
                        gap: 2.5,
                      }}
                    >
                      {asignacionesFinales.map((a) => {
                        const esGeneral = a.materia_codigo === 'GENERAL-INICIAL';
                        const estaSeleccionada = esGeneral
                          ? asignacionSel?.materia_codigo === 'GENERAL-INICIAL' && asignacionSel?.paralelo_id === a.paralelo_id
                          : asignacionSel?.asignacion_id === a.asignacion_id;
                        return (
                          <MateriaCard
                            key={esGeneral ? `general-${a.paralelo_id}` : a.asignacion_id}
                            a={a}
                            seleccionada={estaSeleccionada}
                            onClick={() => handleSelMateria(a)}
                            accentColor={esGeneral ? '#8b5cf6' : brand}
                            gradBg={gradBg}
                            isDark={isDark}
                          />
                        );
                      })}
                    </Box>
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
                      <Tab value="notas" label={esInicial ? "🌟 Cotejo e Informes" : "📝 Notas"} />
                    </Tabs>
                  </Box>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(auto-fill, minmax(260px, 1fr))',
                        md: 'repeat(auto-fill, minmax(270px, 1fr))',
                        lg: 'repeat(auto-fill, minmax(280px, 1fr))',
                      },
                      gap: 2.5,
                    }}
                  >
                    {reportesActuales.map((r) => (
                      <ReporteCard
                        key={r.tipo}
                        def={r}
                        seleccionado={tipoSel === r.tipo}
                        onClick={() => handleSelTipo(r.tipo)}
                        accentColor={brand}
                        isDark={isDark}
                      />
                    ))}
                  </Box>
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
                    esInicial={esInicial}
                  />

                  <Box sx={{ mt: 3, p: 2.5, borderRadius: '12px', bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02), border: `1px solid ${borderField}` }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 10, display: 'block', mb: 1 }}>
                      Sobre este reporte
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{defSel.descripcion}</Typography>
                    {defSel.tipo === 'comparativo_trimestral' && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>El Excel incluye 2 hojas: Notas finales por trimestre · Desglose Ser/Saber/Hacer/Auto.</Typography>}
                    {defSel.tipo === 'boletin' && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>Incluye nota de cada dimensión (Ser 10% · Saber 40% · Hacer 45% · Auto 5%) y la nota final ponderada.</Typography>}
                    {defSel.tipo === 'trimestres_clase' && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>El Excel incluye 3 hojas: Comparativo trimestral · Detalle por estudiante · Atención requerida.</Typography>}
                    {defSel.tipo === 'cotejo_matriz' && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>Cuadrícula oficial completa con la escala de logros (ED, DA, DO, DP) y glosario de indicadores curriculares.</Typography>}
                    {defSel.tipo === 'libreta_individual' && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>Libreta cualitativa oficial con evaluación por campos de desarrollo, redacción pedagógica y firmas para entrega a tutores.</Typography>}
                    {defSel.tipo === 'centralizador_informes' && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>Consolidado general de aula con el informe pedagógico integral de cada alumno y su estado de publicación.</Typography>}
                    {defSel.tipo === 'practicas_formativas' && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>Seguimiento formativo de prácticas y hojas de trabajo con valoración cualitativa.</Typography>}
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