'use client';
// app/dashboard/padre/asistencia/page.tsx

import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Chip,
  Button,
  Tab,
  Tabs,
  Fade,
  Avatar,
  Skeleton,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import { keyframes } from '@mui/system';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import BarChartIcon from '@mui/icons-material/BarChart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

import ResumenHijo from '@/components/padre/asistencia/ResumenHijo';
import HistorialAsistencia from '@/components/padre/asistencia/HistorialAsistencia';
import SolicitarPermisoModal from '@/components/padre/asistencia/SolicitarPermisoModal';
import MisPermisos from '@/components/padre/asistencia/MisPermisos';

import { useAuth } from '@/context/AuthContext';
import {
  useHijosDelPadre,
  useResumenAsistencia,
  useHistorialAsistencia,
  usePermisosHijo,
} from '@/hooks/usePadreAsistencia';
import { EstadoPermiso } from '@/types/padreAsistenciaTypes';

// ──────────────────────────────────────────────
// ANIMACIONES
// ──────────────────────────────────────────────

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const bounceIcon = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
`;

const shimmer = keyframes`
  0%   { background-position: -1000px 0; }
  100% { background-position:  1000px 0; }
`;

// ──────────────────────────────────────────────
// SELECTOR DE HIJO
// ──────────────────────────────────────────────

const SelectorHijo: React.FC<{
  hijos: any[];
  hijoActivo: any;
  onSeleccionar: (hijo: any) => void;
  isLoading: boolean;
}> = ({ hijos, hijoActivo, onSeleccionar, isLoading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[1, 2].map(i => <Skeleton key={i} variant="rounded" width={180} height={60} sx={{ borderRadius: 3 }} />)}
      </Box>
    );
  }

  if (hijos.length <= 1) return null;

  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
      {hijos.map(hijo => {
        const activo = hijo.estudiante_id === hijoActivo?.estudiante_id;
        return (
          <Box
            key={hijo.estudiante_id}
            onClick={() => onSeleccionar(hijo)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: 3,
              cursor: 'pointer',
              border: `2px solid ${activo
                ? (isDark ? '#60a5fa' : '#3b82f6')
                : (isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08))}`,
              background: activo
                ? isDark
                  ? alpha('#3b82f6', 0.15)
                  : alpha('#3b82f6', 0.06)
                : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                border: `2px solid ${isDark ? '#60a5fa' : '#3b82f6'}`,
                background: isDark ? alpha('#3b82f6', 0.1) : alpha('#3b82f6', 0.04),
              },
            }}
          >
            <Avatar
              src={hijo.foto_url ?? undefined}
              sx={{
                width: 36,
                height: 36,
                fontSize: 14,
                fontWeight: 800,
                bgcolor: activo
                  ? isDark ? '#2563eb' : '#3b82f6'
                  : isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
              }}
            >
              {hijo.nombres.charAt(0)}{hijo.apellidos.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                {hijo.nombres.split(' ')[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {hijo.grado_nombre} "{hijo.paralelo_nombre}"
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

// ──────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ──────────────────────────────────────────────

export default function PadreAsistenciaPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useAuth();

  // ─── Estado de UI ───
  const [tabActivo, setTabActivo] = useState(0);
  const [modalPermisoOpen, setModalPermisoOpen] = useState(false);
  const [filtroEstadoPermisos, setFiltroEstadoPermisos] = useState<EstadoPermiso | ''>('');

  // ─── Hooks de datos ───
  const { hijos, hijoActivo, setHijoActivo, isLoading: loadingHijos, refrescar: refrescarHijos } = useHijosDelPadre();

  const {
    resumen,
    isLoading: loadingResumen,
    materiasEnRiesgo,
    refrescar: refrescarResumen,
  } = useResumenAsistencia(hijoActivo?.matricula_id ?? null);

  const {
    asistencias,
    paginacion: paginacionHistorial,
    filtros: filtrosHistorial,
    isLoading: loadingHistorial,
    actualizarFiltros: actualizarFiltrosHistorial,
    cambiarPagina: cambiarPaginaHistorial,
    setMatriculaId,
  } = useHistorialAsistencia(hijoActivo?.matricula_id ?? null);

  const {
    solicitudes,
    paginacion: paginacionPermisos,
    isLoading: loadingPermisos,
    isSubmitting: submittingPermisos,
    pendientes,
    actualizarFiltros: actualizarFiltrosPermisos,
    crear: crearPermiso,
    cancelar: cancelarPermiso,
    refrescar: refrescarPermisos,
  } = usePermisosHijo(hijoActivo?.estudiante_id ?? null);

  // ─── Handlers ───
  const handleSeleccionarHijo = useCallback((hijo: any) => {
    setHijoActivo(hijo);
    setMatriculaId(hijo.matricula_id);
    refrescarResumen();
  }, [setHijoActivo, setMatriculaId, refrescarResumen]);

  const handleFiltroHistorial = useCallback((key: string, value: any) => {
    actualizarFiltrosHistorial({ [key]: value });
  }, [actualizarFiltrosHistorial]);

  const handleFiltroEstadoPermisos = useCallback((estado: EstadoPermiso | '') => {
    setFiltroEstadoPermisos(estado);
    actualizarFiltrosPermisos({ estado: estado || undefined });
  }, [actualizarFiltrosPermisos]);

  const handleCrearPermiso = useCallback(async (data: any, archivo?: File) => {
    const ok = await crearPermiso(data, archivo);
    if (ok) setModalPermisoOpen(false);
    return ok;
  }, [crearPermiso]);

  // Materias disponibles para los filtros del historial
  const materiasDisponibles = resumen?.por_materia.map(m => ({
    asignacion_id: m.asignacion_id,
    materia_nombre: m.materia_nombre,
  })) ?? [];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark
          ? 'radial-gradient(circle at top right, rgba(59,130,246,0.04), transparent 60%)'
          : 'radial-gradient(circle at top right, rgba(59,130,246,0.02), transparent 60%)',
      }}
    >
      <Container maxWidth="xl" disableGutters>
        {/* ══════════ HEADER ══════════ */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 4, pt: 3 }}>
            <Box
              sx={{
                p: 3.5,
                borderRadius: 4,
                background: isDark
                  ? 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
                  : '#fff',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.06)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Shimmer */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(90deg, transparent, ${alpha('#fff', isDark ? 0.03 : 0.08)}, transparent)`,
                  backgroundSize: '1000px 100%',
                  animation: `${shimmer} 4s linear infinite`,
                  pointerEvents: 'none',
                }}
              />

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isDark
                        ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                        : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      boxShadow: '0 6px 20px rgba(59,130,246,0.4)',
                      animation: `${bounceIcon} 4s ease-in-out infinite`,
                    }}
                  >
                    <FamilyRestroomIcon sx={{ fontSize: 30, color: '#fff' }} />
                  </Box>

                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight={900}
                      sx={{
                        background: isDark
                          ? 'linear-gradient(135deg, #60a5fa, #3b82f6)'
                          : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: -0.5,
                        lineHeight: 1.2,
                      }}
                    >
                      Asistencia escolar
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.25 }}>
                      {user?.username && <>Hola, <strong>{user.username}</strong> · </>}
                      {hijoActivo ? (
                        <>
                          Seguimiento de{' '}
                          <Box
                            component="span"
                            sx={{
                              color: isDark ? '#60a5fa' : '#3b82f6',
                              fontWeight: 800,
                            }}
                          >
                            {hijoActivo.nombres} {hijoActivo.apellidos}
                          </Box>
                        </>
                      ) : 'Cargando datos...'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  {/* Badge de materias en riesgo */}
                  {materiasEnRiesgo.length > 0 && (
                    <Chip
                      icon={<WarningAmberIcon sx={{ fontSize: '16px !important' }} />}
                      label={`${materiasEnRiesgo.length} materia${materiasEnRiesgo.length > 1 ? 's' : ''} en riesgo`}
                      size="small"
                      sx={{
                        height: 28,
                        fontWeight: 800,
                        fontSize: 12,
                        bgcolor: isDark ? alpha('#f59e0b', 0.15) : alpha('#f59e0b', 0.1),
                        color: isDark ? '#fbbf24' : '#d97706',
                        border: `1px solid ${alpha('#f59e0b', 0.3)}`,
                        borderRadius: 2,
                        '& .MuiChip-icon': { color: isDark ? '#fbbf24' : '#d97706' },
                      }}
                    />
                  )}

                  {/* Badge de permisos pendientes */}
                  {pendientes.length > 0 && (
                    <Chip
                      icon={<AccessTimeRoundedIcon sx={{ fontSize: '16px !important' }} />}
                      label={`${pendientes.length} permiso${pendientes.length > 1 ? 's' : ''} pendiente${pendientes.length > 1 ? 's' : ''}`}
                      size="small"
                      sx={{
                        height: 28,
                        fontWeight: 800,
                        fontSize: 12,
                        bgcolor: isDark ? alpha('#f59e0b', 0.12) : alpha('#f59e0b', 0.08),
                        color: isDark ? '#fbbf24' : '#d97706',
                        border: `1px solid ${alpha('#f59e0b', 0.25)}`,
                        borderRadius: 2,
                        '& .MuiChip-icon': { color: isDark ? '#fbbf24' : '#d97706' },
                      }}
                    />
                  )}

                  {/* Botón solicitar permiso */}
                  <Button
                    variant="contained"
                    startIcon={<NoteAddIcon />}
                    onClick={() => setModalPermisoOpen(true)}
                    disabled={!hijoActivo}
                    sx={{
                      borderRadius: 2.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 2.5,
                      background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                      boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(245,158,11,0.4)',
                        transform: 'translateY(-1px)',
                      },
                      '&.Mui-disabled': { opacity: 0.5 },
                    }}
                  >
                    Solicitar permiso
                  </Button>

                  <Tooltip title="Actualizar datos">
                    <IconButton
                      onClick={() => { refrescarResumen(); refrescarPermisos(); }}
                      size="small"
                      sx={{
                        bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                        border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                        borderRadius: 2,
                        '&:hover': { bgcolor: isDark ? alpha('#3b82f6', 0.15) : alpha('#3b82f6', 0.08), transform: 'rotate(180deg)' },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <RefreshIcon sx={{ fontSize: 18, color: isDark ? '#60a5fa' : '#3b82f6' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Info del hijo activo */}
              {hijoActivo && (
                <Box
                  sx={{
                    mt: 2.5,
                    pt: 2.5,
                    borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    flexWrap: 'wrap',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {[
                    { label: hijoActivo.nivel_nombre },
                    { label: `${hijoActivo.grado_nombre} "${hijoActivo.paralelo_nombre}"` },
                    { label: hijoActivo.turno_nombre },
                    { label: hijoActivo.periodo_nombre },
                  ].map((item, i) => (
                    <Chip
                      key={i}
                      label={item.label}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: 11,
                        fontWeight: 700,
                        bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                        borderRadius: 1.5,
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Fade>

        {/* ══════════ SELECTOR DE HIJO ══════════ */}
        <SelectorHijo
          hijos={hijos}
          hijoActivo={hijoActivo}
          onSeleccionar={handleSeleccionarHijo}
          isLoading={loadingHijos}
        />

        {/* ══════════ TABS ══════════ */}
        <Box sx={{ animation: `${fadeSlideUp} 0.5s ease-out 0.15s both` }}>
          <Box
            sx={{
              mb: 3,
              borderRadius: 3,
              background: isDark ? alpha('#fff', 0.03) : '#fff',
              border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={tabActivo}
              onChange={(_, v) => setTabActivo(v)}
              sx={{
                minHeight: 52,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  minHeight: 52,
                  color: 'text.secondary',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    color: isDark ? '#60a5fa' : '#3b82f6',
                  },
                },
                '& .MuiTabs-indicator': {
                  background: isDark
                    ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                    : 'linear-gradient(90deg, #3b82f6, #2563eb)',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab
                label="Resumen"
                icon={<BarChartIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
              <Tab
                label="Historial"
                icon={<ListAltIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    Mis permisos
                    {pendientes.length > 0 && (
                      <Chip
                        label={pendientes.length}
                        size="small"
                        sx={{
                          height: 18,
                          minWidth: 18,
                          fontSize: 10,
                          fontWeight: 900,
                          bgcolor: '#f59e0b',
                          color: '#fff',
                          borderRadius: '9px',
                          '& .MuiChip-label': { px: 0.75 },
                        }}
                      />
                    )}
                  </Box>
                }
                icon={<EventBusyIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* ─── Tab 0: Resumen ─── */}
          {tabActivo === 0 && (
            <Fade in timeout={300}>
              <Box>
                <ResumenHijo resumen={resumen} isLoading={loadingResumen} />
              </Box>
            </Fade>
          )}

          {/* ─── Tab 1: Historial ─── */}
          {tabActivo === 1 && (
            <Fade in timeout={300}>
              <Box>
                <HistorialAsistencia
                  asistencias={asistencias}
                  paginacion={paginacionHistorial}
                  isLoading={loadingHistorial}
                  filtros={filtrosHistorial}
                  onFiltroChange={handleFiltroHistorial}
                  onPaginaChange={cambiarPaginaHistorial}
                  materiasDisponibles={materiasDisponibles}
                />
              </Box>
            </Fade>
          )}

          {/* ─── Tab 2: Mis permisos ─── */}
          {tabActivo === 2 && (
            <Fade in timeout={300}>
              <Box>
                <MisPermisos
                  solicitudes={solicitudes}
                  paginacion={paginacionPermisos}
                  isLoading={loadingPermisos}
                  isSubmitting={submittingPermisos}
                  filtroEstado={filtroEstadoPermisos}
                  onFiltroEstadoChange={handleFiltroEstadoPermisos}
                  onPaginaChange={(p) => actualizarFiltrosPermisos({ page: p })}
                  onCancelar={cancelarPermiso}
                  pendientesCount={pendientes.length}
                />
              </Box>
            </Fade>
          )}
        </Box>

        {/* Padding final */}
        <Box sx={{ height: 48 }} />
      </Container>

      {/* ══════════ MODAL SOLICITAR PERMISO ══════════ */}
      <SolicitarPermisoModal
        open={modalPermisoOpen}
        onClose={() => setModalPermisoOpen(false)}
        onSubmit={handleCrearPermiso}
        hijo={hijoActivo}
        materiasDisponibles={materiasDisponibles}
        isSubmitting={submittingPermisos}
      />
    </Box>
  );
}