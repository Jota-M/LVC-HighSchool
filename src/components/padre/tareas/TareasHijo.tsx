'use client';
// components/padre/tareas/TareasHijo.tsx

import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Skeleton,
  Collapse, Divider, TextField, Select, MenuItem, FormControl,
  InputLabel, InputAdornment, Grid, useTheme, alpha, IconButton,
  Tooltip,
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

import {
  TareaHijo,
  ResumenTareas,
  EstadoTarea,
  FiltrosTareas,
  ESTADO_TAREA_CONFIG,
  TIPOS_EVALUACION_LABELS,
  formatDiasRestantes,
  getColorDiasRestantes,
  // DIMENSIONES_CONFIG,
} from '@/types/padreTareasTypes';
import { DIMENSIONES_CONFIG } from '@/types/padreNotasTypes';

// ──────────────────────────────────────────────
// ANIMACIONES
// ──────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ──────────────────────────────────────────────
// ÍCONOS DE ESTADO
// ──────────────────────────────────────────────

const EstadoIcon: React.FC<{ estado: EstadoTarea; size?: number }> = ({ estado, size = 16 }) => {
  const cfg = ESTADO_TAREA_CONFIG[estado];
  const sx = { fontSize: size, color: cfg.color };
  if (estado === 'entregado') return <CheckCircleRoundedIcon sx={sx} />;
  if (estado === 'atrasado')  return <CancelRoundedIcon sx={sx} />;
  if (estado === 'ausente')   return <BlockIcon sx={sx} />;
  return <AccessTimeRoundedIcon sx={sx} />;
};

// ──────────────────────────────────────────────
// TARJETA DE TAREA
// ──────────────────────────────────────────────

const TarjetaTarea: React.FC<{ tarea: TareaHijo; index: number; onVerDetalle: (t: TareaHijo) => void }> = ({
  tarea, index, onVerDetalle,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [expandido, setExpandido] = useState(false);

  const estadoCfg = ESTADO_TAREA_CONFIG[tarea.estado_calculado];
  const dimCfg = tarea.dimension_codigo && DIMENSIONES_CONFIG[tarea.dimension_codigo as keyof typeof DIMENSIONES_CONFIG]
    ? DIMENSIONES_CONFIG[tarea.dimension_codigo as keyof typeof DIMENSIONES_CONFIG]
    : null;
  const colorDias = getColorDiasRestantes(tarea.dias_restantes, tarea.estado_calculado, isDark);

  const formatFecha = (f: string | null) =>
    f ? new Date(f).toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : null;

  const hayDetalle = !!(tarea.descripcion || tarea.instrucciones || tarea.observacion_docente || tarea.nota_sobre_100 != null);

  return (
    <Card
      sx={{
        borderRadius: 3,
        animation: `${fadeUp} 0.35s ease-out ${index * 0.05}s both`,
        overflow: 'hidden',
        border: `1px solid ${alpha(estadoCfg.color, expandido ? 0.4 : 0.2)}`,
        background: isDark
          ? `linear-gradient(145deg, ${alpha(estadoCfg.color, 0.1)} 0%, ${alpha(estadoCfg.color, 0.03)} 100%)`
          : `linear-gradient(145deg, ${alpha(estadoCfg.color, 0.04)} 0%, #fff 100%)`,
        transition: 'all 0.2s ease',
        '&:hover': { boxShadow: `0 4px 16px ${alpha(estadoCfg.color, 0.18)}` },
        '&::before': { content: '""', display: 'block', height: '3px', background: estadoCfg.gradient },
      }}
    >
      <CardContent sx={{ p: 2.5, pb: expandido ? 1 : 2.5 }}>
        {/* ── Fila principal ── */}
        <Box
          sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, cursor: hayDetalle ? 'pointer' : 'default' }}
          onClick={() => hayDetalle && setExpandido(v => !v)}
        >
          {/* Ícono de estado */}
          <Box
            sx={{
              width: 48, height: 48, borderRadius: 2.5, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: estadoCfg.gradient,
              boxShadow: `0 4px 12px ${alpha(estadoCfg.color, 0.35)}`,
            }}
          >
            <EstadoIcon estado={tarea.estado_calculado} size={24} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Nombre y chips */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography variant="body1" fontWeight={800} noWrap sx={{ maxWidth: 300 }}>
                {tarea.evaluacion_nombre}
              </Typography>
              <Chip
                size="small"
                label={estadoCfg.label}
                sx={{
                  height: 22, fontSize: 11, fontWeight: 800,
                  bgcolor: isDark ? alpha(estadoCfg.color, 0.2) : alpha(estadoCfg.color, 0.12),
                  color: estadoCfg.color,
                  border: `1px solid ${alpha(estadoCfg.color, 0.3)}`,
                  borderRadius: 1.5,
                }}
              />
              {tarea.tipo && (
                <Chip
                  size="small"
                  label={TIPOS_EVALUACION_LABELS[tarea.tipo] ?? tarea.tipo}
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
            </Box>

            {/* Fecha límite y nota */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {tarea.fecha_limite && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EventIcon sx={{ fontSize: 13, color: colorDias }} />
                  <Typography variant="caption" fontWeight={700} sx={{ color: colorDias, fontSize: 11 }}>
                    {formatDiasRestantes(tarea.dias_restantes)}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                    ({formatFecha(tarea.fecha_limite)})
                  </Typography>
                </Box>
              )}
              {tarea.nota_sobre_100 != null && (
                <Box
                  sx={{
                    px: 1.25, py: 0.25, borderRadius: 1.5,
                    bgcolor: isDark ? alpha(estadoCfg.color, 0.15) : alpha(estadoCfg.color, 0.1),
                    border: `1px solid ${alpha(estadoCfg.color, 0.3)}`,
                  }}
                >
                  <Typography variant="caption" fontWeight={900} sx={{ color: estadoCfg.color, fontSize: 12 }}>
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

          {/* Expandir + Ver detalle */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <Tooltip title="Ver detalle completo">
              <IconButton
                size="small"
                onClick={e => { e.stopPropagation(); onVerDetalle(tarea); }}
                sx={{
                  bgcolor: isDark ? alpha(estadoCfg.color, 0.12) : alpha(estadoCfg.color, 0.08),
                  color: estadoCfg.color,
                  border: `1px solid ${alpha(estadoCfg.color, 0.25)}`,
                  borderRadius: 2,
                  '&:hover': { bgcolor: alpha(estadoCfg.color, 0.18) },
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
                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10, display: 'block', mb: 0.5 }}>
                  Descripción
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                  {tarea.descripcion}
                </Typography>
              </Box>
            )}
            {tarea.instrucciones && (
              <Box>
                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10, display: 'block', mb: 0.5 }}>
                  Instrucciones
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                  {tarea.instrucciones}
                </Typography>
              </Box>
            )}
            {tarea.nota_sobre_100 != null && (
              <Box
                sx={{
                  p: 2, borderRadius: 2.5,
                  bgcolor: isDark ? alpha(estadoCfg.color, 0.1) : alpha(estadoCfg.color, 0.06),
                  border: `1px solid ${alpha(estadoCfg.color, 0.2)}`,
                }}
              >
                <Typography variant="caption" fontWeight={800} sx={{ color: estadoCfg.color, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10, display: 'block', mb: 0.5 }}>
                  Nota obtenida
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                  <Typography variant="h4" fontWeight={900} sx={{ color: estadoCfg.color, lineHeight: 1 }}>
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
              <Box
                sx={{
                  p: 2, borderRadius: 2.5,
                  bgcolor: isDark ? alpha('#3b82f6', 0.08) : alpha('#3b82f6', 0.04),
                  border: `1px solid ${alpha('#3b82f6', 0.2)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                  <CommentIcon sx={{ fontSize: 14, color: isDark ? '#60a5fa' : '#3b82f6' }} />
                  <Typography variant="caption" fontWeight={800} sx={{ color: isDark ? '#60a5fa' : '#3b82f6', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
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
  tareas: TareaHijo[];
  resumen: ResumenTareas;
  isLoading?: boolean;
  filtros: FiltrosTareas;
  materias: string[];
  onFiltroChange: (f: Partial<FiltrosTareas>) => void;
  onVerDetalle: (t: TareaHijo) => void;
}

const TareasHijo: React.FC<Props> = ({
  tareas, resumen, isLoading = false, filtros, materias, onFiltroChange, onVerDetalle,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const limpiarFiltros = () => onFiltroChange({ estado: null, materia: null, busqueda: null });
  const hayFiltros = !!(filtros.estado || filtros.materia || filtros.busqueda);

  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {[1, 2, 3, 4].map(i => <Grid size={{xs:6, sm:3}} key={i}><Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} /></Grid>)}
        </Grid>
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rounded" height={90} sx={{ borderRadius: 3 }} />)}
      </Stack>
    );
  }

  return (
    <Box>
      {/* Resumen */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {([
          { estado: 'pendiente' as EstadoTarea, value: resumen.pendientes },
          { estado: 'atrasado'  as EstadoTarea, value: resumen.atrasados  },
          { estado: 'entregado' as EstadoTarea, value: resumen.entregados },
          { estado: 'ausente'   as EstadoTarea, value: resumen.ausentes   },
        ]).map((stat, i) => {
          const cfg = ESTADO_TAREA_CONFIG[stat.estado];
          const seleccionado = filtros.estado === stat.estado;
          return (
            <Grid size={{ xs: 6, sm: 3 }} key={stat.estado}>
              <Card
                onClick={() => onFiltroChange({ estado: seleccionado ? null : stat.estado })}
                sx={{
                  borderRadius: 3,
                  animation: `${fadeUp} 0.4s ease-out ${i * 0.07}s both`,
                  border: `2px solid ${alpha(cfg.color, seleccionado ? 0.5 : 0.2)}`,
                  background: isDark ? alpha(cfg.color, seleccionado ? 0.18 : 0.08) : alpha(cfg.color, seleccionado ? 0.1 : 0.04),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 16px ${alpha(cfg.color, 0.25)}` },
                  '&::before': { content: '""', display: 'block', height: '3px', background: cfg.gradient },
                }}
              >
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={900} sx={{ background: cfg.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, mb: 0.5 }}>
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

      {/* Filtros */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2.5, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Buscar evaluación..."
          value={filtros.busqueda ?? ''}
          onChange={e => onFiltroChange({ busqueda: e.target.value || null })}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} /></InputAdornment>,
            endAdornment: filtros.busqueda
              ? <InputAdornment position="end"><IconButton size="small" onClick={() => onFiltroChange({ busqueda: null })}><ClearIcon sx={{ fontSize: 14 }} /></IconButton></InputAdornment>
              : null,
          }}
          sx={{ flex: '1 1 200px', '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontSize: 13 } }}
        />
        {materias.length > 1 && (
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={filtros.materia ?? ''}
              onChange={e => onFiltroChange({ materia: e.target.value || null })}
              displayEmpty
              renderValue={v => v || 'Todas las materias'}
              sx={{ borderRadius: 2.5, fontSize: 13 }}
            >
              <MenuItem value="">Todas las materias</MenuItem>
              {materias.map(m => <MenuItem key={m} value={m} sx={{ fontSize: 13 }}>{m}</MenuItem>)}
            </Select>
          </FormControl>
        )}
        {hayFiltros && (
          <Tooltip title="Limpiar filtros">
            <IconButton
              size="small"
              onClick={limpiarFiltros}
              sx={{ bgcolor: isDark ? alpha('#ef4444', 0.1) : alpha('#ef4444', 0.06), color: '#ef4444', border: `1px solid ${alpha('#ef4444', 0.2)}`, borderRadius: 2, '&:hover': { bgcolor: alpha('#ef4444', 0.15) } }}
            >
              <ClearIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Lista */}
      {tareas.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 7, borderRadius: 3, background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02), border: `2px dashed ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}` }}>
          <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            {hayFiltros ? 'No hay tareas con estos filtros' : 'No hay evaluaciones publicadas para este trimestre'}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            El docente debe marcar las evaluaciones como visibles para que aparezcan acá
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {tareas.map((tarea, i) => (
            <TarjetaTarea key={tarea.evaluacion_id} tarea={tarea} index={i} onVerDetalle={onVerDetalle} />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default TareasHijo;