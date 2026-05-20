'use client';
// components/estudiante/asistencia/EstadisticasAvanzadas.tsx

import React, { useMemo } from 'react';
import {
  Box, Typography, alpha, useTheme, Paper,
  Grid, LinearProgress, Chip, Skeleton,
} from '@mui/material';
import {
  TrendingUp as TrendIcon,
  TrendingDown as DownIcon,
  Remove as NeutralIcon,
  CheckCircle as OkIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { SinDatos } from './SinDatos';

interface EstadisticasAvanzadasProps {
  detalle: any[];
  reporte: any[];
  isLoading: boolean;
  accent: string;
  isDark: boolean;
}

export const EstadisticasAvanzadas: React.FC<EstadisticasAvanzadasProps> = ({
  detalle,
  reporte,
  isLoading,
  accent,
  isDark,
}) => {

  // ── Análisis de tendencias ────────────────────────────────
  const tendencias = useMemo(() => {
    if (!detalle || detalle.length === 0) return null;

    const sorted = [...detalle].sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );

    // Dividir en periodos (semanal)
    const periodos: Array<{
      inicio: Date;
      fin: Date;
      presentes: number;
      total: number;
      porcentaje: number;
    }> = [];

    const hoy = new Date();
    for (let i = 0; i < 12; i++) {
      const fin = new Date(hoy.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const inicio = new Date(fin.getTime() - 7 * 24 * 60 * 60 * 1000);

      const registros = sorted.filter(d => {
        const fecha = new Date(d.fecha);
        return fecha >= inicio && fecha < fin;
      });

      if (registros.length > 0) {
        periodos.unshift({
          inicio,
          fin,
          presentes: registros.filter(r => r.estado === 'presente').length,
          total: registros.length,
          porcentaje: (registros.filter(r => r.estado === 'presente').length / registros.length) * 100,
        });
      }
    }

    // Calcular tendencia
    if (periodos.length < 2) return { periodos, tendencia: 'neutral', cambio: 0 };

    const reciente = periodos[periodos.length - 1].porcentaje;
    const anterior = periodos[periodos.length - 2].porcentaje;
    const cambio = reciente - anterior;

    const tendencia = cambio > 2 ? 'mejorando' : cambio < -2 ? 'empeorando' : 'neutral';

    return { periodos, tendencia, cambio };
  }, [detalle]);

  // ── Análisis por materia ────────────────────────────────
  const porMateria = useMemo(() => {
    if (!reporte || reporte.length === 0) return [];

    return reporte
      .map(r => {
        const presentes = Number(r.asistencias_presentes ?? r.presentes ?? 0);
        const total = Number(r.asistencias_total ?? r.total ?? 0);
        const porcentaje = total > 0 ? (presentes / total) * 100 : 0;

        return {
          nombre: r.materia_nombre ?? 'Materia',
          color: r.materia_color ?? accent,
          presentes,
          ausentes: Number(r.asistencias_ausentes ?? r.ausentes ?? 0),
          total,
          porcentaje,
        };
      })
      .sort((a, b) => b.porcentaje - a.porcentaje);
  }, [reporte, accent]);

  // ── Análisis por día de la semana ────────────────────────
  const porDiaSemana = useMemo(() => {
    if (!detalle || detalle.length === 0) return [];

    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const stats = dias.map((nombre, idx) => ({
      nombre,
      presentes: 0,
      total: 0,
      porcentaje: 0,
    }));

    detalle.forEach(d => {
      const dia = new Date(d.fecha).getDay();
      stats[dia].total++;
      if (d.estado === 'presente') stats[dia].presentes++;
    });

    stats.forEach(s => {
      s.porcentaje = s.total > 0 ? (s.presentes / s.total) * 100 : 0;
    });

    return stats.filter(s => s.total > 0);
  }, [detalle]);

  // ── Métricas generales ────────────────────────────────────
  const metricas = useMemo(() => {
    if (!detalle || detalle.length === 0) return null;

    const total = detalle.length;
    const presentes = detalle.filter(d => d.estado === 'presente').length;
    const ausentes = detalle.filter(d => d.estado === 'ausente').length;
    const justificados = detalle.filter(d => d.estado === 'justificado').length;
    const tardanzas = detalle.filter(d => d.estado === 'tardanza').length;

    // Racha actual
    let racha = 0;
    const sorted = [...detalle].sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    for (const item of sorted) {
      if (item.estado === 'presente') racha++;
      else break;
    }

    // Mejor racha
    let mejorRacha = 0;
    let rachaTemp = 0;
    sorted.forEach(item => {
      if (item.estado === 'presente') {
        rachaTemp++;
        mejorRacha = Math.max(mejorRacha, rachaTemp);
      } else {
        rachaTemp = 0;
      }
    });

    return {
      total,
      presentes,
      ausentes,
      justificados,
      tardanzas,
      racha,
      mejorRacha,
      promedio: (presentes / total) * 100,
    };
  }, [detalle]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rounded" height={200} sx={{ borderRadius: '14px' }} />
        ))}
      </Box>
    );
  }

  if (!detalle || detalle.length === 0) {
    return (
      <SinDatos
        accent={accent}
        isDark={isDark}
        mensaje="No hay suficientes datos para generar estadísticas."
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ── Resumen general ── */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          borderRadius: '14px',
          p: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          📊 Resumen General
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <MetricaBox
              label="Total de clases"
              value={metricas?.total ?? 0}
              icon={<CalendarIcon />}
              color="#7F77DD"
              isDark={isDark}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <MetricaBox
              label="Racha actual"
              value={`${metricas?.racha ?? 0} días`}
              icon={<TrendIcon />}
              color="#1D9E75"
              isDark={isDark}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <MetricaBox
              label="Mejor racha"
              value={`${metricas?.mejorRacha ?? 0} días`}
              icon={<OkIcon />}
              color="#BA7517"
              isDark={isDark}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <MetricaBox
              label="Promedio"
              value={`${Math.round(metricas?.promedio ?? 0)}%`}
              icon={metricas && metricas.promedio >= 85 ? <OkIcon /> : <CancelIcon />}
              color={metricas && metricas.promedio >= 85 ? '#1D9E75' : '#D85A30'}
              isDark={isDark}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* ── Tendencia semanal ── */}
      {tendencias && tendencias.periodos.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
            border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
            borderRadius: '14px',
            p: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              📈 Tendencia de Asistencia
            </Typography>

            <Chip
              icon={
                tendencias.tendencia === 'mejorando' ? <TrendIcon /> :
                tendencias.tendencia === 'empeorando' ? <DownIcon /> :
                <NeutralIcon />
              }
              label={
                tendencias.tendencia === 'mejorando' ? `+${Math.round(tendencias.cambio)}% Mejorando` :
                tendencias.tendencia === 'empeorando' ? `${Math.round(tendencias.cambio)}% Bajando` :
                'Estable'
              }
              size="small"
              sx={{
                bgcolor: tendencias.tendencia === 'mejorando' ? alpha('#1D9E75', 0.15) :
                         tendencias.tendencia === 'empeorando' ? alpha('#D85A30', 0.15) :
                         alpha('#888', 0.15),
                color: tendencias.tendencia === 'mejorando' ? '#1D9E75' :
                       tendencias.tendencia === 'empeorando' ? '#D85A30' :
                       '#888',
                fontWeight: 600,
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {tendencias.periodos.slice(-8).map((periodo, idx) => (
              <Box key={idx}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {periodo.inicio.toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })} - {' '}
                    {periodo.fin.toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })}
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {Math.round(periodo.porcentaje)}% ({periodo.presentes}/{periodo.total})
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={periodo.porcentaje}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      bgcolor: periodo.porcentaje >= 85 ? '#1D9E75' :
                               periodo.porcentaje >= 70 ? '#BA7517' :
                               '#D85A30',
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* ── Desempeño por materia ── */}
      {porMateria.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
            border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
            borderRadius: '14px',
            p: 3,
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            📚 Desempeño por Materia
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {porMateria.map((materia, idx) => (
              <Box key={idx}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: materia.color,
                      flexShrink: 0,
                    }}
                  />

                  <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }} noWrap>
                    {materia.nombre}
                  </Typography>

                  <Chip
                    label={`${Math.round(materia.porcentaje)}%`}
                    size="small"
                    sx={{
                      bgcolor: materia.porcentaje >= 85 ? alpha('#1D9E75', 0.15) :
                               materia.porcentaje >= 70 ? alpha('#BA7517', 0.15) :
                               alpha('#D85A30', 0.15),
                      color: materia.porcentaje >= 85 ? '#1D9E75' :
                             materia.porcentaje >= 70 ? '#BA7517' :
                             '#D85A30',
                      fontWeight: 700,
                      minWidth: 55,
                    }}
                  />

                  <Typography variant="caption" color="text.secondary">
                    {materia.presentes}/{materia.total}
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={materia.porcentaje}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: materia.color,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* ── Asistencia por día de la semana ── */}
      {porDiaSemana.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
            border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
            borderRadius: '14px',
            p: 3,
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            📅 Asistencia por Día de la Semana
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {porDiaSemana.map((dia, idx) => (
              <Box key={idx}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {dia.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(dia.porcentaje)}% ({dia.presentes}/{dia.total})
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={dia.porcentaje}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: dia.porcentaje >= 85 ? '#1D9E75' :
                               dia.porcentaje >= 70 ? '#BA7517' :
                               '#D85A30',
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Paper>
      )}

    </Box>
  );
};

// ── Componente de métrica ──────────────────────────────────
const MetricaBox: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  isDark: boolean;
}> = ({ label, value, icon, color, isDark }) => (
  <Box
    sx={{
      bgcolor: alpha(color, isDark ? 0.12 : 0.08),
      border: `1px solid ${alpha(color, 0.2)}`,
      borderRadius: 2,
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box
        sx={{
            width: 24,
            height: 24,
            borderRadius: 1.5,
            bgcolor: alpha(color, isDark ? 0.2 : 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}
        >
        {icon && (
            <Box sx={{ fontSize: 14, color, display: 'flex' }}>
            {icon}
            </Box>
        )}
      </Box>
    </Box>

    <Typography variant="h6" fontWeight={700} sx={{ color }}>
      {value}
    </Typography>
  </Box>
);