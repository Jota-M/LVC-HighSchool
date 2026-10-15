// components/preinscripcion/revision/layout.tsx
'use client';

import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Chip,
  Paper,
  Stack,
  IconButton,
  Button,
  Tooltip,
  useTheme,
  alpha,
  Avatar,
  Alert,
  AlertTitle,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useRouter } from 'next/navigation';

import { usePreinscripcionDetalle } from '@/hooks/usePreinscripcionDetalle';
import ProgresoStepper from './ProgresoStepper';
import PasoDatosPersonales from './PasoDatosPersonales';
import PasoEntrevista from './PasoEntrevista';
import PasoDecisionFinal from './PasoDecisionFinal';

interface RevisionLayoutProps {
  id: string | string[];
}

export default function RevisionLayout({ id }: RevisionLayoutProps) {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';
  const accentDark = isDark ? '#f59e0b' : '#01579b';

  const hookData = usePreinscripcionDetalle(id);
  const { preinscripcion, loading, error, activeStep, setActiveStep, fetchPreinscripcion } = hookData;
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    if (preinscripcion?.codigo_inscripcion) {
      navigator.clipboard.writeText(preinscripcion.codigo_inscripcion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getEstadoColor = (estado: string) => {
    const map: Record<string, { label: string; color: string }> = {
      aprobada: { label: 'Aprobada', color: '#10b981' },
      rechazada: { label: 'Rechazada', color: '#ef4444' },
      en_espera: { label: 'En Lista de Espera', color: '#f59e0b' },
      en_revision: { label: 'En Revisión', color: '#9c27b0' },
      datos_completos: { label: 'Datos Completos', color: '#0288d1' },
      documentos_aprobados: { label: 'Docs Aprobados', color: '#06b6d4' },
      documentos_pendientes: { label: 'Docs Pendientes', color: '#f59e0b' },
      entrevista_pendiente: { label: 'Entrevista Pendiente', color: '#f59e0b' },
      entrevista_programada: { label: 'Entrevista Programada', color: '#3b82f6' },
      entrevista_completada: { label: 'Entrevista Lista', color: '#10b981' },
      convertida: { label: 'Inscrito / Matriculado', color: '#10b981' },
    };
    return map[estado?.toLowerCase()] || { label: estado || 'Pendiente', color: '#757575' };
  };

  // Loading state
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="70vh"
        gap={2}
      >
        <CircularProgress size={56} sx={{ color: accent }} />
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          Cargando expediente de preinscripción...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error || !preinscripcion) {
    return (
      <Box p={{ xs: 2, sm: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '20px',
            border: `1px solid ${alpha('#ef4444', 0.3)}`,
            bgcolor: alpha('#ef4444', 0.05),
          }}
        >
          <Alert severity="error" sx={{ borderRadius: '12px', mb: 2 }}>
            <AlertTitle>Error al cargar preinscripción</AlertTitle>
            {error || 'No se encontró la información solicitada.'}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard/preinscripciones')}
            sx={{
              borderRadius: '12px',
              borderColor: alpha(accent, 0.5),
              color: accent,
            }}
          >
            Volver a la lista
          </Button>
        </Paper>
      </Box>
    );
  }

  const nombreCompleto = `${preinscripcion.estudiante.nombres} ${preinscripcion.estudiante.apellido_paterno} ${preinscripcion.estudiante.apellido_materno || ''}`.trim();
  const iniciales = `${preinscripcion.estudiante.nombres?.[0] || '?'}${preinscripcion.estudiante.apellido_paterno?.[0] || '?'}`.toUpperCase();
  const estadoInfo = getEstadoColor(preinscripcion.estado);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* HEADER HERO CARD - ESTILO TARJETA MODULAR (SIN LÍNEA SUPERIOR) */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '24px',
          border: `1px solid ${alpha(accent, 0.3)}`,
          overflow: 'hidden',
          mb: 3,
          background: isDark
            ? 'linear-gradient(180deg, #0e1726 0%, #0b1320 100%)'
            : '#ffffff',
          boxShadow: isDark
            ? '0 12px 36px rgba(0, 0, 0, 0.45)'
            : '0 8px 24px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: accent,
            boxShadow: isDark
              ? `0 14px 40px ${alpha(accent, 0.25)}, 0 0 20px ${alpha(accent, 0.15)}`
              : `0 14px 30px ${alpha(accent, 0.2)}`,
            transform: 'translateY(-3px)',
          },
        }}
      >
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          {/* Fila superior: Navegación y Acciones */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 2.5,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Tooltip title="Volver a la lista de preinscripciones">
                <IconButton
                  onClick={() => router.push('/dashboard/preinscripciones')}
                  sx={{
                    borderRadius: '12px',
                    border: `1px solid ${alpha(accent, 0.3)}`,
                    color: alpha(accent, 0.9),
                    backgroundColor: alpha(accent, 0.08),
                    '&:hover': {
                      backgroundColor: alpha(accent, 0.18),
                      borderColor: accent,
                      color: accent,
                      transform: 'translateX(-2px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>

              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Gestión de Preinscripciones / Expediente Detallado
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Tooltip title="Actualizar expediente">
                <IconButton
                  onClick={() => fetchPreinscripcion()}
                  sx={{
                    borderRadius: '12px',
                    border: `1px solid ${alpha(accent, 0.3)}`,
                    color: alpha(accent, 0.9),
                    backgroundColor: alpha(accent, 0.08),
                    '&:hover': {
                      backgroundColor: alpha(accent, 0.18),
                      borderColor: accent,
                      color: accent,
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Button
                variant="outlined"
                size="small"
                onClick={() => router.push('/dashboard/preinscripciones')}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  py: 0.8,
                  borderColor: alpha(accent, 0.5),
                  color: accent,
                  backgroundColor: alpha(accent, 0.05),
                  '&:hover': {
                    borderColor: accent,
                    backgroundColor: alpha(accent, 0.12),
                  },
                }}
              >
                Volver a la Lista
              </Button>
            </Stack>
          </Box>

          {/* Fila principal: Avatar, Nombre, Chips de Estado */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2.5,
              pb: 2.5,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            }}
          >
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Avatar
                src={preinscripcion.estudiante.foto_url || undefined}
                sx={{
                  width: { xs: 60, sm: 68 },
                  height: { xs: 60, sm: 68 },
                  borderRadius: '50%',
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  color: isDark ? '#000' : '#fff',
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  boxShadow: isDark
                    ? '0 4px 20px rgba(250, 204, 21, 0.35)'
                    : '0 4px 20px rgba(2, 136, 209, 0.35)',
                }}
              >
                {iniciales}
              </Avatar>

              <Box>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
                  <Typography variant="h5" fontWeight={800} color="text.primary">
                    {nombreCompleto}
                  </Typography>

                  {/* Chip de Código con botón de copiar */}
                  <Chip
                    label={preinscripcion.codigo_inscripcion}
                    onClick={handleCopyCode}
                    deleteIcon={
                      copied ? (
                        <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />
                      ) : (
                        <ContentCopyIcon sx={{ fontSize: 15 }} />
                      )
                    }
                    onDelete={handleCopyCode}
                    size="small"
                    sx={{
                      borderRadius: '16px',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      letterSpacing: '0.5px',
                      bgcolor: isDark ? 'rgba(15, 23, 42, 0.8)' : alpha('#000', 0.05),
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : `1px solid ${alpha(accent, 0.3)}`,
                      color: accent,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(accent, 0.15),
                        borderColor: accent,
                      },
                    }}
                  />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Postulante a preinscripción escolar en el sistema LVC
                </Typography>
              </Box>
            </Stack>

            {/* Badges de Estado y Cupo */}
            <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
              {/* Badge de Estado del Trámite */}
              <Chip
                label={estadoInfo.label}
                sx={{
                  borderRadius: '20px',
                  fontWeight: 700,
                  px: 1.5,
                  py: 1.8,
                  bgcolor: alpha(estadoInfo.color, 0.15),
                  color: estadoInfo.color,
                  border: `1.5px solid ${alpha(estadoInfo.color, 0.45)}`,
                  boxShadow: `0 4px 14px ${alpha(estadoInfo.color, 0.15)}`,
                }}
              />

              {/* Badge de Cupo Asignado / Lista de Espera / Sin Cupo */}
              {preinscripcion.tiene_cupo_asignado ? (
                <Chip
                  icon={<EventAvailableIcon sx={{ color: '#fff !important' }} />}
                  label="Cupo Asignado"
                  sx={{
                    borderRadius: '20px',
                    fontWeight: 700,
                    px: 1.5,
                    py: 1.8,
                    bgcolor: '#10b981',
                    color: '#fff',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                  }}
                />
              ) : preinscripcion.estado === 'en_espera' ? (
                <Chip
                  icon={<HourglassEmptyIcon sx={{ color: '#fff !important' }} />}
                  label={`Lista de Espera #${preinscripcion.posicion_espera || 1}`}
                  sx={{
                    borderRadius: '20px',
                    fontWeight: 700,
                    px: 1.5,
                    py: 1.8,
                    bgcolor: '#d97706',
                    color: '#fff',
                    boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
                  }}
                />
              ) : (
                <Chip
                  icon={<EventBusyIcon sx={{ color: '#fff !important' }} />}
                  label="Sin Cupo Asignado"
                  sx={{
                    borderRadius: '20px',
                    fontWeight: 700,
                    px: 1.5,
                    py: 1.8,
                    bgcolor: '#f59e0b',
                    color: '#fff',
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                  }}
                />
              )}
            </Stack>
          </Box>

          {/* Fila de Metadatos Rápidos (Periodo, Grado, Turno, Tutor) */}
          <Box
            sx={{
              pt: 2.5,
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 2,
            }}
          >
            {/* Periodo */}
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(0, 0, 0, 0.02)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: accent,
                  boxShadow: isDark ? `0 4px 16px ${alpha(accent, 0.2)}` : `0 4px 14px ${alpha(accent, 0.12)}`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  bgcolor: alpha(accent, 0.15),
                  color: accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EventIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.5px">
                  PERIODO
                </Typography>
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  {preinscripcion.periodo_nombre || 'Gestión Vigente'}
                </Typography>
              </Box>
            </Box>

            {/* Grado Solicitado */}
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(0, 0, 0, 0.02)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: '#10b981',
                  boxShadow: isDark ? '0 4px 16px rgba(16, 185, 129, 0.2)' : '0 4px 14px rgba(16, 185, 129, 0.12)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  bgcolor: alpha('#10b981', 0.15),
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SchoolIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.5px">
                  GRADO
                </Typography>
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  {preinscripcion.grado_nombre || preinscripcion.estudiante.grado_solicitado || 'Sin grado'}
                </Typography>
              </Box>
            </Box>

            {/* Turno */}
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(0, 0, 0, 0.02)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: '#9c27b0',
                  boxShadow: isDark ? '0 4px 16px rgba(156, 39, 176, 0.2)' : '0 4px 14px rgba(156, 39, 176, 0.12)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  bgcolor: alpha('#9c27b0', 0.15),
                  color: '#9c27b0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AccessTimeIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.5px">
                  TURNO
                </Typography>
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  {preinscripcion.turno_nombre || preinscripcion.estudiante.turno_solicitado || 'Mañana'}
                </Typography>
              </Box>
            </Box>

            {/* Tutor Principal */}
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(0, 0, 0, 0.02)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: '#3b82f6',
                  boxShadow: isDark ? '0 4px 16px rgba(59, 130, 246, 0.2)' : '0 4px 14px rgba(59, 130, 246, 0.12)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  bgcolor: alpha('#3b82f6', 0.15),
                  color: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonIcon fontSize="small" />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.5px">
                  TUTOR PRINCIPAL
                </Typography>
                <Typography variant="body2" fontWeight={700} color="text.primary" noWrap>
                  {`${preinscripcion.tutor.nombres} ${preinscripcion.tutor.apellido_paterno}`}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* BANNER INFORMATIVO SI ESTÁ EN LISTA DE ESPERA */}
      {preinscripcion.estado === 'en_espera' && (
        <Alert
          severity="warning"
          icon={<HourglassEmptyIcon sx={{ fontSize: 24, color: '#d97706' }} />}
          action={
            <Button
              color="warning"
              size="medium"
              variant="contained"
              disabled={hookData.saving}
              onClick={async () => {
                const conf = window.confirm(
                  `¿Confirmas la asignación de un cupo vacante para el estudiante ${nombreCompleto}? Pasará a estado "Datos Completos" y saldrá de la lista de espera.`
                );
                if (!conf) return;
                try {
                  await hookData.promoverEspera('Promovido manualmente desde revisión de expediente');
                } catch (e: any) {
                  alert(e.message || 'Error al promover estudiante');
                }
              }}
              sx={{
                bgcolor: '#d97706',
                color: '#fff',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '12px',
                px: 2.5,
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
                '&:hover': { bgcolor: '#b45309' },
              }}
            >
              Promover a Cupo Confirmado
            </Button>
          }
          sx={{
            mb: 3,
            p: 2,
            borderRadius: '20px',
            border: '1.5px solid rgba(245, 158, 11, 0.4)',
            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#fffbeb',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.15)',
          }}
        >
          <AlertTitle sx={{ fontWeight: 800, fontSize: '1rem', color: isDark ? '#fbbf24' : '#92400e', mb: 0.5 }}>
            Postulante en Lista de Espera — Turno #{preinscripcion.posicion_espera || 1}
          </AlertTitle>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.85)' : '#78350f' }}>
            Este estudiante se inscribió cuando no existían cupos en el grado y turno solicitado. Si se ha habilitado un cupo o autorizado una excepción, pulsa en el botón para asignarle cupo y habilitar su expediente regular.
          </Typography>
        </Alert>
      )}

      {/* CUERPO PRINCIPAL: STEPPER LATERAL Y PASO ACTIVO */}
      <Grid container spacing={3}>
        {/* Panel Izquierdo - Progreso */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <ProgresoStepper
            activeStep={activeStep}
            onSelectStep={(step) => setActiveStep(step)}
          />
        </Grid>

        {/* Panel Derecho - Contenido Dinámico del Paso */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {activeStep === 0 && (
            <PasoDatosPersonales
              preinscripcion={preinscripcion}
              notasVerificacionDatos={hookData.notasVerificacionDatos}
              setNotasVerificacionDatos={hookData.setNotasVerificacionDatos}
              aprobarDatos={hookData.aprobarDatos}
              rechazar={hookData.rechazar}
              setActiveStep={hookData.setActiveStep}
              saving={hookData.saving}
            />
          )}

          {activeStep === 1 && (
            <PasoEntrevista
              preinscripcion={preinscripcion}
              setActiveStep={hookData.setActiveStep}
              cambiarEstado={hookData.cambiarEstado}
              reenviarWhatsApp={hookData.reenviarWhatsApp}
              saving={hookData.saving}
            />
          )}

          {activeStep === 2 && (
            <PasoDecisionFinal
              preinscripcion={preinscripcion}
              notasDecisionFinal={hookData.notasDecisionFinal}
              setNotasDecisionFinal={hookData.setNotasDecisionFinal}
              decisionFinal={hookData.decisionFinal}
              setDecisionFinal={hookData.setDecisionFinal}
              confirmarDecision={hookData.confirmarDecision}
              setActiveStep={hookData.setActiveStep}
              saving={hookData.saving}
              cuposDisponibles={hookData.cuposDisponibles}
              cupoSeleccionado={hookData.cupoSeleccionado}
              setCupoSeleccionado={hookData.setCupoSeleccionado}
              verificandoCupo={hookData.verificandoCupo}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}