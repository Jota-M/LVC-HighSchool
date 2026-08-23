'use client';
// app/dashboard/padre/notas/page.tsx
// Restyled: header sin contenedor (mismo patrón que financiero/seguimiento),
// azul fijo de página reemplazado por el token de marca compartido
// (ámbar en modo oscuro / azul en modo claro).

import React, { useCallback } from 'react';
import {
  Box, Container, Typography, Fade, Chip, Skeleton,
  useTheme, alpha, IconButton, Tooltip, Avatar,
} from '@mui/material';
import { keyframes } from '@mui/system';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';

import BoletinNotas from '@/components/padre/notas/BoletinNotas';
import { useHijosDelPadre } from '@/hooks/usePadreAsistencia';
import { usePeriodosEvaluacion, useBoletinNotas } from '@/hooks/usePadreNotas';
import type { HijoInfo } from '@/types/padreAsistenciaTypes';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Paleta — misma lógica dual que financiero/seguimiento ─────────────────
const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary = isDark ? '#facc15' : '#0288d1';
  const primaryEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${primary} 0%, ${primaryEnd} 100%)`;
  return { isDark, primary, primaryEnd, gradBg };
};

// ──────────────────────────────────────────────
// SELECTOR DE HIJO
// ──────────────────────────────────────────────
const SelectorHijo: React.FC<{
  hijos: HijoInfo[];
  hijoActivo: HijoInfo | null;
  onChange: (h: HijoInfo) => void;
  isLoading: boolean;
  isDark: boolean;
  primary: string;
}> = ({ hijos, hijoActivo, onChange, isLoading, isDark, primary }) => {
  if (isLoading) return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {[1, 2].map(i => (
        <Skeleton key={i} variant="rounded" width={150} height={38} sx={{ borderRadius: 2.5 }} />
      ))}
    </Box>
  );

  if (hijos.length <= 1) return null;

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {hijos.map(hijo => {
        const activo = hijo.estudiante_id === hijoActivo?.estudiante_id;
        const iniciales = `${hijo.nombres?.charAt(0) ?? ''}${hijo.apellidos?.charAt(0) ?? ''}`.toUpperCase();
        return (
          <Box
            key={hijo.estudiante_id}
            onClick={() => onChange(hijo)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 1.5, py: 0.75, borderRadius: 2.5, cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: `2px solid ${activo ? primary : alpha(isDark ? '#fff' : '#000', 0.1)}`,
              bgcolor: activo
                ? alpha(primary, isDark ? 0.15 : 0.08)
                : alpha(isDark ? '#fff' : '#000', 0.04),
              '&:hover': {
                borderColor: primary,
                bgcolor: alpha(primary, isDark ? 0.12 : 0.06),
              },
            }}
          >
            <Avatar sx={{
              width: 26, height: 26, fontSize: '0.65rem', fontWeight: 800,
              bgcolor: activo ? primary : alpha(primary, 0.2),
              color: activo ? (isDark ? '#000' : '#fff') : primary,
            }}>
              {iniciales}
            </Avatar>
            <Box>
              <Typography variant="caption" fontWeight={700} sx={{ color: activo ? primary : 'text.primary', display: 'block', lineHeight: 1.2 }}>
                {hijo.nombres.split(' ')[0]} {hijo.apellidos.split(' ')[0]}
              </Typography>
              {hijo.grado_nombre && (
                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', lineHeight: 1 }}>
                  {hijo.grado_nombre}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

// ──────────────────────────────────────────────
// SELECTOR DE TRIMESTRE
// ──────────────────────────────────────────────
const SelectorTrimestre: React.FC<{
  periodos: any[];
  periodoActivo: any;
  onChange: (p: any) => void;
  isLoading: boolean;
  isDark: boolean;
  primary: string;
  gradBg: string;
}> = ({ periodos, periodoActivo, onChange, isLoading, isDark, primary, gradBg }) => {
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
            key={p.id} label={p.nombre} onClick={() => onChange(p)}
            sx={{
              height: 34, fontWeight: 700, fontSize: 13, borderRadius: 2.5, cursor: 'pointer',
              transition: 'all 0.2s ease',
              ...(activo
                ? { background: gradBg, color: isDark ? '#000' : '#fff', boxShadow: `0 4px 12px ${alpha(primary, 0.35)}`, border: 'none' }
                : { bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04), color: 'text.secondary', border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`, '&:hover': { bgcolor: alpha(primary, isDark ? 0.15 : 0.08), color: primary } }),
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
  const { isDark, primary, gradBg } = usePalette();

  const { hijos, hijoActivo, setHijoActivo, isLoading: loadingHijo } = useHijosDelPadre();

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

  const handleCambioHijo = useCallback((hijo: HijoInfo) => {
    setHijoActivo(hijo);
  }, [setHijoActivo]);

  const handleCambioPeriodo = useCallback((p: any) => {
    setPeriodoActivo(p);
  }, [setPeriodoActivo]);

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* ══ HEADER — mismo patrón que financiero/seguimiento: sin contenedor ══ */}
        <Fade in timeout={500}>
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
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SchoolRoundedIcon
                    sx={{ color: primary, fontSize: 36, animation: `${bounce} 1.5s infinite` }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      fontWeight: 800,
                      background: gradBg,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: 'fadeIn 1s ease-out',
                      '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(-10px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                    }}
                  >
                    Notas y Boletín
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                    letterSpacing: 0.3,
                    animation: 'fadeInText 1.2s ease-out',
                    '@keyframes fadeInText': {
                      from: { opacity: 0, transform: 'translateY(5px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  {hijoActivo
                    ? <>{hijoActivo.nombres} {hijoActivo.apellidos} · <strong>{hijoActivo.grado_nombre} "{hijoActivo.paralelo_nombre}"</strong></>
                    : 'Cargando datos...'}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap',
                  width: { xs: '100%', md: 'auto' },
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                }}
              >
                {promedio != null && (
                  <Chip
                    icon={<BarChartRoundedIcon sx={{ fontSize: '16px !important' }} />}
                    label={`Promedio: ${promedio}`}
                    size="small"
                    sx={{
                      height: 28, fontWeight: 800, fontSize: 12,
                      bgcolor: isDark ? alpha(primary, 0.15) : alpha(primary, 0.1),
                      color: primary,
                      border: `1px solid ${alpha(primary, 0.3)}`,
                      borderRadius: 2,
                      '& .MuiChip-icon': { color: primary },
                    }}
                  />
                )}
                <Tooltip title="Actualizar">
                  <IconButton
                    onClick={refrescarBoletin}
                    size="small"
                    disabled={loadingBoletin}
                    sx={{
                      bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                      border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                      borderRadius: '10px',
                      '&:hover': { bgcolor: isDark ? alpha(primary, 0.15) : alpha(primary, 0.08), transform: 'rotate(180deg)' },
                      transition: 'all 0.3s',
                    }}
                  >
                    <RefreshRoundedIcon sx={{ fontSize: 16, color: primary }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Selector de hijo — solo si hay más de uno */}
            {hijos.length > 1 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Estudiante
                </Typography>
                <SelectorHijo
                  hijos={hijos}
                  hijoActivo={hijoActivo}
                  onChange={handleCambioHijo}
                  isLoading={loadingHijo}
                  isDark={isDark}
                  primary={primary}
                />
              </Box>
            )}

            {/* Selector de trimestre */}
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Trimestre
              </Typography>
              <SelectorTrimestre
                periodos={periodos}
                periodoActivo={periodoActivo}
                onChange={handleCambioPeriodo}
                isLoading={loadingPeriodos}
                isDark={isDark}
                primary={primary}
                gradBg={gradBg}
              />
            </Box>
          </Box>
        </Fade>

        {/* ── BOLETÍN ── */}
        <Fade in timeout={700}>
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
        </Fade>

      </Container>
    </Box>
  );
}