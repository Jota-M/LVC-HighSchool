'use client';
// app/dashboard/docente/seguimiento/page.tsx
// Mismo patrón estructural que la página de asistencia:
// Sección 1 → Mis materias (reutiliza MisMaterias de asistencia)
// Sección 2 → Lista de estudiantes con conteos de observaciones
// Sección 3 → Drawer lateral al seleccionar un estudiante

import React, { useState, useCallback } from 'react';
import {
  Box, Container, Typography, Fade, Alert, Button,
  IconButton, Tooltip, Chip, useTheme, alpha, Snackbar,
} from '@mui/material';
import { keyframes } from '@mui/system';
import PsychologyIcon  from '@mui/icons-material/Psychology';
import RefreshIcon     from '@mui/icons-material/Refresh';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// Reutilizar MisMaterias de asistencia — mismo componente
import MisMaterias, { MateriaDocente } from '@/components/docente/asistencia/MisMaterias';

// Componentes propios del módulo
import ListaEstudiantesSeguimiento from '@/components/docente/seguimiento/ListaEstudiantesSeguimiento';
import DrawerObservacionesEstudiante from '@/components/docente/seguimiento/DrawerObservacionesEstudiante';

// Hooks
import { useAuth }           from '@/context/AuthContext';
import { useMisAsignaciones } from '@/hooks/useAsistencia';
import {
  useResumenPorAsignacion,
} from '@/hooks/useSeguimientoPedagogico';
import { AsignacionDocente } from '@/services/asistenciaService';
import { ResumenEstudianteAsignacion } from '@/types/seguimientoPedagogicoTypes';

// ─────────────────────────────────────
// Animaciones (mismo estilo que asistencia)
// ─────────────────────────────────────

const bounceIcon = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
`;
const shimmer = keyframes`
  0%   { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;
const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─────────────────────────────────────
// Adaptador: AsignacionDocente → MateriaDocente
// (mismo que en asistencia)
// ─────────────────────────────────────

const adaptarAsignacion = (a: AsignacionDocente): MateriaDocente => ({
  asignacion_id:     a.asignacion_id,
  materia_nombre:    a.materia_nombre,
  materia_codigo:    a.materia_codigo,
  paralelo_nombre:   a.paralelo_nombre,
  grado_nombre:      a.grado_nombre,
  turno_nombre:      a.turno_nombre,
  turno_hora_inicio: a.turno_hora_inicio,
  turno_hora_fin:    a.turno_hora_fin,
  total_estudiantes: Number(a.total_estudiantes),
  color:             a.materia_color ?? undefined,
  lista_pasada_hoy:  false,           // no aplica para seguimiento
  hora_ultimo_registro: undefined,
});

// ─────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────

export default function DocenteSeguimientoPage() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useAuth();

  // ── Mis asignaciones (reutiliza hook de asistencia — misma API) ──
  const {
    asignaciones,
    isLoading:      loadingMaterias,
    sinAsignaciones,
    refrescar:      refrescarAsignaciones,
  } = useMisAsignaciones();

  // ── Materia seleccionada ──
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<number | null>(null);
  const asignacionActual = asignaciones.find(a => a.asignacion_id === materiaSeleccionada);

  // ── Resumen de estudiantes (observaciones por alumno) ──
  const {
    resumen,
    isLoading:            loadingResumen,
    estudiantesUrgentes,
    cargar:               cargarResumen,
    refrescar:            refrescarResumen,
  } = useResumenPorAsignacion();

  // ── Estudiante seleccionado (abre el drawer) ──
  const [estudianteSeleccionado, setEstudianteSeleccionado] =
    useState<ResumenEstudianteAsignacion | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Snackbar ──
  const [snack, setSnack] = useState<{
    open: boolean; msg: string; severity: 'success' | 'error' | 'info';
  }>({ open: false, msg: '', severity: 'success' });

  const showSnack = (msg: string, severity: 'success' | 'error' | 'info' = 'success') =>
    setSnack({ open: true, msg, severity });

  // ─────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────

  const handleSeleccionarMateria = useCallback(async (asignacionId: number) => {
    // Toggle: si ya estaba seleccionada, deseleccionar
    if (asignacionId === materiaSeleccionada) {
      setMateriaSeleccionada(null);
      setEstudianteSeleccionado(null);
      setDrawerOpen(false);
      return;
    }
    setMateriaSeleccionada(asignacionId);
    setEstudianteSeleccionado(null);
    setDrawerOpen(false);
    // Cargar resumen de esa asignación
    const periodo = asignaciones.find(a => a.asignacion_id === asignacionId)?.periodo_academico_id;
    await cargarResumen(asignacionId, periodo);
  }, [materiaSeleccionada, asignaciones, cargarResumen]);

  const handleSeleccionarEstudiante = useCallback((matriculaId: number) => {
    const est = resumen.find(e => e.matricula_id === matriculaId) ?? null;
    setEstudianteSeleccionado(est);
    setDrawerOpen(true);
  }, [resumen]);

  const handleCerrarDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEstudianteSeleccionado(null);
  }, []);

  const handleObservacionGuardada = useCallback(() => {
    showSnack('✅ Observación registrada exitosamente', 'success');
    // Refrescar el resumen para actualizar los conteos en la lista
    refrescarResumen();
  }, [refrescarResumen]);

  const materiasAdaptadas = asignaciones.map(adaptarAsignacion);

  // ─────────────────────────────────────
  // Render
  // ─────────────────────────────────────

  return (
    <Box sx={{
      minHeight: '100vh',
      background: isDark
        ? 'radial-gradient(circle at top right, rgba(251,191,36,0.05), transparent 50%), radial-gradient(circle at bottom left, rgba(139,92,246,0.05), transparent 50%)'
        : 'radial-gradient(circle at top right, rgba(139,92,246,0.03), transparent 50%), radial-gradient(circle at bottom left, rgba(251,191,36,0.03), transparent 50%)',
    }}>
      <Container maxWidth="xl" disableGutters>

        {/* ══ HEADER ══ */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 5, pt: 3 }}>
            <Box sx={{
              p: 4, borderRadius: 4,
              background: isDark
                ? 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))'
                : 'linear-gradient(145deg, #fff, #f9fafb)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* shimmer decorativo */}
              <Box sx={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(90deg, transparent, ${alpha('#fff', isDark ? 0.05 : 0.1)}, transparent)`,
                backgroundSize: '1000px 100%',
                animation: `${shimmer} 3s linear infinite`,
                pointerEvents: 'none',
              }} />

              <Box sx={{
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: 3,
                position: 'relative', zIndex: 1,
              }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    {/* Ícono animado */}
                    <Box sx={{
                      width: 64, height: 64, borderRadius: 3,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isDark
                        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                        : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      boxShadow: isDark
                        ? '0 8px 24px rgba(251,191,36,0.4)'
                        : '0 8px 24px rgba(139,92,246,0.4)',
                      animation: `${bounceIcon} 3s ease-in-out infinite`,
                      position: 'relative', overflow: 'hidden',
                      '&::before': {
                        content: '""', position: 'absolute',
                        top: '-50%', left: '-50%', width: '200%', height: '200%',
                        background: `radial-gradient(circle, ${alpha('#fff', 0.3)} 0%, transparent 70%)`,
                        animation: `${rotate} 10s linear infinite`,
                      },
                    }}>
                      <PsychologyIcon sx={{ fontSize: 36, color: '#fff', zIndex: 1 }} />
                    </Box>

                    <Box>
                      <Typography variant="h3" fontWeight={900} sx={{
                        background: isDark
                          ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                          : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: -1, lineHeight: 1.2,
                      }}>
                        Seguimiento Pedagógico
                      </Typography>
                      <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ mt: 0.5 }}>
                        Hola,{' '}
                        <strong>{user?.username}</strong>
                        {asignaciones.length > 0 && (
                          <>
                            {' · '}
                            <Box component="span" sx={{ color: isDark ? '#fbbf24' : '#8b5cf6' }}>
                              {asignaciones.length} materia{asignaciones.length > 1 ? 's' : ''} asignada{asignaciones.length > 1 ? 's' : ''}
                            </Box>
                          </>
                        )}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Alerta urgentes globales */}
                  {estudiantesUrgentes.length > 0 && (
                    <Chip
                      icon={<PsychologyIcon sx={{ fontSize: '14px !important' }} />}
                      label={`${estudiantesUrgentes.length} estudiante${estudiantesUrgentes.length > 1 ? 's' : ''} con observaciones urgentes`}
                      size="small"
                      sx={{
                        mt: 1,
                        bgcolor: '#fee2e2',
                        color: '#dc2626',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        border: '1px solid rgba(220,38,38,0.2)',
                      }}
                    />
                  )}
                </Box>

                {/* Botón refrescar */}
                <Tooltip title="Refrescar materias">
                  <IconButton
                    onClick={refrescarAsignaciones}
                    disabled={loadingMaterias}
                    sx={{
                      bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.04),
                      border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
                      '&:hover': {
                        bgcolor: isDark ? alpha('#fbbf24', 0.2) : alpha('#8b5cf6', 0.15),
                        transform: 'rotate(180deg)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <RefreshIcon sx={{ color: isDark ? '#fbbf24' : '#8b5cf6' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* ══ SIN ASIGNACIONES ══ */}
        {sinAsignaciones && (
          <Fade in>
            <Alert
              severity="info"
              sx={{ mb: 4, borderRadius: 3 }}
              action={
                <Button size="small" onClick={refrescarAsignaciones} sx={{ fontWeight: 700 }}>
                  Reintentar
                </Button>
              }
            >
              <Typography variant="body2" fontWeight={600}>
                No tenés asignaciones activas para este período académico.
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* ══ SECCIÓN 1: MIS MATERIAS ══ */}
        <Box sx={{ mb: 5, animation: `${fadeSlideUp} 0.6s ease-out 0.2s both` }}>
          <MisMaterias
            materias={materiasAdaptadas}
            isLoading={loadingMaterias}
            seleccionada={materiaSeleccionada}
            onSeleccionar={handleSeleccionarMateria}
            fecha={new Date().toISOString().slice(0, 10)}
          />
        </Box>

        {/* ══ SECCIÓN 2: LISTA DE ESTUDIANTES ══ */}
        {materiaSeleccionada && (
          <Fade in timeout={400}>
            <Box sx={{ mb: 5, animation: `${fadeSlideUp} 0.5s ease-out` }}>

              {/* Breadcrumb */}
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1, mb: 3,
                p: 2, borderRadius: 3,
                background: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
              }}>
                <Typography variant="caption" color="text.disabled" fontWeight={700}>
                  Mis Materias
                </Typography>
                <NavigateNextIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                <Typography variant="caption" fontWeight={800} sx={{
                  background: isDark
                    ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                    : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {asignacionActual?.materia_nombre} — {asignacionActual?.grado_nombre} "{asignacionActual?.paralelo_nombre}"
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontWeight: 600 }}>
                  Seleccioná un estudiante para ver su historial o registrar una observación
                </Typography>
              </Box>

              <ListaEstudiantesSeguimiento
                resumen={resumen}
                isLoading={loadingResumen}
                estudianteSeleccionado={estudianteSeleccionado?.matricula_id ?? null}
                onSeleccionar={handleSeleccionarEstudiante}
              />
            </Box>
          </Fade>
        )}

      </Container>

      {/* ══ DRAWER: Historial + Nueva Observación ══ */}
      <DrawerObservacionesEstudiante
        open={drawerOpen}
        estudiante={estudianteSeleccionado}
        asignacionId={materiaSeleccionada ?? 0}
        periodoId={
          asignaciones.find(a => a.asignacion_id === materiaSeleccionada)?.periodo_academico_id ?? 0
        }
        onClose={handleCerrarDrawer}
      />

      {/* ══ SNACKBAR ══ */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          sx={{
            borderRadius: 3,
            fontWeight: 700,
            minWidth: 300,
            background:
              snack.severity === 'success' ? 'linear-gradient(135deg,#10b981,#34d399)' :
              snack.severity === 'error'   ? 'linear-gradient(135deg,#ef4444,#f87171)' :
                                             'linear-gradient(135deg,#8b5cf6,#a78bfa)',
            color: '#fff',
            boxShadow:
              snack.severity === 'success' ? '0 8px 32px rgba(16,185,129,0.4)' :
              snack.severity === 'error'   ? '0 8px 32px rgba(239,68,68,0.4)' :
                                             '0 8px 32px rgba(139,92,246,0.4)',
            border: 'none',
            '& .MuiAlert-icon':                     { color: '#fff' },
            '& .MuiAlert-action .MuiIconButton-root': { color: '#fff' },
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}