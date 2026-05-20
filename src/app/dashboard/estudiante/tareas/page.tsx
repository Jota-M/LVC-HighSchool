'use client';
// app/dashboard/estudiante/tareas/page.tsx

import React, { useState, useCallback } from 'react';
import {
  Box, Container, Typography, Fade, Chip, Skeleton,
  useTheme, alpha, IconButton, Tooltip,
} from '@mui/material';
import { keyframes } from '@mui/system';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import TareasEstudianteList from '@/components/estudiante/tareas/TareasEstudianteList';
import DetalleEvaluacionEstudiante from '@/components/estudiante/tareas/DetalleEvaluacionEstudiante';
import { usePeriodosEstudiante } from '@/hooks/useEstudiante';
import { useTareasEstudiante } from '@/hooks/useEstudiante';
import type { TareaEstudiante, EstadoTarea } from '@/types/estudiante';

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
  periodos: { id: number; nombre: string }[];
  periodoActivo: number | null;
  onChange: (id: number) => void;
  isLoading: boolean;
}> = ({ periodos, periodoActivo, onChange, isLoading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (isLoading) return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {[1, 2, 3].map(i => (
        <Skeleton key={i} variant="rounded" width={130} height={34} sx={{ borderRadius: 2.5 }} />
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {periodos.map(p => {
        const activo = p.id === periodoActivo;
        return (
          <Chip
            key={p.id}
            label={p.nombre}
            onClick={() => onChange(p.id)}
            sx={{
              height: 34, fontWeight: 700, fontSize: 13, borderRadius: 2.5,
              cursor: 'pointer', transition: 'all 0.2s ease',
              ...(activo
                ? {
                    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(245,158,11,0.35)',
                    border: 'none',
                  }
                : {
                    bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                    color: 'text.secondary',
                    border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
                    '&:hover': {
                      bgcolor: isDark ? alpha('#f59e0b', 0.15) : alpha('#f59e0b', 0.08),
                      color: isDark ? '#fbbf24' : '#d97706',
                    },
                  }),
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

export default function EstudianteTareasPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { periodos, periodoActivo, setPeriodoActivo, isLoading: loadingPeriodos } =
    usePeriodosEstudiante();

  const [estadoFiltro, setEstadoFiltro] = useState<EstadoTarea | undefined>(undefined);

  const { tareas, resumen, isLoading, refrescar } = useTareasEstudiante({
    periodo_evaluacion_id: periodoActivo ?? undefined,
    estado: estadoFiltro,
  });

  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaEstudiante | null>(null);

  const handleVerDetalle = useCallback((t: TareaEstudiante) => setTareaSeleccionada(t), []);
  const handleCerrarDetalle = useCallback(() => setTareaSeleccionada(null), []);

  const handleCambioPeriodo = useCallback((id: number) => {
    setPeriodoActivo(id);
    setEstadoFiltro(undefined);
  }, [setPeriodoActivo]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark
          ? 'radial-gradient(circle at top right, rgba(245,158,11,0.04), transparent 60%)'
          : 'radial-gradient(circle at top right, rgba(245,158,11,0.02), transparent 60%)',
      }}
    >
      <Container maxWidth="xl" disableGutters>

        {/* ── HEADER ── */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 4, pt: 3 }}>
            <Box
              sx={{
                p: 3.5, borderRadius: 4,
                background: isDark
                  ? 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
                  : '#fff',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.06)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Shimmer */}
              <Box sx={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(90deg, transparent, ${alpha('#fff', isDark ? 0.03 : 0.08)}, transparent)`,
                backgroundSize: '1000px 100%',
                animation: `${shimmer} 4s linear infinite`,
                pointerEvents: 'none',
              }} />

              <Box sx={{
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', flexWrap: 'wrap',
                gap: 2, position: 'relative', zIndex: 1,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 56, height: 56, borderRadius: 3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                    boxShadow: '0 6px 20px rgba(245,158,11,0.4)',
                  }}>
                    <AssignmentIcon sx={{ fontSize: 30, color: '#fff' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h4" fontWeight={900}
                      sx={{
                        background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        letterSpacing: -0.5, lineHeight: 1.2,
                      }}
                    >
                      Mis Tareas
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.25 }}>
                      Evaluaciones y trabajos publicados por tus docentes
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {resumen.atrasados > 0 && (
                    <Chip
                      icon={<WarningAmberIcon sx={{ fontSize: '16px !important' }} />}
                      label={`${resumen.atrasados} atrasado${resumen.atrasados > 1 ? 's' : ''}`}
                      size="small"
                      sx={{
                        height: 28, fontWeight: 800, fontSize: 12,
                        bgcolor: isDark ? alpha('#ef4444', 0.15) : alpha('#ef4444', 0.1),
                        color: isDark ? '#f87171' : '#ef4444',
                        border: `1px solid ${alpha('#ef4444', 0.3)}`, borderRadius: 2,
                        '& .MuiChip-icon': { color: isDark ? '#f87171' : '#ef4444' },
                      }}
                    />
                  )}
                  <Tooltip title="Actualizar">
                    <IconButton
                      onClick={refrescar}
                      size="small"
                      disabled={isLoading}
                      sx={{
                        bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                        border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                        borderRadius: 2, transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: isDark ? alpha('#f59e0b', 0.15) : alpha('#f59e0b', 0.08),
                          transform: 'rotate(180deg)',
                        },
                      }}
                    >
                      <RefreshIcon sx={{ fontSize: 18, color: isDark ? '#fbbf24' : '#f59e0b' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Selector trimestre */}
              <Box sx={{
                mt: 2.5, pt: 2.5,
                borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
                position: 'relative', zIndex: 1,
              }}>
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

        {/* ── CONTENIDO ── */}
        <Box sx={{ animation: `${fadeSlideUp} 0.5s ease-out 0.15s both`, pb: 6 }}>
          <TareasEstudianteList
            tareas={tareas}
            resumen={resumen}
            isLoading={isLoading || loadingPeriodos}
            estadoFiltro={estadoFiltro ?? null}
            onEstadoFiltro={(e) => setEstadoFiltro(e ?? undefined)}
            onVerDetalle={handleVerDetalle}
          />
        </Box>

      </Container>

      {/* ── DRAWER DE DETALLE ── */}
      <DetalleEvaluacionEstudiante
        tarea={tareaSeleccionada}
        open={!!tareaSeleccionada}
        onClose={handleCerrarDetalle}
      />
    </Box>
  );
}