// components/reservaCupo/admin/ModalNuevaReservaAdmin.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Avatar,
  IconButton,
  Paper,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  FamilyRestroom as FamilyIcon,
  PictureAsPdf as PdfIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  RestartAlt as RestartAltIcon,
  WarningAmber as WarningAmberIcon,
  EventNote as EventNoteIcon,
  Badge as BadgeIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import reservaCupoService from '@/services/reservaCupoService';
import {
  ValidarEstudianteResponse,
  HermanoParaReserva,
  ConfirmarReservaPayload,
} from '@/types/reservaCupoTypes';
import toast from 'react-hot-toast';

interface ModalNuevaReservaAdminProps {
  open: boolean;
  onClose: () => void;
  onReservaExitosa?: () => void;
}

export const ModalNuevaReservaAdmin: React.FC<ModalNuevaReservaAdminProps> = ({
  open,
  onClose,
  onReservaExitosa,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── Tokens visuales institucionales ──
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#0f172a' : '#ffffff';
  const bgCard = isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc';
  const borderCard = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';

  // ── Estados de Búsqueda del Estudiante Regular ──
  const [ciInput, setCiInput] = useState('');
  const [isBuscando, setIsBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [datosEstudiante, setDatosEstudiante] = useState<ValidarEstudianteResponse['data'] | null>(null);

  // ── Estados del Formulario de Reserva ──
  const [confirmaContinuidad, setConfirmaContinuidad] = useState(true);
  const [motivoNoContinua, setMotivoNoContinua] = useState('');
  const [turnoDestinoId, setTurnoDestinoId] = useState<number>(1);

  // Datos del Tutor / Responsable
  const [tutorNombre, setTutorNombre] = useState('');
  const [tutorCi, setTutorCi] = useState('');
  const [tutorParentesco, setTutorParentesco] = useState('Padre');
  const [tutorTelefono, setTutorTelefono] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // ── Sección Opcional: Hermanos Postulantes ──
  const [mostrarSeccionHermanos, setMostrarSeccionHermanos] = useState(false);
  const [gradosDisponibles, setGradosDisponibles] = useState<Array<{ id: number; nombre: string; nivel_nombre?: string }>>([]);
  const [loadingGrados, setLoadingGrados] = useState(false);

  // Formulario rápido para hermano
  const [hermanosAgregados, setHermanosAgregados] = useState<HermanoParaReserva[]>([]);
  const [hNombres, setHNombres] = useState('');
  const [hApPaterno, setHApPaterno] = useState('');
  const [hApMaterno, setHApMaterno] = useState('');
  const [hCi, setHCi] = useState('');
  const [hFechaNacimiento, setHFechaNacimiento] = useState('');
  const [hGenero, setHGenero] = useState<'M' | 'F'>('M');
  const [hGradoId, setHGradoId] = useState<number | ''>('');
  const [hTurnoId, setHTurnoId] = useState<number>(1);

  // ── Estados de Envío y Resultado ──
  const [isConfirmando, setIsConfirmando] = useState(false);
  const [reservaConfirmadaData, setReservaConfirmadaData] = useState<{
    principal?: any;
    hermanos?: any[];
  } | null>(null);

  // Cargar lista de grados para postulaciones de hermanos
  useEffect(() => {
    if (open && mostrarSeccionHermanos && gradosDisponibles.length === 0) {
      setLoadingGrados(true);
      reservaCupoService
        .obtenerGradosDisponibles()
        .then((data) => setGradosDisponibles(data))
        .catch((e) => console.error('Error al cargar grados:', e))
        .finally(() => setLoadingGrados(false));
    }
  }, [open, mostrarSeccionHermanos, gradosDisponibles.length]);

  // Resetear estados al cerrar
  const handleReset = () => {
    setCiInput('');
    setIsBuscando(false);
    setErrorBusqueda(null);
    setDatosEstudiante(null);
    setConfirmaContinuidad(true);
    setMotivoNoContinua('');
    setTurnoDestinoId(1);
    setTutorNombre('');
    setTutorCi('');
    setTutorParentesco('Padre');
    setTutorTelefono('');
    setObservaciones('');
    setMostrarSeccionHermanos(false);
    setHermanosAgregados([]);
    setHNombres('');
    setHApPaterno('');
    setHApMaterno('');
    setHCi('');
    setHFechaNacimiento('');
    setHGenero('M');
    setHGradoId('');
    setHTurnoId(1);
    setIsConfirmando(false);
    setReservaConfirmadaData(null);
  };

  const handleCerrar = () => {
    handleReset();
    onClose();
  };

  // Buscar Estudiante Regular por CI
  const handleBuscar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const ciLimpio = ciInput.trim();
    if (!ciLimpio) {
      setErrorBusqueda('Por favor ingresa el Carnet de Identidad (CI) del estudiante.');
      return;
    }

    setIsBuscando(true);
    setErrorBusqueda(null);
    setDatosEstudiante(null);

    try {
      const data = await reservaCupoService.validarEstudiantePorCI(ciLimpio);
      setDatosEstudiante(data);

      if (data.ya_reservado && data.reserva) {
        // Ya tiene reserva confirmada
        setErrorBusqueda(null);
      } else if (data.proyeccion_siguiente) {
        // Fijar el turno sugerido o por defecto
        const turnoDefecto =
          data.gestion_actual?.turno_id ||
          data.proyeccion_siguiente.turno_sugerido_id ||
          1;
        setTurnoDestinoId(turnoDefecto);
      }
    } catch (err: any) {
      console.error('Error al buscar estudiante:', err);
      const msg =
        err.response?.data?.message ||
        'No se encontró ningún estudiante regular activo con ese número de CI.';
      setErrorBusqueda(msg);
    } finally {
      setIsBuscando(false);
    }
  };

  // Agregar hermano a la lista temporal
  const handleAgregarHermano = () => {
    if (!hNombres.trim() || !hApPaterno.trim()) {
      toast.error('Ingrese los nombres y apellido paterno del hermano.');
      return;
    }
    if (!hFechaNacimiento) {
      toast.error('Ingrese la fecha de nacimiento del hermano.');
      return;
    }
    if (!hGradoId) {
      toast.error('Seleccione el grado solicitado para el hermano.');
      return;
    }

    const gradoObj = gradosDisponibles.find((g) => g.id === Number(hGradoId));

    const nuevoHermano: HermanoParaReserva = {
      id_temp: `temp_${Date.now()}_${Math.random()}`,
      hermano_regular_id: datosEstudiante?.estudiante?.id || 0,
      hermano_regular_nombre: datosEstudiante?.estudiante?.nombre_completo,
      nombres: hNombres.trim(),
      apellido_paterno: hApPaterno.trim(),
      apellido_materno: hApMaterno.trim() || undefined,
      ci: hCi.trim() || undefined,
      fecha_nacimiento: hFechaNacimiento,
      genero: hGenero,
      grado_solicitado_id: Number(hGradoId),
      grado_solicitado_nombre: gradoObj ? gradoObj.nombre : 'Grado Solicitado',
      turno_solicitado_id: hTurnoId,
      turno_solicitado_nombre: hTurnoId === 1 ? 'Mañana' : 'Tarde',
    };

    setHermanosAgregados((prev) => [...prev, nuevoHermano]);

    // Limpiar campos del hermano
    setHNombres('');
    setHApPaterno('');
    setHApMaterno('');
    setHCi('');
    setHFechaNacimiento('');
    setHGenero('M');
    setHGradoId('');
    toast.success('Hermano agregado a la postulación familiar.');
  };

  const handleEliminarHermano = (idTemp: string) => {
    setHermanosAgregados((prev) => prev.filter((h) => h.id_temp !== idTemp));
  };

  // Enviar Confirmación de Reserva
  const handleConfirmarReserva = async () => {
    if (!datosEstudiante?.estudiante || !datosEstudiante?.proyeccion_siguiente) {
      toast.error('Faltan datos del estudiante para confirmar la reserva.');
      return;
    }

    if (!tutorNombre.trim()) {
      toast.error('Ingrese el nombre del tutor o persona responsable.');
      return;
    }
    if (!tutorCi.trim()) {
      toast.error('Ingrese el CI del tutor o persona responsable.');
      return;
    }
    if (!tutorTelefono.trim() || tutorTelefono.trim().length < 7) {
      toast.error('Ingrese un número de teléfono / WhatsApp válido (mín. 7 dígitos).');
      return;
    }

    setIsConfirmando(true);
    try {
      const periodoDestinoId = datosEstudiante.proyeccion_siguiente.periodo_id;

      const payload: ConfirmarReservaPayload = {
        periodo_academico_id: periodoDestinoId,
        estudiantes: [
          {
            estudiante_id: datosEstudiante.estudiante.id,
            grado_actual_id: datosEstudiante.gestion_actual?.grado_id || null,
            grado_destino_id: datosEstudiante.proyeccion_siguiente.grado_id,
            turno_destino_id: turnoDestinoId,
            continua: confirmaContinuidad,
            confirma_continuidad: confirmaContinuidad,
            motivo_no_continua: !confirmaContinuidad ? motivoNoContinua : undefined,
          },
        ],
        hermanos: hermanosAgregados.map((h) => ({
          hermano_regular_id: datosEstudiante.estudiante!.id,
          grado_solicitado_id: h.grado_solicitado_id,
          turno_solicitado_id: h.turno_solicitado_id,
          nombres: h.nombres,
          apellido_paterno: h.apellido_paterno,
          apellido_materno: h.apellido_materno || '',
          ci: h.ci || '',
          fecha_nacimiento: h.fecha_nacimiento,
          genero: h.genero,
          observaciones: h.observaciones || 'Registro presencial en administración',
        })),
        tutor_nombre: tutorNombre.trim(),
        tutor_ci: tutorCi.trim(),
        tutor_parentesco: tutorParentesco,
        tutor_telefono: tutorTelefono.trim(),
        observaciones:
          observaciones.trim() ||
          'Reserva de cupo registrada presencialmente desde el Panel de Administración',
      };

      const respuesta = await reservaCupoService.confirmarReserva(payload);

      const principalGenerado =
        respuesta.reserva_principal || respuesta.reservas?.[0];
      const hermanosGenerados = respuesta.hermanos || [];

      setReservaConfirmadaData({
        principal: principalGenerado,
        hermanos: hermanosGenerados,
      });

      toast.success('¡Reserva registrada con éxito!');
      onReservaExitosa?.();
    } catch (err: any) {
      console.error('Error al confirmar reserva:', err);
      const msg =
        err.response?.data?.message ||
        'Ocurrió un error al confirmar la reserva. Revise los datos.';
      toast.error(msg);
    } finally {
      setIsConfirmando(false);
    }
  };

  const getInitials = (nombres?: string, apPaterno?: string) => {
    const n = nombres ? nombres.charAt(0) : '';
    const p = apPaterno ? apPaterno.charAt(0) : '';
    return (n + p).toUpperCase() || 'ES';
  };

  return (
    <Dialog
      open={open}
      onClose={handleCerrar}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: bgModal,
          borderRadius: '20px',
          border: `1.5px solid ${brandBorder}`,
          backgroundImage: 'none',
          boxShadow: isDark
            ? '0 25px 60px rgba(0,0,0,0.7)'
            : '0 20px 50px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* ── Encabezado ── */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2.5,
          pb: 1.5,
          borderBottom: `1px solid ${borderCard}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: brandDim,
              color: brand,
              border: `1.5px solid ${brand}`,
              width: 44,
              height: 44,
            }}
          >
            <SchoolIcon />
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight={800} color="text.primary">
                Nueva Reserva de Cupo
              </Typography>
              <Chip
                label="Administración"
                size="small"
                sx={{
                  bgcolor: brandDim,
                  color: brand,
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  height: 22,
                }}
              />
              <Chip
                label="Gestión 2027"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.12)',
                  color: '#10b981',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  height: 22,
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Registra la reserva regular y/o hermanos presencialmente en secretaría
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleCerrar}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* ── VISTA TRAS CONFIRMACIÓN EXITOSA ── */}
        {reservaConfirmadaData ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '2px solid #10b981',
                mx: 'auto',
                mb: 2,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 44 }} />
            </Avatar>

            <Typography variant="h5" fontWeight={800} color="text.primary" gutterBottom>
              ¡Reserva Registrada Exitosamente!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
              El cupo para el estudiante regular y sus postulaciones familiares han sido confirmados en el sistema institucional.
            </Typography>

            {/* Tarjeta del Recibo del Estudiante Principal */}
            {reservaConfirmadaData.principal && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  maxWidth: 520,
                  mx: 'auto',
                  borderRadius: '14px',
                  bgcolor: bgCard,
                  border: `1.5px solid ${borderCard}`,
                  textAlign: 'left',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      Estudiante Regular Confirmado:
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                      {reservaConfirmadaData.principal.estudiante_nombre_completo ||
                        reservaConfirmadaData.principal.estudiante_nombres}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Código de Cupo: <strong>{reservaConfirmadaData.principal.codigo_reserva}</strong>
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PdfIcon />}
                    onClick={() =>
                      reservaCupoService.descargarPDF(
                        reservaConfirmadaData.principal.codigo_reserva
                      )
                    }
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 700,
                      bgcolor: '#ef4444',
                      '&:hover': { bgcolor: '#dc2626' },
                    }}
                  >
                    Descargar Recibo PDF
                  </Button>
                </Box>
              </Paper>
            )}

            {/* Recibos de Hermanos si los hubo */}
            {reservaConfirmadaData.hermanos &&
              reservaConfirmadaData.hermanos.length > 0 && (
                <Box sx={{ maxWidth: 520, mx: 'auto', mb: 3, textAlign: 'left' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ display: 'block', mb: 1 }}>
                    Hermanos Postulantes con Prioridad Familiar:
                  </Typography>
                  <Stack spacing={1}>
                    {reservaConfirmadaData.hermanos.map((h: any, idx: number) => (
                      <Paper
                        key={idx}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          bgcolor: bgCard,
                          border: `1px solid ${borderCard}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={800}>
                            {h.nombres} {h.apellido_paterno}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Cód: <strong>{h.codigo_reserva}</strong> · {h.grado_solicitado_nombre || 'Grado Solicitado'}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<PdfIcon />}
                          onClick={() => reservaCupoService.descargarPDF(h.codigo_reserva)}
                          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                        >
                          PDF Hermano
                        </Button>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 3,
                }}
              >
                Registrar Otra Reserva
              </Button>
              <Button
                variant="contained"
                onClick={handleCerrar}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 800,
                  textTransform: 'none',
                  px: 4,
                  bgcolor: brand,
                  color: isDark ? '#000' : '#fff',
                  '&:hover': {
                    bgcolor: isDark ? '#eab308' : '#01579b',
                  },
                }}
              >
                Finalizar y Cerrar
              </Button>
            </Box>
          </Box>
        ) : (
          /* ── FORMULARIO DE REGISTRO EN MODAL ── */
          <Box>
            {/* Paso 1: Buscador por CI */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2.5,
                borderRadius: '14px',
                bgcolor: bgCard,
                border: `1px solid ${borderCard}`,
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} color="text.primary" sx={{ mb: 1 }}>
                Paso 1: Identificar Estudiante Regular por CI
              </Typography>
              <Box component="form" onSubmit={handleBuscar} sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ingrese el Carnet de Identidad (CI) del estudiante..."
                  value={ciInput}
                  onChange={(e) => setCiInput(e.target.value)}
                  disabled={isBuscando}
                  sx={{
                    flex: 1,
                    minWidth: { xs: '100%', sm: 260 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isBuscando || !ciInput.trim()}
                  startIcon={isBuscando ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                  sx={{
                    borderRadius: '12px',
                    px: 3,
                    fontWeight: 800,
                    textTransform: 'none',
                    bgcolor: brand,
                    color: isDark ? '#000' : '#fff',
                    '&:hover': {
                      bgcolor: isDark ? '#eab308' : '#01579b',
                    },
                  }}
                >
                  {isBuscando ? 'Buscando...' : 'Buscar Alumno'}
                </Button>
              </Box>

              {errorBusqueda && (
                <Alert severity="error" sx={{ mt: 1.5, borderRadius: '10px' }}>
                  {errorBusqueda}
                </Alert>
              )}
            </Paper>

            {/* Caso: El estudiante ya cuenta con una reserva confirmada */}
            {datosEstudiante?.ya_reservado && datosEstudiante?.reserva && (
              <Alert
                severity="info"
                icon={<EventNoteIcon fontSize="inherit" />}
                sx={{
                  mb: 2.5,
                  borderRadius: '14px',
                  bgcolor: isDark ? alpha('#3b82f6', 0.15) : alpha('#3b82f6', 0.08),
                  border: `1.5px solid ${alpha('#3b82f6', 0.4)}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight={800} color="#3b82f6" gutterBottom>
                  Este estudiante ya cuenta con Reserva Confirmada para 2027
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                  Alumno: <strong>{datosEstudiante.estudiante?.nombre_completo || 'Estudiante'}</strong> · CI: <strong>{datosEstudiante.estudiante?.ci}</strong>
                  <br />
                  Código de Reserva: <strong>{datosEstudiante.reserva.codigo_reserva}</strong> · Fecha: {datosEstudiante.reserva.fecha_reserva_formateada || 'Registrada'}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  color="info"
                  startIcon={<PdfIcon />}
                  onClick={() => reservaCupoService.descargarPDF(datosEstudiante.reserva!.codigo_reserva)}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                >
                  Ver / Descargar Recibo PDF Oficial
                </Button>
              </Alert>
            )}

            {/* Caso: Estudiante regular encontrado y elegible para reservar */}
            {datosEstudiante && !datosEstudiante.ya_reservado && datosEstudiante.estudiante && (
              <Box>
                {/* Tarjeta Informativa del Estudiante y Proyección */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2.5,
                    borderRadius: '14px',
                    bgcolor: isDark ? alpha('#10b981', 0.08) : alpha('#10b981', 0.05),
                    border: `1.5px solid ${alpha('#10b981', 0.35)}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 46,
                        height: 46,
                        bgcolor: alpha('#10b981', 0.2),
                        color: '#10b981',
                        fontWeight: 800,
                        border: '1.5px solid #10b981',
                      }}
                    >
                      {getInitials(
                        datosEstudiante.estudiante.nombres,
                        datosEstudiante.estudiante.apellido_paterno
                      )}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" fontWeight={800} color="text.primary" noWrap>
                          {datosEstudiante.estudiante.nombre_completo}
                        </Typography>
                        <Chip
                          label="Estudiante Regular Activo"
                          size="small"
                          color="success"
                          sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        CI: <strong>{datosEstudiante.estudiante.ci}</strong> · Cód: <strong>{datosEstudiante.estudiante.codigo}</strong>
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1.2 }} />

                  {/* Comparativa Gestión Actual vs Destino 2027 */}
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                        Gestión Actual ({datosEstudiante.gestion_actual?.periodo_nombre || '2026'}):
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="text.primary">
                        {datosEstudiante.gestion_actual?.grado_nombre} (
                        {datosEstudiante.gestion_actual?.nivel_nombre})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Turno: <strong>{datosEstudiante.gestion_actual?.turno_nombre || 'Mañana'}</strong>
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }} sx={{ textAlign: 'center', display: { xs: 'none', sm: 'block' } }}>
                      <ArrowForwardIcon sx={{ color: '#10b981', fontSize: 26 }} />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 5 }}>
                      <Typography variant="caption" color="#10b981" fontWeight={800} display="block">
                        Proyección Gestión 2027:
                      </Typography>
                      <Typography variant="body2" fontWeight={800} color="#10b981">
                        {datosEstudiante.proyeccion_siguiente?.grado_nombre} (
                        {datosEstudiante.proyeccion_siguiente?.nivel_nombre})
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <InputLabel>Turno 2027</InputLabel>
                          <Select
                            value={turnoDestinoId}
                            label="Turno 2027"
                            onChange={(e) => setTurnoDestinoId(Number(e.target.value))}
                            sx={{ borderRadius: '10px', height: 34 }}
                          >
                            <MenuItem value={1}>Turno Mañana</MenuItem>
                            <MenuItem value={2}>Turno Tarde</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 1.5, pt: 1, borderTop: `1px dashed ${borderCard}` }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={confirmaContinuidad}
                          onChange={(e) => setConfirmaContinuidad(e.target.checked)}
                          color="success"
                        />
                      }
                      label={
                        <Typography variant="body2" fontWeight={700} color="text.primary">
                          {confirmaContinuidad
                            ? '✅ Confirma Continuidad de Estudios para la Gestión 2027'
                            : '❌ No continuará en el establecimiento para la Gestión 2027'}
                        </Typography>
                      }
                    />
                    {!confirmaContinuidad && (
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Especifique el motivo por el cual no continuará (ej: traslado, cambio de domicilio...)"
                        value={motivoNoContinua}
                        onChange={(e) => setMotivoNoContinua(e.target.value)}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                </Paper>

                {/* Paso 2: Datos del Tutor / Responsable */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2.5,
                    borderRadius: '14px',
                    bgcolor: bgCard,
                    border: `1px solid ${borderCard}`,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={800} color="text.primary" sx={{ mb: 1.5 }}>
                    Paso 2: Datos de Quien Realiza el Trámite (Tutor / Apoderado)
                  </Typography>

                  <Grid container spacing={1.8}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        required
                        size="small"
                        label="Nombre Completo del Tutor"
                        value={tutorNombre}
                        onChange={(e) => setTutorNombre(e.target.value)}
                        placeholder="Ej: Juan Carlos Pérez Gómez"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        fullWidth
                        required
                        size="small"
                        label="Carnet de Identidad (CI)"
                        value={tutorCi}
                        onChange={(e) => setTutorCi(e.target.value)}
                        placeholder="Ej: 5489123"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Parentesco</InputLabel>
                        <Select
                          value={tutorParentesco}
                          label="Parentesco"
                          onChange={(e) => setTutorParentesco(e.target.value)}
                        >
                          <MenuItem value="Padre">Padre</MenuItem>
                          <MenuItem value="Madre">Madre</MenuItem>
                          <MenuItem value="Tutor Legal">Tutor Legal</MenuItem>
                          <MenuItem value="Abuelo/a">Abuelo/a</MenuItem>
                          <MenuItem value="Tío/a">Tío/a</MenuItem>
                          <MenuItem value="Otro">Otro</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        required
                        size="small"
                        label="Teléfono / Celular (WhatsApp)"
                        value={tutorTelefono}
                        onChange={(e) => setTutorTelefono(e.target.value)}
                        placeholder="Ej: 71234567"
                        helperText="Se enviará confirmación y citación"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Observaciones Administrativas (Opcional)"
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Notas o aclaraciones de secretaría..."
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Paso 3: Sección Opcional de Hermanos Nuevos */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2.5,
                    borderRadius: '14px',
                    bgcolor: bgCard,
                    border: `1px solid ${borderCard}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FamilyIcon sx={{ color: brand }} />
                      <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                        ¿Registrar Hermano(s) para Admisión 2027? (Prioridad Familiar)
                      </Typography>
                    </Box>
                    <Switch
                      checked={mostrarSeccionHermanos}
                      onChange={(e) => setMostrarSeccionHermanos(e.target.checked)}
                      color="primary"
                    />
                  </Box>

                  {mostrarSeccionHermanos && (
                    <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px dashed ${borderCard}` }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        Ingresa los datos del hermano nuevo postulante. El sistema le asignará prioridad familiar vinculada a este estudiante regular.
                      </Typography>

                      <Grid container spacing={1.5} alignItems="center">
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Nombres del Hermano"
                            value={hNombres}
                            onChange={(e) => setHNombres(e.target.value)}
                            placeholder="Ej: Lucas Mateo"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Apellido Paterno"
                            value={hApPaterno}
                            onChange={(e) => setHApPaterno(e.target.value)}
                            placeholder="Ej: Pérez"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Apellido Materno"
                            value={hApMaterno}
                            onChange={(e) => setHApMaterno(e.target.value)}
                            placeholder="Ej: Gómez"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="CI (Opcional)"
                            value={hCi}
                            onChange={(e) => setHCi(e.target.value)}
                            placeholder="Sin CI o número"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Fecha Nacimiento"
                            InputLabelProps={{ shrink: true }}
                            value={hFechaNacimiento}
                            onChange={(e) => setHFechaNacimiento(e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 2 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Género</InputLabel>
                            <Select
                              value={hGenero}
                              label="Género"
                              onChange={(e) => setHGenero(e.target.value as 'M' | 'F')}
                            >
                              <MenuItem value="M">Masc.</MenuItem>
                              <MenuItem value="F">Fem.</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Grado Solicitado</InputLabel>
                            <Select
                              value={hGradoId}
                              label="Grado Solicitado"
                              onChange={(e) => setHGradoId(Number(e.target.value))}
                            >
                              {gradosDisponibles.map((g) => (
                                <MenuItem key={g.id} value={g.id}>
                                  {g.nombre} {g.nivel_nombre ? `(${g.nivel_nombre})` : ''}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Turno Solicitado</InputLabel>
                            <Select
                              value={hTurnoId}
                              label="Turno Solicitado"
                              onChange={(e) => setHTurnoId(Number(e.target.value))}
                            >
                              <MenuItem value={1}>Mañana</MenuItem>
                              <MenuItem value={2}>Tarde</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={handleAgregarHermano}
                            sx={{
                              borderRadius: '10px',
                              textTransform: 'none',
                              fontWeight: 700,
                              py: 0.9,
                            }}
                          >
                            + Agregar Este Hermano
                          </Button>
                        </Grid>
                      </Grid>

                      {/* Lista de Hermanos agregados */}
                      {hermanosAgregados.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Hermanos agregados a la postulación ({hermanosAgregados.length}):
                          </Typography>
                          <Stack spacing={1}>
                            {hermanosAgregados.map((h) => (
                              <Paper
                                key={h.id_temp}
                                elevation={0}
                                sx={{
                                  p: 1.2,
                                  borderRadius: '10px',
                                  bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
                                  border: `1px solid ${borderCard}`,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <Box>
                                  <Typography variant="body2" fontWeight={800}>
                                    {h.nombres} {h.apellido_paterno} {h.apellido_materno || ''}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Solicita: <strong>{h.grado_solicitado_nombre}</strong> · Turno: <strong>{h.turno_solicitado_nombre}</strong> {h.ci ? `· CI: ${h.ci}` : ''}
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleEliminarHermano(h.id_temp)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Paper>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  )}
                </Paper>

                {/* Botón de Confirmación Principal */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCerrar}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 3,
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    disabled={isConfirmando}
                    startIcon={
                      isConfirmando ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <CheckCircleIcon />
                      )
                    }
                    onClick={handleConfirmarReserva}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 800,
                      px: 4,
                      py: 1.2,
                      bgcolor: brand,
                      color: isDark ? '#000' : '#fff',
                      '&:hover': {
                        bgcolor: isDark ? '#eab308' : '#01579b',
                      },
                    }}
                  >
                    {isConfirmando
                      ? 'Confirmando Reserva...'
                      : 'Confirmar y Guardar Reserva'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModalNuevaReservaAdmin;
