'use client';
// components/materiales/detalle/EstadisticasPanel.tsx

import React from 'react';
import {
  Box, Typography, LinearProgress, alpha, Skeleton, Grid, Tooltip,
} from '@mui/material';
import {
  RemoveRedEyeRounded as EyeIcon,
  CloudDownloadRounded as DownloadIcon,
  FavoriteRounded as FavIcon,
  ChatBubbleRounded as ChatIcon,
  ShareRounded as ShareIcon,
  PrintRounded as PrintIcon,
  TimerRounded as TimerIcon,
  CheckCircleRounded as CompletedIcon,
  PeopleAltRounded as PeopleIcon,
  HelpOutlineRounded as QuestionIcon,
  TrendingUpRounded as TrendingIcon,
} from '@mui/icons-material';
import { useEstadisticasMaterial } from '@/hooks/useMaterial';

interface EstadisticasPanelProps {
  materialId: number;
  accent: string;
  isDark: boolean;
}

export const EstadisticasPanel: React.FC<EstadisticasPanelProps> = ({
  materialId, accent, isDark,
}) => {
  const { estadisticas, isLoading } = useEstadisticasMaterial(materialId);

  if (isLoading) {
    return (
      <Box sx={{ p: 1 }}>
        <Box sx={{ mb: 2.5 }}>
          <Skeleton variant="text" width={180} height={24} />
          <Skeleton variant="text" width={280} height={18} />
        </Box>
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Skeleton variant="rounded" height={100} sx={{ borderRadius: '14px' }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Coerción segura de datos numéricos para evitar cualquier posible NaN
  const vistas = Number(estadisticas?.total_vistas ?? 0);
  const descargas = Number(estadisticas?.total_descargas ?? 0);
  const favoritos = Number(estadisticas?.total_favoritos ?? 0);
  const comentarios = Number(estadisticas?.total_comentarios ?? 0);
  const compartidos = Number(estadisticas?.total_compartidos ?? 0);
  const impresiones = Number(estadisticas?.total_impresiones ?? 0);
  const completados = Number(estadisticas?.total_completados ?? 0);
  const estudiantesUnicos = Number(estadisticas?.estudiantes_unicos ?? 0);
  const dudasAbiertas = Number(estadisticas?.total_dudas_abiertas ?? 0);
  const duracionSegundos = Number(estadisticas?.promedio_duracion_segundos ?? 0);

  const maxVal = Math.max(vistas, descargas, favoritos, comentarios, 1);

  const formatDuracion = (seg: number) => {
    if (!seg || isNaN(seg)) return '—';
    if (seg < 60) return `${Math.round(seg)}s`;
    const m = Math.floor(seg / 60);
    const s = Math.round(seg % 60);
    return `${m}m${s > 0 ? ` ${s}s` : ''}`;
  };

  const totalInteracciones = vistas + descargas + comentarios + favoritos + compartidos;
  const tasaDescarga = vistas > 0 ? Math.round((descargas / vistas) * 100) : 0;
  const tasaCompletado = vistas > 0 ? Math.round((completados / vistas) * 100) : 0;

  const items = [
    {
      label: 'Visualizaciones',
      sub: 'Accesos totales',
      value: vistas,
      icon: <EyeIcon sx={{ fontSize: 18 }} />,
      color: '#0288d1',
      isText: false,
    },
    {
      label: 'Descargas',
      sub: 'Archivos bajados',
      value: descargas,
      icon: <DownloadIcon sx={{ fontSize: 18 }} />,
      color: '#16a34a',
      isText: false,
    },
    {
      label: 'Alumnos únicos',
      sub: 'Estudiantes alcanzados',
      value: estudiantesUnicos,
      icon: <PeopleIcon sx={{ fontSize: 18 }} />,
      color: '#6366f1',
      isText: false,
    },
    {
      label: 'En Favoritos',
      sub: 'Guardados por alumnos',
      value: favoritos,
      icon: <FavIcon sx={{ fontSize: 18 }} />,
      color: '#ef4444',
      isText: false,
    },
    {
      label: 'Comentarios',
      sub: 'Mensajes en el foro',
      value: comentarios,
      icon: <ChatIcon sx={{ fontSize: 18 }} />,
      color: '#f59e0b',
      isText: false,
    },
    {
      label: 'Dudas pendientes',
      sub: 'Preguntas sin resolver',
      value: dudasAbiertas,
      icon: <QuestionIcon sx={{ fontSize: 18 }} />,
      color: dudasAbiertas > 0 ? '#ea580c' : '#94a3b8',
      isText: false,
    },
    {
      label: 'Completados',
      sub: 'Lectura finalizada',
      value: completados,
      icon: <CompletedIcon sx={{ fontSize: 18 }} />,
      color: '#059669',
      isText: false,
    },
    {
      label: 'Compartidos',
      sub: 'Enlaces distribuidos',
      value: compartidos,
      icon: <ShareIcon sx={{ fontSize: 18 }} />,
      color: '#8b5cf6',
      isText: false,
    },
    {
      label: 'Impresiones',
      sub: 'Copias físicas enviadas',
      value: impresiones,
      icon: <PrintIcon sx={{ fontSize: 18 }} />,
      color: '#64748b',
      isText: false,
    },
    {
      label: 'Tiempo promedio',
      sub: 'Permanencia estimada',
      value: formatDuracion(duracionSegundos),
      icon: <TimerIcon sx={{ fontSize: 18 }} />,
      color: accent,
      isText: true,
    },
  ];

  return (
    <Box>
      {/* ── Encabezado ── */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <TrendingIcon sx={{ fontSize: 20, color: accent }} />
          <Typography
            sx={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: accent,
            }}
          >
            Métricas de Engagement Didáctico
          </Typography>
        </Box>
        <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary', mb: 0.4 }}>
          Estadísticas y Análisis de Uso
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
          Monitorea el impacto, la retención y la participación de los alumnos con este recurso.
        </Typography>
      </Box>

      {/* ── Tarjetas Resumen Destacadas ── */}
      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        {[
          {
            label: 'Total de Interacciones',
            val: totalInteracciones.toLocaleString(),
            sub: 'Vistas, descargas y foro',
            color: accent,
          },
          {
            label: 'Alumnos que lo Vieron',
            val: estudiantesUnicos.toLocaleString(),
            sub: estudiantesUnicos === 1 ? '1 estudiante activo' : `${estudiantesUnicos} estudiantes activos`,
            color: '#6366f1',
          },
          {
            label: 'Tasa de Descarga',
            val: `${tasaDescarga}%`,
            sub: descargas > 0 ? `${descargas} de ${vistas} visualizaciones` : 'Sin descargas registradas',
            color: '#16a34a',
          },
          {
            label: 'Tasa de Completado',
            val: `${tasaCompletado}%`,
            sub: completados > 0 ? `${completados} lecturas completas` : 'Pendiente de completar',
            color: '#0288d1',
          },
        ].map((card, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: isDark ? alpha(card.color, 0.06) : alpha(card.color, 0.04),
                border: `1.5px solid ${alpha(card.color, isDark ? 0.25 : 0.2)}`,
                boxShadow: isDark
                  ? `0 4px 20px ${alpha(card.color, 0.1)}`
                  : `0 4px 14px ${alpha(card.color, 0.06)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 24px ${alpha(card.color, 0.18)}`,
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.68rem',
                  color: 'text.secondary',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  mb: 0.5,
                }}
              >
                {card.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  color: card.color,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  mb: 0.4,
                }}
              >
                {card.val}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 500 }}>
                {card.sub}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* ── Desglose en Cuadrícula de Indicadores ── */}
      <Typography
        sx={{
          fontSize: '0.74rem',
          fontWeight: 800,
          color: 'text.secondary',
          mb: 1.5,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Detalle de Interacciones
      </Typography>

      <Grid container spacing={1.5}>
        {items.map(item => {
          const numValue = typeof item.value === 'number' ? item.value : 0;
          const pct = Math.min((numValue / maxVal) * 100, 100);

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={item.label}>
              <Box
                sx={{
                  p: 1.8,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '14px',
                  border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                  bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: alpha(item.color, 0.5),
                    boxShadow: `0 4px 16px ${alpha(item.color, 0.12)}`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box>
                  {/* Icono + label */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '8px',
                        bgcolor: alpha(item.color, isDark ? 0.2 : 0.12),
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        noWrap
                        sx={{
                          fontSize: '0.78rem',
                          color: 'text.primary',
                          fontWeight: 700,
                          lineHeight: 1.2,
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography noWrap sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
                        {item.sub}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Valor Principal */}
                  <Typography
                    sx={{
                      fontSize: item.isText ? '1.25rem' : '1.5rem',
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      color: item.color,
                      lineHeight: 1.2,
                      my: 1,
                    }}
                  >
                    {item.isText ? item.value : numValue.toLocaleString()}
                  </Typography>
                </Box>

                {/* Barra relativa de volumen */}
                {!item.isText ? (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                      <Typography sx={{ fontSize: '0.62rem', color: 'text.disabled', fontWeight: 600 }}>
                        Volumen
                      </Typography>
                      <Typography sx={{ fontSize: '0.62rem', color: item.color, fontWeight: 700 }}>
                        {vistas > 0 ? `${Math.round((numValue / vistas) * 100)}%` : '0%'}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 5,
                        borderRadius: 3,
                        bgcolor: isDark ? alpha(item.color, 0.12) : alpha(item.color, 0.08),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: item.color,
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', mt: 1 }}>
                    Calculado por sesión activa
                  </Typography>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default EstadisticasPanel;