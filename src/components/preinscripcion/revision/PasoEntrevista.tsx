// components/preinscripcion/revision/PasoEntrevista.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  TextField,
  Button,
  Divider,
  Grid,
  Avatar,
  Alert,
  AlertTitle,
  useTheme,
  alpha,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import VideocamIcon from '@mui/icons-material/Videocam';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PreInscripcionDetalle } from '@/types/preinscripcionTypes';

dayjs.locale('es');

interface PasoEntrevistaProps {
  preinscripcion: PreInscripcionDetalle;
  setActiveStep: (step: number) => void;
  cambiarEstado: (estado: any, observaciones?: string) => Promise<void>;
  saving: boolean;
}

export default function PasoEntrevista({
  preinscripcion,
  setActiveStep,
  cambiarEstado,
  saving,
}: PasoEntrevistaProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [fechaEntrevista, setFechaEntrevista] = useState<Dayjs | null>(null);
  const [modalidad, setModalidad] = useState<'presencial' | 'virtual'>('presencial');
  const [lugar, setLugar] = useState('Dirección del Colegio - Oficina Principal');
  const [enlaceVirtual, setEnlaceVirtual] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const nombreCompleto = `${preinscripcion.estudiante.nombres} ${preinscripcion.estudiante.apellido_paterno} ${preinscripcion.estudiante.apellido_materno || ''}`.trim();
  const iniciales = `${preinscripcion.estudiante.nombres[0]}${preinscripcion.estudiante.apellido_paterno[0]}`;

  const handleAgendarEntrevista = async () => {
    if (!fechaEntrevista) {
      alert('Debes seleccionar una fecha y hora');
      return;
    }

    const notasEntrevista = `
Entrevista agendada:
- Fecha: ${fechaEntrevista.format('DD/MM/YYYY HH:mm')}
- Modalidad: ${modalidad === 'presencial' ? 'Presencial' : 'Virtual'}
- ${modalidad === 'presencial' ? `Lugar: ${lugar}` : `Enlace: ${enlaceVirtual}`}
${observaciones ? `\n- Observaciones: ${observaciones}` : ''}
    `.trim();

    await cambiarEstado('entrevista_programada', notasEntrevista);
  };

  const handleMarcarRealizada = async () => {
    const notasCompletas = `
Entrevista completada:
- Fecha realizada: ${dayjs().format('DD/MM/YYYY HH:mm')}
- Modalidad: ${modalidad}
${observaciones ? `\n- Observaciones: ${observaciones}` : ''}
    `.trim();

    await cambiarEstado('entrevista_completada', notasCompletas);
    setActiveStep(3);
  };

  // Estilos dinámicos
  const cardStyle = {
    borderRadius: 4,
    border: '1px solid',
    borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
    boxShadow: isDark
      ? '0 8px 32px rgba(0,0,0,0.4)'
      : '0 8px 24px rgba(0,0,0,0.08)',
    background: isDark
      ? 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)'
      : '#ffffff',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: isDark
        ? '0 12px 40px rgba(0,0,0,0.5)'
        : '0 12px 32px rgba(0,0,0,0.12)',
    },
  };

  const headerIconStyle = {
    width: 56,
    height: 56,
    borderRadius: 3,
    background: isDark
      ? 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)'
      : 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: isDark
      ? '0 4px 20px rgba(244, 114, 182, 0.4)'
      : '0 4px 15px rgba(236, 72, 153, 0.3)',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.8 },
    },
  };

  const isAgendada = preinscripcion.estado === 'entrevista_programada';

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      {/* Header del paso */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={2}
            flexWrap="wrap"
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={headerIconStyle}>
                <EventIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    background: isDark
                      ? 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)'
                      : 'linear-gradient(135deg, #db2777 0%, #9f1239 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Entrevista con Directora
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: isDark ? alpha('#fff', 0.7) : 'text.secondary' }}
                >
                  Agendar y realizar entrevista de admisión
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<AccessTimeIcon />}
              label={isAgendada ? 'Entrevista agendada' : 'Pendiente de agendar'}
              sx={{
                bgcolor: isAgendada
                  ? isDark
                    ? alpha('#10b981', 0.2)
                    : alpha('#10b981', 0.1)
                  : isDark
                  ? alpha('#f59e0b', 0.2)
                  : alpha('#f59e0b', 0.1),
                color: isAgendada
                  ? isDark
                    ? '#6ee7b7'
                    : '#059669'
                  : isDark
                  ? '#fbbf24'
                  : '#d97706',
                fontWeight: 600,
                border: '1px solid',
                borderColor: isAgendada
                  ? isDark
                    ? '#6ee7b7'
                    : '#10b981'
                  : isDark
                  ? '#fbbf24'
                  : '#f59e0b',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: isAgendada
                    ? isDark
                      ? alpha('#10b981', 0.3)
                      : alpha('#10b981', 0.15)
                    : isDark
                    ? alpha('#f59e0b', 0.3)
                    : alpha('#f59e0b', 0.15),
                  transform: 'scale(1.05)',
                },
              }}
            />
          </Box>

          <LinearProgress
            variant="determinate"
            value={75}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
              '& .MuiLinearProgress-bar': {
                background: isDark
                  ? 'linear-gradient(90deg, #f472b6 0%, #ec4899 100%)'
                  : 'linear-gradient(90deg, #ec4899 0%, #be185d 100%)',
                borderRadius: 4,
                transition: 'all 0.5s ease',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Información del Estudiante */}
      <Card sx={{ ...cardStyle, mb: 3, mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: isDark ? '#fff' : 'text.primary',
            }}
          >
            Candidato a Entrevistar
          </Typography>

          <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
            <Avatar
              sx={{
                width: 80,
                height: 80,
                background: isDark
                  ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                fontSize: '2rem',
                fontWeight: 700,
                boxShadow: isDark
                  ? '0 4px 20px rgba(96, 165, 250, 0.4)'
                  : '0 4px 20px rgba(59, 130, 246, 0.3)',
                animation: 'scaleIn 0.5s ease both',
                '@keyframes scaleIn': {
                  from: {
                    opacity: 0,
                    transform: 'scale(0.5)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'scale(1)',
                  },
                },
              }}
            >
              {iniciales}
            </Avatar>
            <Box flex={1}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: isDark ? '#fff' : 'text.primary',
                }}
              >
                {nombreCompleto}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: isDark ? alpha('#fff', 0.7) : 'text.secondary',
                  mb: 1,
                }}
              >
                Grado solicitado: {preinscripcion.estudiante.grado_solicitado}
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Chip
                  icon={<PersonIcon sx={{ fontSize: 16 }} />}
                  label={preinscripcion.tutor.nombres}
                  size="small"
                  sx={{
                    borderColor: isDark ? alpha('#ec4899', 0.5) : '#ec4899',
                    color: isDark ? '#f9a8d4' : '#be185d',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: isDark ? alpha('#ec4899', 0.15) : alpha('#ec4899', 0.1),
                      transform: 'scale(1.05)',
                    },
                  }}
                  variant="outlined"
                />
                <Chip
                  label={`📞 ${preinscripcion.tutor.telefono}`}
                  size="small"
                  sx={{
                    borderColor: isDark ? alpha('#ec4899', 0.5) : '#ec4899',
                    color: isDark ? '#f9a8d4' : '#be185d',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: isDark ? alpha('#ec4899', 0.15) : alpha('#ec4899', 0.1),
                      transform: 'scale(1.05)',
                    },
                  }}
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Agendar Entrevista */}
      <Card sx={{ ...cardStyle, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: isDark ? '#fff' : 'text.primary',
            }}
          >
            Agendar Entrevista
          </Typography>

          <Grid container spacing={3}>
            {/* Fecha y Hora */}
            <Grid size={{ xs: 12, md: 6 }}>
              <DateTimePicker
                label="Fecha y Hora de la Entrevista"
                value={fechaEntrevista}
                onChange={setFechaEntrevista}
                minDateTime={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.04),
                        },
                        '&.Mui-focused': {
                          bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#ec4899', 0.05),
                        },
                      },
                    },
                  },
                }}
              />
            </Grid>

            {/* Modalidad */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: isDark ? alpha('#f472b6', 0.8) : '#be185d',
                }}
              >
                Modalidad de Entrevista
              </Typography>
              <Box display="flex" gap={2}>
                <Button
                  variant={modalidad === 'presencial' ? 'contained' : 'outlined'}
                  startIcon={<LocationOnIcon />}
                  onClick={() => setModalidad('presencial')}
                  fullWidth
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    py: 1.5,
                    fontWeight: 600,
                    ...(modalidad === 'presencial'
                      ? {
                          background: isDark
                            ? 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)'
                            : 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                          boxShadow: isDark
                            ? '0 4px 15px rgba(244, 114, 182, 0.4)'
                            : '0 4px 15px rgba(236, 72, 153, 0.3)',
                          '&:hover': {
                            background: isDark
                              ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
                              : 'linear-gradient(135deg, #be185d 0%, #9f1239 100%)',
                          },
                        }
                      : {
                          borderWidth: 2,
                          borderColor: isDark ? alpha('#ec4899', 0.5) : '#ec4899',
                          color: isDark ? '#f9a8d4' : '#be185d',
                          '&:hover': {
                            borderWidth: 2,
                            bgcolor: isDark ? alpha('#ec4899', 0.15) : alpha('#ec4899', 0.1),
                          },
                        }),
                  }}
                >
                  Presencial
                </Button>
                <Button
                  variant={modalidad === 'virtual' ? 'contained' : 'outlined'}
                  startIcon={<VideocamIcon />}
                  onClick={() => setModalidad('virtual')}
                  fullWidth
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    py: 1.5,
                    fontWeight: 600,
                    ...(modalidad === 'virtual'
                      ? {
                          background: isDark
                            ? 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)'
                            : 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                          boxShadow: isDark
                            ? '0 4px 15px rgba(244, 114, 182, 0.4)'
                            : '0 4px 15px rgba(236, 72, 153, 0.3)',
                          '&:hover': {
                            background: isDark
                              ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
                              : 'linear-gradient(135deg, #be185d 0%, #9f1239 100%)',
                          },
                        }
                      : {
                          borderWidth: 2,
                          borderColor: isDark ? alpha('#ec4899', 0.5) : '#ec4899',
                          color: isDark ? '#f9a8d4' : '#be185d',
                          '&:hover': {
                            borderWidth: 2,
                            bgcolor: isDark ? alpha('#ec4899', 0.15) : alpha('#ec4899', 0.1),
                          },
                        }),
                  }}
                >
                  Virtual
                </Button>
              </Box>
            </Grid>

            {/* Lugar o Enlace según modalidad */}
            <Grid size={{ xs: 12 }}>
              {modalidad === 'presencial' ? (
                <TextField
                  fullWidth
                  label="Lugar de la Entrevista"
                  value={lugar}
                  onChange={(e) => setLugar(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.04),
                      },
                      '&.Mui-focused': {
                        bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#ec4899', 0.05),
                      },
                    },
                  }}
                />
              ) : (
                <TextField
                  fullWidth
                  label="Enlace de Video Llamada (Zoom, Meet, etc.)"
                  value={enlaceVirtual}
                  onChange={(e) => setEnlaceVirtual(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.04),
                      },
                      '&.Mui-focused': {
                        bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#ec4899', 0.05),
                      },
                    },
                  }}
                />
              )}
            </Grid>

            {/* Observaciones */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Observaciones o Instrucciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Documentos a traer, temas a tratar, etc."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.04),
                    },
                    '&.Mui-focused': {
                      bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#ec4899', 0.05),
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Notificación automática */}
      <Alert
        severity="info"
        icon={<CalendarTodayIcon />}
        sx={{
          borderRadius: 3,
          mb: 3,
          bgcolor: isDark ? alpha('#3b82f6', 0.15) : alpha('#3b82f6', 0.1),
          border: '1px solid',
          borderColor: isDark ? alpha('#60a5fa', 0.3) : alpha('#3b82f6', 0.2),
          '& .MuiAlert-icon': {
            color: isDark ? '#60a5fa' : '#3b82f6',
          },
        }}
      >
        <AlertTitle sx={{ fontWeight: 600, color: isDark ? '#fff' : undefined }}>
          Notificación Automática
        </AlertTitle>
        <Typography
          variant="body2"
          sx={{ color: isDark ? alpha('#fff', 0.8) : 'text.secondary' }}
        >
          Al agendar la entrevista, se enviará automáticamente un correo y SMS a{' '}
          <strong>{preinscripcion.tutor.nombres}</strong> con los detalles de la cita.
        </Typography>
      </Alert>

      {/* Acciones */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => setActiveStep(1)}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                borderWidth: 2,
                borderColor: isDark ? alpha('#6b7280', 0.5) : '#9ca3af',
                color: isDark ? '#d1d5db' : '#6b7280',
                fontWeight: 600,
                px: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: isDark ? '#d1d5db' : '#6b7280',
                  bgcolor: isDark ? alpha('#6b7280', 0.15) : alpha('#9ca3af', 0.1),
                  transform: 'translateX(-4px)',
                },
              }}
            >
              Volver
            </Button>

            <Box display="flex" gap={2} flexWrap="wrap">
              {isAgendada && (
                <Button
                  variant="contained"
                  startIcon={<TaskAltIcon />}
                  onClick={handleMarcarRealizada}
                  disabled={saving}
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    background: isDark
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    boxShadow: isDark
                      ? '0 4px 15px rgba(16, 185, 129, 0.4)'
                      : '0 4px 15px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: isDark
                        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                        : 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: isDark
                        ? '0 8px 25px rgba(16, 185, 129, 0.5)'
                        : '0 8px 25px rgba(16, 185, 129, 0.4)',
                    },
                    '&:disabled': {
                      background: alpha('#999', 0.3),
                      color: alpha('#fff', 0.5),
                    },
                  }}
                >
                  {saving ? 'Guardando...' : 'Marcar como Realizada'}
                </Button>
              )}

              <Button
                variant="contained"
                startIcon={<EventIcon />}
                onClick={handleAgendarEntrevista}
                disabled={!fechaEntrevista || saving}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  background: isDark
                    ? 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)'
                    : 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                  boxShadow: isDark
                    ? '0 4px 15px rgba(244, 114, 182, 0.4)'
                    : '0 4px 15px rgba(236, 72, 153, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: isDark
                      ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
                      : 'linear-gradient(135deg, #be185d 0%, #9f1239 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                      ? '0 8px 25px rgba(244, 114, 182, 0.5)'
                      : '0 8px 25px rgba(236, 72, 153, 0.4)',
                  },
                  '&:disabled': {
                    background: alpha('#999', 0.3),
                    color: alpha('#fff', 0.5),
                  },
                }}
              >
                {saving ? 'Agendando...' : 'Agendar Entrevista'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}