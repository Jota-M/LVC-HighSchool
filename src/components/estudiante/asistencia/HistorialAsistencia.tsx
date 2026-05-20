'use client';
// components/estudiante/asistencia/HistorialAsistencia.tsx

import React, { useMemo, useState } from 'react';
import {
  Box, Typography, alpha, useTheme, Skeleton,
  Chip, Collapse, IconButton, Divider, Paper,
  TextField, InputAdornment, Tooltip,
} from '@mui/material';
import {
  CheckCircle as OkIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandIcon,
  AssignmentLate as PermisoIcon,
  HelpOutline as TardiIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarMonth as CalendarIcon,
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

    if (busqueda) {
      resultado = resultado.filter(d =>
        d.materia_nombre?.toLowerCase().includes(busqueda.toLowerCase())
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
          <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: '12px' }} />
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
      {/* Barra de búsqueda y filtros */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          borderRadius: '14px',
          p: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Buscador */}
          <TextField
            size="small"
            placeholder="Buscar materia..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
              },
            }}
          />

          {/* Filtros de estado */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`Todas (${stats.total})`}
              onClick={() => setFiltroEstado(null)}
              size="small"
              sx={{
                bgcolor: !filtroEstado ? alpha(accent, 0.15) : 'transparent',
                color: !filtroEstado ? accent : 'text.secondary',
                fontWeight: !filtroEstado ? 600 : 400,
                '&:hover': { bgcolor: alpha(accent, 0.1) },
              }}
            />

            <Chip
              icon={<OkIcon sx={{ fontSize: 14 }} />}
              label={`Presentes (${stats.presentes})`}
              onClick={() => setFiltroEstado('presente')}
              size="small"
              sx={{
                bgcolor: filtroEstado === 'presente' ? alpha('#1D9E75', 0.15) : 'transparent',
                color: filtroEstado === 'presente' ? '#1D9E75' : 'text.secondary',
                fontWeight: filtroEstado === 'presente' ? 600 : 400,
                '&:hover': { bgcolor: alpha('#1D9E75', 0.1) },
              }}
            />

            <Chip
              icon={<CancelIcon sx={{ fontSize: 14 }} />}
              label={`Ausentes (${stats.ausentes})`}
              onClick={() => setFiltroEstado('ausente')}
              size="small"
              sx={{
                bgcolor: filtroEstado === 'ausente' ? alpha('#D85A30', 0.15) : 'transparent',
                color: filtroEstado === 'ausente' ? '#D85A30' : 'text.secondary',
                fontWeight: filtroEstado === 'ausente' ? 600 : 400,
                '&:hover': { bgcolor: alpha('#D85A30', 0.1) },
              }}
            />

            {stats.justificados > 0 && (
              <Chip
                icon={<PermisoIcon sx={{ fontSize: 14 }} />}
                label={`Justificados (${stats.justificados})`}
                onClick={() => setFiltroEstado('justificado')}
                size="small"
                sx={{
                  bgcolor: filtroEstado === 'justificado' ? alpha('#BA7517', 0.15) : 'transparent',
                  color: filtroEstado === 'justificado' ? '#BA7517' : 'text.secondary',
                  fontWeight: filtroEstado === 'justificado' ? 600 : 400,
                  '&:hover': { bgcolor: alpha('#BA7517', 0.1) },
                }}
              />
            )}

            {stats.tardanzas > 0 && (
              <Chip
                icon={<TardiIcon sx={{ fontSize: 14 }} />}
                label={`Tardanzas (${stats.tardanzas})`}
                onClick={() => setFiltroEstado('tardanza')}
                size="small"
                sx={{
                  bgcolor: filtroEstado === 'tardanza' ? alpha('#7F77DD', 0.15) : 'transparent',
                  color: filtroEstado === 'tardanza' ? '#7F77DD' : 'text.secondary',
                  fontWeight: filtroEstado === 'tardanza' ? 600 : 400,
                  '&:hover': { bgcolor: alpha('#7F77DD', 0.1) },
                }}
              />
            )}
          </Box>
        </Box>
      </Paper>

      {/* Lista de registros */}
      {porFecha.length === 0 ? (
        <SinDatos
          accent={accent}
          isDark={isDark}
          mensaje="No se encontraron registros con los filtros aplicados."
        />
      ) : (
        <Paper
          elevation={0}
          sx={{
            bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
            border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          {porFecha.map(([fecha, registros], idx) => {
            const isOpen = expanded === fecha;
            const presentes = registros.filter(r => r.estado === 'presente').length;
            const total = registros.length;
            const allOk = presentes === total;
            const promedio = (presentes / total) * 100;

            return (
              <React.Fragment key={fecha}>
                {idx > 0 && <Divider sx={{ opacity: 0.5 }} />}

                {/* Cabecera de fecha */}
                <Box
                  onClick={() => setExpanded(isOpen ? null : fecha)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2.5,
                    py: 2,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    '&:hover': {
                      bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
                    },
                  }}
                >
                  {/* Icono de calendario */}
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: alpha(
                        allOk ? '#1D9E75' : presentes === 0 ? '#D85A30' : '#BA7517',
                        isDark ? 0.15 : 0.1
                      ),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CalendarIcon
                      sx={{
                        fontSize: 20,
                        color: allOk ? '#1D9E75' : presentes === 0 ? '#D85A30' : '#BA7517',
                      }}
                    />
                  </Box>

                  {/* Información de fecha */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {formatearFecha(fecha)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {total} {total === 1 ? 'clase' : 'clases'} registradas
                    </Typography>
                  </Box>

                  {/* Badge de estado */}
                  <Chip
                    label={`${presentes}/${total}`}
                    size="small"
                    sx={{
                      bgcolor: alpha(
                        allOk ? '#1D9E75' : presentes === 0 ? '#D85A30' : '#BA7517',
                        isDark ? 0.2 : 0.15
                      ),
                      color: allOk ? '#1D9E75' : presentes === 0 ? '#D85A30' : '#BA7517',
                      fontWeight: 700,
                      minWidth: 60,
                    }}
                  />

                  <IconButton
                    size="small"
                    sx={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.3s',
                    }}
                  >
                    <ExpandIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Detalle de materias */}
                <Collapse in={isOpen} unmountOnExit>
                  <Box
                    sx={{
                      bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                      px: 2.5,
                      py: 1.5,
                    }}
                  >
                    {registros.map((r, ridx) => (
                      <RegistroRow key={ridx} registro={r} isDark={isDark} />
                    ))}
                  </Box>
                </Collapse>
              </React.Fragment>
            );
          })}
        </Paper>
      )}
    </Box>
  );
};

// ── Fila de registro individual mejorada ──────────────────────
const RegistroRow: React.FC<{ registro: any; isDark: boolean }> = ({ registro, isDark }) => {
  const { chip, bg } = getChipEstado(registro.estado, isDark);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.5,
        px: 1,
        borderRadius: 2,
        transition: 'background 0.15s',
        '&:hover': {
          bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
        },
      }}
    >
      {/* Dot de color de materia */}
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

      {/* Nombre de materia */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {registro.materia_nombre}
        </Typography>

        {registro.hora_marcacion && (
          <Typography variant="caption" color="text.secondary">
            ⏰ {registro.hora_marcacion.slice(0, 5)}
          </Typography>
        )}
      </Box>

      {/* Chip de estado */}
      <Chip
        icon={chip.icon}
        label={chip.label}
        size="small"
        sx={{
          bgcolor: bg,
          color: chip.color,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 26,
          '& .MuiChip-icon': { color: chip.color, fontSize: 14 },
        }}
      />

      {/* Info adicional */}
      {registro.permiso_codigo && (
        <Tooltip title={registro.permiso_motivo || 'Permiso justificado'} arrow>
          <Chip
            label={`Permiso #${registro.permiso_codigo}`}
            size="small"
            sx={{
              bgcolor: alpha('#BA7517', isDark ? 0.15 : 0.1),
              color: '#BA7517',
              fontSize: '0.7rem',
              height: 22,
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
        chip: { label: 'Presente', color: '#085041', icon: <OkIcon /> },
        bg: isDark ? alpha('#1D9E75', 0.2) : '#E1F5EE',
      };
    case 'ausente':
      return {
        chip: { label: 'Ausente', color: '#791F1F', icon: <CancelIcon /> },
        bg: isDark ? alpha('#D85A30', 0.2) : '#FCEBEB',
      };
    case 'justificado':
      return {
        chip: { label: 'Justificado', color: '#633806', icon: <PermisoIcon /> },
        bg: isDark ? alpha('#BA7517', 0.2) : '#FAEEDA',
      };
    case 'tardanza':
      return {
        chip: { label: 'Tardanza', color: '#26215C', icon: <TardiIcon /> },
        bg: isDark ? alpha('#7F77DD', 0.2) : '#EEEDFE',
      };
    default:
      return {
        chip: { label: estado, color: 'text.secondary', icon: <TardiIcon /> },
        bg: 'transparent',
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