'use client';
// app/dashboard/padre/notas/page.tsx

import React, { useCallback } from 'react';
import {
  Box, Container, Typography, Fade, Chip, Skeleton,
  useTheme, alpha, IconButton, Tooltip,
} from '@mui/material';
import { keyframes } from '@mui/system';
import SchoolIcon from '@mui/icons-material/School';
import RefreshIcon from '@mui/icons-material/Refresh';
import BarChartIcon from '@mui/icons-material/BarChart';

import BoletinNotas from '@/components/padre/notas/BoletinNotas';
import { useHijosDelPadre } from '@/hooks/usePadreAsistencia';
import { usePeriodosEvaluacion, useBoletinNotas } from '@/hooks/usePadreNotas';

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -1000px 0; }
  100% { background-position:  1000px 0; }
`;

// ──────────────────────────────────────────────
// SELECTOR DE TRIMESTRE
// ──────────────────────────────────────────────

const SelectorTrimestre: React.FC<{
  periodos: any[];
  periodoActivo: any;
  onChange: (p: any) => void;
  isLoading: boolean;
}> = ({ periodos, periodoActivo, onChange, isLoading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" width={130} height={34} sx={{ borderRadius: 2.5 }} />)}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {periodos.map(p => {
        const activo = p.id === periodoActivo?.id;
        return (
          <Chip
            key={p.id}
            label={p.nombre}
            onClick={() => onChange(p)}
            sx={{
              height: 34, fontWeight: 700, fontSize: 13, borderRadius: 2.5, cursor: 'pointer',
              transition: 'all 0.2s ease',
              ...(activo
                ? { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', boxShadow: '0 4px 12px rgba(59,130,246,0.35)', border: 'none' }
                : { bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04), color: 'text.secondary', border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`, '&:hover': { bgcolor: isDark ? alpha('#3b82f6', 0.15) : alpha('#3b82f6', 0.08), color: isDark ? '#60a5fa' : '#3b82f6' } }),
            }}
          />
        );
      })}
    </Box>
  );
};

// ──────────────────────────────────────────────
// PÁGINA
// ──────────────────────────────────────────────

export default function PadreNotasPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { hijoActivo, isLoading: loadingHijo } = useHijosDelPadre();

  const { periodos, periodoActivo, setPeriodoActivo, isLoading: loadingPeriodos } =
    usePeriodosEvaluacion(hijoActivo);

  const {
    boletin, isLoading: loadingBoletin,
    aprobadas, reprobadas, sinNota, promedio,
    refrescar: refrescarBoletin,
  } = useBoletinNotas(
    hijoActivo?.matricula_id ?? null,
    periodoActivo?.id ?? null
  );

  const handleCambioPeriodo = useCallback((p: any) => {
    setPeriodoActivo(p);
  }, [setPeriodoActivo]);

  return (
    <Box sx={{ minHeight: '100vh', background: isDark ? 'radial-gradient(circle at top right, rgba(59,130,246,0.04), transparent 60%)' : 'radial-gradient(circle at top right, rgba(59,130,246,0.02), transparent 60%)' }}>
      <Container maxWidth="xl" disableGutters>

        {/* ── HEADER ── */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 4, pt: 3 }}>
            <Box
              sx={{
                p: 3.5, borderRadius: 4,
                background: isDark ? 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)' : '#fff',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.06)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent, ${alpha('#fff', isDark ? 0.03 : 0.08)}, transparent)`, backgroundSize: '1000px 100%', animation: `${shimmer} 4s linear infinite`, pointerEvents: 'none' }} />

              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 6px 20px rgba(59,130,246,0.4)' }}>
                    <SchoolIcon sx={{ fontSize: 30, color: '#fff' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={900} sx={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -0.5, lineHeight: 1.2 }}>
                      Notas y Boletín
                    </Typography>
                    {hijoActivo && (
                      <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.25 }}>
                        {hijoActivo.nombres} {hijoActivo.apellidos} ·{' '}
                        <Box component="span" sx={{ color: isDark ? '#60a5fa' : '#3b82f6', fontWeight: 800 }}>
                          {hijoActivo.grado_nombre} "{hijoActivo.paralelo_nombre}"
                        </Box>
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  {promedio != null && (
                    <Chip
                      icon={<BarChartIcon sx={{ fontSize: '16px !important' }} />}
                      label={`Promedio: ${promedio}`}
                      size="small"
                      sx={{ height: 28, fontWeight: 800, fontSize: 12, bgcolor: isDark ? alpha('#3b82f6', 0.15) : alpha('#3b82f6', 0.1), color: isDark ? '#60a5fa' : '#3b82f6', border: `1px solid ${alpha('#3b82f6', 0.3)}`, borderRadius: 2, '& .MuiChip-icon': { color: isDark ? '#60a5fa' : '#3b82f6' } }}
                    />
                  )}
                  <Tooltip title="Actualizar">
                    <IconButton
                      onClick={refrescarBoletin}
                      size="small"
                      disabled={loadingBoletin}
                      sx={{ bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04), border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`, borderRadius: 2, transition: 'all 0.3s ease', '&:hover': { bgcolor: isDark ? alpha('#3b82f6', 0.15) : alpha('#3b82f6', 0.08), transform: 'rotate(180deg)' } }}
                    >
                      <RefreshIcon sx={{ fontSize: 18, color: isDark ? '#60a5fa' : '#3b82f6' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Selector de trimestre */}
              <Box sx={{ mt: 2.5, pt: 2.5, borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`, position: 'relative', zIndex: 1 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Trimestre
                </Typography>
                <SelectorTrimestre
                  periodos={periodos}
                  periodoActivo={periodoActivo}
                  onChange={handleCambioPeriodo}
                  isLoading={loadingPeriodos}
                />
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* ── BOLETÍN ── */}
        <Box sx={{ animation: `${fadeSlideUp} 0.5s ease-out 0.15s both`, pb: 6 }}>
          <BoletinNotas
            boletin={boletin}
            isLoading={loadingBoletin || loadingHijo}
            aprobadas={aprobadas}
            reprobadas={reprobadas}
            sinNota={sinNota}
            promedio={promedio}
            matriculaId={hijoActivo?.matricula_id ?? null}
            periodoEvaluacionId={periodoActivo?.id ?? null}
          />
        </Box>

      </Container>
    </Box>
  );
}