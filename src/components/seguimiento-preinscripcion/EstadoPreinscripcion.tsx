import React from 'react';
import {
  EstadoPreInscripcion,
  ESTADOS_PREINSCRIPCION,
  PreInscripcionDetalle,
} from '@/types/preinscripcionTypes';
import RefreshIcon from '@mui/icons-material/Refresh';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
  useTheme,
  Tooltip,
} from '@mui/material';
import { keyframes } from '@mui/system';

const popAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1.1); }
`;

const PASOS_PROCESO = [
  { label: 'Solicitud Iniciada', icon: DescriptionIcon, color: '#0288d1' },
  { label: 'Revisión de Datos', icon: PersonSearchIcon, color: '#f59e0b' },
  { label: 'Entrevista de Admisión', icon: EventAvailableIcon, color: '#8b5cf6' },
  { label: 'Resultado Final', icon: VerifiedIcon, color: '#10b981' },
];

interface EstadoPreinscripcionProps {
  preinscripcion: PreInscripcionDetalle;
  onRecargar: () => void;
}

export const EstadoPreinscripcion: React.FC<EstadoPreinscripcionProps> = ({
  preinscripcion,
  onRecargar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getPasoActivo = (estado: EstadoPreInscripcion): number => {
    const mapeo: Record<EstadoPreInscripcion, number> = {
      en_espera: 0,
      iniciada: 0,
      datos_completos: 1,
      documentos_pendientes: 1,
      en_revision: 1,
      documentos_aprobados: 2,
      entrevista_pendiente: 2,
      entrevista_programada: 2,
      entrevista_completada: 3,
      aprobada: 3,
      rechazada: -1,
      convertida: 3,
      expirada: -1,
      cancelada: -1,
    };
    return mapeo[estado] ?? 0;
  };

  const estadoInfo = ESTADOS_PREINSCRIPCION[preinscripcion.estado as EstadoPreInscripcion];
  const pasoActivo = getPasoActivo(preinscripcion.estado as EstadoPreInscripcion);

  const paperStyle = {
    p: { xs: 3, md: 4.5 },
    borderRadius: '24px',
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(1, 87, 155, 0.12)',
    boxShadow: isDark
      ? '0 20px 60px rgba(0, 0, 0, 0.5)'
      : '0 20px 60px rgba(1, 87, 155, 0.1)',
  };

  return (
    <Paper elevation={0} sx={{ ...paperStyle, mb: 4 }}>
      {/* Encabezado de la solicitud */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              color: isDark ? '#ffffff' : '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            Estado de tu Solicitud
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
              fontWeight: 600,
            }}
          >
            Consulta del expediente escolar
          </Typography>
        </Box>

        <Tooltip title="Actualizar información">
          <IconButton
            onClick={onRecargar}
            sx={{
              color: isDark ? '#facc15' : '#01579b',
              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(1, 87, 155, 0.08)',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(1, 87, 155, 0.15)',
                transform: 'rotate(180deg)',
              },
              transition: 'all 0.4s ease',
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tarjeta resumen del estudiante y estado */}
      <Box
        sx={{
          p: 3,
          borderRadius: '18px',
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(2, 136, 209, 0.04)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(1, 87, 155, 0.12)',
          mb: 4,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>
              Código de Preinscripción
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 800,
                color: isDark ? '#facc15' : '#01579b',
                letterSpacing: '0.05em',
              }}
            >
              {preinscripcion.codigo_inscripcion}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>
              Postulante
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                color: isDark ? '#ffffff' : '#0f172a',
              }}
            >
              {preinscripcion.estudiante.nombres} {preinscripcion.estudiante.apellido_paterno}{' '}
              {preinscripcion.estudiante.apellido_materno || ''}
            </Typography>
            {preinscripcion.estudiante.ci && (
              <Typography variant="caption" color="text.secondary">
                C.I. {preinscripcion.estudiante.ci}
              </Typography>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Estado Actual
              </Typography>
              <Chip
                label={estadoInfo?.label || preinscripcion.estado}
                sx={{
                  bgcolor: estadoInfo?.color || '#0288d1',
                  color: '#ffffff',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  px: 2,
                  py: 2.2,
                  borderRadius: '12px',
                  boxShadow: `0 4px 15px ${estadoInfo?.color || '#0288d1'}40`,
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Stepper Visual estilo FormStepper */}
      <Box sx={{ my: 4, px: { xs: 1, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          {PASOS_PROCESO.map((paso, index) => {
            const isCompleted = pasoActivo >= 0 && index < pasoActivo;
            const isActive = pasoActivo >= 0 && index === pasoActivo;
            const StepIconComponent = paso.icon;

            return (
              <Box
                key={paso.label}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  zIndex: 2,
                  width: { xs: '23%', sm: '20%' },
                }}
              >
                {/* Círculo del icono */}
                <Box
                  sx={{
                    width: { xs: 44, sm: 54 },
                    height: { xs: 44, sm: 54 },
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isActive
                      ? paso.color
                      : isCompleted
                      ? `${paso.color}25`
                      : isDark
                      ? '#1e293b'
                      : '#e2e8f0',
                    color: isActive ? '#ffffff' : isCompleted ? paso.color : isDark ? '#64748b' : '#94a3b8',
                    border: isActive
                      ? `3px solid ${paso.color}`
                      : isCompleted
                      ? `2px solid ${paso.color}60`
                      : `2px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                    boxShadow: isActive ? `0 8px 25px ${paso.color}50` : 'none',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    animation: isActive ? `${popAnimation} 0.6s ease` : 'none',
                    transition: 'all 0.3s ease',
                    mb: 1.5,
                  }}
                >
                  {isCompleted ? (
                    <CheckCircleIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
                  ) : (
                    <StepIconComponent sx={{ fontSize: { xs: 22, sm: 26 } }} />
                  )}
                </Box>

                {/* Etiqueta del paso */}
                <Typography
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: isActive || isCompleted ? 700 : 500,
                    fontSize: { xs: '0.7rem', sm: '0.82rem' },
                    color: isActive
                      ? isDark
                        ? '#ffffff'
                        : '#0f172a'
                      : isCompleted
                      ? paso.color
                      : isDark
                      ? '#94a3b8'
                      : '#64748b',
                    lineHeight: 1.3,
                  }}
                >
                  {paso.label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Barra de progreso global */}
        <Box sx={{ mt: 3, mx: { xs: 2, md: 5 } }}>
          <Box
            sx={{
              height: 6,
              borderRadius: 10,
              bgcolor: isDark ? '#1e293b' : '#e2e8f0',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: pasoActivo >= 0 ? `${(pasoActivo / (PASOS_PROCESO.length - 1)) * 100}%` : '0%',
                background: 'linear-gradient(90deg, #0288d1, #f59e0b, #10b981)',
                borderRadius: 10,
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Alertas dinámicas */}
      {preinscripcion.estado === 'en_espera' && (
        <Alert
          severity="warning"
          icon={<ScheduleIcon />}
          sx={{
            mt: 4,
            borderRadius: '16px',
            fontFamily: "'Montserrat', sans-serif",
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <AlertTitle sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800 }}>
            En Lista de Espera — Posición #{preinscripcion.posicion_espera || 1}
          </AlertTitle>
          Tu solicitud fue registrada con éxito. Debido a que el cupo directo en este grado y turno se encuentra completo, estás ubicado en la lista de espera oficial. Te contactaremos inmediatamente cuando se libere una vacante.
        </Alert>
      )}

      {preinscripcion.observaciones && (
        <Alert
          severity="info"
          icon={<PendingIcon />}
          sx={{
            mt: 3,
            borderRadius: '16px',
            fontFamily: "'Montserrat', sans-serif",
            border: '1px solid rgba(2, 136, 209, 0.3)',
          }}
        >
          <AlertTitle sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800 }}>
            Observaciones Institucionales
          </AlertTitle>
          {preinscripcion.observaciones}
        </Alert>
      )}

      {preinscripcion.motivo_rechazo && (
        <Alert
          severity="error"
          icon={<ErrorOutlineIcon />}
          sx={{
            mt: 3,
            borderRadius: '16px',
            fontFamily: "'Montserrat', sans-serif",
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <AlertTitle sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800 }}>
            Motivo de la Decisión
          </AlertTitle>
          {preinscripcion.motivo_rechazo}
        </Alert>
      )}
    </Paper>
  );
};
