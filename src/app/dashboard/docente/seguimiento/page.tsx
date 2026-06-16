'use client';
// app/dashboard/docente/seguimiento/page.tsx
// Restiladla al sistema de tokens brand/brandDim/brandBorder — mismo patrón que gestión de notas.
// Funcionalidad 100% intacta.

import React, { useState, useCallback } from 'react';
import {
  Box, Container, Typography, Fade, Alert, Button, LinearProgress,
  IconButton, Tooltip, Chip, useTheme, alpha, Snackbar,
} from '@mui/material';
import { keyframes } from '@mui/system';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RefreshIcon from '@mui/icons-material/Refresh';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ErrorIcon from '@mui/icons-material/Error';

import MisMaterias, { MateriaDocente } from '@/components/docente/asistencia/MisMaterias';
import ListaEstudiantesSeguimiento from '@/components/docente/seguimiento/ListaEstudiantesSeguimiento';
import DrawerObservacionesEstudiante from '@/components/docente/seguimiento/DrawerObservacionesEstudiante';

import { useAuth } from '@/context/AuthContext';
import { useMisAsignaciones } from '@/hooks/useAsistencia';
import { useResumenPorAsignacion } from '@/hooks/useSeguimientoPedagogico';
import { AsignacionDocente } from '@/services/asistenciaService';
import { ResumenEstudianteAsignacion } from '@/types/seguimientoPedagogicoTypes';

// ── animaciones ───────────────────────────────────────────────────────────────
const bounceIcon = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── adaptador (igual que antes) ───────────────────────────────────────────────
const adaptarAsignacion = (a: AsignacionDocente): MateriaDocente => ({
  asignacion_id: a.asignacion_id,
  materia_nombre: a.materia_nombre,
  materia_codigo: a.materia_codigo,
  paralelo_nombre: a.paralelo_nombre,
  grado_nombre: a.grado_nombre,
  turno_nombre: a.turno_nombre,
  turno_hora_inicio: a.turno_hora_inicio,
  turno_hora_fin: a.turno_hora_fin,
  total_estudiantes: Number(a.total_estudiantes),
  color: a.materia_color ?? undefined,
  lista_pasada_hoy: false,
  hora_ultimo_registro: undefined,
});

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA
// ─────────────────────────────────────────────────────────────────────────────
export default function DocenteSeguimientoPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useAuth();

  // ── tokens (mismo sistema que notas / NuevoHorarioModal) ──
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${brand} 0%, ${brandEnd} 100%)`;

  // ── hooks (sin cambios) ──
  const {
    asignaciones,
    isLoading: loadingMaterias,
    sinAsignaciones,
    refrescar: refrescarAsignaciones,
  } = useMisAsignaciones();

  const [materiaSeleccionada, setMateriaSeleccionada] = useState<number | null>(null);
  const asignacionActual = asignaciones.find(a => a.asignacion_id === materiaSeleccionada);

  const {
    resumen,
    isLoading: loadingResumen,
    estudiantesUrgentes,
    cargar: cargarResumen,
    refrescar: refrescarResumen,
  } = useResumenPorAsignacion();

  const [estudianteSeleccionado, setEstudianteSeleccionado] =
    useState<ResumenEstudianteAsignacion | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [snack, setSnack] = useState<{
    open: boolean; msg: string; severity: 'success' | 'error' | 'info';
  }>({ open: false, msg: '', severity: 'success' });

  const showSnack = (msg: string, severity: 'success' | 'error' | 'info' = 'success') =>
    setSnack({ open: true, msg, severity });

  // ── handlers (sin cambios) ──
  const handleSeleccionarMateria = useCallback(async (asignacionId: number) => {
    if (asignacionId === materiaSeleccionada) {
      setMateriaSeleccionada(null);
      setEstudianteSeleccionado(null);
      setDrawerOpen(false);
      return;
    }
    setMateriaSeleccionada(asignacionId);
    setEstudianteSeleccionado(null);
    setDrawerOpen(false);
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
    refrescarResumen();
  }, [refrescarResumen]);

  const materiasAdaptadas = asignaciones.map(adaptarAsignacion);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* ══ HEADER — mismo patrón que gestión de notas ══ */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>

              {/* Título + subtítulo */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <PsychologyIcon sx={{
                    color: brand,
                    fontSize: 36,
                    animation: `${bounceIcon} 1.5s ease-in-out infinite`,
                  }} />
                  <Typography variant="h1" sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    fontWeight: 800,
                    background: gradBg,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Seguimiento Pedagógico
                  </Typography>
                </Box>

                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Hola, <strong>{user?.username}</strong>
                  {asignaciones.length > 0 && (
                    <>
                      {' — '}
                      <Box component="span" sx={{ color: brand, fontWeight: 700 }}>
                        {asignaciones.length} materia{asignaciones.length > 1 ? 's' : ''} asignada{asignaciones.length > 1 ? 's' : ''}
                      </Box>
                    </>
                  )}
                  {!materiaSeleccionada && ' · Seleccioná una materia para ver el seguimiento.'}
                </Typography>

                {/* Chip urgentes globales */}
                {estudiantesUrgentes.length > 0 && (
                  <Chip
                    icon={<ErrorIcon sx={{ fontSize: '13px !important', color: '#dc2626 !important' }} />}
                    label={`${estudiantesUrgentes.length} estudiante${estudiantesUrgentes.length > 1 ? 's' : ''} con observaciones urgentes`}
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor: alpha('#dc2626', 0.08),
                      color: '#dc2626',
                      border: `1px solid ${alpha('#dc2626', 0.2)}`,
                      fontWeight: 700,
                      fontSize: '0.72rem',
                    }}
                  />
                )}
              </Box>

              {/* Botón refrescar */}
              <Tooltip title="Refrescar materias">
                <IconButton
                  onClick={refrescarAsignaciones}
                  disabled={loadingMaterias}
                  size="small"
                  sx={{
                    border: `1px solid ${alpha(brand, 0.25)}`,
                    color: brand,
                    '&:hover': {
                      bgcolor: alpha(brand, 0.08),
                      transform: 'rotate(180deg)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Fade>

        {/* ══ LOADING ══ */}
        {loadingMaterias && (
          <LinearProgress
            sx={{
              borderRadius: 4,
              height: 4,
              mb: 3,
              bgcolor: alpha(brand, 0.1),
              '& .MuiLinearProgress-bar': { background: gradBg },
            }}
          />
        )}

        {/* ══ SIN ASIGNACIONES ══ */}
        {sinAsignaciones && (
          <Fade in>
            <Alert
              severity="info"
              sx={{
                mb: 4,
                borderRadius: 3,
                background: alpha(brand, 0.06),
                color: brand,
                border: `1px solid ${alpha(brand, 0.2)}`,
                '& .MuiAlert-icon': { color: brand },
              }}
              action={
                <Button
                  size="small"
                  onClick={refrescarAsignaciones}
                  sx={{ fontWeight: 700, color: brand }}
                >
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
        <Box sx={{ mb: 4, animation: `${fadeUp} 0.35s ease-out 0.07s both` }}>
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
            <Box sx={{ mb: 5, animation: `${fadeUp} 0.35s ease-out` }}>

              {/* Breadcrumb — mismo estilo que notas */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 3,
              }}>
                <Typography variant="caption" color="text.disabled" fontWeight={700}>
                  Mis Materias
                </Typography>
                <NavigateNextIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                <Typography variant="caption" fontWeight={800} sx={{
                  background: gradBg,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {asignacionActual?.materia_nombre} — {asignacionActual?.grado_nombre} "{asignacionActual?.paralelo_nombre}"
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
                  Seleccioná un estudiante para ver su historial o registrar una observación
                </Typography>
              </Box>

              {/* Loading resumen */}
              {loadingResumen && (
                <LinearProgress
                  sx={{
                    borderRadius: 4,
                    height: 4,
                    mb: 3,
                    bgcolor: alpha(brand, 0.1),
                    '& .MuiLinearProgress-bar': { background: gradBg },
                  }}
                />
              )}

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

      {/* ══ MODAL: Historial + Nueva Observación ══ */}
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
              snack.severity === 'success' ? gradBg :
                snack.severity === 'error' ? 'linear-gradient(135deg,#ef4444,#f87171)' :
                  'linear-gradient(135deg,#8b5cf6,#a78bfa)',
            color: isDark ? '#000' : '#fff',
            boxShadow:
              snack.severity === 'success' ? `0 8px 32px ${alpha(brand, 0.4)}` :
                snack.severity === 'error' ? '0 8px 32px rgba(239,68,68,0.4)' :
                  '0 8px 32px rgba(139,92,246,0.4)',
            border: 'none',
            '& .MuiAlert-icon': { color: isDark ? '#000' : '#fff' },
            '& .MuiAlert-action .MuiIconButton-root': { color: isDark ? '#000' : '#fff' },
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}