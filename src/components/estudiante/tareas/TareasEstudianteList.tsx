'use client';
// components/estudiante/tareas/TareasEstudianteList.tsx
// Listado de tareas del estudiante agrupadas por materia con diseño institucional de docente

import React, { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Skeleton,
  Collapse, TextField, InputAdornment, Grid, Button,
  useTheme, alpha, IconButton, Tooltip,
} from '@mui/material';
import { keyframes } from '@mui/system';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import BlockIcon from '@mui/icons-material/Block';
import CommentIcon from '@mui/icons-material/Comment';
import GradeIcon from '@mui/icons-material/Grade';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import ComputerRoundedIcon from '@mui/icons-material/ComputerRounded';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import { useRouter } from 'next/navigation';

import type { TareaEstudiante, ResumenTareas, EstadoTarea } from '@/types/estudiante';

// ──────────────────────────────────────────────
// CONFIG DE ESTADOS
// ──────────────────────────────────────────────
const ESTADO_CONFIG: Record<EstadoTarea, {
  label: string; color: string; gradient: string;
}> = {
  pendiente: {
    label: 'Pendiente',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  },
  entregado: {
    label: 'Entregado',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
  },
  atrasado: {
    label: 'Atrasado',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
  },
  ausente: {
    label: 'Ausente',
    color: '#6b7280',
    gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)',
  },
};

const DIMENSIONES: Record<string, { label: string; color: string }> = {
  SER:  { label: 'Ser',            color: '#10B981' },
  SAB:  { label: 'Saber',          color: '#3B82F6' },
  HAC:  { label: 'Hacer',          color: '#F59E0B' },
  AUTO: { label: 'Autoevaluación', color: '#8B5CF6' },
  AUT:  { label: 'Autoevaluación', color: '#8B5CF6' },
};

const TIPOS_LABELS: Record<string, string> = {
  // Saber
  examen:              'Examen',
  exposicion:          'Exposición',
  cuestionario:        'Cuestionario',
  tarea:               'Tarea',
  ficha_trabajo:       'Ficha de trabajo',
  investigacion:       'Investigación',
  evaluacion_oral:     'Evaluación oral',
  // Hacer
  trabajo_practico:    'Trabajo práctico',
  manualidad:          'Manualidad',
  experimento:         'Experimento',
  actividad_practica:  'Actividad práctica',
  ejercicio_practico:  'Ejercicio práctico',
  trabajo_grupal:      'Trabajo grupal',
  proyecto:            'Proyecto',
  demostracion:        'Demostración',
  produccion_creativa: 'Producción creativa',
  // Compatibilidad
  trabajo:             'Trabajo',
  practica:            'Práctica',
  quiz:                'Quiz',
  participacion:       'Participación',
  general:             'General',
  ser:                 'Actitudinal',
};

// ──────────────────────────────────────────────
// ANIMACIONES
// ──────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
const formatDias = (dias: number | null | undefined): string => {
  if (dias == null) return 'Sin fecha límite';
  if (dias < 0)  return `Venció hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`;
  if (dias === 0) return 'Vence hoy';
  if (dias === 1) return 'Vence mañana';
  return `${dias} días restantes`;
};

const colorDias = (dias: number | null | undefined, estado: EstadoTarea, isDark: boolean): string => {
  if (estado === 'entregado') return isDark ? '#34d399' : '#10b981';
  if (estado === 'atrasado')  return isDark ? '#f87171' : '#ef4444';
  if (dias == null) return isDark ? '#9ca3af' : '#6b7280';
  if (dias <= 1)  return isDark ? '#f87171' : '#ef4444';
  if (dias <= 3)  return isDark ? '#fbbf24' : '#f59e0b';
  return isDark ? '#9ca3af' : '#6b7280';
};

const formatFecha = (f: string | null | undefined) =>
  f ? new Date(f).toLocaleDateString('es-BO', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  }) : null;

// ──────────────────────────────────────────────
// ÍCONO DE ESTADO
// ──────────────────────────────────────────────
const EstadoIcon: React.FC<{ estado: EstadoTarea; size?: number }> = ({ estado, size = 20 }) => {
  const sx = { fontSize: size };
  if (estado === 'entregado') return <CheckCircleRoundedIcon sx={sx} />;
  if (estado === 'atrasado')  return <CancelRoundedIcon sx={sx} />;
  if (estado === 'ausente')   return <BlockIcon sx={sx} />;
  return <AccessTimeRoundedIcon sx={sx} />;
};

// ──────────────────────────────────────────────
// TARJETA INDIVIDUAL DE TAREA (DENTRO DE MATERIA)
// ──────────────────────────────────────────────
const TarjetaTarea: React.FC<{
  tarea: TareaEstudiante;
  index: number;
  accentColor: string;
  gradBg: string;
  textOnAccent: string;
}> = ({ tarea, index, accentColor, gradBg, textOnAccent }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();

  const cfg = ESTADO_CONFIG[tarea.estado_calculado] || ESTADO_CONFIG.pendiente;
  const dimCodigo = tarea.dimension_codigo ? tarea.dimension_codigo.toUpperCase() : '';
  const dimCfg = DIMENSIONES[dimCodigo] || null;
  const cdias = colorDias(tarea.dias_restantes, tarea.estado_calculado, isDark);
  const esVirtual = tarea.modalidad === 'virtual';
  const esPracticaDigital = Boolean(tarea.permite_entrega_archivo || tarea.tipo === 'practica');

  const handleVerDetalle = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/estudiante/tareas/${tarea.evaluacion_id}`);
  };

  const handleRendirExamen = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/estudiante/examenes/${tarea.evaluacion_id}`);
  };

  return (
    <Card
      onClick={handleVerDetalle}
      sx={{
        borderRadius: '16px',
        animation: `${fadeUp} 0.3s ease-out ${Math.min(index, 8) * 0.03}s both`,
        overflow: 'hidden',
        cursor: 'pointer',
        border: `1.5px solid ${alpha(isDark ? '#fff' : '#000', isDark ? 0.08 : 0.07)}`,
        background: isDark
          ? `linear-gradient(135deg, ${alpha(cfg.color, 0.05)} 0%, rgba(15, 23, 42, 0.7) 100%)`
          : `linear-gradient(135deg, ${alpha(cfg.color, 0.03)} 0%, #ffffff 100%)`,
        boxShadow: isDark
          ? '0 4px 18px rgba(0, 0, 0, 0.3)'
          : '0 2px 12px rgba(0, 0, 0, 0.03)',
        transition: 'all 0.22s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: alpha(accentColor, 0.45),
          boxShadow: isDark
            ? `0 8px 24px ${alpha(cfg.color, 0.2)}`
            : `0 8px 24px ${alpha(cfg.color, 0.12)}`,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.2 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          {/* Ícono de estado con contenedor redondeado */}
          <Box sx={{
            width: 44, height: 44, borderRadius: '13px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: alpha(cfg.color, isDark ? 0.18 : 0.12),
            color: cfg.color,
            border: `1.5px solid ${alpha(cfg.color, 0.35)}`,
            boxShadow: `0 3px 10px ${alpha(cfg.color, 0.18)}`,
          }}>
            <EstadoIcon estado={tarea.estado_calculado} size={22} />
          </Box>

          {/* Bloque central: Título, tipo, dimensión y fecha */}
          <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>

            {/* Fila 1: Título y chips de estado/modalidad */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.6 }}>
              <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '0.98rem', sm: '1.05rem' }, lineHeight: 1.3 }}>
                {tarea.evaluacion_nombre}
              </Typography>

              <Chip
                size="small"
                label={cfg.label}
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 800,
                  bgcolor: isDark ? alpha(cfg.color, 0.2) : alpha(cfg.color, 0.12),
                  color: cfg.color,
                  border: `1px solid ${alpha(cfg.color, 0.3)}`,
                  borderRadius: '8px',
                }}
              />

              {esVirtual && (
                <Chip
                  size="small"
                  icon={<ComputerRoundedIcon sx={{ fontSize: '13px !important' }} />}
                  label="En Línea"
                  sx={{
                    height: 22,
                    fontSize: 11,
                    fontWeight: 800,
                    bgcolor: isDark ? alpha('#0288d1', 0.22) : alpha('#0288d1', 0.1),
                    color: isDark ? '#38bdf8' : '#0288d1',
                    border: `1px solid ${alpha('#0288d1', 0.3)}`,
                    borderRadius: '8px',
                    '& .MuiChip-icon': { color: isDark ? '#38bdf8' : '#0288d1' },
                  }}
                />
              )}

              {esPracticaDigital && (
                <Chip
                  size="small"
                  icon={<CloudUploadRoundedIcon sx={{ fontSize: '13px !important' }} />}
                  label="Práctica / Archivos"
                  sx={{
                    height: 22,
                    fontSize: 11,
                    fontWeight: 800,
                    bgcolor: isDark ? alpha('#10b981', 0.22) : alpha('#10b981', 0.12),
                    color: isDark ? '#34d399' : '#059669',
                    border: `1px solid ${alpha('#10b981', 0.35)}`,
                    borderRadius: '8px',
                    '& .MuiChip-icon': { color: isDark ? '#34d399' : '#059669' },
                  }}
                />
              )}

              {tarea.tipo && (
                <Chip
                  size="small"
                  label={TIPOS_LABELS[tarea.tipo] ?? tarea.tipo}
                  sx={{
                    height: 20,
                    fontSize: 10.5,
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                    color: 'text.secondary',
                    borderRadius: '6px',
                  }}
                />
              )}
            </Box>

            {/* Fila 2: Dimensión, Trimestre, Fechas y Calificación */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {dimCfg && (
                <Chip
                  size="small"
                  label={dimCfg.label}
                  sx={{
                    height: 20,
                    fontSize: 10.5,
                    fontWeight: 800,
                    bgcolor: alpha(dimCfg.color, 0.12),
                    color: dimCfg.color,
                    border: `1px solid ${alpha(dimCfg.color, 0.25)}`,
                    borderRadius: '6px',
                  }}
                />
              )}

              {tarea.fecha_limite && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <EventIcon sx={{ fontSize: 14, color: cdias }} />
                  <Typography variant="caption" fontWeight={800} sx={{ color: cdias, fontSize: 11.5 }}>
                    {formatDias(tarea.dias_restantes)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                    ({formatFecha(tarea.fecha_limite)})
                  </Typography>
                </Box>
              )}

              {tarea.puntaje_maximo === 0 ? (
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  px: 1.2, py: 0.2, borderRadius: '8px',
                  bgcolor: isDark ? alpha('#10b981', 0.15) : alpha('#10b981', 0.1),
                  border: `1px solid ${alpha('#10b981', 0.35)}`,
                }}>
                  <Typography variant="caption" fontWeight={800} sx={{ color: '#10b981', fontSize: 11 }}>
                    Práctica formativa (Sin nota)
                  </Typography>
                </Box>
              ) : (tarea.nota_sobre_100 != null || tarea.puntaje_obtenido != null) && (
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  px: 1.2, py: 0.2, borderRadius: '8px',
                  bgcolor: isDark ? alpha(cfg.color, 0.15) : alpha(cfg.color, 0.1),
                  border: `1px solid ${alpha(cfg.color, 0.35)}`,
                }}>
                  <GradeIcon sx={{ fontSize: 13, color: cfg.color }} />
                  <Typography variant="caption" fontWeight={900} sx={{ color: cfg.color, fontSize: 11.5 }}>
                    Nota: {tarea.nota_sobre_100 ?? tarea.puntaje_obtenido} / {tarea.puntaje_maximo || 100} pts
                  </Typography>
                </Box>
              )}

              {tarea.observacion_docente && (
                <Chip
                  size="small"
                  icon={<CommentIcon sx={{ fontSize: '12px !important' }} />}
                  label="Con observación"
                  sx={{
                    height: 20,
                    fontSize: 10.5,
                    fontWeight: 700,
                    bgcolor: isDark ? alpha('#3b82f6', 0.14) : alpha('#3b82f6', 0.08),
                    color: isDark ? '#60a5fa' : '#2563eb',
                    borderRadius: '6px',
                    '& .MuiChip-icon': { color: isDark ? '#60a5fa' : '#2563eb' },
                  }}
                />
              )}
            </Box>

          </Box>

          {/* Botones de acción */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0,
            alignSelf: { xs: 'stretch', sm: 'center' },
            justifyContent: { xs: 'flex-end', sm: 'flex-end' },
            pt: { xs: 1, sm: 0 },
            borderTop: { xs: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}`, sm: 'none' },
          }}>
            {esVirtual && tarea.estado_calculado !== 'entregado' && (
              <Button
                variant="contained"
                size="small"
                startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={handleRendirExamen}
                sx={{
                  borderRadius: '10px',
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'none',
                  px: 2,
                  py: 0.6,
                  background: gradBg,
                  color: textOnAccent,
                  boxShadow: `0 3px 12px ${alpha(accentColor, 0.35)}`,
                  '&:hover': {
                    boxShadow: `0 4px 16px ${alpha(accentColor, 0.5)}`,
                  },
                }}
              >
                Rendir Examen
              </Button>
            )}

            {!esVirtual && esPracticaDigital && tarea.estado_calculado !== 'entregado' && (
              <Button
                variant="contained"
                size="small"
                startIcon={<CloudUploadRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={handleVerDetalle}
                sx={{
                  borderRadius: '10px',
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'none',
                  px: 2,
                  py: 0.6,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  boxShadow: '0 3px 12px rgba(16, 185, 129, 0.38)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.55)',
                  },
                }}
              >
                Subir Práctica
              </Button>
            )}

            <Button
              variant="outlined"
              size="small"
              endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
              onClick={handleVerDetalle}
              sx={{
                borderRadius: '10px',
                fontSize: 12,
                fontWeight: 800,
                textTransform: 'none',
                px: 1.8,
                py: 0.6,
                borderColor: alpha(accentColor, 0.35),
                color: accentColor,
                '&:hover': {
                  borderColor: accentColor,
                  bgcolor: alpha(accentColor, 0.08),
                },
              }}
            >
              Detalle
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ──────────────────────────────────────────────
// SECCIÓN DE MATERIA AGRUPADA
// ──────────────────────────────────────────────
interface GrupoMateria {
  materia_nombre: string;
  total: number;
  pendientes: number;
  atrasados: number;
  entregados: number;
  ausentes: number;
  tareas: TareaEstudiante[];
}

const SeccionMateria: React.FC<{
  grupo: GrupoMateria;
  index: number;
  abierto: boolean;
  onToggle: () => void;
  accentColor: string;
  gradBg: string;
  textOnAccent: string;
}> = ({ grupo, index, abierto, onToggle, accentColor, gradBg, textOnAccent }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        borderRadius: '18px',
        animation: `${fadeUp} 0.35s ease-out ${index * 0.05}s both`,
        overflow: 'hidden',
        border: `1.5px solid ${alpha(isDark ? '#fff' : '#000', isDark ? 0.09 : 0.08)}`,
        background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#ffffff',
        boxShadow: isDark
          ? '0 4px 20px rgba(0, 0, 0, 0.35)'
          : '0 4px 18px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Cabecera interactiva de la Materia */}
      <Box
        onClick={onToggle}
        sx={{
          p: { xs: 2, sm: 2.2 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          background: isDark
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)'
            : 'linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.005) 100%)',
          borderBottom: abierto ? `1px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}` : 'none',
          transition: 'background 0.2s ease',
          '&:hover': {
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          },
        }}
      >
        {/* Lado izquierdo: Ícono de materia y Nombre */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: gradBg,
              color: textOnAccent,
              flexShrink: 0,
              boxShadow: `0 3px 10px ${alpha(accentColor, 0.3)}`,
            }}
          >
            <MenuBookRoundedIcon sx={{ fontSize: 20 }} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', sm: '1.15rem' }, lineHeight: 1.2 }}>
              {grupo.materia_nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: 11.5 }}>
              {grupo.total} {grupo.total === 1 ? 'evaluación registrada' : 'evaluaciones registradas'}
            </Typography>
          </Box>
        </Box>

        {/* Lado derecho: Mini badges de estados y botón toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          {grupo.pendientes > 0 && (
            <Chip
              size="small"
              label={`${grupo.pendientes} pend.`}
              sx={{
                height: 22,
                fontSize: 10.5,
                fontWeight: 800,
                bgcolor: alpha('#f59e0b', 0.15),
                color: isDark ? '#fbbf24' : '#d97706',
                border: `1px solid ${alpha('#f59e0b', 0.35)}`,
                borderRadius: '6px',
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            />
          )}

          {grupo.atrasados > 0 && (
            <Chip
              size="small"
              label={`${grupo.atrasados} atras.`}
              sx={{
                height: 22,
                fontSize: 10.5,
                fontWeight: 800,
                bgcolor: alpha('#ef4444', 0.15),
                color: isDark ? '#f87171' : '#dc2626',
                border: `1px solid ${alpha('#ef4444', 0.35)}`,
                borderRadius: '6px',
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            />
          )}

          {grupo.entregados > 0 && (
            <Chip
              size="small"
              label={`${grupo.entregados} entr.`}
              sx={{
                height: 22,
                fontSize: 10.5,
                fontWeight: 800,
                bgcolor: alpha('#10b981', 0.15),
                color: isDark ? '#34d399' : '#059669',
                border: `1px solid ${alpha('#10b981', 0.35)}`,
                borderRadius: '6px',
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            />
          )}

          <IconButton
            size="small"
            sx={{
              borderRadius: '10px',
              border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.1)}`,
              p: 0.6,
              color: accentColor,
            }}
          >
            {abierto ? <ExpandLessIcon sx={{ fontSize: 20 }} /> : <ExpandMoreIcon sx={{ fontSize: 20 }} />}
          </IconButton>
        </Box>
      </Box>

      {/* Contenido colapsable: Tarjetas de tareas de esta materia */}
      <Collapse in={abierto}>
        <Box sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: isDark ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.01)' }}>
          <Stack spacing={1.5}>
            {grupo.tareas.map((tarea, i) => (
              <TarjetaTarea
                key={tarea.evaluacion_id}
                tarea={tarea}
                index={i}
                accentColor={accentColor}
                gradBg={gradBg}
                textOnAccent={textOnAccent}
              />
            ))}
          </Stack>
        </Box>
      </Collapse>
    </Card>
  );
};

// ──────────────────────────────────────────────
// PROPS Y COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────
interface Props {
  tareas:         TareaEstudiante[];
  resumen:        ResumenTareas;
  isLoading?:     boolean;
  estadoFiltro:   EstadoTarea | null;
  onEstadoFiltro: (e: EstadoTarea | null) => void;
  onVerDetalle:   (t: TareaEstudiante) => void;
  accentColor?:   string;
  gradBg?:        string;
  textOnAccent?:  string;
}

export const TareasEstudianteList: React.FC<Props> = ({
  tareas,
  resumen,
  isLoading = false,
  estadoFiltro,
  onEstadoFiltro,
  accentColor: propAccent,
  gradBg: propGradBg,
  textOnAccent: propTextOnAccent,
}) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const accentColor = propAccent || (isDark ? '#facc15' : '#0288d1');
  const gradBg = propGradBg || (isDark
    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)');
  const textOnAccent = propTextOnAccent || (isDark ? '#000' : '#fff');

  const [busqueda, setBusqueda] = useState('');
  const [dimensionFiltro, setDimensionFiltro] = useState<string | null>(null);

  // Control de materias colapsadas / expandidas
  const [materiasColapsadas, setMateriasColapsadas] = useState<Record<string, boolean>>({});

  // Filtrado compuesto (Búsqueda + Estado + Dimensión)
  const tareasFiltradas = useMemo(() => {
    return tareas.filter(t => {
      // Filtro texto
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const coincide =
          t.evaluacion_nombre.toLowerCase().includes(q) ||
          t.materia_nombre.toLowerCase().includes(q) ||
          (t.descripcion && t.descripcion.toLowerCase().includes(q));
        if (!coincide) return false;
      }

      // Filtro dimensión
      if (dimensionFiltro) {
        const dimCod = (t.dimension_codigo || '').toUpperCase();
        if (dimensionFiltro === 'SER' && dimCod !== 'SER') return false;
        if (dimensionFiltro === 'SAB' && dimCod !== 'SAB') return false;
        if (dimensionFiltro === 'HAC' && dimCod !== 'HAC') return false;
        if ((dimensionFiltro === 'AUT' || dimensionFiltro === 'AUTO') && dimCod !== 'AUT' && dimCod !== 'AUTO') return false;
      }

      return true;
    });
  }, [tareas, busqueda, dimensionFiltro]);

  // Agrupación por Materia
  const gruposPorMateria = useMemo(() => {
    const mapa: Record<string, GrupoMateria> = {};

    tareasFiltradas.forEach(t => {
      const nombre = t.materia_nombre || 'Sin materia asignada';
      if (!mapa[nombre]) {
        mapa[nombre] = {
          materia_nombre: nombre,
          total: 0,
          pendientes: 0,
          atrasados: 0,
          entregados: 0,
          ausentes: 0,
          tareas: [],
        };
      }
      mapa[nombre].total += 1;
      if (t.estado_calculado === 'pendiente') mapa[nombre].pendientes += 1;
      if (t.estado_calculado === 'atrasado')  mapa[nombre].atrasados += 1;
      if (t.estado_calculado === 'entregado') mapa[nombre].entregados += 1;
      if (t.estado_calculado === 'ausente')   mapa[nombre].ausentes += 1;
      mapa[nombre].tareas.push(t);
    });

    // Ordenar: primero las que tienen tareas pendientes/atrasadas, luego por nombre
    return Object.values(mapa).sort((a, b) => {
      const urgenciaA = a.atrasados * 2 + a.pendientes;
      const urgenciaB = b.atrasados * 2 + b.pendientes;
      if (urgenciaB !== urgenciaA) return urgenciaB - urgenciaA;
      return a.materia_nombre.localeCompare(b.materia_nombre);
    });
  }, [tareasFiltradas]);

  const toggleMateria = (materia: string) => {
    setMateriasColapsadas(prev => ({
      ...prev,
      [materia]: !prev[materia],
    }));
  };

  const todasColapsadas = useMemo(() => {
    if (gruposPorMateria.length === 0) return false;
    return gruposPorMateria.every(g => materiasColapsadas[g.materia_nombre] === true);
  }, [gruposPorMateria, materiasColapsadas]);

  const toggleTodas = () => {
    const nuevoEstado = !todasColapsadas;
    const mapa: Record<string, boolean> = {};
    gruposPorMateria.forEach(g => {
      mapa[g.materia_nombre] = nuevoEstado;
    });
    setMateriasColapsadas(mapa);
  };

  const limpiarTodosLosFiltros = () => {
    setBusqueda('');
    setDimensionFiltro(null);
    onEstadoFiltro(null);
  };

  const tieneFiltrosActivos = Boolean(busqueda.trim() || dimensionFiltro || estadoFiltro);

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Grid container spacing={2} sx={{ mb: 1 }}>
          {[1, 2, 3, 4].map(i => (
            <Grid size={{ xs: 6, sm: 3 }} key={i}>
              <Skeleton variant="rounded" height={95} sx={{ borderRadius: '16px' }} />
            </Grid>
          ))}
        </Grid>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: '18px' }} />
        ))}
      </Stack>
    );
  }

  return (
    <Box>
      {/* ── KPI Cards de Estado (Interactivos y adaptados al tema) ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {([
          { estado: 'pendiente' as EstadoTarea, value: resumen.pendientes },
          { estado: 'atrasado'  as EstadoTarea, value: resumen.atrasados  },
          { estado: 'entregado' as EstadoTarea, value: resumen.entregados },
          { estado: 'ausente'   as EstadoTarea, value: resumen.ausentes   },
        ]).map((stat, i) => {
          const cfg = ESTADO_CONFIG[stat.estado];
          const sel = estadoFiltro === stat.estado;
          return (
            <Grid size={{ xs: 6, sm: 3 }} key={stat.estado}>
              <Card
                onClick={() => onEstadoFiltro(sel ? null : stat.estado)}
                sx={{
                  borderRadius: '16px',
                  animation: `${fadeUp} 0.4s ease-out ${i * 0.06}s both`,
                  border: `2px solid ${sel ? cfg.color : alpha(cfg.color, isDark ? 0.22 : 0.2)}`,
                  background: isDark
                    ? `linear-gradient(135deg, ${alpha(cfg.color, sel ? 0.2 : 0.07)} 0%, rgba(15, 23, 42, 0.7) 100%)`
                    : `linear-gradient(135deg, ${alpha(cfg.color, sel ? 0.16 : 0.05)} 0%, #ffffff 100%)`,
                  boxShadow: sel
                    ? `0 6px 20px ${alpha(cfg.color, 0.35)}`
                    : (isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.04)'),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: cfg.color,
                    boxShadow: `0 6px 22px ${alpha(cfg.color, 0.28)}`,
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 1.8, sm: 2.2 }, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.8 }}>
                    <Box sx={{
                      width: 38, height: 38, borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: alpha(cfg.color, 0.15),
                      color: cfg.color,
                    }}>
                      <EstadoIcon estado={stat.estado} size={20} />
                    </Box>
                  </Box>

                  <Typography variant="h3" fontWeight={900} sx={{ color: cfg.color, lineHeight: 1, mb: 0.5, fontSize: { xs: '1.8rem', sm: '2.2rem' } }}>
                    {stat.value}
                  </Typography>

                  <Typography variant="caption" fontWeight={800} sx={{ color: cfg.color, fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                    {cfg.label}{stat.value !== 1 ? 's' : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ── Barra de Búsqueda y Filtros de Dimensión ── */}
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        mb: 2.5,
      }}>
        {/* Buscador de texto */}
        <TextField
          size="small"
          placeholder="Buscar tarea, práctica, examen o materia..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: accentColor }} />
              </InputAdornment>
            ),
            endAdornment: busqueda ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setBusqueda('')}>
                  <ClearIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            flex: '1 1 240px',
            maxWidth: { xs: '100%', sm: 360 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              fontSize: 13.5,
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
              '& fieldset': {
                borderColor: alpha(accentColor, 0.25),
              },
              '&:hover fieldset': {
                borderColor: accentColor,
              },
              '&.Mui-focused fieldset': {
                borderColor: accentColor,
              },
            },
          }}
        />

        {/* Filtros por Dimensión y botón Colapsar/Expandir todas */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 0.5, color: 'text.secondary' }}>
            <FilterListRoundedIcon sx={{ fontSize: 16, color: accentColor }} />
            <Typography variant="caption" fontWeight={700} sx={{ fontSize: 11.5 }}>
              Dimensión:
            </Typography>
          </Box>

          <Chip
            size="small"
            clickable
            label="Todas"
            onClick={() => setDimensionFiltro(null)}
            sx={{
              height: 28,
              fontSize: 11.5,
              fontWeight: 700,
              borderRadius: '8px',
              bgcolor: !dimensionFiltro
                ? accentColor
                : (isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04)),
              color: !dimensionFiltro ? textOnAccent : 'text.secondary',
              border: `1px solid ${!dimensionFiltro ? accentColor : alpha(isDark ? '#fff' : '#000', 0.08)}`,
              '&:hover': {
                bgcolor: !dimensionFiltro ? accentColor : alpha(accentColor, 0.12),
              },
            }}
          />

          {Object.entries(DIMENSIONES)
            .filter(([cod]) => cod !== 'AUTO')
            .map(([cod, d]) => {
              const sel = dimensionFiltro === cod || (cod === 'AUT' && dimensionFiltro === 'AUTO');
              return (
                <Chip
                  key={cod}
                  size="small"
                  clickable
                  label={d.label}
                  onClick={() => setDimensionFiltro(sel ? null : cod)}
                  sx={{
                    height: 28,
                    fontSize: 11.5,
                    fontWeight: 700,
                    borderRadius: '8px',
                    bgcolor: sel
                      ? d.color
                      : (isDark ? alpha(d.color, 0.12) : alpha(d.color, 0.08)),
                    color: sel ? '#ffffff' : d.color,
                    border: `1.5px solid ${alpha(d.color, sel ? 0.8 : 0.25)}`,
                    '&:hover': {
                      bgcolor: sel ? d.color : alpha(d.color, 0.2),
                    },
                  }}
                />
              );
            })}

          {/* Botón expandir/colapsar todas las materias */}
          {gruposPorMateria.length > 1 && (
            <Button
              size="small"
              startIcon={todasColapsadas ? <UnfoldMoreIcon sx={{ fontSize: 15 }} /> : <UnfoldLessIcon sx={{ fontSize: 15 }} />}
              onClick={toggleTodas}
              sx={{
                textTransform: 'none',
                fontSize: 11.5,
                fontWeight: 700,
                color: 'text.secondary',
                borderRadius: '8px',
                px: 1.2,
                border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.1)}`,
                '&:hover': {
                  color: accentColor,
                  borderColor: accentColor,
                },
              }}
            >
              {todasColapsadas ? 'Expandir' : 'Colapsar'}
            </Button>
          )}

          {tieneFiltrosActivos && (
            <Tooltip title="Limpiar todos los filtros">
              <Button
                size="small"
                startIcon={<ClearIcon sx={{ fontSize: 14 }} />}
                onClick={limpiarTodosLosFiltros}
                sx={{
                  textTransform: 'none',
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: 'error.main',
                  borderRadius: '8px',
                  ml: 0.5,
                  '&:hover': { bgcolor: alpha('#ef4444', 0.1) },
                }}
              >
                Limpiar
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* ── Lista de Materias y sus Tareas ── */}
      {gruposPorMateria.length === 0 ? (
        <Box sx={{
          textAlign: 'center', py: 8, px: 3, borderRadius: '18px',
          background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015),
          border: `2px dashed ${alpha(accentColor, isDark ? 0.25 : 0.2)}`,
        }}>
          <AssignmentIcon sx={{ fontSize: 52, color: alpha(accentColor, 0.4), mb: 1.5 }} />
          <Typography variant="h6" color="text.primary" fontWeight={800} sx={{ mb: 0.5 }}>
            {tieneFiltrosActivos
              ? 'No se encontraron tareas con los filtros seleccionados'
              : 'No hay tareas publicadas para este trimestre'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mb: 2 }}>
            {tieneFiltrosActivos
              ? 'Intentá cambiar los filtros o el término de búsqueda para ver más resultados.'
              : 'Las evaluaciones y prácticas aparecerán aquí agrupadas por materia a medida que tus profesores las programen.'}
          </Typography>
          {tieneFiltrosActivos && (
            <Button
              variant="outlined"
              size="small"
              onClick={limpiarTodosLosFiltros}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, borderColor: accentColor, color: accentColor }}
            >
              Restablecer filtros
            </Button>
          )}
        </Box>
      ) : (
        <Stack spacing={2.5}>
          {gruposPorMateria.map((grupo, idx) => (
            <SeccionMateria
              key={grupo.materia_nombre}
              grupo={grupo}
              index={idx}
              abierto={!materiasColapsadas[grupo.materia_nombre]}
              onToggle={() => toggleMateria(grupo.materia_nombre)}
              accentColor={accentColor}
              gradBg={gradBg}
              textOnAccent={textOnAccent}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default TareasEstudianteList;