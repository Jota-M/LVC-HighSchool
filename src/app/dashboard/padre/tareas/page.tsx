// app/dashboard/padre/tareas/page.tsx
'use client';
import React, { useState, useCallback } from 'react';
import {
  Box, Container, Typography, Fade, Chip, Skeleton,
  useTheme, alpha, IconButton, Tooltip, Avatar,
  FormControl, InputLabel, Select, MenuItem, Badge,
} from '@mui/material';
import { keyframes } from '@mui/system';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckIcon from '@mui/icons-material/CheckCircle';

import TareasHijo from '@/components/padre/tareas/TareasHijo';
import DetalleEvaluacion from '@/components/padre/tareas/DetalleEvaluacion';
import { useHijosDelPadre } from '@/hooks/usePadreAsistencia';
import { usePeriodosEvaluacion } from '@/hooks/usePadreNotas';
import { useTareasHijo } from '@/hooks/usePadreTareas';
import type { TareaHijo } from '@/types/padreTareasTypes';
import type { HijoInfo } from '@/types/padreAsistenciaTypes';

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ──────────────────────────────────────────────
// CARD SELECTOR DE HIJO (mismo lenguaje que HijoCard de horario)
// ──────────────────────────────────────────────
const HijoCardTareas: React.FC<{
  hijo: HijoInfo;
  activo: boolean;
  accentColor: string;
  isDark: boolean;
  onClick: () => void;
}> = ({ hijo, activo, accentColor, isDark, onClick }) => {
  const iniciales = `${hijo.nombres?.charAt(0) ?? ''}${hijo.apellidos?.charAt(0) ?? ''}`.toUpperCase();

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        p: 1.5,
        borderRadius: 3,
        minWidth: { xs: 140, sm: 170 },
        maxWidth: { xs: 160, sm: 200 },
        border: `2px solid ${activo ? accentColor : alpha(accentColor, 0.15)}`,
        bgcolor: activo
          ? isDark ? alpha('#facc15', 0.1) : alpha('#0288d1', 0.07)
          : isDark ? '#ffffff06' : '#fafafa',
        transition: 'all 0.18s',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: accentColor,
          transform: 'translateY(-2px)',
          boxShadow: `0 6px 20px ${alpha(accentColor, 0.18)}`,
        },
      }}
    >
      {activo && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: accentColor, borderRadius: '12px 12px 0 0' }} />
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={<CheckIcon sx={{ fontSize: 12, color: '#10b981', bgcolor: isDark ? '#1a1a1a' : '#fff', borderRadius: '50%' }} />}
        >
          <Avatar sx={{
            width: 38, height: 38, fontSize: '0.9rem', fontWeight: 800,
            bgcolor: activo ? accentColor : alpha(accentColor, 0.2),
            color: activo ? (isDark ? '#000' : '#fff') : accentColor,
          }}>
            {iniciales}
          </Avatar>
        </Badge>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2" fontWeight={700}
            sx={{ lineHeight: 1.2, color: activo ? accentColor : 'text.primary', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
          >
            {hijo.nombres.split(' ')[0]}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', lineHeight: 1.2, display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {hijo.apellidos}
          </Typography>
          {hijo.grado_nombre && (
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: accentColor, fontWeight: 600, lineHeight: 1 }}>
              {hijo.grado_nombre} {hijo.paralelo_nombre ? `"${hijo.paralelo_nombre}"` : ''}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// ──────────────────────────────────────────────
// PÁGINA
// ──────────────────────────────────────────────
export default function PadreTareasPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = isDark ? '#facc15' : '#0288d1';

  const { hijos, hijoActivo, setHijoActivo, isLoading: loadingHijo } = useHijosDelPadre();

  const { periodos, periodoActivo, setPeriodoActivo, isLoading: loadingPeriodos } =
    usePeriodosEvaluacion(hijoActivo);

  const { tareas, resumen, filtros, isLoading, materias, actualizarFiltros, cargar, refrescar } =
    useTareasHijo(hijoActivo);

  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaHijo | null>(null);

  const handleVerDetalle = useCallback((t: TareaHijo) => setTareaSeleccionada(t), []);
  const handleCerrarDetalle = useCallback(() => setTareaSeleccionada(null), []);

  const handleCambioHijo = useCallback((hijo: HijoInfo) => {
    setHijoActivo(hijo);
    actualizarFiltros({ estado: null, materia: null, busqueda: null });
  }, [setHijoActivo, actualizarFiltros]);

  const handleCambioPeriodo = useCallback((periodoId: number) => {
    const p = periodos.find((per: any) => per.id === periodoId);
    if (!p) return;
    setPeriodoActivo(p);
    cargar({ periodo_evaluacion_id: p.id });
    actualizarFiltros({ estado: null, materia: null, busqueda: null });
  }, [periodos, setPeriodoActivo, cargar, actualizarFiltros]);

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Fade in timeout={450}>
          <Box>

            {/* ── HEADER ── */}
            <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <AssignmentIcon sx={{ color: accentColor, fontSize: 34, animation: `${float} 2.5s ease-in-out infinite` }} />
                  <Box>
                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: { xs: '1.4rem', sm: '1.9rem', md: '2.2rem' },
                        fontWeight: 800,
                        background: isDark
                          ? 'linear-gradient(135deg,#facc15,#f59e0b)'
                          : 'linear-gradient(135deg,#0288d1,#01579b)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1.1,
                      }}
                    >
                      Tareas y Trabajos
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {hijoActivo
                        ? <>
                          {hijoActivo.nombres} {hijoActivo.apellidos} ·{' '}
                          <Box component="span" sx={{ color: accentColor, fontWeight: 700 }}>
                            {hijoActivo.grado_nombre} "{hijoActivo.paralelo_nombre}"
                          </Box>
                        </>
                        : 'Seguimiento académico familiar'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {resumen.atrasados > 0 && (
                  <Chip
                    icon={<WarningAmberIcon sx={{ fontSize: '16px !important' }} />}
                    label={`${resumen.atrasados} atrasado${resumen.atrasados > 1 ? 's' : ''}`}
                    size="small"
                    sx={{ height: 28, fontWeight: 800, fontSize: 12, bgcolor: isDark ? alpha('#ef4444', 0.15) : alpha('#ef4444', 0.1), color: isDark ? '#f87171' : '#ef4444', border: `1px solid ${alpha('#ef4444', 0.3)}`, borderRadius: 2 }}
                  />
                )}

                {/* Selector período — mismo componente que horario */}
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Trimestre</InputLabel>
                  <Select
                    value={periodoActivo?.id ?? ''}
                    onChange={(e) => handleCambioPeriodo(e.target.value as number)}
                    label="Trimestre"
                    disabled={loadingPeriodos}
                  >
                    {periodos.map((p: any) => (
                      <MenuItem key={p.id} value={p.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {p.nombre}
                          {p.activo && (
                            <Typography component="span" sx={{ fontSize: '0.6rem', fontWeight: 700, px: 0.7, py: 0.15, borderRadius: 1, bgcolor: accentColor, color: isDark ? '#000' : '#fff' }}>
                              ACTIVO
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Tooltip title="Actualizar">
                  <IconButton
                    onClick={refrescar}
                    size="small"
                    disabled={isLoading}
                    sx={{ bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04), border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`, borderRadius: 2, transition: 'all 0.3s ease', '&:hover': { bgcolor: alpha(accentColor, isDark ? 0.15 : 0.08), transform: 'rotate(180deg)' } }}
                  >
                    <RefreshIcon sx={{ fontSize: 18, color: accentColor }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* ── SELECTOR DE HIJOS ── */}
            {loadingHijo ? (
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {[1, 2].map((i) => (
                  <Skeleton key={i} variant="rounded" width={160} height={80} sx={{ borderRadius: 3 }} />
                ))}
              </Box>
            ) : hijos.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                {hijos.map((hijo) => (
                  <HijoCardTareas
                    key={hijo.estudiante_id}
                    hijo={hijo}
                    activo={hijo.estudiante_id === hijoActivo?.estudiante_id}
                    accentColor={accentColor}
                    isDark={isDark}
                    onClick={() => handleCambioHijo(hijo)}
                  />
                ))}
              </Box>
            )}

            {/* ── CONTENIDO ── */}
            <Box sx={{ animation: `${fadeSlideUp} 0.5s ease-out 0.15s both`, pb: 6 }}>
              <TareasHijo
                tareas={tareas}
                resumen={resumen}
                isLoading={isLoading || loadingHijo}
                filtros={filtros}
                materias={materias}
                onFiltroChange={actualizarFiltros}
                onVerDetalle={handleVerDetalle}
                accentColor={accentColor}
              />
            </Box>

          </Box>
        </Fade>
      </Container>

      {/* ── DRAWER DE DETALLE ── */}
      <DetalleEvaluacion
        tarea={tareaSeleccionada}
        open={!!tareaSeleccionada}
        onClose={handleCerrarDetalle}
      />
    </Box>
  );
}