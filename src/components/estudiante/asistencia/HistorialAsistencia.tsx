'use client';
// components/estudiante/asistencia/HistorialAsistencia.tsx
// Historial cronológico de asistencias con diseño institucional unificado

import React, { useMemo, useState } from 'react';
import {
  Box, Typography, alpha, Skeleton,
  Chip, Collapse, IconButton, Divider, Paper,
  TextField, InputAdornment, Tooltip,
} from '@mui/material';
import {
  CheckCircleRounded as OkIcon,
  CancelRounded as CancelIcon,
  ExpandMoreRounded as ExpandIcon,
  AssignmentTurnedInRounded as PermisoIcon,
  AccessTimeRounded as TardiIcon,
  SearchRounded as SearchIcon,
  ClearRounded as ClearIcon,
  CalendarMonthRounded as CalendarIcon,
} from '@mui/icons-material';
import { SinDatos } from './SinDatos';

interface HistorialAsistenciaProps {
  detalle: any[];
  isLoading: boolean;
  accent: string;
  isDark: boolean;
}

export const HistorialAsistencia: React.FC<HistorialAsistenciaProps> = ({
  detalle,
  isLoading,
  accent,
  isDark,
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null);

  // Filtrar por búsqueda y estado
  const detalleFiltrado = useMemo(() => {
    let resultado = detalle;

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      resultado = resultado.filter(d =>
        d.materia_nombre?.toLowerCase().includes(q) ||
        d.docente_nombres?.toLowerCase().includes(q) ||
        d.docente_apellidos?.toLowerCase().includes(q)
      );
    }

    if (filtroEstado) {
      resultado = resultado.filter(d => d.estado === filtroEstado);
    }

    return resultado;
  }, [detalle, busqueda, filtroEstado]);

  // Agrupar por fecha
  const porFecha = useMemo(() => {
    const grupos: Record<string, any[]> = {};
    for (const item of detalleFiltrado) {
      const fecha = item.fecha?.split('T')[0] ?? 'Sin fecha';
      if (!grupos[fecha]) grupos[fecha] = [];
      grupos[fecha].push(item);
    }
    return Object.entries(grupos).sort(([a], [b]) => b.localeCompare(a));
  }, [detalleFiltrado]);

  // Estadísticas de filtros
  const stats = useMemo(() => {
    const total = detalle.length;
    const presentes = detalle.filter(d => d.estado === 'presente').length;
    const ausentes = detalle.filter(d => d.estado === 'ausente').length;
    const justificados = detalle.filter(d => d.estado === 'justificado').length;
    const tardanzas = detalle.filter(d => d.estado === 'tardanza').length;

    return { total, presentes, ausentes, justificados, tardanzas };
  }, [detalle]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: '14px' }} />
        ))}
      </Box>
    );
  }

  if (!detalle || !detalle.length) {
    return (
      <SinDatos
        accent={accent}
        isDark={isDark}
        mensaje="No hay registros de asistencia para el período seleccionado."
      />
    );
  }

  return (
    <Box>
      {/* ── Barra de Búsqueda y Filtros de Estado ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.8, sm: 2.2 },
          mb: 2.5,
          borderRadius: '18px',
          border: `1.5px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Buscador de materia o docente */}
          <TextField
            size="small"
            placeholder="Buscar por materia o docente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: busqueda ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setBusqueda('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: 240 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: isDark ? alpha('#000', 0.2) : '#fff',
                '& fieldset': {
                  borderColor: alpha(isDark ? '#fff' : '#000', 0.12),
                },
                '&:hover fieldset': {
                  borderColor: accent,
                },
              },
            }}
          />

          {/* Chips de filtro por estado */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`Todos (${stats.total})`}
              onClick={() => setFiltroEstado(null)}
              size="small"
              clickable
              sx={{
                height: 32,
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                bgcolor: !filtroEstado ? accent : (isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04)),
                color: !filtroEstado ? (isDark ? '#000' : '#fff') : 'text.secondary',
                border: `1.5px solid ${!filtroEstado ? accent : alpha(isDark ? '#fff' : '#000', 0.08)}`,
                boxShadow: !filtroEstado ? `0 2px 8px ${alpha(accent, 0.3)}` : 'none',
              }}
            />

            <Chip
              icon={<OkIcon sx={{ fontSize: '15px !important' }} />}
              label={`Presentes (${stats.presentes})`}
              onClick={() => setFiltroEstado(filtroEstado === 'presente' ? null : 'presente')}
              size="small"
              clickable
              sx={{
                height: 32,
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                bgcolor: filtroEstado === 'presente' ? '#10b981' : (isDark ? alpha('#10b981', 0.12) : alpha('#10b981', 0.08)),
                color: filtroEstado === 'presente' ? '#fff' : (isDark ? '#34d399' : '#059669'),
                border: `1.5px solid ${alpha('#10b981', filtroEstado === 'presente' ? 1 : 0.25)}`,
                '& .MuiChip-icon': {
                  color: filtroEstado === 'presente' ? '#fff' : (isDark ? '#34d399' : '#059669'),
                },
              }}
            />

            <Chip
              icon={<CancelIcon sx={{ fontSize: '15px !important' }} />}
              label={`Ausentes (${stats.ausentes})`}
              onClick={() => setFiltroEstado(filtroEstado === 'ausente' ? null : 'ausente')}
              size="small"
              clickable
              sx={{
                height: 32,
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                bgcolor: filtroEstado === 'ausente' ? '#ef4444' : (isDark ? alpha('#ef4444', 0.12) : alpha('#ef4444', 0.08)),
                color: filtroEstado === 'ausente' ? '#fff' : (isDark ? '#f87171' : '#dc2626'),
                border: `1.5px solid ${alpha('#ef4444', filtroEstado === 'ausente' ? 1 : 0.25)}`,
                '& .MuiChip-icon': {
                  color: filtroEstado === 'ausente' ? '#fff' : (isDark ? '#f87171' : '#dc2626'),
                },
              }}
            />

            {stats.tardanzas > 0 && (
              <Chip
                icon={<TardiIcon sx={{ fontSize: '15px !important' }} />}
                label={`Tardanzas (${stats.tardanzas})`}
                onClick={() => setFiltroEstado(filtroEstado === 'tardanza' ? null : 'tardanza')}
                size="small"
                clickable
                sx={{
                  height: 32,
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  bgcolor: filtroEstado === 'tardanza' ? '#f59e0b' : (isDark ? alpha('#f59e0b', 0.12) : alpha('#f59e0b', 0.08)),
                  color: filtroEstado === 'tardanza' ? (isDark ? '#000' : '#fff') : (isDark ? '#fbbf24' : '#d97706'),
                  border: `1.5px solid ${alpha('#f59e0b', filtroEstado === 'tardanza' ? 1 : 0.25)}`,
                  '& .MuiChip-icon': {
                    color: filtroEstado === 'tardanza' ? (isDark ? '#000' : '#fff') : (isDark ? '#fbbf24' : '#d97706'),
                  },
                }}
              />
            )}

            {stats.justificados > 0 && (
              <Chip
                icon={<PermisoIcon sx={{ fontSize: '15px !important' }} />}
                label={`Justificados (${stats.justificados})`}
                onClick={() => setFiltroEstado(filtroEstado === 'justificado' ? null : 'justificado')}
                size="small"
                clickable
                sx={{
                  height: 32,
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  bgcolor: filtroEstado === 'justificado' ? '#8b5cf6' : (isDark ? alpha('#8b5cf6', 0.12) : alpha('#8b5cf6', 0.08)),
                  color: filtroEstado === 'justificado' ? '#fff' : (isDark ? '#c084fc' : '#7c3aed'),
                  border: `1.5px solid ${alpha('#8b5cf6', filtroEstado === 'justificado' ? 1 : 0.25)}`,
                  '& .MuiChip-icon': {
                    color: filtroEstado === 'justificado' ? '#fff' : (isDark ? '#c084fc' : '#7c3aed'),
                  },
                }}
              />
            )}
          </Box>
        </Box>
      </Paper>

      {/* ── Lista de Registros Agrupados por Fecha ── */}
      {porFecha.length === 0 ? (
        <SinDatos
          accent={accent}
          isDark={isDark}
          mensaje="No se encontraron registros con los criterios de búsqueda actuales."
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {porFecha.map(([fecha, registros]) => {
            const isOpen = expanded === fecha;
            const presentes = registros.filter(r => r.estado === 'presente').length;
            const total = registros.length;
            const allOk = presentes === total;

            return (
              <Paper
                key={fecha}
                elevation={0}
                sx={{
                  bgcolor: isDark ? alpha('#fff', 0.025) : '#ffffff',
                  border: `1.5px solid ${alpha(allOk ? '#10b981' : presentes === 0 ? '#ef4444' : '#f59e0b', isDark ? 0.25 : 0.18)}`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: `0 4px 16px ${alpha(allOk ? '#10b981' : '#f59e0b', 0.12)}`,
                  },
                }}
              >
                {/* Cabecera de fecha */}
                <Box
                  onClick={() => setExpanded(isOpen ? null : fecha)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.8,
                    px: { xs: 2, sm: 2.5 },
                    py: 1.8,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    '&:hover': {
                      bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.02),
                    },
                  }}
                >
                  {/* Icono de calendario con color condicional */}
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '12px',
                      bgcolor: alpha(allOk ? '#10b981' : presentes === 0 ? '#ef4444' : '#f59e0b', 0.16),
                      color: allOk ? '#10b981' : presentes === 0 ? '#ef4444' : '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CalendarIcon sx={{ fontSize: 22 }} />
                  </Box>

                  {/* Información de la fecha */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ textTransform: 'capitalize', fontSize: '0.95rem' }}>
                      {formatearFecha(fecha)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {total} {total === 1 ? 'materia programada' : 'materias programadas'}
                    </Typography>
                  </Box>

                  {/* Badge resumen de la fecha */}
                  <Chip
                    label={`${presentes} de ${total} asistidas`}
                    size="small"
                    sx={{
                      bgcolor: alpha(allOk ? '#10b981' : presentes === 0 ? '#ef4444' : '#f59e0b', 0.15),
                      color: allOk ? (isDark ? '#34d399' : '#059669') : presentes === 0 ? (isDark ? '#f87171' : '#dc2626') : (isDark ? '#fbbf24' : '#d97706'),
                      fontWeight: 800,
                      borderRadius: '8px',
                      height: 28,
                      fontSize: '0.74rem',
                      border: `1px solid ${alpha(allOk ? '#10b981' : presentes === 0 ? '#ef4444' : '#f59e0b', 0.3)}`,
                    }}
                  />

                  <IconButton
                    size="small"
                    sx={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.25s ease',
                      p: 0.6,
                    }}
                  >
                    <ExpandIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>

                {/* Desglose de materias */}
                <Collapse in={isOpen} unmountOnExit>
                  <Box
                    sx={{
                      borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}`,
                      bgcolor: isDark ? alpha('#000', 0.2) : alpha('#000', 0.015),
                      px: { xs: 2, sm: 2.5 },
                      py: 1,
                    }}
                  >
                    {registros.map((r, ridx) => (
                      <RegistroRow key={ridx} registro={r} isDark={isDark} />
                    ))}
                  </Box>
                </Collapse>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

// ── Fila de registro individual modernizada ──────────────────
const RegistroRow: React.FC<{ registro: any; isDark: boolean }> = ({ registro, isDark }) => {
  const chip = getChipEstado(registro.estado, isDark);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.4,
        px: 1,
        borderRadius: '10px',
        transition: 'background 0.15s ease',
        '&:hover': {
          bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
        },
      }}
    >
      {/* Indicador de color de materia */}
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: registro.materia_color || '#888',
          flexShrink: 0,
          boxShadow: `0 0 6px ${alpha(registro.materia_color || '#888', 0.5)}`,
        }}
      />

      {/* Información de materia */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: '0.86rem' }}>
          {registro.materia_nombre}
        </Typography>

        {registro.hora_marcacion && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TardiIcon sx={{ fontSize: 13 }} />
            Marcado: {registro.hora_marcacion.slice(0, 5)}
          </Typography>
        )}
      </Box>

      {/* Chip de estado */}
      <Chip
        icon={chip.icon}
        label={chip.label}
        size="small"
        sx={{
          bgcolor: chip.bg,
          color: chip.color,
          fontWeight: 800,
          fontSize: '0.74rem',
          height: 28,
          borderRadius: '8px',
          border: `1px solid ${alpha(chip.color, 0.3)}`,
          '& .MuiChip-icon': { color: chip.color, fontSize: 15 },
        }}
      />

      {/* Permiso o justificación si existe */}
      {registro.permiso_codigo && (
        <Tooltip title={registro.permiso_motivo || 'Permiso justificado'} arrow>
          <Chip
            label={`Permiso #${registro.permiso_codigo}`}
            size="small"
            sx={{
              bgcolor: alpha('#8b5cf6', isDark ? 0.18 : 0.1),
              color: isDark ? '#c084fc' : '#7c3aed',
              fontSize: '0.7rem',
              fontWeight: 700,
              height: 24,
              borderRadius: '6px',
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
};

// ── Helpers ──────────────────────────────────────────────────
function getChipEstado(estado: string, isDark: boolean) {
  switch (estado) {
    case 'presente':
      return {
        label: 'Presente',
        color: isDark ? '#34d399' : '#059669',
        bg: isDark ? alpha('#10b981', 0.18) : alpha('#10b981', 0.1),
        icon: <OkIcon />,
      };
    case 'ausente':
      return {
        label: 'Ausente',
        color: isDark ? '#f87171' : '#dc2626',
        bg: isDark ? alpha('#ef4444', 0.18) : alpha('#ef4444', 0.1),
        icon: <CancelIcon />,
      };
    case 'justificado':
      return {
        label: 'Justificado',
        color: isDark ? '#c084fc' : '#7c3aed',
        bg: isDark ? alpha('#8b5cf6', 0.18) : alpha('#8b5cf6', 0.1),
        icon: <PermisoIcon />,
      };
    case 'tardanza':
      return {
        label: 'Tardanza',
        color: isDark ? '#fbbf24' : '#d97706',
        bg: isDark ? alpha('#f59e0b', 0.18) : alpha('#f59e0b', 0.1),
        icon: <TardiIcon />,
      };
    default:
      return {
        label: estado,
        color: 'text.secondary',
        bg: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
        icon: <TardiIcon />,
      };
  }
}

function formatearFecha(fechaStr: string): string {
  try {
    const d = new Date(fechaStr + 'T12:00:00');
    return d.toLocaleDateString('es-BO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return fechaStr;
  }
}

export default HistorialAsistencia;