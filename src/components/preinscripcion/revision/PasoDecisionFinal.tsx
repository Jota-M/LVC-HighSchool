// components/preinscripcion/revision/PasoDecisionFinal.tsx
'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  TextField,
  Button,
  Grid,
  Avatar,
  Alert,
  AlertTitle,
  CircularProgress,
  Stack,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import PendingIcon from '@mui/icons-material/Pending';
import SendIcon from '@mui/icons-material/Send';
import DownloadIcon from '@mui/icons-material/Download';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import SchoolIcon from '@mui/icons-material/School';
import { toast } from 'react-hot-toast';
import { PreInscripcionDetalle, EstadoPreInscripcion } from '@/types/preinscripcionTypes';

interface PasoDecisionFinalProps {
  preinscripcion: PreInscripcionDetalle;
  notasDecisionFinal: string;
  setNotasDecisionFinal: (notas: string) => void;
  decisionFinal: EstadoPreInscripcion | '';
  setDecisionFinal: (decision: EstadoPreInscripcion | '') => void;
  confirmarDecision: (notificarWhatsapp?: boolean) => Promise<void>;
  setActiveStep: (step: number) => void;
  saving: boolean;
  cuposDisponibles: any[];
  cupoSeleccionado: number | null;
  setCupoSeleccionado: (id: number | null) => void;
  verificandoCupo: boolean;
}

export default function PasoDecisionFinal({
  preinscripcion,
  notasDecisionFinal,
  setNotasDecisionFinal,
  decisionFinal,
  setDecisionFinal,
  confirmarDecision,
  setActiveStep,
  saving,
  cuposDisponibles,
  cupoSeleccionado,
  setCupoSeleccionado,
  verificandoCupo,
}: PasoDecisionFinalProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';
  const accentDark = isDark ? '#f59e0b' : '#01579b';

  // Estado para el modal de confirmación y opción de WhatsApp
  const [openModalConfirmacion, setOpenModalConfirmacion] = React.useState(false);
  const [errorModal, setErrorModal] = React.useState<string | null>(null);
  const [notificarWhatsapp, setNotificarWhatsapp] = React.useState(true);

  const handleAbrirModal = () => {
    setErrorModal(null);
    setOpenModalConfirmacion(true);
  };

  const handleAbrirModalConWA = (conWA: boolean) => {
    setNotificarWhatsapp(conWA);
    setErrorModal(null);
    setOpenModalConfirmacion(true);
  };

  const handleCerrarModal = () => {
    if (saving) return;
    setOpenModalConfirmacion(false);
    setErrorModal(null);
  };

  const handleEjecutarDecision = async (conWhatsapp?: boolean) => {
    try {
      setErrorModal(null);
      const deberiaNotificar = conWhatsapp !== undefined ? conWhatsapp : notificarWhatsapp;
      setNotificarWhatsapp(deberiaNotificar);
      await confirmarDecision(deberiaNotificar);
      toast.success(
        deberiaNotificar
          ? 'Resolución final registrada y notificación enviada por WhatsApp al tutor.'
          : 'Resolución final registrada exitosamente (sin enviar WhatsApp).'
      );
      if (openModalConfirmacion) {
        setOpenModalConfirmacion(false);
      }
    } catch (err: any) {
      const msg = err.message || 'Error al confirmar la decisión final';
      setErrorModal(msg);
      toast.error(msg);
    }
  };

  const nombreCompleto = `${preinscripcion.estudiante.nombres} ${preinscripcion.estudiante.apellido_paterno} ${preinscripcion.estudiante.apellido_materno || ''}`.trim();
  const iniciales = `${preinscripcion.estudiante.nombres?.[0] || '?'}${preinscripcion.estudiante.apellido_paterno?.[0] || '?'}`.toUpperCase();

  const calcularEdad = (fechaNacimiento?: string) => {
    if (!fechaNacimiento) return 'No especificada';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return `${edad} años`;
  };

  const getGradoLabel = (grado?: string | null) => {
    if (!grado) return 'No especificado';
    return grado.replace(/_/g, ' ');
  };

  const decisiones = [
    {
      key: 'aprobada' as EstadoPreInscripcion,
      color: '#10b981',
      lightColor: alpha('#10b981', 0.12),
      title: 'Aceptar y Admitir Estudiante',
      desc: 'Aprobar la admisión formal del estudiante para la gestión escolar solicitada.',
      icon: <CheckCircleIcon sx={{ fontSize: 26 }} />,
    },
    {
      key: 'rechazada' as EstadoPreInscripcion,
      color: '#ef4444',
      lightColor: alpha('#ef4444', 0.12),
      title: 'Denegar / Rechazar Admisión',
      desc: 'Rechazar la solicitud de preinscripción (se notificará el motivo al tutor).',
      icon: <CloseIcon sx={{ fontSize: 26 }} />,
    },
    {
      key: 'documentos_pendientes' as EstadoPreInscripcion,
      color: '#f59e0b',
      lightColor: alpha('#f59e0b', 0.12),
      title: 'Solicitar Información Adicional',
      desc: 'Requerir documentación complementaria o aclaración previa a la decisión final.',
      icon: <PendingIcon sx={{ fontSize: 26 }} />,
    },
    {
      key: 'en_espera' as EstadoPreInscripcion,
      color: '#8b5cf6',
      lightColor: alpha('#8b5cf6', 0.12),
      title: 'Mover a Lista de Espera',
      desc: 'Pasar al postulante a lista de espera y liberar su cupo (ej. inasistencia a entrevista o falta de vacante).',
      icon: <AccessTimeIcon sx={{ fontSize: 26 }} />,
    },
  ];

  const cardStyle = {
    borderRadius: '24px',
    border: `1px solid ${alpha(accent, 0.28)}`,
    overflow: 'hidden',
    background: isDark
      ? 'linear-gradient(180deg, #0e1726 0%, #0b1320 100%)'
      : '#ffffff',
    boxShadow: isDark
      ? '0 10px 30px rgba(0, 0, 0, 0.4)'
      : '0 4px 20px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    mb: 3,
    '&:hover': {
      borderColor: accent,
      boxShadow: isDark
        ? `0 14px 40px ${alpha(accent, 0.25)}, 0 0 20px ${alpha(accent, 0.15)}`
        : `0 14px 30px ${alpha(accent, 0.2)}`,
      transform: 'translateY(-3px)',
    },
  };

  const cupoInfo = cuposDisponibles[0];
  const tieneCupoAsignado = preinscripcion.tiene_cupo_asignado;

  return (
    <>
      {/* HEADER DEL PASO */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            flexWrap="wrap"
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#000' : '#fff',
                  boxShadow: isDark
                    ? '0 4px 16px rgba(250,204,21,0.35)'
                    : '0 4px 16px rgba(2,136,209,0.35)',
                }}
              >
                <TaskAltIcon sx={{ fontSize: 28 }} />
              </Box>

              <Box>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  Paso 3: Decisión Final y Asignación de Cupo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Resolución del expediente de admisión y notificación a los padres
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
              label="Etapa Resolutiva"
              sx={{
                borderRadius: '10px',
                fontWeight: 600,
                bgcolor: alpha(accent, 0.12),
                color: accent,
                border: `1px solid ${alpha(accent, 0.3)}`,
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* RESUMEN DEL PROCESO PREVIO */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box
              sx={{
                width: 5,
                height: 22,
                borderRadius: 1,
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
              }}
            />
            <Typography variant="h6" fontWeight={700} color="text.primary">
              Resumen de Fases Evaluadas
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {[
              {
                title: 'Datos Personales y Tutores',
                desc: 'Información del estudiante y tutores legales',
                status: 'Confirmados',
                color: '#10b981',
              },
              {
                title: 'Entrevista de Admisión',
                desc: 'Evaluación y reunión directiva',
                status: preinscripcion.estado.includes('entrevista') ? 'Realizada / Coordinada' : 'Completada',
                color: '#10b981',
              },
            ].map((fase, idx) => (
              <Grid size={{ xs: 12, md: 6 }} key={idx}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    bgcolor: isDark ? alpha('#fff', 0.03) : alpha(accent, 0.03),
                    border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha(accent, 0.15)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: '10px',
                      bgcolor: alpha(fase.color, 0.15),
                      color: fase.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircleIcon fontSize="small" />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                      {fase.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {fase.desc}
                    </Typography>
                  </Box>
                  <Chip
                    label={fase.status}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      bgcolor: alpha(fase.color, 0.15),
                      color: fase.color,
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      {/* GESTIÓN DE CUPO (MOSTRAR SI DECIDE APROBAR) */}
      {decisionFinal === 'aprobada' && (
        <Paper elevation={0} sx={cardStyle}>
          <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box
                sx={{
                  width: 5,
                  height: 22,
                  borderRadius: 1,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                }}
              />
              <Typography variant="h6" fontWeight={700} color="text.primary">
                Asignación de Vacante / Cupo
              </Typography>
            </Box>

            {verificandoCupo ? (
              <Box textAlign="center" py={4}>
                <CircularProgress size={38} sx={{ color: accent }} />
                <Typography variant="body2" color="text.secondary" mt={2}>
                  Verificando aforo y cupos en tiempo real...
                </Typography>
              </Box>
            ) : tieneCupoAsignado ? (
              <Alert
                severity="success"
                icon={<EventAvailableIcon />}
                sx={{
                  borderRadius: '14px',
                  bgcolor: alpha('#10b981', 0.1),
                  border: `1.5px solid ${alpha('#10b981', 0.35)}`,
                }}
              >
                <AlertTitle sx={{ fontWeight: 700, color: '#10b981' }}>
                  Cupo Previamente Asignado
                </AlertTitle>
                <Typography variant="body2" color="text.primary" mb={1.5}>
                  Este postulante ya cuenta con una vacante reservada en el sistema.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    label={`Grado: ${preinscripcion.grado_nombre || 'Registrado'}`}
                    size="small"
                    sx={{ bgcolor: alpha('#10b981', 0.2), color: '#10b981', fontWeight: 700 }}
                  />
                  <Chip
                    label={`Turno: ${preinscripcion.turno_nombre || 'Mañana'}`}
                    size="small"
                    sx={{ bgcolor: alpha('#10b981', 0.2), color: '#10b981', fontWeight: 700 }}
                  />
                  <Chip
                    label={`Periodo: ${preinscripcion.periodo_nombre || 'Gestión Vigente'}`}
                    size="small"
                    sx={{ bgcolor: alpha('#10b981', 0.2), color: '#10b981', fontWeight: 700 }}
                  />
                </Stack>
              </Alert>
            ) : cupoInfo ? (
              <>
                <Alert
                  severity="info"
                  sx={{
                    mb: 2.5,
                    borderRadius: '14px',
                    bgcolor: alpha(accent, 0.08),
                    border: `1px solid ${alpha(accent, 0.25)}`,
                    color: 'text.primary',
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 700, color: accent }}>
                    Cupo Disponible para Asignación
                  </AlertTitle>
                  Al confirmar la aprobación, el sistema descontará 1 vacante de la configuración oficial.
                </Alert>

                {/* Tarjeta de Cupo con estilo CuposTab */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    bgcolor: isDark ? alpha('#fff', 0.03) : alpha(accent, 0.03),
                    border: `1.5px solid ${alpha(accent, 0.3)}`,
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        GRADO Y TURNO
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                        {cupoInfo.grado_nombre}
                      </Typography>
                      <Typography variant="caption" color={accent} fontWeight={600}>
                        Turno: {cupoInfo.turno_nombre} ({cupoInfo.periodo_nombre})
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 8 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          OCUPACIÓN DEL CUPO
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="#10b981">
                          {cupoInfo.cupos_disponibles} disponibles de {cupoInfo.cupos_totales}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={((cupoInfo.cupos_ocupados || 0) / (cupoInfo.cupos_totales || 1)) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#10b981',
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </>
            ) : (
              <Alert
                severity="warning"
                icon={<WarningAmberIcon />}
                sx={{
                  borderRadius: '14px',
                  bgcolor: alpha('#f59e0b', 0.1),
                  border: `1.5px solid ${alpha('#f59e0b', 0.35)}`,
                }}
              >
                <AlertTitle sx={{ fontWeight: 700 }}>No hay cupos disponibles</AlertTitle>
                No se encontró disponibilidad activa para este curso. Puedes verificar la configuración de cupos en el módulo de Cupos.
                <Box mt={1.5}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => window.open('/dashboard/cupos', '_blank')}
                    sx={{
                      borderRadius: '10px',
                      borderColor: alpha('#f59e0b', 0.6),
                      color: '#f59e0b',
                    }}
                  >
                    Ver Gestión de Cupos
                  </Button>
                </Box>
              </Alert>
            )}
          </Box>
        </Paper>
      )}

      {/* SELECCIÓN DE DECISIÓN FINAL */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box
              sx={{
                width: 5,
                height: 22,
                borderRadius: 1,
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
              }}
            />
            <Typography variant="h6" fontWeight={700} color="text.primary">
              Resolución de Admisión
            </Typography>
          </Box>

          <Stack spacing={2} sx={{ mb: 3 }}>
            {decisiones.map(({ key, color, lightColor, title, desc, icon }) => {
              const isSelected = decisionFinal === key;

              return (
                <Paper
                  key={key}
                  elevation={0}
                  onClick={() => setDecisionFinal(key)}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    bgcolor: isSelected
                      ? lightColor
                      : isDark
                        ? alpha('#fff', 0.02)
                        : alpha('#000', 0.02),
                    border: `2px solid ${isSelected
                        ? color
                        : isDark
                          ? alpha('#fff', 0.08)
                          : alpha('#000', 0.08)
                      }`,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: color,
                      transform: 'translateX(4px)',
                      boxShadow: `0 4px 18px ${alpha(color, 0.2)}`,
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        bgcolor: alpha(color, 0.15),
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {icon}
                    </Box>

                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight={700} color={isSelected ? color : 'text.primary'}>
                        {title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {desc}
                      </Typography>
                    </Box>

                    <Chip
                      label={isSelected ? 'Seleccionado' : 'Elegir'}
                      size="small"
                      sx={{
                        borderRadius: '8px',
                        fontWeight: 700,
                        bgcolor: isSelected ? color : 'transparent',
                        color: isSelected ? '#fff' : 'text.secondary',
                        border: `1px solid ${isSelected ? color : alpha(theme.palette.divider, 0.8)}`,
                      }}
                    />
                  </Box>
                </Paper>
              );
            })}
          </Stack>

          <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1.5 }}>
            Justificación o Notas de la Decisión:
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Escribe la justificación institucional o resolución final..."
            value={notasDecisionFinal}
            onChange={(e) => setNotasDecisionFinal(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                '&.Mui-focused fieldset': {
                  borderColor: accent,
                  borderWidth: 2,
                },
              },
            }}
          />

          {/* Notificaciones y Canales */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              bgcolor: notificarWhatsapp
                ? isDark ? alpha('#25D366', 0.08) : alpha('#25D366', 0.05)
                : isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
              border: `1px solid ${notificarWhatsapp ? alpha('#25D366', 0.35) : alpha(theme.palette.divider, 0.25)
                }`,
              mb: 3,
              transition: 'all 0.25s ease',
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={notificarWhatsapp}
                  onChange={(e) => setNotificarWhatsapp(e.target.checked)}
                  color="success"
                  disabled={saving}
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1.5} ml={0.5}>
                  {notificarWhatsapp ? (
                    <WhatsAppIcon sx={{ color: '#25D366', fontSize: 26 }} />
                  ) : (
                    <NotificationsOffIcon sx={{ color: 'text.secondary', fontSize: 26 }} />
                  )}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                      {notificarWhatsapp
                        ? 'Notificar resolución oficial por WhatsApp al tutor'
                        : 'Aprobar en el sistema sin enviar WhatsApp'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {notificarWhatsapp
                        ? 'Al confirmar, el sistema registrará la resolución y notificará a los tutores registrados vía WhatsApp oficial.'
                        : 'El estudiante quedará admitido formalmente en el sistema sin enviar ningún mensaje de WhatsApp.'}
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ m: 0, width: '100%' }}
            />
          </Paper>

          {errorModal && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
              {errorModal}
            </Alert>
          )}

          {/* Botones de Acción */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => setActiveStep(1)}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
                py: 1.2,
                borderColor: alpha(accent, 0.5),
                color: accent,
                backgroundColor: alpha(accent, 0.05),
                '&:hover': {
                  borderColor: accent,
                  backgroundColor: alpha(accent, 0.12),
                  transform: 'translateX(-2px)',
                },
              }}
            >
              Volver a Entrevista
            </Button>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              {decisionFinal === 'aprobada' ? (
                <>
                  {/* Botón 1: Solo Aprobar (Sin WhatsApp) - Ejecución Directa */}
                  <Button
                    variant="outlined"
                    startIcon={saving && !notificarWhatsapp ? <CircularProgress size={18} color="inherit" /> : <NotificationsOffIcon />}
                    disabled={!decisionFinal || saving}
                    onClick={() => handleEjecutarDecision(false)}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 2.8,
                      py: 1.3,
                      borderColor: '#10b981',
                      color: isDark ? '#34d399' : '#059669',
                      bgcolor: alpha('#10b981', 0.08),
                      '&:hover': {
                        borderColor: '#059669',
                        bgcolor: alpha('#10b981', 0.18),
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {saving && !notificarWhatsapp ? 'Aprobando...' : 'Solo Aprobar (Sin WhatsApp)'}
                  </Button>

                  {/* Botón 2: Aprobar y Enviar WhatsApp - Ejecución Directa */}
                  <Button
                    variant="contained"
                    startIcon={saving && notificarWhatsapp ? <CircularProgress size={18} color="inherit" /> : <WhatsAppIcon />}
                    disabled={!decisionFinal || saving}
                    onClick={() => handleEjecutarDecision(true)}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 3.2,
                      py: 1.3,
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                      color: '#fff',
                      boxShadow: '0 6px 20px rgba(37, 211, 102, 0.35)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #20ba5a 0%, #0e7065 100%)',
                        boxShadow: '0 8px 24px rgba(37, 211, 102, 0.5)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {saving && notificarWhatsapp ? 'Aprobando...' : 'Aprobar y Enviar WhatsApp'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                  disabled={!decisionFinal || saving}
                  onClick={handleAbrirModal}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3.5,
                    py: 1.3,
                    background: decisionFinal
                      ? decisionFinal === 'rechazada'
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : isDark
                          ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                          : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)'
                      : alpha(theme.palette.divider, 0.5),
                    color: decisionFinal === 'rechazada' ? '#fff' : (isDark ? '#000' : '#fff'),
                    boxShadow: decisionFinal
                      ? '0 6px 20px rgba(0,0,0,0.2)'
                      : 'none',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.25s ease',
                  }}
                >
                  {saving ? 'Procesando...' : 'Confirmar Resolución Final'}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* MODAL ELEGANTE DE CONFIRMACIÓN DE RESOLUCIÓN */}
      <Dialog
        open={openModalConfirmacion}
        onClose={handleCerrarModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 1,
            background: isDark
              ? 'linear-gradient(145deg, #0e1726 0%, #0b1320 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: `1px solid ${alpha(accent, 0.25)}`,
            boxShadow: isDark
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
              : '0 25px 50px -12px rgba(2, 136, 209, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  decisionFinal === 'aprobada'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : decisionFinal === 'rechazada'
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(2, 136, 209, 0.15)',
                color:
                  decisionFinal === 'aprobada'
                    ? '#10b981'
                    : decisionFinal === 'rechazada'
                      ? '#ef4444'
                      : accent,
              }}
            >
              {decisionFinal === 'aprobada' ? (
                <CheckCircleIcon sx={{ fontSize: 26 }} />
              ) : decisionFinal === 'rechazada' ? (
                <CancelIcon sx={{ fontSize: 26 }} />
              ) : (
                <PendingIcon sx={{ fontSize: 26 }} />
              )}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="text.primary">
                Confirmar Resolución Final
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Verifica los detalles antes de registrar la decisión
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCerrarModal} disabled={saving} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1.5 }}>
          {errorModal && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
              {errorModal}
            </Alert>
          )}

          {/* Tarjeta de Resumen de la Resolución */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: '16px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(2, 136, 209, 0.03)',
              borderColor: alpha(accent, 0.2),
              mb: 2.5,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                Resolución a Aplicar:
              </Typography>
              <Chip
                label={
                  decisionFinal === 'aprobada'
                    ? 'APROBADA'
                    : decisionFinal === 'rechazada'
                      ? 'RECHAZADA'
                      : decisionFinal
                        ? decisionFinal.toUpperCase()
                        : ''
                }
                sx={{
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  letterSpacing: '0.5px',
                  backgroundColor:
                    decisionFinal === 'aprobada'
                      ? 'rgba(16, 185, 129, 0.18)'
                      : decisionFinal === 'rechazada'
                        ? 'rgba(239, 68, 68, 0.18)'
                        : 'rgba(2, 136, 209, 0.18)',
                  color:
                    decisionFinal === 'aprobada'
                      ? '#10b981'
                      : decisionFinal === 'rechazada'
                        ? '#ef4444'
                        : accent,
                  border: `1px solid ${decisionFinal === 'aprobada'
                      ? 'rgba(16, 185, 129, 0.4)'
                      : decisionFinal === 'rechazada'
                        ? 'rgba(239, 68, 68, 0.4)'
                        : alpha(accent, 0.4)
                    }`,
                }}
              />
            </Box>

            <Stack spacing={1.5}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Estudiante:
                </Typography>
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  {preinscripcion.estudiante.nombres} {preinscripcion.estudiante.apellido_paterno}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Código:
                </Typography>
                <Typography variant="body2" fontWeight={700} color={accent}>
                  {preinscripcion.codigo_inscripcion}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Grado y Turno:
                </Typography>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {preinscripcion.grado_nombre || 'Grado'} — Turno {preinscripcion.turno_nombre || 'Turno'}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Tutor Responsable:
                </Typography>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {preinscripcion.tutor?.nombres} {preinscripcion.tutor?.apellido_paterno}
                </Typography>
              </Box>

              {notasDecisionFinal && (
                <Box pt={1} borderTop={`1px dashed ${alpha(theme.palette.divider, 0.5)}`}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Observaciones registradas:
                  </Typography>
                  <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontStyle: 'italic' }}>
                    "{notasDecisionFinal}"
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>

          {/* Opción Interactiva de Notificación por WhatsApp */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '16px',
              backgroundColor: notificarWhatsapp
                ? 'rgba(37, 211, 102, 0.08)'
                : alpha(theme.palette.text.secondary, 0.06),
              border: `1px solid ${notificarWhatsapp
                  ? 'rgba(37, 211, 102, 0.35)'
                  : alpha(theme.palette.divider, 0.5)
                }`,
              transition: 'all 0.25s ease',
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={notificarWhatsapp}
                  onChange={(e) => setNotificarWhatsapp(e.target.checked)}
                  color="success"
                  disabled={saving}
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1.2}>
                  {notificarWhatsapp ? (
                    <WhatsAppIcon sx={{ color: '#25D366', fontSize: 24 }} />
                  ) : (
                    <NotificationsOffIcon sx={{ color: 'text.secondary', fontSize: 24 }} />
                  )}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                      {notificarWhatsapp
                        ? 'Notificar resolución por WhatsApp al tutor'
                        : 'Aprobar sin enviar mensaje por WhatsApp'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {notificarWhatsapp
                        ? 'Se enviará la confirmación oficial al número de WhatsApp del tutor registrado.'
                        : 'El estudiante quedará admitido y aprobado formalmente en el sistema sin enviar ningún mensaje al tutor.'}
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ m: 0, width: '100%' }}
            />
          </Paper>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleCerrarModal}
            disabled={saving}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
            }}
          >
            Volver y Revisar
          </Button>

          {decisionFinal === 'aprobada' ? (
            <>
              {/* Opción 1: Solo Aprobar Sin WhatsApp */}
              <Button
                variant="outlined"
                onClick={() => handleEjecutarDecision(false)}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2.5,
                  borderColor: '#10b981',
                  color: isDark ? '#34d399' : '#059669',
                  bgcolor: alpha('#10b981', 0.08),
                  '&:hover': {
                    borderColor: '#059669',
                    bgcolor: alpha('#10b981', 0.16),
                  },
                }}
              >
                Solo Aprobar (Sin WhatsApp)
              </Button>

              {/* Opción 2: Aprobar Y Enviar WhatsApp */}
              <Button
                variant="contained"
                onClick={() => handleEjecutarDecision(true)}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <WhatsAppIcon />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 3,
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  color: '#fff',
                  boxShadow: '0 6px 20px rgba(37, 211, 102, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #20ba5a 0%, #0e7065 100%)',
                    boxShadow: '0 8px 24px rgba(37, 211, 102, 0.5)',
                  },
                }}
              >
                {saving ? 'Confirmando...' : 'Aprobar y Enviar WhatsApp'}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => handleEjecutarDecision()}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                backgroundColor:
                  decisionFinal === 'rechazada'
                    ? '#ef4444'
                    : accent,
                color: '#fff',
                '&:hover': {
                  backgroundColor:
                    decisionFinal === 'rechazada'
                      ? '#dc2626'
                      : accentDark,
                },
              }}
            >
              {saving ? 'Confirmando...' : 'Sí, Confirmar Resolución'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}