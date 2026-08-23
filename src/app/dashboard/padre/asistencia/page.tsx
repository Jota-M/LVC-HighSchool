'use client';
// app/dashboard/padre/asistencia/page.tsx
// Restyled: header sin contenedor (mismo patrón que financiero/seguimiento/notas),
// azul fijo de página reemplazado por el token de marca compartido
// (ámbar en modo oscuro / azul en modo claro). Los chips de riesgo/pendientes
// y el botón "Solicitar permiso" son de urgencia/acción, no de marca — intactos.

import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
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
import FamilyRestroomRoundedIcon from '@mui/icons-material/FamilyRestroomRounded';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import BarChartIcon from '@mui/icons-material/BarChart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
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

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

// ─── Paleta — misma lógica dual que financiero/seguimiento/notas ───────────
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
  hijos: any[];
  hijoActivo: any;
  onSeleccionar: (hijo: any) => void;
  isLoading: boolean;
  isDark: boolean;
  primary: string;
  gradBg: string;
}> = ({ hijos, hijoActivo, onSeleccionar, isLoading, isDark, primary, gradBg }) => {
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
              border: `2px solid ${activo ? primary : (isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08))}`,
              background: activo
                ? (isDark ? alpha(primary, 0.15) : alpha(primary, 0.06))
                : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                border: `2px solid ${primary}`,
                background: isDark ? alpha(primary, 0.1) : alpha(primary, 0.04),
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
                background: activo ? gradBg : (isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)),
                color: activo ? (isDark ? '#000' : '#fff') : undefined,
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
  const { isDark, primary, gradBg } = usePalette();
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
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* ══ HEADER — mismo patrón que financiero/seguimiento/notas: sin contenedor ══ */}
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
                  <FamilyRestroomRoundedIcon
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
                    Asistencia Escolar
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
                  {user?.username ? (
                    <>Hola, <strong>{user.username}</strong> — </>
                  ) : null}
                  {hijoActivo
                    ? <>seguimiento de <strong>{hijoActivo.nombres} {hijoActivo.apellidos}</strong></>
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
                {/* Badge de materias en riesgo (urgencia — ámbar fijo) */}
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

                {/* Badge de permisos pendientes (urgencia — ámbar fijo) */}
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

                {/* Botón solicitar permiso (acción — ámbar/naranja fijo) */}
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

                <Tooltip title="Actualizar">
                  <IconButton
                    onClick={() => { refrescarResumen(); refrescarPermisos(); }}
                    size="small"
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

            {/* Chips de info del hijo activo */}
            {hijoActivo && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[
                  hijoActivo.nivel_nombre,
                  `${hijoActivo.grado_nombre} "${hijoActivo.paralelo_nombre}"`,
                  hijoActivo.turno_nombre,
                  hijoActivo.periodo_nombre,
                ].filter(Boolean).map((label, i) => (
                  <Chip
                    key={i} label={label} size="small"
                    sx={{
                      height: 24, fontSize: 11, fontWeight: 700, borderRadius: 1.5,
                      bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Fade>

        {/* ══════════ SELECTOR DE HIJO ══════════ */}
        <SelectorHijo
          hijos={hijos}
          hijoActivo={hijoActivo}
          onSeleccionar={handleSeleccionarHijo}
          isLoading={loadingHijos}
          isDark={isDark}
          primary={primary}
          gradBg={gradBg}
        />

        {/* ══════════ TABS ══════════ */}
        <Box sx={{ animation: `${fadeSlideUp} 0.5s ease-out 0.15s both`, pb: 6 }}>
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
                    color: primary,
                  },
                },
                '& .MuiTabs-indicator': {
                  background: gradBg,
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