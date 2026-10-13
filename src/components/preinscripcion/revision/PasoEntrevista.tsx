// components/preinscripcion/revision/PasoEntrevista.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  TextField,
  Button,
  Grid,
  Avatar,
  Alert,
  AlertTitle,
  Stack,
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
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import VideocamIcon from '@mui/icons-material/Videocam';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
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
  const accent = isDark ? '#facc15' : '#0288d1';
  const accentDark = isDark ? '#f59e0b' : '#01579b';

  const [fechaEntrevista, setFechaEntrevista] = useState<Dayjs | null>(null);
  const [modalidad, setModalidad] = useState<'presencial' | 'virtual'>('presencial');
  const [lugar, setLugar] = useState('Dirección del Colegio - Oficina Principal');
  const [enlaceVirtual, setEnlaceVirtual] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const nombreCompleto = `${preinscripcion.estudiante.nombres} ${preinscripcion.estudiante.apellido_paterno} ${preinscripcion.estudiante.apellido_materno || ''}`.trim();
  const iniciales = `${preinscripcion.estudiante.nombres?.[0] || '?'}${preinscripcion.estudiante.apellido_paterno?.[0] || '?'}`.toUpperCase();

  const handleAgendarEntrevista = async () => {
    if (!fechaEntrevista) {
      alert('Debes seleccionar una fecha y hora para la entrevista');
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
    setActiveStep(2);
  };

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

  const isAgendada = preinscripcion.estado === 'entrevista_programada';
  const isCompletada = preinscripcion.estado === 'entrevista_completada';

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
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
                <CalendarMonthIcon sx={{ fontSize: 28 }} />
              </Box>

              <Box>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  Paso 2: Entrevista de Admisión
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Coordina o registra la reunión evaluativa con la dirección
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
              label={
                isCompletada
                  ? 'Entrevista Realizada'
                  : isAgendada
                  ? 'Entrevista Agendada'
                  : 'Pendiente de Agendar'
              }
              sx={{
                borderRadius: '10px',
                fontWeight: 600,
                bgcolor: isCompletada
                  ? alpha('#10b981', 0.15)
                  : isAgendada
                  ? alpha(accent, 0.15)
                  : alpha('#f59e0b', 0.15),
                color: isCompletada
                  ? '#10b981'
                  : isAgendada
                  ? accent
                  : '#f59e0b',
                border: `1px solid ${
                  isCompletada
                    ? alpha('#10b981', 0.3)
                    : isAgendada
                    ? alpha(accent, 0.35)
                    : alpha('#f59e0b', 0.3)
                }`,
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* CANDIDATO A ENTREVISTAR */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
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
              Candidato a Entrevistar
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
            <Avatar
              src={preinscripcion.estudiante.foto_url || undefined}
              sx={{
                width: 72,
                height: 72,
                borderRadius: '18px',
                bgcolor: alpha(accent, 0.2),
                color: accent,
                fontSize: '1.8rem',
                fontWeight: 700,
                border: `2px solid ${alpha(accent, 0.4)}`,
              }}
            >
              {iniciales}
            </Avatar>

            <Box flex={1} sx={{ minWidth: 200 }}>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {nombreCompleto}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Postula a: {preinscripcion.grado_nombre || preinscripcion.estudiante.grado_solicitado} • Turno {preinscripcion.turno_nombre || preinscripcion.estudiante.turno_solicitado || 'Mañana'}
              </Typography>

              <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
                <Chip
                  icon={<PersonIcon sx={{ fontSize: 16 }} />}
                  label={`Tutor: ${preinscripcion.tutor.nombres} ${preinscripcion.tutor.apellido_paterno}`}
                  size="small"
                  sx={{
                    borderRadius: '8px',
                    bgcolor: alpha(accent, 0.08),
                    color: accent,
                    border: `1px solid ${alpha(accent, 0.25)}`,
                    fontWeight: 600,
                  }}
                />
                <Chip
                  icon={<PhoneIcon sx={{ fontSize: 16 }} />}
                  label={`Tel: ${preinscripcion.tutor.telefono || 'Sin teléfono'}`}
                  size="small"
                  sx={{
                    borderRadius: '8px',
                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* FORMULARIO PARA AGENDAR ENTREVISTA */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
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
              Programación de la Cita
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Fecha y Hora */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" fontWeight={700} color={accent} sx={{ display: 'block', mb: 1, textTransform: 'uppercase' }}>
                Fecha y Hora de la Entrevista
              </Typography>
              <DateTimePicker
                value={fechaEntrevista}
                onChange={setFechaEntrevista}
                minDateTime={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    placeholder: 'Selecciona fecha y hora...',
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '14px',
                        bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                        '&.Mui-focused fieldset': {
                          borderColor: accent,
                          borderWidth: 2,
                        },
                      },
                    },
                  },
                }}
              />
            </Grid>

            {/* Modalidad */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" fontWeight={700} color={accent} sx={{ display: 'block', mb: 1, textTransform: 'uppercase' }}>
                Modalidad de la Entrevista
              </Typography>
              <Box display="flex" gap={2}>
                <Button
                  variant={modalidad === 'presencial' ? 'contained' : 'outlined'}
                  startIcon={<LocationOnIcon />}
                  onClick={() => setModalidad('presencial')}
                  fullWidth
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    py: 1.5,
                    fontWeight: 600,
                    ...(modalidad === 'presencial'
                      ? {
                          background: isDark
                            ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                            : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                          color: isDark ? '#000' : '#fff',
                          boxShadow: `0 4px 14px ${alpha(accent, 0.3)}`,
                        }
                      : {
                          borderColor: alpha(accent, 0.4),
                          color: accent,
                          bgcolor: alpha(accent, 0.04),
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
                    borderRadius: '12px',
                    textTransform: 'none',
                    py: 1.5,
                    fontWeight: 600,
                    ...(modalidad === 'virtual'
                      ? {
                          background: isDark
                            ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                            : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                          color: isDark ? '#000' : '#fff',
                          boxShadow: `0 4px 14px ${alpha(accent, 0.3)}`,
                        }
                      : {
                          borderColor: alpha(accent, 0.4),
                          color: accent,
                          bgcolor: alpha(accent, 0.04),
                        }),
                  }}
                >
                  Virtual (Meet/Zoom)
                </Button>
              </Box>
            </Grid>

            {/* Lugar o Enlace */}
            <Grid size={{ xs: 12 }}>
              {modalidad === 'presencial' ? (
                <TextField
                  fullWidth
                  label="Lugar o Dirección de la Entrevista"
                  value={lugar}
                  onChange={(e) => setLugar(e.target.value)}
                  sx={{
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
              ) : (
                <TextField
                  fullWidth
                  label="Enlace de la Videollamada (Google Meet / Zoom)"
                  placeholder="https://meet.google.com/..."
                  value={enlaceVirtual}
                  onChange={(e) => setEnlaceVirtual(e.target.value)}
                  sx={{
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
              )}
            </Grid>

            {/* Observaciones */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notas y Observaciones de la Entrevista"
                placeholder="Indica recomendaciones para los padres o notas post-entrevista..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                sx={{
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
            </Grid>
          </Grid>

          <Alert
            severity="info"
            sx={{
              mt: 3,
              borderRadius: '14px',
              bgcolor: alpha(accent, 0.08),
              border: `1px solid ${alpha(accent, 0.25)}`,
              color: 'text.primary',
              '& .MuiAlert-icon': {
                color: accent,
              },
            }}
          >
            <AlertTitle sx={{ fontWeight: 700 }}>Aviso de Comunicación</AlertTitle>
            Al agendar la cita, se notificará al tutor <strong>{preinscripcion.tutor.nombres}</strong> con los detalles del encuentro.
          </Alert>

          {/* Botones de acción */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mt: 3,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => setActiveStep(0)}
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
              Volver a Datos Personales
            </Button>

            <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
              {isAgendada && (
                <Button
                  variant="contained"
                  startIcon={<TaskAltIcon />}
                  onClick={handleMarcarRealizada}
                  disabled={saving}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3,
                    py: 1.2,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.5)',
                    },
                    transition: 'all 0.25s ease',
                  }}
                >
                  {saving ? 'Guardando...' : 'Marcar Entrevista Realizada'}
                </Button>
              )}

              <Button
                variant="contained"
                startIcon={<EventIcon />}
                onClick={handleAgendarEntrevista}
                disabled={!fechaEntrevista || saving}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 3,
                  py: 1.2,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  color: isDark ? '#000' : '#fff',
                  boxShadow: isDark
                    ? '0 6px 20px rgba(250,204,21,0.3)'
                    : '0 6px 20px rgba(2,136,209,0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                      ? '0 8px 24px rgba(250,204,21,0.45)'
                      : '0 8px 24px rgba(2,136,209,0.45)',
                  },
                  transition: 'all 0.25s ease',
                }}
              >
                {saving ? 'Agendando...' : 'Agendar Entrevista'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
}