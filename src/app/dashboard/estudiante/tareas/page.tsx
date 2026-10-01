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
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedIcon from '@mui/icons-material/Verified';

import { useRouter } from 'next/navigation';
import TareasEstudianteList from '@/components/estudiante/tareas/TareasEstudianteList';
import { usePeriodosEstudiante, useTareasEstudiante } from '@/hooks/useEstudiante';
import { useAuth } from '@/context/AuthContext';
import type { TareaEstudiante, EstadoTarea } from '@/types/estudiante';

// ─── Animaciones ──────────────────────────────────────────────
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-5px); }
`;

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Paleta Dinámica Dual (Idéntica a Docente) ────────────────
const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = isDark ? '#facc15' : '#0288d1';
  const accentColorEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${accentColor} 0%, ${accentColorEnd} 100%)`;
  const textOnAccent = isDark ? '#000000' : '#ffffff';
  return { isDark, accentColor, accentColorEnd, gradBg, textOnAccent };
};

// ──────────────────────────────────────────────
// SELECTOR DE TRIMESTRE (Estilo Docente)
// ──────────────────────────────────────────────
const SelectorTrimestre: React.FC<{
  periodos: { id: number; nombre: string; activo?: boolean }[];
  periodoActivo: number | null;
  onChange: (id: number) => void;
  isLoading: boolean;
  accentColor: string;
  isDark: boolean;
}> = ({ periodos, periodoActivo, onChange, isLoading, accentColor, isDark }) => {
  if (isLoading) return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {[1, 2, 3].map(i => (
        <Skeleton key={i} variant="rounded" width={130} height={36} sx={{ borderRadius: '12px' }} />
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {periodos.map(p => {
        const isSelected = p.id === periodoActivo;
        return (
          <Chip
            key={p.id}
            clickable
            onClick={() => onChange(p.id)}
            icon={p.activo ? <VerifiedIcon sx={{ fontSize: '15px !important' }} /> : undefined}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <span>{p.nombre}</span>
                {p.activo && (
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      px: 0.7,
                      py: 0.1,
                      borderRadius: '6px',
                      bgcolor: isSelected
                        ? (isDark ? '#000' : '#fff')
                        : accentColor,
                      color: isSelected
                        ? accentColor
                        : (isDark ? '#000' : '#fff'),
                    }}
                  >
                    ACTIVO
                  </Box>
                )}
              </Box>
            }
            sx={{
              height: 38,
              px: 1.2,
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.82rem',
              transition: 'all 0.25s ease',
              cursor: 'pointer',
              backgroundColor: isSelected
                ? accentColor
                : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
              color: isSelected ? (isDark ? '#000' : '#fff') : 'text.primary',
              border: `1.5px solid ${isSelected ? accentColor : alpha(isDark ? '#fff' : '#000', 0.08)}`,
              boxShadow: isSelected ? `0 4px 14px ${alpha(accentColor, 0.3)}` : 'none',
              '& .MuiChip-icon': {
                color: isSelected ? (isDark ? '#000' : '#fff') : accentColor,
              },
              '&:hover': {
                backgroundColor: isSelected ? accentColor : alpha(accentColor, 0.12),
                borderColor: accentColor,
                transform: 'translateY(-1px)',
              },
            }}
          />
        );
      })}
    </Box>
  );
};

// ──────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ──────────────────────────────────────────────
export default function EstudianteTareasPage() {
  const { user } = useAuth();
  const { isDark, accentColor, gradBg, textOnAccent } = usePalette();

  const { periodos, periodoActivo, setPeriodoActivo, isLoading: loadingPeriodos } =
    usePeriodosEstudiante();

  const [estadoFiltro, setEstadoFiltro] = useState<EstadoTarea | undefined>(undefined);

  const { tareas, resumen, proximasAvencer, isLoading, refrescar } = useTareasEstudiante({
    periodo_evaluacion_id: periodoActivo ?? undefined,
    estado: estadoFiltro,
  });

  const router = useRouter();

  const handleVerDetalle = useCallback((t: TareaEstudiante) => {
    router.push(`/dashboard/estudiante/tareas/${t.evaluacion_id}`);
  }, [router]);

  const handleCambioPeriodo = useCallback((id: number) => {
    setPeriodoActivo(id);
    setEstadoFiltro(undefined);
  }, [setPeriodoActivo]);

  const nombreUsuario = user?.username || 'Estudiante';

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* ══ HEADER INSTITUCIONAL DOCENTE ══ */}
        <Fade in timeout={450}>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 3,
              }}
            >
              {/* IZQUIERDA: TÍTULO + SALUDO */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AssignmentIcon
                    sx={{
                      color: accentColor,
                      fontSize: { xs: 32, md: 38 },
                      animation: `${bounce} 2s infinite ease-in-out`,
                    }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.6rem', sm: '2rem', md: '2.4rem' },
                      fontWeight: 800,
                      background: gradBg,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: -0.5,
                      lineHeight: 1.2,
                    }}
                  >
                    Mis Tareas y Evaluaciones
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.8, fontWeight: 500 }}>
                  Hola, <strong>{nombreUsuario}</strong> — revisá las tareas, actividades y exámenes asignados por tus docentes.
                </Typography>
              </Box>

              {/* DERECHA: ALERTAS RESUMEN Y REFRESCAR */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                {resumen.atrasados > 0 && (
                  <Chip
                    icon={<WarningAmberIcon sx={{ fontSize: '15px !important' }} />}
                    label={`${resumen.atrasados} atrasada${resumen.atrasados > 1 ? 's' : ''}`}
                    size="small"
                    sx={{
                      height: 32,
                      fontWeight: 800,
                      fontSize: 12,
                      bgcolor: isDark ? alpha('#ef4444', 0.18) : alpha('#ef4444', 0.1),
                      color: isDark ? '#f87171' : '#dc2626',
                      border: `1.5px solid ${alpha('#ef4444', 0.35)}`,
                      borderRadius: '10px',
                      '& .MuiChip-icon': { color: isDark ? '#f87171' : '#dc2626' },
                    }}
                  />
                )}

                {proximasAvencer && proximasAvencer.length > 0 && (
                  <Chip
                    icon={<AccessTimeIcon sx={{ fontSize: '15px !important' }} />}
                    label={`${proximasAvencer.length} por vencer`}
                    size="small"
                    sx={{
                      height: 32,
                      fontWeight: 800,
                      fontSize: 12,
                      bgcolor: isDark ? alpha('#f59e0b', 0.18) : alpha('#f59e0b', 0.1),
                      color: isDark ? '#fbbf24' : '#d97706',
                      border: `1.5px solid ${alpha('#f59e0b', 0.35)}`,
                      borderRadius: '10px',
                      '& .MuiChip-icon': { color: isDark ? '#fbbf24' : '#d97706' },
                    }}
                  />
                )}

                <Tooltip title="Actualizar tareas">
                  <IconButton
                    onClick={refrescar}
                    disabled={isLoading}
                    sx={{
                      borderRadius: '14px',
                      border: `1px solid ${alpha(accentColor, 0.25)}`,
                      bgcolor: isDark ? alpha(accentColor, 0.08) : alpha(accentColor, 0.05),
                      color: accentColor,
                      p: 1.1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha(accentColor, 0.15),
                        transform: 'rotate(180deg)',
                      },
                    }}
                  >
                    <RefreshIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* ══ SELECTOR DE TRIMESTRE (PANEL ESTILO DOCENTE) ══ */}
            {periodos.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  flexWrap: 'wrap',
                  p: 1.5,
                  borderRadius: '18px',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)',
                  border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mr: 0.5 }}>
                  <CalendarMonthIcon sx={{ fontSize: 20, color: accentColor }} />
                  <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
                    Trimestre académico:
                  </Typography>
                </Box>

                <SelectorTrimestre
                  periodos={periodos}
                  periodoActivo={periodoActivo}
                  onChange={handleCambioPeriodo}
                  isLoading={loadingPeriodos}
                  accentColor={accentColor}
                  isDark={isDark}
                />
              </Box>
            )}
          </Box>
        </Fade>

        {/* ── CONTENIDO PRINCIPAL: LISTADO Y FILTROS ── */}
        <Box sx={{ animation: `${fadeSlideUp} 0.4s ease-out both`, pb: 6 }}>
          <TareasEstudianteList
            tareas={tareas}
            resumen={resumen}
            isLoading={isLoading || loadingPeriodos}
            estadoFiltro={estadoFiltro ?? null}
            onEstadoFiltro={(e) => setEstadoFiltro(e ?? undefined)}
            onVerDetalle={handleVerDetalle}
            accentColor={accentColor}
            gradBg={gradBg}
            textOnAccent={textOnAccent}
          />
        </Box>

      </Container>
    </Box>
  );
}