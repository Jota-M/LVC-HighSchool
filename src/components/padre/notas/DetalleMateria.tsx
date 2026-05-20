'use client';
// components/padre/notas/DetalleMateria.tsx

import React from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Skeleton, Stack, Paper,
  useTheme, alpha, IconButton, Tooltip,
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import VerifiedIcon from '@mui/icons-material/Verified';

import {
  NotaDimension,
  CalificacionPorPeriodo,
  DIMENSIONES_CONFIG,
  CodigoDimension,
} from '@/types/padreNotasTypes';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fillBar = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

// ──────────────────────────────────────────────
// TARJETA DE DIMENSIÓN
// ──────────────────────────────────────────────

const TarjetaDimension: React.FC<{
  nota: NotaDimension;
  index: number;
}> = ({ nota, index }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cfg = DIMENSIONES_CONFIG[nota.dimension_codigo as CodigoDimension] ?? {
    color: '#6b7280', label: nota.dimension_nombre, porcentaje: 0, descripcion: '',
  };
  const valor = Number(nota.nota_promedio ?? 0);

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        animation: `${fadeUp} 0.4s ease-out ${index * 0.08}s both`,
        background: isDark ? alpha(cfg.color, 0.1) : alpha(cfg.color, 0.06),
        border: `1px solid ${alpha(cfg.color, 0.2)}`,
        flex: '1 1 180px',
        minWidth: 160,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: cfg.color,
            boxShadow: `0 4px 12px ${alpha(cfg.color, 0.4)}`,
          }}
        >
          <Typography variant="h6" fontWeight={900} sx={{ color: '#fff', lineHeight: 1 }}>
            {valor > 0 ? valor : '—'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={800} sx={{ color: cfg.color }}>
            {cfg.label}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
            {cfg.porcentaje}% del total · {nota.total_evaluaciones} eval.
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06),
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${valor}%`,
            borderRadius: 3,
            bgcolor: cfg.color,
            transformOrigin: 'left',
            animation: `${fillBar} 0.8s ease-out ${index * 0.08}s both`,
          }}
        />
      </Box>
    </Box>
  );
};

// ──────────────────────────────────────────────
// PROPS Y COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────

interface Props {
  materiaNombre: string;
  notasDimension: NotaDimension[];
  calificaciones: CalificacionPorPeriodo[];
  isLoading?: boolean;
  onVolver: () => void;
}

const DetalleMateria: React.FC<Props> = ({
  materiaNombre,
  notasDimension,
  calificaciones,
  isLoading = false,
  onVolver,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        <Skeleton variant="rounded" height={48} sx={{ borderRadius: 3 }} />
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={100} sx={{ flex: '1 1 160px', borderRadius: 3 }} />)}
        </Box>
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
      </Stack>
    );
  }

  // Agrupar calificaciones por dimensión
  const porDimension = calificaciones.reduce<Record<string, CalificacionPorPeriodo[]>>((acc, c) => {
    const cod = c.dimension_codigo ?? 'SIN';
    if (!acc[cod]) acc[cod] = [];
    acc[cod].push(c);
    return acc;
  }, {});

  const formatFecha = (f?: string) =>
    f ? new Date(f + 'T12:00:00').toLocaleDateString('es-BO', { day: 'numeric', month: 'short' }) : '—';

  return (
    <Box>
      {/* Header con botón volver */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Tooltip title="Volver al boletín">
          <IconButton
            onClick={onVolver}
            size="small"
            sx={{
              bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
              border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
              borderRadius: 2,
              '&:hover': { bgcolor: isDark ? alpha('#3b82f6', 0.15) : alpha('#3b82f6', 0.08) },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Box>
          <Typography variant="h6" fontWeight={900}>
            {materiaNombre}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Detalle de evaluaciones por dimensión
          </Typography>
        </Box>
      </Box>

      {/* Tarjetas de dimensiones */}
      {notasDimension.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
          {notasDimension.map((nd, i) => (
            <TarjetaDimension key={nd.dimension_evaluacion_id} nota={nd} index={i} />
          ))}
        </Box>
      )}

      {/* Tabla de evaluaciones por dimensión */}
      {calificaciones.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            borderRadius: 3,
            background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
            border: `2px dashed ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          }}
        >
          <EventAvailableIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            No hay evaluaciones registradas aún
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2.5}>
          {(['SER', 'SAB', 'HAC', 'AUTO'] as CodigoDimension[]).map(cod => {
            const evals = porDimension[cod];
            if (!evals || evals.length === 0) return null;
            const cfg = DIMENSIONES_CONFIG[cod];
            return (
              <Box key={cod}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ width: 4, height: 24, borderRadius: 2, bgcolor: cfg.color }} />
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: cfg.color }}>
                    {cfg.label}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${evals.length} evaluacion${evals.length > 1 ? 'es' : ''}`}
                    sx={{
                      height: 20,
                      fontSize: 10,
                      fontWeight: 700,
                      bgcolor: alpha(cfg.color, 0.12),
                      color: cfg.color,
                      borderRadius: 1.5,
                    }}
                  />
                </Box>

                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
                    background: isDark
                      ? 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
                      : '#fff',
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow
                        sx={{
                          '& th': {
                            fontWeight: 800,
                            fontSize: 11,
                            color: 'text.secondary',
                            bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015),
                            borderBottom: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
                            py: 1.25,
                          },
                        }}
                      >
                        <TableCell>Evaluación</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell align="center">Nota</TableCell>
                        <TableCell align="center">Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {evals.map((ev, i) => {
                        const nota = ev.puntaje_obtenido;
                        const max  = ev.puntaje_maximo ?? 100;
                        const pct  = nota !== undefined && nota !== null ? Math.round((nota / max) * 100) : null;
                        return (
                          <TableRow
                            key={ev.evaluacion_id}
                            sx={{
                              animation: `${fadeUp} 0.3s ease-out ${i * 0.04}s both`,
                              '& td': {
                                fontSize: 13,
                                py: 1.25,
                                borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}`,
                              },
                              '&:last-child td': { borderBottom: 'none' },
                              '&:hover': { bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015) },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
                                {ev.evaluacion_nombre}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                                {ev.evaluacion_tipo ?? '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: 11 }}>
                                {formatFecha(ev.evaluacion_fecha)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {nota !== null && nota !== undefined ? (
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="body2" fontWeight={900} sx={{ color: cfg.color, fontSize: 14 }}>
                                    {nota}
                                  </Typography>
                                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                                    /{max}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.disabled">—</Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {ev.esta_ausente ? (
                                <Chip
                                  size="small"
                                  icon={<SentimentVeryDissatisfiedIcon sx={{ fontSize: '12px !important' }} />}
                                  label="Ausente"
                                  sx={{
                                    height: 22,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    bgcolor: alpha('#ef4444', 0.1),
                                    color: '#ef4444',
                                    borderRadius: 1.5,
                                  }}
                                />
                              ) : pct !== null ? (
                                <Chip
                                  size="small"
                                  label={`${pct}%`}
                                  sx={{
                                    height: 22,
                                    fontSize: 10,
                                    fontWeight: 800,
                                    bgcolor: alpha(cfg.color, 0.12),
                                    color: cfg.color,
                                    borderRadius: 1.5,
                                  }}
                                />
                              ) : (
                                <Typography variant="caption" color="text.disabled">Pendiente</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default DetalleMateria;