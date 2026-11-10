'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Switch,
  Chip,
  Avatar,
  Stack,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Divider,
  Paper,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VideocamIcon from '@mui/icons-material/Videocam';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { preinscripcionService } from '@/services/preinscripcionService';
import { HermanoPostulanteInfo } from '@/types/preinscripcionTypes';
import { useRouter } from 'next/navigation';

dayjs.locale('es');

interface ModalAgendarEntrevistaFamiliarProps {
  open: boolean;
  onClose: () => void;
  preinscripcionId: number | null;
  onSuccess?: () => void;
}

export default function ModalAgendarEntrevistaFamiliar({
  open,
  onClose,
  preinscripcionId,
  onSuccess,
}: ModalAgendarEntrevistaFamiliarProps) {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const [tutorInfo, setTutorInfo] = useState<any>(null);
  const [postulantes, setPostulantes] = useState<HermanoPostulanteInfo[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Campos de la entrevista
  const [fechaEntrevista, setFechaEntrevista] = useState<Dayjs | null>(null);
  const [modalidad, setModalidad] = useState<'presencial' | 'virtual'>('presencial');
  const [lugar, setLugar] = useState('Dirección del Colegio - Oficina Principal');
  const [enlaceVirtual, setEnlaceVirtual] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [notificarWhatsapp, setNotificarWhatsapp] = useState(true);

  // Cargar grupo familiar
  useEffect(() => {
    if (!open || !preinscripcionId) return;

    let mounted = true;
    const fetchFamilia = async () => {
      setLoading(true);
      setError(null);
      setFeedbackSuccess(null);
      try {
        const data = await preinscripcionService.obtenerFamilia(preinscripcionId);
        if (!mounted) return;
        setTutorInfo(data?.tutor || null);
        const lista = data?.postulantes || [];
        setPostulantes(lista);
        // Pre-seleccionar todos los postulantes de la familia
        setSelectedIds(lista.map((p: any) => p.id));
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'Error al obtener postulantes de la familia');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFamilia();

    return () => {
      mounted = false;
    };
  }, [open, preinscripcionId]);

  const handleTogglePostulante = (id: number) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) return; // al menos 1 seleccionado
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedIds(postulantes.map((p) => p.id));
    } else {
      // Dejar al menos el actual
      const actual = postulantes.find((p) => p.es_actual) || postulantes[0];
      if (actual) setSelectedIds([actual.id]);
    }
  };

  const handleGuardar = async () => {
    if (!fechaEntrevista) {
      setError('Debes seleccionar una fecha y hora para la entrevista.');
      return;
    }
    if (selectedIds.length === 0) {
      setError('Debes seleccionar al menos un postulante.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const fechaTexto = fechaEntrevista.format('DD/MM/YYYY');
    const horaTexto = fechaEntrevista.format('HH:mm');

    try {
      const res = await preinscripcionService.agendarEntrevistaFamiliar({
        preinscripcion_ids: selectedIds,
        fecha_texto: fechaTexto,
        hora_texto: horaTexto,
        modalidad,
        lugar: modalidad === 'presencial' ? lugar : undefined,
        enlace: modalidad === 'virtual' ? enlaceVirtual : undefined,
        observaciones: observaciones.trim() || undefined,
        notificarWhatsapp,
      });

      setFeedbackSuccess(
        `✅ Entrevista familiar agendada exitosamente para ${selectedIds.length} postulante(s)${
          notificarWhatsapp ? ' y notificación enviada por WhatsApp al tutor.' : '.'
        }`
      );

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Error al agendar entrevista familiar');
    } finally {
      setSubmitting(false);
    }
  };

  // Preview del mensaje de WhatsApp
  const postulantesSeleccionados = postulantes.filter((p) => selectedIds.includes(p.id));
  const tutorNombre = tutorInfo
    ? `${tutorInfo.nombres || ''} ${tutorInfo.apellido_paterno || ''}`.trim()
    : 'Padre/Madre/Tutor';

  const previewHijos = postulantesSeleccionados
    .map((p) => `*${p.estudiante_nombre}* (${p.grado_nombre || 'Sin grado'})`)
    .join(', ');

  const previewFecha = fechaEntrevista
    ? `${fechaEntrevista.format('DD/MM/YYYY')} a horas ${fechaEntrevista.format('HH:mm')}`
    : '[Fecha y Hora seleccionada]';

  const previewLugar =
    modalidad === 'virtual'
      ? `Virtual (Google Meet): ${enlaceVirtual || 'Se enviará el enlace por este medio'}`
      : `Presencial: ${lugar || 'Dirección del Colegio - Oficina Principal'}`;

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          bgcolor: isDark ? '#0b1320' : '#ffffff',
          backgroundImage: 'none',
          boxShadow: isDark
            ? '0 24px 60px rgba(0,0,0,0.7)'
            : '0 20px 50px rgba(0,0,0,0.15)',
        },
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        {/* Cabecera del Dialog */}
        <DialogTitle
          sx={{
            p: 3,
            pb: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              sx={{
                bgcolor: alpha('#3b82f6', 0.15),
                color: '#3b82f6',
                width: 44,
                height: 44,
              }}
            >
              <PeopleIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800} color="text.primary">
                Agendar Entrevista Familiar Conjunta
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Programa la citación para todos los hermanos postulantes en 1 solo paso con WhatsApp
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            disabled={submitting}
            sx={{
              borderRadius: '10px',
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={6} gap={2}>
              <CircularProgress size={44} sx={{ color: accent }} />
              <Typography variant="body2" color="text.secondary">
                Buscando hermanos postulantes de la misma familia...
              </Typography>
            </Box>
          ) : (
            <Stack spacing={3}>
              {/* Alertas */}
              {error && (
                <Alert severity="error" sx={{ borderRadius: '14px' }}>
                  {error}
                </Alert>
              )}
              {feedbackSuccess && (
                <Alert severity="success" sx={{ borderRadius: '14px' }}>
                  {feedbackSuccess}
                </Alert>
              )}

              {/* Tarjeta Informativa del Tutor */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  bgcolor: isDark ? alpha('#3b82f6', 0.1) : '#eff6ff',
                  border: `1px solid ${alpha('#3b82f6', 0.25)}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    TUTOR PRINCIPAL DE LA FAMILIA
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                    {tutorNombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    CI: {tutorInfo?.ci || 'Sin CI'} • Celular:{' '}
                    <strong>{tutorInfo?.celular || tutorInfo?.telefono || 'No registrado'}</strong>
                  </Typography>
                </Box>
                <Chip
                  icon={<WhatsAppIcon sx={{ fontSize: 16 }} />}
                  label="Notificación oficial directa"
                  size="small"
                  sx={{
                    bgcolor: alpha('#16a34a', 0.15),
                    color: '#16a34a',
                    fontWeight: 700,
                  }}
                />
              </Paper>

              {/* Selección de Hermanos Postulantes */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                    Hermanos a incluir en la entrevista ({selectedIds.length} seleccionados):
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => handleSelectAll(selectedIds.length !== postulantes.length)}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                  >
                    {selectedIds.length === postulantes.length
                      ? 'Deseleccionar hermanos'
                      : 'Seleccionar todos'}
                  </Button>
                </Box>

                <Stack spacing={1}>
                  {postulantes.map((postulante) => {
                    const isChecked = selectedIds.includes(postulante.id);
                    return (
                      <Paper
                        key={postulante.id}
                        elevation={0}
                        onClick={() => handleTogglePostulante(postulante.id)}
                        sx={{
                          p: 1.5,
                          borderRadius: '14px',
                          border: isChecked
                            ? `1.5px solid ${accent}`
                            : `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                          bgcolor: isChecked
                            ? alpha(accent, isDark ? 0.12 : 0.06)
                            : isDark
                            ? alpha('#fff', 0.02)
                            : '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1.5,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: accent,
                          },
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Checkbox
                            checked={isChecked}
                            onChange={() => handleTogglePostulante(postulante.id)}
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                              color: alpha(accent, 0.6),
                              '&.Mui-checked': { color: accent },
                              p: 0.5,
                            }}
                          />
                          <Avatar
                            src={postulante.estudiante_foto || undefined}
                            sx={{
                              width: 38,
                              height: 38,
                              bgcolor: alpha(accent, 0.2),
                              color: accent,
                              fontWeight: 700,
                              fontSize: '0.95rem',
                            }}
                          >
                            {postulante.estudiante_nombre?.[0] || 'E'}
                          </Avatar>
                          <Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" fontWeight={800} color="text.primary">
                                {postulante.estudiante_nombre}
                              </Typography>
                              {postulante.es_actual && (
                                <Chip
                                  label="Actual"
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    bgcolor: alpha(accent, 0.15),
                                    color: accent,
                                  }}
                                />
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {postulante.grado_nombre || 'Grado sin asignar'} • Turno{' '}
                              {postulante.turno_nombre || 'Mañana'} • Cód:{' '}
                              {postulante.codigo_inscripcion}
                            </Typography>
                          </Box>
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={postulante.estado}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              height: 22,
                              fontWeight: 600,
                              textTransform: 'capitalize',
                            }}
                          />
                          <Tooltip title="Abrir expediente detallado">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/preinscripciones/detalle/${postulante.id}`);
                              }}
                              sx={{
                                color: 'text.secondary',
                                '&:hover': { color: accent },
                              }}
                            >
                              <OpenInNewIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              {/* Formulario de Fecha, Hora y Modalidad */}
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="text.primary" mb={2}>
                  Datos de la Cita de Entrevista:
                </Typography>

                <Grid container spacing={2}>
                  {/* Selector Fecha y Hora */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DateTimePicker
                      label="Fecha y Hora de la Entrevista *"
                      value={fechaEntrevista}
                      onChange={(newVal) => setFechaEntrevista(newVal)}
                      ampm={false}
                      format="DD/MM/YYYY HH:mm"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          helperText: 'Horario institucional de atención',
                        },
                      }}
                    />
                  </Grid>

                  {/* Modalidad */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Modalidad de la Entrevista</InputLabel>
                      <Select
                        value={modalidad}
                        label="Modalidad de la Entrevista"
                        onChange={(e) => setModalidad(e.target.value as 'presencial' | 'virtual')}
                      >
                        <MenuItem value="presencial">
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationOnIcon fontSize="small" sx={{ color: '#ef4444' }} />
                            Presencial (en el Colegio)
                          </Box>
                        </MenuItem>
                        <MenuItem value="virtual">
                          <Box display="flex" alignItems="center" gap={1}>
                            <VideocamIcon fontSize="small" sx={{ color: '#3b82f6' }} />
                            Virtual (Google Meet / Video)
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Lugar o Enlace */}
                  <Grid size={{ xs: 12 }}>
                    {modalidad === 'presencial' ? (
                      <TextField
                        fullWidth
                        size="small"
                        label="Lugar presencial *"
                        value={lugar}
                        onChange={(e) => setLugar(e.target.value)}
                        placeholder="Ej: Dirección del Colegio - Oficina Principal"
                      />
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        label="Enlace de reunión virtual (Google Meet / Zoom)"
                        value={enlaceVirtual}
                        onChange={(e) => setEnlaceVirtual(e.target.value)}
                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                        helperText="Si lo dejas vacío, se indicará que se enviará momentos antes por WhatsApp"
                      />
                    )}
                  </Grid>

                  {/* Observaciones opcionales */}
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      label="Observaciones o Requisitos para los Padres (Opcional)"
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Ej: Es indispensable traer los boletines y carnet de vacunas originales de ambos postulantes."
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Switch WhatsApp */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  bgcolor: isDark ? alpha('#16a34a', 0.1) : '#f0fdf4',
                  border: `1px solid ${alpha('#16a34a', 0.25)}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={800} color="text.primary">
                    Enviar Notificación Oficial de Citación por WhatsApp
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Envía un solo mensaje consolidado al tutor con el detalle de todos los postulantes
                  </Typography>
                </Box>
                <Switch
                  checked={notificarWhatsapp}
                  onChange={(e) => setNotificarWhatsapp(e.target.checked)}
                  color="success"
                />
              </Box>

              {/* Vista previa del mensaje */}
              {notificarWhatsapp && (
                <Box>
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    VISTA PREVIA DEL MENSAJE QUE RECIBIRÁ EL PADRE / TUTOR:
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 0.8,
                      p: 2,
                      borderRadius: '14px',
                      bgcolor: isDark ? '#021e14' : '#dcf8c6',
                      border: '1px solid rgba(22, 163, 74, 0.3)',
                      fontFamily: 'monospace',
                      fontSize: '0.82rem',
                      whiteSpace: 'pre-wrap',
                      color: isDark ? '#bbf7d0' : '#14532d',
                    }}
                  >
                    {`Estimado/a ${tutorNombre}, le saludamos cordialmente de la Unidad Educativa Privada La Voz de Cristo.

Le recordamos el cronograma oficial de la entrevista institucional de prioridad familiar para sus hijos postulantes: ${
                      previewHijos || '[Ninguno]'
                    }:

📅 Fecha y Hora: ${previewFecha}
🏛️ Modalidad: ${modalidad.toUpperCase()}
📍 Lugar: ${previewLugar}

Es indispensable la asistencia del tutor junto con los postulantes.

💡 Nota: Para su comodidad y optimizar su tiempo, se llevará a cabo una sola entrevista conjunta para toda la familia.${
                      observaciones ? `\n\n📝 Observaciones: ${observaciones}` : ''
                    }${
                      modalidad !== 'virtual'
                        ? '\n\n📍 Ubicación del Colegio (Google Maps):\nhttps://maps.app.goo.gl/dWapCMNPguGBMUTv9'
                        : ''
                    }

Secretaría General: +591 69624189`}
                  </Paper>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            pt: 1.5,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={submitting}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardar}
            disabled={submitting || loading || selectedIds.length === 0}
            startIcon={
              submitting ? <CircularProgress size={18} color="inherit" /> : <CalendarMonthIcon />
            }
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              bgcolor: accent,
              color: isDark ? '#000' : '#fff',
              '&:hover': {
                bgcolor: alpha(accent, 0.85),
              },
            }}
          >
            {submitting
              ? 'Agendando...'
              : `Agendar Cita para ${selectedIds.length} Hermano(s)`}
          </Button>
        </DialogActions>
      </LocalizationProvider>
    </Dialog>
  );
}

