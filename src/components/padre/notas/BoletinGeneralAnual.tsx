'use client';
// components/padre/notas/BoletinGeneralAnual.tsx
// Vista comparativa y consolidada de los 3 trimestres para padres.
// Muestra las notas finales de cada materia en cada trimestre y el promedio anual ponderado.

import React from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Skeleton, Stack,
  Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, useTheme, alpha, Tooltip,
} from '@mui/material';
import { keyframes } from '@mui/system';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import AutoAwesomeMosaicRoundedIcon from '@mui/icons-material/AutoAwesomeMosaicRounded';
import { SvgIconProps } from '@mui/material/SvgIcon';

import {
  ResumenMateriaAnual,
  PeriodoEvaluacion,
  getColorNivelRendimiento,
  getGradientNivelRendimiento,
} from '@/types/padreNotasTypes';

// ──────────────────────────────────────────────
// ANIMACIONES
// ──────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ──────────────────────────────────────────────
// STAT CARD
// ──────────────────────────────────────────────

interface StatCardData {
  label: string;
  value: string | number;
  subtitle: string;
  color: string;
  gradient: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<{ stat: StatCardData; index: number }> = ({ stat, index }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        animation: `${fadeUp} 0.4s ease-out ${index * 0.07}s both`,
        border: `1px solid ${alpha(stat.color, 0.25)}`,
        background: isDark
          ? `linear-gradient(155deg, ${alpha(stat.color, 0.18)} 0%, ${alpha(stat.color, 0.04)} 55%, transparent 100%)`
          : `linear-gradient(155deg, ${alpha(stat.color, 0.1)} 0%, #fff 60%)`,
        boxShadow: `0 4px 18px ${alpha(stat.color, isDark ? 0.18 : 0.1)}`,
        transition: 'all 0.25s ease',
        '&::before': { content: '""', display: 'block', height: '3px', background: stat.gradient },
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 12px 28px ${alpha(stat.color, 0.32)}`,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: -14,
          top: -14,
          opacity: isDark ? 0.1 : 0.06,
          transform: 'rotate(-8deg)',
          pointerEvents: 'none',
        }}
      >
        {React.cloneElement(stat.icon as React.ReactElement<SvgIconProps>, {
          sx: { color: stat.color, fontSize: 110 },
        })}
      </Box>

      <CardContent sx={{ p: 2.75, position: 'relative' }}>
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: alpha(stat.color, 0.9),
            mb: 1.25,
          }}
        >
          {stat.label}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: '13px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: stat.gradient,
              boxShadow: `0 4px 14px ${alpha(stat.color, 0.45)}`,
            }}
          >
            {React.cloneElement(stat.icon as React.ReactElement<SvgIconProps>, {
              sx: { color: '#fff', fontSize: 24 },
            })}
          </Box>
          <Typography
            variant="h2"
            fontWeight={900}
            sx={{
              fontSize: { xs: '2.4rem', sm: '2.75rem' },
              lineHeight: 1,
              letterSpacing: '-0.02em',
              background: stat.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {stat.value}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: 13, lineHeight: 1.4 }}>
          {stat.subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

// ──────────────────────────────────────────────
// CHIP DE NOTA POR TRIMESTRE
// ──────────────────────────────────────────────

const ChipNotaTrimestre: React.FC<{
  nota: number | null | undefined;
  aprobado: boolean | null | undefined;
  isDark: boolean;
}> = ({ nota, aprobado, isDark }) => {
  if (nota == null) {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 54,
          py: 0.6,
          px: 1,
          borderRadius: 2,
          bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
          border: `1px dashed ${isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15)}`,
        }}
      >
        <Typography variant="caption" color="text.disabled" fontWeight={700}>
          —
        </Typography>
      </Box>
    );
  }

  const color =
    nota >= 70 ? '#10b981' :
    nota >= 51 ? '#f59e0b' : '#ef4444';

  return (
    <Tooltip title={aprobado ? 'Aprobado' : 'Reprobado'} arrow>
      <Box
        sx={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 58,
          py: 0.5,
          px: 1,
          borderRadius: 2,
          bgcolor: alpha(color, isDark ? 0.18 : 0.1),
          border: `1px solid ${alpha(color, 0.3)}`,
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: `0 3px 10px ${alpha(color, 0.25)}`,
          },
        }}
      >
        <Typography variant="body2" fontWeight={900} sx={{ color, lineHeight: 1.1 }}>
          {nota}
        </Typography>
        <Typography variant="caption" sx={{ color: alpha(color, 0.8), fontSize: 9, fontWeight: 700 }}>
          {aprobado ? 'Aprobado' : 'Reprobado'}
        </Typography>
      </Box>
    </Tooltip>
  );
};

// ──────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────

interface Props {
  materiasAnuales: ResumenMateriaAnual[];
  periodos: PeriodoEvaluacion[];
  isLoading?: boolean;
  promedioGeneral?: number | null;
  aprobadas?: number;
  reprobadas?: number;
  sinNota?: number;
}

const BoletinGeneralAnual: React.FC<Props> = ({
  materiasAnuales,
  periodos,
  isLoading = false,
  promedioGeneral,
  aprobadas = 0,
  reprobadas = 0,
  sinNota = 0,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const primary = isDark ? '#facc15' : '#0288d1';
  const primaryEnd = isDark ? '#f59e0b' : '#01579b';
  const primaryGrad = `linear-gradient(135deg, ${primary}, ${primaryEnd})`;

  const periodosOrdenados = [...periodos].sort((a, b) => a.orden - b.orden);

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
        <Skeleton variant="rounded" height={360} sx={{ borderRadius: 3 }} />
      </Stack>
    );
  }

  if (materiasAnuales.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          borderRadius: 3,
          background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
          border: `2px dashed ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
        }}
      >
        <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography variant="body1" color="text.secondary" fontWeight={600}>
          No hay calificaciones registradas para generar el resumen anual
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Las notas aparecerán a medida que los docentes publiquen los trimestres
        </Typography>
      </Box>
    );
  }

  const totalMaterias = materiasAnuales.length;

  const stats: StatCardData[] = [
    {
      label: 'Aprobadas',
      value: aprobadas,
      color: '#10b981',
      gradient: 'linear-gradient(135deg,#10b981,#34d399)',
      subtitle: `${aprobadas} de ${totalMaterias} materias aprobadas en el año`,
      icon: <CheckCircleRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />,
    },
    {
      label: 'Reprobadas',
      value: reprobadas,
      color: '#ef4444',
      gradient: 'linear-gradient(135deg,#ef4444,#f87171)',
      subtitle:
        reprobadas > 0
          ? `${reprobadas} materia${reprobadas > 1 ? 's' : ''} con promedio anual bajo 51 pts`
          : 'Ninguna materia reprobada en el año',
      icon: <CancelRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />,
    },
    {
      label: 'Sin Nota / En curso',
      value: sinNota,
      color: '#6b7280',
      gradient: 'linear-gradient(135deg,#6b7280,#9ca3af)',
      subtitle:
        sinNota > 0
          ? `${sinNota} materia${sinNota > 1 ? 's' : ''} pendientes de calificación`
          : 'Todas las materias cuentan con notas',
      icon: <HourglassEmptyRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />,
    },
    {
      label: 'Promedio Anual',
      value: promedioGeneral != null ? `${promedioGeneral}` : '—',
      color: primary,
      gradient: primaryGrad,
      subtitle: 'Promedio general acumulado sobre 100 puntos',
      icon: <BarChartRoundedIcon sx={{ color: isDark ? '#000' : '#fff', fontSize: 22 }} />,
    },
  ];

  const thStyle = {
    fontWeight: 800,
    fontSize: 11.5,
    color: 'text.secondary',
    py: 1.5,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  return (
    <Box>
      {/* ── STAT CARDS GLOBALES ── */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {stats.map((stat, i) => (
          <Grid size={{ xs: 6, sm: 3 }} key={stat.label}>
            <StatCard stat={stat} index={i} />
          </Grid>
        ))}
      </Grid>

      {/* ── TABLA CONSOLIDADA ANUAL ── */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          background: isDark
            ? `linear-gradient(145deg, ${alpha('#fff', 0.03)} 0%, ${alpha('#fff', 0.01)} 100%)`
            : '#ffffff',
          overflow: 'hidden',
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 18px rgba(0,0,0,0.04)',
          animation: `${fadeUp} 0.4s ease-out both`,
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
                borderBottom: `2px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
              }}
            >
              <TableCell sx={{ ...thStyle, pl: 3 }}>Materia</TableCell>
              {periodosOrdenados.map((p, idx) => (
                <TableCell key={p.id} align="center" sx={thStyle}>
                  {p.nombre || `T${idx + 1}`}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ ...thStyle, pr: 3, color: primary }}>
                Promedio Anual
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materiasAnuales.map((mat, index) => {
              const colorNivel = getColorNivelRendimiento(mat.nivel, isDark);
              const gradientNivel = getGradientNivelRendimiento(mat.nivel);

              return (
                <TableRow
                  key={mat.materia_codigo}
                  sx={{
                    animation: `${fadeUp} 0.3s ease-out ${index * 0.03}s both`,
                    '& td': {
                      py: 1.75,
                      borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}`,
                    },
                    '&:last-child td': { borderBottom: 'none' },
                    '&:hover': {
                      bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015),
                    },
                  }}
                >
                  {/* Materia y nota mínima */}
                  <TableCell sx={{ pl: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 4,
                          height: 32,
                          borderRadius: 2,
                          background: mat.promedio_anual != null ? gradientNivel : alpha('#9ca3af', 0.5),
                        }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={800} sx={{ fontSize: 14 }}>
                          {mat.materia_nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                          Mínimo: {mat.nota_minima} pts
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Celdas de los 3 Trimestres */}
                  {periodosOrdenados.map(p => {
                    const tri = mat.trimestres.find(t => t.periodo_id === p.id);
                    return (
                      <TableCell key={p.id} align="center">
                        <ChipNotaTrimestre
                          nota={tri?.nota_final}
                          aprobado={tri?.aprobado}
                          isDark={isDark}
                        />
                      </TableCell>
                    );
                  })}

                  {/* Promedio Anual */}
                  <TableCell align="center" sx={{ pr: 3 }}>
                    {mat.promedio_anual != null ? (
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2.5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: gradientNivel,
                            boxShadow: `0 4px 12px ${alpha(colorNivel, 0.4)}`,
                          }}
                        >
                          <Typography variant="body2" fontWeight={900} sx={{ color: '#fff', lineHeight: 1 }}>
                            {mat.promedio_anual}
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha('#fff', 0.8), fontSize: 8.5, fontWeight: 700 }}>
                            /100
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          label={
                            mat.aprobado_anual
                              ? 'Aprobado'
                              : 'Reprobado'
                          }
                          sx={{
                            height: 22,
                            fontSize: 10,
                            fontWeight: 800,
                            bgcolor: alpha(colorNivel, isDark ? 0.2 : 0.12),
                            color: colorNivel,
                            border: `1px solid ${alpha(colorNivel, 0.3)}`,
                            borderRadius: 1.5,
                          }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.disabled" fontWeight={600}>
                        Pendiente
                      </Typography>
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
};

export default BoletinGeneralAnual;
