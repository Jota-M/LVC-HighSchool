'use client';
// components/estudiante/tareas/TareasEstudianteList.tsx

import React, { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Skeleton,
  Collapse, Divider, TextField, InputAdornment, Grid,
  useTheme, alpha, IconButton, Tooltip,
} from '@mui/material';
import { keyframes } from '@mui/system';
import ExpandMoreIcon        from '@mui/icons-material/ExpandMore';
import ExpandLessIcon        from '@mui/icons-material/ExpandLess';
import SearchIcon            from '@mui/icons-material/Search';
import ClearIcon             from '@mui/icons-material/Clear';
import AssignmentIcon        from '@mui/icons-material/Assignment';
import EventIcon             from '@mui/icons-material/Event';
import OpenInNewIcon         from '@mui/icons-material/OpenInNew';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon     from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import BlockIcon             from '@mui/icons-material/Block';
import CommentIcon           from '@mui/icons-material/Comment';
import GradeIcon             from '@mui/icons-material/Grade';

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
};

const TIPOS_LABELS: Record<string, string> = {
  tarea:      'Tarea',
  examen:     'Examen',
  trabajo:    'Trabajo',
  practica:   'Práctica',
  proyecto:   'Proyecto',
  exposicion: 'Exposición',
  quiz:       'Quiz',
};

// ──────────────────────────────────────────────
// ANIMACIONES
// ──────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
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
  const sx = { fontSize: size, color: '#fff' };
  if (estado === 'entregado') return <CheckCircleRoundedIcon sx={sx} />;
  if (estado === 'atrasado')  return <CancelRoundedIcon sx={sx} />;
  if (estado === 'ausente')   return <BlockIcon sx={sx} />;
  return <AccessTimeRoundedIcon sx={sx} />;
};

// ──────────────────────────────────────────────
// TARJETA DE TAREA
// ──────────────────────────────────────────────

const TarjetaTarea: React.FC<{
  tarea: TareaEstudiante;
  index: number;
  onVerDetalle: (t: TareaEstudiante) => void;
}> = ({ tarea, index, onVerDetalle }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [expandido, setExpandido] = useState(false);

  const cfg     = ESTADO_CONFIG[tarea.estado_calculado];
  const dimCfg  = tarea.dimension_codigo ? DIMENSIONES[tarea.dimension_codigo] : null;
  const cdias   = colorDias(tarea.dias_restantes, tarea.estado_calculado, isDark);
  const hayDetalle = !!(tarea.descripcion || tarea.instrucciones || tarea.observacion_docente || tarea.nota_sobre_100 != null);

  return (
    <Card
      sx={{
        borderRadius: 3,
        animation: `${fadeUp} 0.35s ease-out ${index * 0.05}s both`,
        overflow: 'hidden',
        border: `1px solid ${alpha(cfg.color, expandido ? 0.4 : 0.2)}`,
        background: isDark
          ? `linear-gradient(145deg, ${alpha(cfg.color, 0.1)} 0%, ${alpha(cfg.color, 0.03)} 100%)`
          : `linear-gradient(145deg, ${alpha(cfg.color, 0.04)} 0%, #fff 100%)`,
        transition: 'all 0.2s ease',
        '&:hover': { boxShadow: `0 4px 16px ${alpha(cfg.color, 0.18)}` },
        '&::before': { content: '""', display: 'block', height: '3px', background: cfg.gradient },
      }}
    >
      <CardContent sx={{ p: 2.5, pb: expandido ? 1 : 2.5 }}>

        {/* ── Fila principal ── */}
        <Box
          sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, cursor: hayDetalle ? 'pointer' : 'default' }}
          onClick={() => hayDetalle && setExpandido(v => !v)}
        >
          {/* Ícono de estado */}
          <Box sx={{
            width: 48, height: 48, borderRadius: 2.5, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: cfg.gradient,
            boxShadow: `0 4px 12px ${alpha(cfg.color, 0.35)}`,
          }}>
            <EstadoIcon estado={tarea.estado_calculado} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Nombre y chips */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography variant="body1" fontWeight={800} noWrap sx={{ maxWidth: 300 }}>
                {tarea.evaluacion_nombre}
              </Typography>
              <Chip
                size="small"
                label={cfg.label}
                sx={{
                  height: 22, fontSize: 11, fontWeight: 800,
                  bgcolor: isDark ? alpha(cfg.color, 0.2) : alpha(cfg.color, 0.12),
                  color: cfg.color,
                  border: `1px solid ${alpha(cfg.color, 0.3)}`,
                  borderRadius: 1.5,
                }}
              />
              {tarea.tipo && (
                <Chip
                  size="small"
                  label={TIPOS_LABELS[tarea.tipo] ?? tarea.tipo}
                  sx={{
                    height: 20, fontSize: 10, fontWeight: 700,
                    bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                    borderRadius: 1.5,
                  }}
                />
              )}
            </Box>

            {/* Materia y dimensión */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.75 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                {tarea.materia_nombre}
              </Typography>
              {dimCfg && (
                <>
                  <Typography variant="caption" color="text.disabled">·</Typography>
                  <Chip
                    size="small"
                    label={dimCfg.label}
                    sx={{
                      height: 18, fontSize: 10, fontWeight: 800,
                      bgcolor: alpha(dimCfg.color, 0.12),
                      color: dimCfg.color,
                      borderRadius: 1.5,
                    }}
                  />
                </>
              )}
              <Typography variant="caption" color="text.disabled">·</Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                {tarea.periodo_nombre}
              </Typography>
            </Box>

            {/* Fecha límite y nota */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {tarea.fecha_limite && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EventIcon sx={{ fontSize: 13, color: cdias }} />
                  <Typography variant="caption" fontWeight={700} sx={{ color: cdias, fontSize: 11 }}>
                    {formatDias(tarea.dias_restantes)}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                    ({formatFecha(tarea.fecha_limite)})
                  </Typography>
                </Box>
              )}
              {tarea.nota_sobre_100 != null && (
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  px: 1.25, py: 0.25, borderRadius: 1.5,
                  bgcolor: isDark ? alpha(cfg.color, 0.15) : alpha(cfg.color, 0.1),
                  border: `1px solid ${alpha(cfg.color, 0.3)}`,
                }}>
                  <GradeIcon sx={{ fontSize: 13, color: cfg.color }} />
                  <Typography variant="caption" fontWeight={900} sx={{ color: cfg.color, fontSize: 12 }}>
                    {tarea.nota_sobre_100}/100
                  </Typography>
                </Box>
              )}
              {tarea.observacion_docente && (
                <Chip
                  size="small"
                  icon={<CommentIcon sx={{ fontSize: '11px !important' }} />}
                  label="Obs. docente"
                  sx={{
                    height: 20, fontSize: 10, fontWeight: 700,
                    bgcolor: isDark ? alpha('#3b82f6', 0.12) : alpha('#3b82f6', 0.08),
                    color: isDark ? '#60a5fa' : '#3b82f6',
                    borderRadius: 1.5,
                    '& .MuiChip-icon': { color: isDark ? '#60a5fa' : '#3b82f6' },
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Botón ver detalle + expandir */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <Tooltip title="Ver detalle completo">
              <IconButton
                size="small"
                onClick={e => { e.stopPropagation(); onVerDetalle(tarea); }}
                sx={{
                  bgcolor: isDark ? alpha(cfg.color, 0.12) : alpha(cfg.color, 0.08),
                  color: cfg.color,
                  border: `1px solid ${alpha(cfg.color, 0.25)}`,
                  borderRadius: 2,
                  '&:hover': { bgcolor: alpha(cfg.color, 0.2) },
                }}
              >
                <OpenInNewIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
            {hayDetalle && (
              <IconButton size="small" sx={{ borderRadius: 2 }}>
                {expandido ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            )}
          </Box>
        </Box>

        {/* ── Detalle expandible ── */}
        <Collapse in={expandido}>
          <Divider sx={{ my: 2, borderColor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06) }} />
          <Stack spacing={1.5}>
            {tarea.descripcion && (
              <Box>
                <Typography variant="caption" fontWeight={800} color="text.secondary"
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10, display: 'block', mb: 0.5 }}>
                  Descripción
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                  {tarea.descripcion}
                </Typography>
              </Box>
            )}
            {tarea.instrucciones && (
              <Box>
                <Typography variant="caption" fontWeight={800} color="text.secondary"
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10, display: 'block', mb: 0.5 }}>
                  Instrucciones
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                  {tarea.instrucciones}
                </Typography>
              </Box>
            )}
            {tarea.nota_sobre_100 != null && (
              <Box sx={{
                p: 2, borderRadius: 2.5,
                bgcolor: isDark ? alpha(cfg.color, 0.1) : alpha(cfg.color, 0.06),
                border: `1px solid ${alpha(cfg.color, 0.2)}`,
              }}>
                <Typography variant="caption" fontWeight={800}
                  sx={{ color: cfg.color, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10, display: 'block', mb: 0.5 }}>
                  Tu nota
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                  <Typography variant="h4" fontWeight={900} sx={{ color: cfg.color, lineHeight: 1 }}>
                    {tarea.nota_sobre_100}
                  </Typography>
                  <Typography variant="body2" color="text.disabled">/100</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    ({tarea.puntaje_obtenido}/{tarea.puntaje_maximo} pts)
                  </Typography>
                </Box>
                {tarea.fecha_registro && (
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5, fontSize: 10 }}>
                    Registrado el {formatFecha(tarea.fecha_registro)}
                  </Typography>
                )}
              </Box>
            )}
            {tarea.observacion_docente && (
              <Box sx={{
                p: 2, borderRadius: 2.5,
                bgcolor: isDark ? alpha('#3b82f6', 0.08) : alpha('#3b82f6', 0.04),
                border: `1px solid ${alpha('#3b82f6', 0.2)}`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                  <CommentIcon sx={{ fontSize: 14, color: isDark ? '#60a5fa' : '#3b82f6' }} />
                  <Typography variant="caption" fontWeight={800}
                    sx={{ color: isDark ? '#60a5fa' : '#3b82f6', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
                    Observación del docente
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: 13, color: 'text.secondary', fontStyle: 'italic' }}>
                  "{tarea.observacion_docente}"
                </Typography>
              </Box>
            )}
          </Stack>
        </Collapse>

      </CardContent>
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
}

const TareasEstudianteList: React.FC<Props> = ({
  tareas, resumen, isLoading = false,
  estadoFiltro, onEstadoFiltro, onVerDetalle,
}) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [busqueda, setBusqueda] = useState('');

  const tareasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return tareas;
    const q = busqueda.toLowerCase();
    return tareas.filter(t =>
      t.evaluacion_nombre.toLowerCase().includes(q) ||
      t.materia_nombre.toLowerCase().includes(q)
    );
  }, [tareas, busqueda]);

  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {[1, 2, 3, 4].map(i => (
            <Grid size={{ xs: 6, sm: 3 }} key={i}>
              <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} variant="rounded" height={90} sx={{ borderRadius: 3 }} />
        ))}
      </Stack>
    );
  }

  return (
    <Box>
      {/* ── Resumen clicable ── */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
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
                  borderRadius: 3,
                  animation: `${fadeUp} 0.4s ease-out ${i * 0.07}s both`,
                  border: `2px solid ${alpha(cfg.color, sel ? 0.5 : 0.2)}`,
                  background: isDark ? alpha(cfg.color, sel ? 0.18 : 0.08) : alpha(cfg.color, sel ? 0.1 : 0.04),
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 16px ${alpha(cfg.color, 0.25)}` },
                  '&::before': { content: '""', display: 'block', height: '3px', background: cfg.gradient },
                }}
              >
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={900}
                    sx={{ background: cfg.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ color: cfg.color, fontSize: 11 }}>
                    {cfg.label}{stat.value !== 1 ? 's' : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ── Buscador ── */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Buscar evaluación o materia..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: busqueda ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setBusqueda('')}>
                  <ClearIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ flex: '1 1 200px', '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontSize: 13 } }}
        />
        {estadoFiltro && (
          <Tooltip title="Limpiar filtro">
            <IconButton
              size="small"
              onClick={() => onEstadoFiltro(null)}
              sx={{
                bgcolor: isDark ? alpha('#ef4444', 0.1) : alpha('#ef4444', 0.06),
                color: '#ef4444',
                border: `1px solid ${alpha('#ef4444', 0.2)}`,
                borderRadius: 2,
                '&:hover': { bgcolor: alpha('#ef4444', 0.15) },
              }}
            >
              <ClearIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* ── Lista ── */}
      {tareasFiltradas.length === 0 ? (
        <Box sx={{
          textAlign: 'center', py: 7, borderRadius: 3,
          background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
          border: `2px dashed ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
        }}>
          <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            {busqueda || estadoFiltro
              ? 'No hay tareas con estos filtros'
              : 'No hay evaluaciones publicadas para este trimestre'}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Las evaluaciones aparecerán cuando tu docente las publique
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {tareasFiltradas.map((tarea, i) => (
            <TarjetaTarea
              key={tarea.evaluacion_id}
              tarea={tarea}
              index={i}
              onVerDetalle={onVerDetalle}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default TareasEstudianteList;