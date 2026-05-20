'use client';
// components/padre/asistencia/HistorialAsistencia.tsx

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Skeleton,
  Pagination,
  Stack,
  useTheme,
  alpha,
  InputAdornment,
  IconButton,
  Tooltip,
  Paper,
  Grid,
} from '@mui/material';
import { keyframes } from '@mui/system';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import ArticleIcon from '@mui/icons-material/Article';

import { AsistenciaHijo, EstadoAsistencia, Paginacion } from '@/types/padreAsistenciaTypes';
import { ESTADOS_ASISTENCIA } from '@/types/asistenciaTypes';

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const ESTADO_CONFIG: Record<EstadoAsistencia, { label: string; color: string; icon: React.ReactNode }> = {
  presente:    { label: 'Presente',      color: '#10b981', icon: <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> },
  ausente:     { label: 'Ausente',       color: '#ef4444', icon: <CancelRoundedIcon sx={{ fontSize: 16 }} /> },
  tardanza:    { label: 'Tardanza',      color: '#f59e0b', icon: <AccessTimeRoundedIcon sx={{ fontSize: 16 }} /> },
  justificado: { label: 'Justificado',   color: '#8b5cf6', icon: <VerifiedRoundedIcon sx={{ fontSize: 16 }} /> },
  falta_parcial:{ label: 'Falta parcial', color: '#3b82f6', icon: <RemoveCircleOutlineRoundedIcon sx={{ fontSize: 16 }} /> },
};

const formatFecha = (fecha: string): string => {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-BO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// ──────────────────────────────────────────────
// PROPS
// ──────────────────────────────────────────────

interface Props {
  asistencias: AsistenciaHijo[];
  paginacion: Paginacion;
  isLoading?: boolean;
  filtros: {
    estado?: EstadoAsistencia;
    fecha_inicio?: string;
    fecha_fin?: string;
    asignacion_docente_id?: number;
  };
  onFiltroChange: (key: string, value: any) => void;
  onPaginaChange: (page: number) => void;
  materiasDisponibles?: { asignacion_id: number; materia_nombre: string }[];
}

// ──────────────────────────────────────────────
// COMPONENTE
// ──────────────────────────────────────────────

const HistorialAsistencia: React.FC<Props> = ({
  asistencias,
  paginacion,
  isLoading = false,
  filtros,
  onFiltroChange,
  onPaginaChange,
  materiasDisponibles = [],
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [showFiltros, setShowFiltros] = useState(false);

  const hayFiltros = !!(filtros.estado || filtros.fecha_inicio || filtros.fecha_fin || filtros.asignacion_docente_id);

  const limpiarFiltros = () => {
    onFiltroChange('estado', undefined);
    onFiltroChange('fecha_inicio', undefined);
    onFiltroChange('fecha_fin', undefined);
    onFiltroChange('asignacion_docente_id', undefined);
  };

  return (
    <Box>
      {/* Header de sección */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 4,
              height: 28,
              borderRadius: 2,
              background: isDark
                ? 'linear-gradient(180deg, #60a5fa, #3b82f6)'
                : 'linear-gradient(180deg, #3b82f6, #2563eb)',
            }}
          />
          <Typography variant="h6" fontWeight={800}>
            Historial de asistencia
          </Typography>
          {paginacion.total > 0 && (
            <Chip
              size="small"
              label={`${paginacion.total} registros`}
              sx={{
                height: 24,
                fontSize: 11,
                fontWeight: 700,
                bgcolor: isDark ? alpha('#3b82f6', 0.15) : alpha('#3b82f6', 0.1),
                color: isDark ? '#60a5fa' : '#2563eb',
                borderRadius: 1.5,
              }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {hayFiltros && (
            <Tooltip title="Limpiar filtros">
              <IconButton
                size="small"
                onClick={limpiarFiltros}
                sx={{
                  bgcolor: isDark ? alpha('#ef4444', 0.1) : alpha('#ef4444', 0.08),
                  color: isDark ? '#f87171' : '#ef4444',
                  border: `1px solid ${alpha('#ef4444', 0.2)}`,
                  borderRadius: 2,
                  '&:hover': { bgcolor: alpha('#ef4444', 0.15) },
                }}
              >
                <ClearIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Filtros">
            <IconButton
              size="small"
              onClick={() => setShowFiltros(v => !v)}
              sx={{
                bgcolor: showFiltros
                  ? isDark ? alpha('#3b82f6', 0.15) : alpha('#3b82f6', 0.1)
                  : isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                color: showFiltros ? (isDark ? '#60a5fa' : '#2563eb') : 'text.secondary',
                border: `1px solid ${showFiltros ? alpha('#3b82f6', 0.3) : 'transparent'}`,
                borderRadius: 2,
                '&:hover': { bgcolor: isDark ? alpha('#3b82f6', 0.15) : alpha('#3b82f6', 0.1) },
              }}
            >
              <FilterListIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Panel de filtros */}
      {showFiltros && (
        <Box
          sx={{
            p: 2.5,
            mb: 2,
            borderRadius: 3,
            background: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
            border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
            animation: `${fadeUp} 0.2s ease-out`,
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{xs:12, sm:6, md:3}}>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontWeight: 600, fontSize: 13 }}>Estado</InputLabel>
                <Select
                  value={filtros.estado ?? ''}
                  label="Estado"
                  onChange={e => onFiltroChange('estado', e.target.value || undefined)}
                  sx={{ borderRadius: 2, fontSize: 13 }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {Object.entries(ESTADO_CONFIG).map(([val, cfg]) => (
                    <MenuItem key={val} value={val}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: cfg.color }}>{cfg.icon}</Box>
                        {cfg.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {materiasDisponibles.length > 0 && (
              <Grid size={{xs:12, sm:6, md:3}}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontWeight: 600, fontSize: 13 }}>Materia</InputLabel>
                  <Select
                    value={filtros.asignacion_docente_id ?? ''}
                    label="Materia"
                    onChange={e => onFiltroChange('asignacion_docente_id', e.target.value || undefined)}
                    sx={{ borderRadius: 2, fontSize: 13 }}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {materiasDisponibles.map(m => (
                      <MenuItem key={m.asignacion_id} value={m.asignacion_id}>
                        {m.materia_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid size={{xs:12, sm:6, md:3}}>
              <TextField
                size="small"
                label="Desde"
                type="date"
                fullWidth
                value={filtros.fecha_inicio ?? ''}
                onChange={e => onFiltroChange('fecha_inicio', e.target.value || undefined)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 },
                  '& .MuiInputLabel-root': { fontWeight: 600, fontSize: 13 },
                }}
              />
            </Grid>

            <Grid size={{xs:12, sm:6, md:3}}>
              <TextField
                size="small"
                label="Hasta"
                type="date"
                fullWidth
                value={filtros.fecha_fin ?? ''}
                onChange={e => onFiltroChange('fecha_fin', e.target.value || undefined)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 },
                  '& .MuiInputLabel-root': { fontWeight: 600, fontSize: 13 },
                }}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Tabla */}
      {isLoading ? (
        <Stack spacing={1}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      ) : asistencias.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 7,
            borderRadius: 3,
            background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
            border: `2px dashed ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          }}
        >
          <ArticleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            No hay registros para los filtros aplicados
          </Typography>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
            background: isDark
              ? 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)'
              : '#fff',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    fontWeight: 800,
                    fontSize: 12,
                    color: 'text.secondary',
                    borderBottom: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.08)}`,
                    py: 1.5,
                    bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015),
                  },
                }}
              >
                <TableCell>Fecha</TableCell>
                <TableCell>Materia</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Observación</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {asistencias.map((a, i) => {
                const cfg = ESTADO_CONFIG[a.estado];
                return (
                  <TableRow
                    key={a.id}
                    sx={{
                      animation: `${fadeUp} 0.3s ease-out ${i * 0.04}s both`,
                      transition: 'background 0.2s ease',
                      '&:hover': {
                        bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                      },
                      '& td': {
                        fontSize: 13,
                        py: 1.25,
                        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}`,
                      },
                      '&:last-child td': { borderBottom: 'none' },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
                        {formatFecha(a.fecha)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 160, fontSize: 13 }}>
                        {a.materia_nombre}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        size="small"
                        icon={<Box sx={{ color: `${cfg.color} !important`, display: 'flex' }}>{cfg.icon}</Box>}
                        label={cfg.label}
                        sx={{
                          height: 26,
                          fontSize: 11,
                          fontWeight: 700,
                          bgcolor: alpha(cfg.color, isDark ? 0.15 : 0.1),
                          color: cfg.color,
                          border: `1px solid ${alpha(cfg.color, 0.25)}`,
                          borderRadius: 2,
                          '& .MuiChip-icon': { color: `${cfg.color} !important`, ml: 0.5 },
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {a.hora_marcacion?.slice(0, 5)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {a.permiso_codigo ? (
                        <Chip
                          size="small"
                          label={`Permiso ${a.permiso_codigo}`}
                          icon={<VerifiedRoundedIcon sx={{ fontSize: '12px !important' }} />}
                          sx={{
                            height: 22,
                            fontSize: 10,
                            fontWeight: 700,
                            bgcolor: alpha('#8b5cf6', 0.1),
                            color: isDark ? '#a78bfa' : '#7c3aed',
                            borderRadius: 1.5,
                          }}
                        />
                      ) : a.justificacion ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ maxWidth: 180, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {a.justificacion}
                        </Typography>
                      ) : a.observaciones ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ maxWidth: 180, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {a.observaciones}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Paginación */}
      {paginacion.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={paginacion.totalPages}
            page={paginacion.page}
            onChange={(_, p) => onPaginaChange(p)}
            shape="rounded"
            size="small"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 2,
                fontWeight: 700,
              },
              '& .Mui-selected': {
                background: isDark
                  ? 'linear-gradient(135deg, #3b82f6, #2563eb) !important'
                  : 'linear-gradient(135deg, #3b82f6, #2563eb) !important',
                color: '#fff !important',
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default HistorialAsistencia;