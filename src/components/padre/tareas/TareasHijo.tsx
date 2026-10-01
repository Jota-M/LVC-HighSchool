'use client';
// components/padre/tareas/TareasHijo.tsx

import React, { useMemo, useState } from 'react';
import {
  Box, Typography, Stack, Chip, Skeleton, Collapse, Divider,
  TextField, Select, MenuItem, FormControl, InputAdornment,
  useTheme, alpha, IconButton, Tooltip, Paper,
} from '@mui/material';
import { keyframes } from '@mui/system';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AssignmentIcon from '@mui/icons-material/Assignment';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
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
} from '@/types/padreTareasTypes';
import { DIMENSIONES_CONFIG } from '@/types/padreNotasTypes';

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

// ──────────────────────────────────────────────
// FILA DE TAREA — un punto de estado, no una card completa
// ──────────────────────────────────────────────

const FilaTarea: React.FC<{
  tarea: TareaHijo;
  onVerDetalle: (t: TareaHijo) => void;
  accent: string;
}> = ({ tarea, onVerDetalle, accent }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [abierto, setAbierto] = useState(false);

  const estadoCfg = ESTADO_TAREA_CONFIG[tarea.estado_calculado];
  const dimCfg = tarea.dimension_codigo && DIMENSIONES_CONFIG[tarea.dimension_codigo as keyof typeof DIMENSIONES_CONFIG]
    ? DIMENSIONES_CONFIG[tarea.dimension_codigo as keyof typeof DIMENSIONES_CONFIG]
    : null;
  const colorDias = getColorDiasRestantes(tarea.dias_restantes, tarea.estado_calculado, isDark);
  const hayDetalle = !!(tarea.descripcion || tarea.instrucciones || tarea.observacion_docente || tarea.nota_sobre_100 != null);

  const formatFecha = (f: string | null) =>
    f ? new Date(f).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' }) : null;

  return (
    <Box>
      <Box
        onClick={() => hayDetalle && setAbierto(v => !v)}
        sx={{
          display: 'flex', alignItems: 'flex-start', gap: 1.5,
          py: 1.4, px: 1.5, borderRadius: 2,
          cursor: hayDetalle ? 'pointer' : 'default',
          transition: 'background-color 0.15s',
          '&:hover': { bgcolor: alpha(accent, isDark ? 0.07 : 0.05) },
        }}
      >
        {/* Punto de estado — reemplaza el ícono-caja + franja + borde */}
        <Box sx={{ pt: 0.6, flexShrink: 0 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: estadoCfg.color }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 14 }}>
              {tarea.evaluacion_nombre}
            </Typography>
            {tarea.tipo && (
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                {TIPOS_EVALUACION_LABELS[tarea.tipo] ?? tarea.tipo}
              </Typography>
            )}
            {dimCfg && (
              <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 700, color: dimCfg.color }}>
                {dimCfg.label}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mt: 0.3, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ fontSize: 11.5, fontWeight: 600, color: estadoCfg.color }}>
              {estadoCfg.label}
            </Typography>
            {tarea.fecha_limite && (
              <Typography variant="caption" sx={{ fontSize: 11.5, color: colorDias }}>
                {formatDiasRestantes(tarea.dias_restantes)} · {formatFecha(tarea.fecha_limite)}
              </Typography>
            )}
            {tarea.observacion_docente && (
              <CommentIcon sx={{ fontSize: 13, color: isDark ? '#60a5fa' : '#3b82f6' }} />
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          {tarea.nota_sobre_100 != null && (
            <Typography variant="body2" fontWeight={800} sx={{ fontSize: 14, color: estadoCfg.color }}>
              {tarea.nota_sobre_100}
              <Typography component="span" variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>/100</Typography>
            </Typography>
          )}
          <Tooltip title="Ver detalle completo">
            <IconButton
              size="small"
              onClick={e => { e.stopPropagation(); onVerDetalle(tarea); }}
              sx={{ color: 'text.disabled', '&:hover': { color: estadoCfg.color } }}
            >
              <OpenInNewIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          {hayDetalle && (
            <ExpandMoreIcon
              sx={{
                fontSize: 18, color: 'text.disabled',
                transform: abierto ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          )}
        </Box>
      </Box>

      <Collapse in={abierto}>
        <Box sx={{ px: 1.5, pb: 1.75, pl: 4.5 }}>
          <Stack spacing={1.25}>
            {tarea.descripcion && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12.5 }}>
                {tarea.descripcion}
              </Typography>
            )}
            {tarea.instrucciones && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12.5, fontStyle: 'italic' }}>
                {tarea.instrucciones}
              </Typography>
            )}
            {tarea.observacion_docente && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                <CommentIcon sx={{ fontSize: 13, color: isDark ? '#60a5fa' : '#3b82f6', mt: 0.2 }} />
                <Typography variant="body2" sx={{ fontSize: 12.5, color: 'text.secondary', fontStyle: 'italic' }}>
                  "{tarea.observacion_docente}"
                </Typography>
              </Box>
            )}
            {tarea.nota_sobre_100 != null && (
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                {tarea.puntaje_obtenido}/{tarea.puntaje_maximo} pts
                {tarea.fecha_registro && ` · registrado el ${formatFecha(tarea.fecha_registro)}`}
              </Typography>
            )}
          </Stack>
        </Box>
      </Collapse>
    </Box>
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
  accentColor?: string;
}

const TareasHijo: React.FC<Props> = ({
  tareas, resumen, isLoading = false, filtros, materias, onFiltroChange, onVerDetalle, accentColor,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = accentColor ?? (isDark ? '#facc15' : '#0288d1');

  const limpiarFiltros = () => onFiltroChange({ estado: null, materia: null, busqueda: null });
  const hayFiltros = !!(filtros.estado || filtros.materia || filtros.busqueda);

  // Agrupar por materia — solo cuando no hay búsqueda ni filtro de materia activo,
  // porque ahí la agrupación deja de aportar (el usuario ya acotó a un subconjunto)
  const agrupadas = useMemo(() => {
    if (filtros.materia || filtros.busqueda) return null;
    const grupos = new Map<string, TareaHijo[]>();
    for (const t of tareas) {
      const key = t.materia_nombre || 'Sin materia';
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key)!.push(t);
    }
    return grupos;
  }, [tareas, filtros.materia, filtros.busqueda]);

  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        <Skeleton variant="rounded" height={48} sx={{ borderRadius: 2.5 }} />
        <Skeleton variant="rounded" height={44} sx={{ borderRadius: 2.5 }} />
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 2 }} />)}
      </Stack>
    );
  }

  const stats: { estado: EstadoTarea; value: number }[] = [
    { estado: 'pendiente', value: resumen.pendientes },
    { estado: 'atrasado', value: resumen.atrasados },
    { estado: 'entregado', value: resumen.entregados },
    { estado: 'ausente', value: resumen.ausentes },
  ];

  return (
    <Box>
      {/* ── Barra de resumen — chips inline, no cajas ── */}
      <Paper
        variant="outlined"
        sx={{
          display: 'flex', flexWrap: 'wrap', gap: 0.75, p: 1, mb: 2, borderRadius: 2.5,
          borderColor: alpha(accent, isDark ? 0.18 : 0.15),
          bgcolor: alpha(accent, isDark ? 0.06 : 0.04),
        }}
      >
        {stats.map((stat) => {
          const cfg = ESTADO_TAREA_CONFIG[stat.estado];
          const seleccionado = filtros.estado === stat.estado;
          return (
            <Chip
              key={stat.estado}
              onClick={() => onFiltroChange({ estado: seleccionado ? null : stat.estado })}
              label={`${stat.value} ${cfg.label}${stat.value !== 1 ? 's' : ''}`}
              size="small"
              sx={{
                height: 30, fontWeight: 700, fontSize: 12.5, borderRadius: 2,
                bgcolor: seleccionado ? alpha(cfg.color, isDark ? 0.22 : 0.14) : 'transparent',
                color: seleccionado ? cfg.color : 'text.secondary',
                border: `1px solid ${seleccionado ? alpha(cfg.color, 0.4) : 'transparent'}`,
                '&:hover': { bgcolor: alpha(cfg.color, isDark ? 0.15 : 0.08) },
              }}
            />
          );
        })}
      </Paper>

      {/* ── Filtros ── */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Buscar evaluación..."
          value={filtros.busqueda ?? ''}
          onChange={e => onFiltroChange({ busqueda: e.target.value || null })}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15, color: 'text.disabled' }} /></InputAdornment>,
            endAdornment: filtros.busqueda
              ? <InputAdornment position="end"><IconButton size="small" onClick={() => onFiltroChange({ busqueda: null })}><ClearIcon sx={{ fontSize: 14 }} /></IconButton></InputAdornment>
              : null,
          }}
          sx={{
            flex: '1 1 220px',
            '& .MuiOutlinedInput-root': {
              borderRadius: 2, fontSize: 13,
              bgcolor: alpha(accent, isDark ? 0.05 : 0.03),
            },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(accent, isDark ? 0.18 : 0.15) },
            '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: `${accent} !important` },
          }}
        />
        {materias.length > 1 && (
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <Select
              value={filtros.materia ?? ''}
              onChange={e => onFiltroChange({ materia: e.target.value || null })}
              displayEmpty
              renderValue={v => (v as string) || 'Todas las materias'}
              sx={{ borderRadius: 2, fontSize: 13 }}
            >
              <MenuItem value="">Todas las materias</MenuItem>
              {materias.map(m => <MenuItem key={m} value={m} sx={{ fontSize: 13 }}>{m}</MenuItem>)}
            </Select>
          </FormControl>
        )}
        {hayFiltros && (
          <Tooltip title="Limpiar filtros">
            <IconButton size="small" onClick={limpiarFiltros} sx={{ color: 'text.disabled', '&:hover': { color: '#ef4444' } }}>
              <ClearIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* ── Lista ── */}
      {tareas.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <AssignmentIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {hayFiltros ? 'No hay tareas con estos filtros' : 'No hay evaluaciones publicadas para este trimestre'}
          </Typography>
        </Box>
      ) : agrupadas ? (
        <Stack spacing={2.5} sx={{ animation: `${fadeIn} 0.25s ease-out` }}>
          {[...agrupadas.entries()].map(([materia, items]) => (
            <Box key={materia}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, px: 1.5 }}>
                <Typography variant="caption" fontWeight={800} sx={{ color: accent, fontSize: 12 }}>
                  {materia}
                </Typography>
                <Divider sx={{ flex: 1, borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08) }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                  {items.length}
                </Typography>
              </Box>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2.5, overflow: 'hidden',
                  borderColor: alpha(accent, isDark ? 0.15 : 0.12),
                  bgcolor: alpha(accent, isDark ? 0.035 : 0.02),
                }}
              >
                {items.map((tarea, i) => (
                  <React.Fragment key={tarea.evaluacion_id}>
                    <FilaTarea tarea={tarea} onVerDetalle={onVerDetalle} accent={accent} />
                    {i < items.length - 1 && <Divider sx={{ borderColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05) }} />}
                  </React.Fragment>
                ))}
              </Paper>
            </Box>
          ))}
        </Stack>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2.5, overflow: 'hidden', animation: `${fadeIn} 0.25s ease-out`,
            borderColor: alpha(accent, isDark ? 0.15 : 0.12),
            bgcolor: alpha(accent, isDark ? 0.035 : 0.02),
          }}
        >
          {tareas.map((tarea, i) => (
            <React.Fragment key={tarea.evaluacion_id}>
              <FilaTarea tarea={tarea} onVerDetalle={onVerDetalle} accent={accent} />
              {i < tareas.length - 1 && <Divider sx={{ borderColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05) }} />}
            </React.Fragment>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default TareasHijo;