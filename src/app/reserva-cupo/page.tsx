// app/reserva-cupo/page.tsx
'use client';
import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Collapse,
  useTheme,
  alpha
} from '@mui/material';
import '@fontsource/roboto';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Badge as BadgeIcon,
  EventAvailable as EventAvailableIcon,
  FamilyRestroom as FamilyIcon,
  Schedule as ScheduleIcon,
  Lock as LockIcon,
  Clear as ClearIcon,
  CancelOutlined as CancelIcon
} from '@mui/icons-material';
import Header from '../login/Header';
import reservaCupoService from '@/services/reservaCupoService';
import {
  EstudianteSeleccionadoParaReserva,
  ReservaCupoData
} from '@/types/reservaCupoTypes';
import ReciboReservaCard from '@/components/reservaCupo/ReciboReservaCard';
import ModalEstudianteNoEncontrado from '@/components/reservaCupo/ModalEstudianteNoEncontrado';

const steps = [
  { label: 'Buscar Estudiante por CI', color: '#0288d1' },
  { label: 'Continuidad y Quien Reserva', color: '#10b981' },
  { label: 'Recibo Oficial', color: '#01579b' }
];

const PARENTESCOS = [
  'Padre',
  'Madre',
  'Tutor Legal'
];

export default function ReservaCupoPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [activeStep, setActiveStep] = useState(0);

  // Estados de búsqueda por CI
  const [ciInput, setCiInput] = useState('');
  const [isValidando, setIsValidando] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  // Estados para Modal de Estudiante No Encontrado / CI Inválido
  const [modalNoEncontradoOpen, setModalNoEncontradoOpen] = useState(false);
  const [ciConsultadoModal, setCiConsultadoModal] = useState('');
  const [modalErrorTipo, setModalErrorTipo] = useState<string>('ESTUDIANTE_NO_ENCONTRADO');
  const [modalErrorMensaje, setModalErrorMensaje] = useState<string>('');
  const [modalNombreEstudiante, setModalNombreEstudiante] = useState<string | undefined>(undefined);
  const [origenBusqueda, setOrigenBusqueda] = useState<'principal' | 'otro'>('principal');

  // Referencias a los inputs para auto-focus y selección tras reintento
  const ciInputRef = useRef<HTMLInputElement>(null);
  const ciOtroHijoRef = useRef<HTMLInputElement>(null);

  // Lista de estudiantes seleccionados para la reserva
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<EstudianteSeleccionadoParaReserva[]>([]);

  // Agregar otro hijo en el Paso 2
  const [mostrarAgregarOtro, setMostrarAgregarOtro] = useState(false);
  const [ciOtroHijo, setCiOtroHijo] = useState('');
  const [isBuscandoOtro, setIsBuscandoOtro] = useState(false);

  // Datos de quien realiza la reserva
  const [tutorNombre, setTutorNombre] = useState('');
  const [tutorCi, setTutorCi] = useState('');
  const [tutorParentesco, setTutorParentesco] = useState('Padre');
  const [tutorTelefono, setTutorTelefono] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [isConfirmando, setIsConfirmando] = useState(false);
  const [errorConfirmacion, setErrorConfirmacion] = useState<string | null>(null);

  // Resultados de la reserva confirmada
  const [reservasConfirmadas, setReservasConfirmadas] = useState<ReservaCupoData[]>([]);

  // Determinar dinámicamente si al menos un estudiante continuará
  const algunoContinuara = estudiantesSeleccionados.some(item => item.confirma_continuidad);

  // ========================================================
  // ESTILOS IDÉNTICOS A PREINSCRIPCIÓN
  // Modo oscuro: Amarillo / Dorado (#facc15 / #f59e0b)
  // Modo claro: Celeste / Azulado (#0288d1 / #01579b)
  // ========================================================
  const brandPrimary = isDark ? '#facc15' : '#0288d1';
  const brandDeep = isDark ? '#f59e0b' : '#01579b';
  const brandTextContained = isDark ? '#000000' : '#ffffff';
  const brandGradient = isDark
    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
    : 'linear-gradient(135deg, #01579b 0%, #0288d1 100%)';
  const brandGradientHover = isDark
    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    : 'linear-gradient(135deg, #014377 0%, #0277bd 100%)';
  const brandShadow = isDark
    ? '0 8px 25px rgba(250, 204, 21, 0.4)'
    : '0 8px 25px rgba(1, 87, 155, 0.4)';
  const brandShadowHover = isDark
    ? '0 12px 30px rgba(250, 204, 21, 0.55)'
    : '0 12px 30px rgba(1, 87, 155, 0.5)';

  const paperContainerStyle = {
    p: { xs: 3, md: 5 },
    borderRadius: '24px',
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: isDark ? '1px solid rgba(250, 204, 21, 0.2)' : '1px solid rgba(1, 87, 155, 0.15)',
    boxShadow: isDark
      ? '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 25px rgba(250, 204, 21, 0.05)'
      : '0 20px 60px rgba(1, 87, 155, 0.15)',
  };

  const primaryBtnStyle = {
    background: brandGradient,
    color: `${brandTextContained} !important`,
    borderRadius: '12px',
    fontWeight: 800,
    textTransform: 'none',
    px: 4,
    py: 1.5,
    boxShadow: brandShadow,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: brandGradientHover,
      transform: 'translateY(-2px)',
      boxShadow: brandShadowHover,
    },
    '&:disabled': {
      background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
      color: isDark ? 'rgba(255,255,255,0.3) !important' : 'rgba(0,0,0,0.3) !important',
      boxShadow: 'none',
    }
  };

  const confirmBtnStyle = {
    background: brandGradient,
    color: `${brandTextContained} !important`,
    borderRadius: '12px',
    fontWeight: 800,
    textTransform: 'none',
    px: 4,
    py: 1.5,
    boxShadow: brandShadow,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: brandGradientHover,
      transform: 'translateY(-2px)',
      boxShadow: brandShadowHover,
    },
    '&:disabled': {
      background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
      color: isDark ? 'rgba(255,255,255,0.3) !important' : 'rgba(0,0,0,0.3) !important',
      boxShadow: 'none',
    }
  };

  const outlineBtnStyle = {
    border: `2px solid ${brandPrimary}`,
    color: isDark ? '#facc15' : '#01579b',
    borderRadius: '12px',
    fontWeight: 700,
    textTransform: 'none',
    px: 3,
    py: 1.2,
    transition: 'all 0.3s ease',
    '&:hover': {
      border: `2px solid ${brandDeep}`,
      background: isDark ? alpha('#facc15', 0.12) : alpha('#0288d1', 0.08),
      transform: 'translateY(-2px)',
    }
  };

  // ========================================================
  // VALIDACIÓN PRELIMINAR DE CI Y CONTROL DEL MODAL
  // ========================================================
  const validarFormatoCI = (ci: string): { valido: boolean; mensaje?: string } => {
    const ciLimpio = ci.trim();
    if (!ciLimpio) {
      return { valido: false, mensaje: 'Por favor ingresa el Carnet de Identidad (CI) del estudiante' };
    }
    // Debe contener al menos 4 dígitos numéricos
    const digitos = ciLimpio.replace(/\D/g, '');
    if (digitos.length < 4) {
      return {
        valido: false,
        mensaje: 'El Carnet de Identidad debe contener al menos 4 dígitos numéricos (ej: 16721370).'
      };
    }
    // Solo permitir caracteres alfanuméricos, espacios o guiones
    if (!/^[a-zA-Z0-9\s\-]+$/.test(ciLimpio)) {
      return {
        valido: false,
        mensaje: 'El Carnet de Identidad no debe contener caracteres especiales ni símbolos extraños.'
      };
    }
    return { valido: true };
  };

  const handleRetryModal = () => {
    setModalNoEncontradoOpen(false);
    setTimeout(() => {
      if (origenBusqueda === 'principal') {
        ciInputRef.current?.focus();
        ciInputRef.current?.select();
      } else {
        ciOtroHijoRef.current?.focus();
        ciOtroHijoRef.current?.select();
      }
    }, 150);
  };

  // ========================================================
  // BÚSQUEDA Y AGREGADO POR CI
  // ========================================================

  const handleBuscarYAgregar = async (ciABuscar: string, esPrimerEstudiante = true) => {
    const ciLimpio = ciABuscar.trim();
    setErrorValidacion(null);

    // Validación de formato
    const valFormato = validarFormatoCI(ciLimpio);
    if (!valFormato.valido) {
      if (!ciLimpio) {
        setErrorValidacion(valFormato.mensaje || 'Por favor ingresa el Carnet de Identidad (CI) del estudiante');
        if (esPrimerEstudiante) {
          ciInputRef.current?.focus();
        } else {
          ciOtroHijoRef.current?.focus();
        }
        return;
      }

      // Si el usuario ingresó algo inválido (ej: letras, símbolos, menos de 4 dígitos)
      setCiConsultadoModal(ciLimpio);
      setModalErrorTipo('CI_INVALIDO_FORMATO');
      setModalErrorMensaje(valFormato.mensaje || 'Formato de Carnet de Identidad no válido.');
      setModalNombreEstudiante(undefined);
      setOrigenBusqueda(esPrimerEstudiante ? 'principal' : 'otro');
      setModalNoEncontradoOpen(true);
      return;
    }

    // Verificar si el estudiante ya fue agregado previamente a la lista
    const estudianteExistente = estudiantesSeleccionados.find(item => item.estudiante.ci.trim() === ciLimpio);
    if (estudianteExistente) {
      const nombreEst = estudianteExistente.estudiante.nombre_completo || `${estudianteExistente.estudiante.nombres} ${estudianteExistente.estudiante.apellido_paterno}`;
      setCiConsultadoModal(ciLimpio);
      setModalErrorTipo('YA_EN_LISTA');
      setModalNombreEstudiante(nombreEst);
      setModalErrorMensaje(`El estudiante ${nombreEst} ya se encuentra agregado en tu lista de reserva.`);
      setOrigenBusqueda(esPrimerEstudiante ? 'principal' : 'otro');
      setModalNoEncontradoOpen(true);
      return;
    }

    if (esPrimerEstudiante) {
      setIsValidando(true);
    } else {
      setIsBuscandoOtro(true);
    }

    try {
      const data = await reservaCupoService.validarEstudiantePorCI(ciLimpio);

      if (data.ya_reservado && data.reserva) {
        if (esPrimerEstudiante && estudiantesSeleccionados.length === 0) {
          setReservasConfirmadas([data.reserva]);
          setActiveStep(2);
          return;
        } else {
          const nombreEst = data.estudiante?.nombre_completo || 'El estudiante';
          setCiConsultadoModal(ciLimpio);
          setModalErrorTipo('YA_RESERVADO');
          setModalNombreEstudiante(nombreEst);
          setModalErrorMensaje(
            `El estudiante ${nombreEst} ya cuenta con una reserva confirmada para la Gestión 2027 (Código: ${data.reserva.codigo_reserva}).`
          );
          setOrigenBusqueda(esPrimerEstudiante ? 'principal' : 'otro');
          setModalNoEncontradoOpen(true);
          return;
        }
      }

      if (!data.estudiante || !data.gestion_actual || !data.proyeccion_siguiente) {
        setErrorValidacion('No se encontraron los datos académicos del estudiante');
        return;
      }

      // El turno se mantiene automáticamente en el mismo turno actual
      const turnoFijado = data.gestion_actual.turno_id || data.proyeccion_siguiente.turno_sugerido_id || 1;

      const nuevoItem: EstudianteSeleccionadoParaReserva = {
        estudiante: data.estudiante,
        gestion_actual: data.gestion_actual,
        proyeccion_siguiente: data.proyeccion_siguiente,
        turno_seleccionado_id: turnoFijado,
        confirma_continuidad: true // por defecto confirma que continuará
      };

      setEstudiantesSeleccionados(prev => [...prev, nuevoItem]);

      if (esPrimerEstudiante) {
        setActiveStep(1);
        setCiInput('');
      } else {
        setCiOtroHijo('');
        setMostrarAgregarOtro(false);
      }

    } catch (err: any) {
      console.error('Error al validar por CI:', err);
      const errorTipo = err.response?.data?.error_tipo;
      const errorMsg = err.response?.data?.message || 'Error al validar el estudiante. Verifique el Carnet de Identidad.';

      // Abrir modal estilizado si no se encontró el estudiante o si no es regular / bachiller egresado
      if (
        errorTipo === 'ESTUDIANTE_NO_ENCONTRADO' ||
        errorTipo === 'NO_ES_REGULAR' ||
        errorTipo === 'BACHILLER_EGRESADO' ||
        err.response?.status === 400 ||
        err.response?.status === 404
      ) {
        setCiConsultadoModal(ciLimpio);
        setModalErrorTipo(errorTipo || 'ESTUDIANTE_NO_ENCONTRADO');
        setModalErrorMensaje(errorMsg);
        setOrigenBusqueda(esPrimerEstudiante ? 'principal' : 'otro');
        setModalNoEncontradoOpen(true);
      } else {
        setErrorValidacion(errorMsg);
      }
    } finally {
      setIsValidando(false);
      setIsBuscandoOtro(false);
    }
  };

  const handleToggleContinuidad = (estudianteId: number) => {
    setEstudiantesSeleccionados(prev =>
      prev.map(item =>
        item.estudiante.id === estudianteId
          ? { ...item, confirma_continuidad: !item.confirma_continuidad }
          : item
      )
    );
  };

  const handleQuitarEstudiante = (estudianteId: number) => {
    const filtrados = estudiantesSeleccionados.filter(item => item.estudiante.id !== estudianteId);
    setEstudiantesSeleccionados(filtrados);
    if (filtrados.length === 0) {
      setActiveStep(0);
    }
  };

  // ========================================================
  // CONFIRMACIÓN
  // ========================================================

  const handleConfirmarReserva = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorConfirmacion(null);

    // Filtrar solo los estudiantes que confirmaron continuidad
    const estudiantesAConfirmar = estudiantesSeleccionados.filter(item => item.confirma_continuidad);

    if (estudiantesAConfirmar.length === 0) {
      setErrorConfirmacion('Debe confirmar la continuidad de al menos un estudiante para poder realizar la reserva.');
      return;
    }

    if (!tutorNombre.trim()) {
      setErrorConfirmacion('Debe ingresar el nombre de la persona que realiza la reserva');
      return;
    }
    if (!tutorCi.trim()) {
      setErrorConfirmacion('Debe ingresar el carnet de identidad (CI) de quien realiza la reserva');
      return;
    }
    if (!tutorTelefono.trim()) {
      setErrorConfirmacion('Debe ingresar el número de celular / WhatsApp');
      return;
    }

    setIsConfirmando(true);
    try {
      const periodoDestinoId = estudiantesAConfirmar[0]?.proyeccion_siguiente.periodo_id;

      const payload = {
        periodo_academico_id: periodoDestinoId,
        estudiantes: estudiantesAConfirmar.map(item => ({
          estudiante_id: item.estudiante.id,
          grado_actual_id: item.gestion_actual.grado_id || null,
          grado_destino_id: item.proyeccion_siguiente.grado_id,
          turno_destino_id: item.turno_seleccionado_id
        })),
        tutor_nombre: tutorNombre.trim(),
        tutor_ci: tutorCi.trim(),
        tutor_parentesco: tutorParentesco.trim(),
        tutor_telefono: tutorTelefono.trim(),
        observaciones: observaciones.trim() || undefined
      };

      const resultado = await reservaCupoService.confirmarReserva(payload);
      setReservasConfirmadas(resultado.reservas);
      setActiveStep(2);

    } catch (err: any) {
      console.error('Error al confirmar reserva:', err);
      const msg = err.response?.data?.message || 'Error al guardar la reserva. Por favor intenta nuevamente.';
      setErrorConfirmacion(msg);
    } finally {
      setIsConfirmando(false);
    }
  };

  const handleReiniciar = () => {
    setActiveStep(0);
    setCiInput('');
    setCiOtroHijo('');
    setEstudiantesSeleccionados([]);
    setReservasConfirmadas([]);
    setTutorNombre('');
    setTutorCi('');
    setTutorParentesco('Padre');
    setTutorTelefono('');
    setObservaciones('');
    setErrorValidacion(null);
    setErrorConfirmacion(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(135deg, #090B26 0%, #000000 100%)'
          : 'linear-gradient(135deg, #fdfcfb 0%, #B9BED4 100%)',
        pb: 10
      }}
    >
      <Header />

      <Container maxWidth="md" sx={{ pt: { xs: 4, md: 6 }, }}>
        {/* Título Principal estilo PreInscripción */}
        <Box sx={{ textAlign: 'center', mb: 4, mt: 12 }}>
          <Chip
            icon={<EventAvailableIcon sx={{ color: `${brandTextContained} !important`, fontSize: 18 }} />}
            label="GESTIÓN 2027 · ESTUDIANTES REGULARES"
            sx={{
              fontWeight: 800,
              fontSize: '0.8rem',
              px: 2,
              py: 2.2,
              mb: 2,
              color: brandTextContained,
              background: brandGradient,
              boxShadow: brandShadow,
            }}
          />
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 900,
              fontSize: { xs: '1.8rem', sm: '2.4rem', md: '2.8rem' },
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
              mb: 1
            }}
          >
            Reserva de Cupos 2027
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: isDark ? '#cbd5e1' : '#475569',
              maxWidth: 640,
              mx: 'auto',
              fontSize: { xs: '0.95rem', md: '1.05rem' }
            }}
          >
            Confirma la continuidad de estudios de tu hijo/a o familiar en la <strong>U.E.P. La Voz de Cristo</strong>. Ingresa el Carnet de Identidad (CI) del estudiante para apartar su cupo.
          </Typography>
        </Box>

        {/* Stepper Superior Minimalista */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          {steps.map((st, idx) => {
            const isAct = idx === activeStep;
            const isDone = idx < activeStep;
            const activeColor = brandPrimary;
            const doneColor = '#10b981';
            return (
              <Box
                key={st.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.8,
                  borderRadius: '30px',
                  bgcolor: isAct
                    ? alpha(activeColor, 0.15)
                    : isDone
                      ? alpha(doneColor, 0.1)
                      : 'transparent',
                  border: isAct
                    ? `2px solid ${activeColor}`
                    : isDone
                      ? `1.5px solid ${doneColor}`
                      : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                  color: isAct ? activeColor : isDone ? doneColor : 'text.secondary',
                  transition: 'all 0.3s ease'
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: isAct ? activeColor : isDone ? doneColor : isDark ? '#334155' : '#e2e8f0',
                    color: isAct ? brandTextContained : isDone ? '#fff' : 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}
                >
                  {isDone ? '✓' : idx + 1}
                </Box>
                <Typography variant="caption" fontWeight={700} sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {st.label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* ========================================================
            PASO 1: BÚSQUEDA DEL ESTUDIANTE SOLO POR CI
        ======================================================== */}
        {activeStep === 0 && (
          <Paper elevation={0} sx={paperContainerStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '16px',
                  bgcolor: alpha(brandPrimary, 0.15),
                  color: brandPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <SearchIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800} color={brandPrimary}>
                  Paso 1: Identificación del Estudiante Regular
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ingresa únicamente el número de Carnet de Identidad (CI) del alumno.
                </Typography>
              </Box>
            </Box>

            {errorValidacion && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setErrorValidacion(null)}>
                {errorValidacion}
              </Alert>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleBuscarYAgregar(ciInput, true);
              }}
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    inputRef={ciInputRef}
                    label="Carnet de Identidad (CI) del Estudiante"
                    placeholder="Ej: 16721370 o 16636793"
                    value={ciInput}
                    onChange={(e) => {
                      // Permitir solo números, letras, espacios y guiones
                      const val = e.target.value.replace(/[^a-zA-Z0-9\s\-]/g, '');
                      setCiInput(val);
                      if (errorValidacion) setErrorValidacion(null);
                    }}
                    disabled={isValidando}
                    autoFocus
                    required
                    helperText="Número de cédula registrado del estudiante regular (mínimo 4 dígitos)"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '14px',
                        '&.Mui-focused fieldset': {
                          borderColor: brandPrimary,
                          borderWidth: '2px'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: brandPrimary
                      }
                    }}
                    slotProps={{
                      input: {
                        startAdornment: <BadgeIcon sx={{ color: brandPrimary, mr: 1 }} />,
                        endAdornment: ciInput ? (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setCiInput('');
                              ciInputRef.current?.focus();
                            }}
                            edge="end"
                            aria-label="Limpiar campo"
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        ) : null
                      }
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={isValidando}
                    endIcon={isValidando ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                    sx={primaryBtnStyle}
                  >
                    {isValidando ? 'Buscando estudiante...' : 'Consultar y Continuar'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        )}

        {/* ========================================================
            PASO 2: CONFIRMAR CONTINUIDAD Y QUIÉN RESERVA (MULTI-ESTUDIANTE)
        ======================================================== */}
        {activeStep === 1 && estudiantesSeleccionados.length > 0 && (
          <Paper elevation={0} sx={paperContainerStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '16px',
                    bgcolor: alpha(brandPrimary, 0.15),
                    color: brandPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <SchoolIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} color={brandPrimary}>
                    Paso 2: Confirmar Continuidad para Gestión 2027
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revisa el curso al que pasa cada estudiante y registra los datos de quien reserva.
                  </Typography>
                </Box>
              </Box>

              <Chip
                label={`${estudiantesSeleccionados.length} Estudiante(s)`}
                sx={{
                  bgcolor: alpha(brandPrimary, 0.15),
                  color: brandPrimary,
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  py: 1.8,
                  px: 1
                }}
              />
            </Box>

            {errorConfirmacion && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setErrorConfirmacion(null)}>
                {errorConfirmacion}
              </Alert>
            )}

            {errorValidacion && (
              <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setErrorValidacion(null)}>
                {errorValidacion}
              </Alert>
            )}

            {/* LISTA DE TARJETAS POR CADA ESTUDIANTE */}
            <Stack spacing={3} sx={{ mb: 3.5 }}>
              {estudiantesSeleccionados.map((item, index) => (
                <Card
                  key={item.estudiante.id}
                  variant="outlined"
                  sx={{
                    borderRadius: '20px',
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
                    border: `1.5px solid ${item.confirma_continuidad ? (isDark ? 'rgba(250, 204, 21, 0.6)' : '#0288d1') : '#cbd5e1'}`,
                    boxShadow: item.confirma_continuidad ? (isDark ? '0 10px 25px rgba(250, 204, 21, 0.15)' : '0 10px 25px rgba(2, 136, 209, 0.12)') : 'none',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                    {/* Botón para quitar estudiante si hay más de 1 */}
                    {estudiantesSeleccionados.length > 1 && (
                      <Tooltip title="Quitar estudiante de la reserva">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleQuitarEstudiante(item.estudiante.id)}
                          sx={{ position: 'absolute', top: 16, right: 16 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <Chip
                        size="small"
                        label={`Estudiante #${index + 1}`}
                        sx={{ bgcolor: alpha(brandPrimary, 0.15), color: brandPrimary, fontWeight: 800 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        CI: <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>{item.estudiante.ci}</strong>
                      </Typography>
                    </Box>

                    <Typography variant="h5" fontWeight={800} sx={{ color: isDark ? '#ffffff' : '#0f172a', mb: 0.5 }}>
                      {item.estudiante.nombre_completo}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                      Actualmente cursa: <strong>{item.gestion_actual.grado_nombre}</strong> (Turno {item.gestion_actual.turno_nombre})
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {/* Proyección 2027 y Turno Asignado */}
                    <Grid container spacing={2.5} alignItems="center">
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Grado al que Pasa en Gestión 2027:
                        </Typography>
                        <Chip
                          icon={<SchoolIcon fontSize="small" sx={{ color: '#fff !important' }} />}
                          label={item.proyeccion_siguiente.grado_nombre}
                          sx={{
                            bgcolor: '#10b981',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            py: 2.2,
                            px: 1.5,
                            mt: 0.5,
                            borderRadius: '12px'
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Turno Asignado:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip
                            icon={<ScheduleIcon fontSize="small" sx={{ color: `${brandPrimary} !important` }} />}
                            label={`Turno ${item.gestion_actual.turno_nombre}`}
                            sx={{
                              bgcolor: alpha(brandPrimary, 0.15),
                              color: brandPrimary,
                              fontWeight: 800,
                              py: 2,
                              px: 1,
                              borderRadius: '12px'
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            (Mantiene su turno de estudiante regular)
                          </Typography>
                        </Box>
                      </Grid>

                      {/* SWITCH / CONFIRMACIÓN DE CONTINUIDAD */}
                      <Grid size={{ xs: 12 }}>
                        <Box
                          sx={{
                            mt: 1.5,
                            p: 2,
                            borderRadius: '14px',
                            bgcolor: item.confirma_continuidad
                              ? (isDark ? alpha('#10b981', 0.15) : '#f0fdf4')
                              : (isDark ? alpha('#ef4444', 0.15) : '#fef2f2'),
                            border: `1.5px solid ${item.confirma_continuidad ? '#10b981' : '#ef4444'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 1.5
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={800} color={item.confirma_continuidad ? (isDark ? '#4ade80' : '#15803d') : (isDark ? '#f87171' : '#b91c1c')}>
                              {item.confirma_continuidad
                                ? '✓ Confirmo que mi hijo/a CONTINUARÁ en el colegio en la Gestión 2027'
                                : '✕ No continuará en el colegio para la Gestión 2027 (No se reservará cupo)'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.confirma_continuidad
                                ? 'Se reservará su plaza para el grado y turno indicados.'
                                : 'Si desmarca esta opción, no se emitirá reserva de cupo para este alumno.'}
                            </Typography>
                          </Box>

                          <FormControlLabel
                            control={
                              <Switch
                                checked={item.confirma_continuidad}
                                onChange={() => handleToggleContinuidad(item.estudiante.id)}
                                color="success"
                              />
                            }
                            label={item.confirma_continuidad ? 'Continuará' : 'No continuará'}
                            sx={{ m: 0 }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            {/* BOTÓN O CAJA PARA AGREGAR OTRO HIJO */}
            {!mostrarAgregarOtro ? (
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setMostrarAgregarOtro(true);
                    setErrorValidacion(null);
                  }}
                  sx={{
                    borderRadius: '14px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3.5,
                    py: 1.4,
                    border: `2px dashed ${brandPrimary}`,
                    color: brandPrimary,
                    bgcolor: alpha(brandPrimary, 0.08),
                    '&:hover': {
                      border: `2px dashed ${brandDeep}`,
                      bgcolor: alpha(brandPrimary, 0.16),
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  + Agregar otro hijo o familiar (por CI)
                </Button>
              </Box>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: '16px',
                  bgcolor: alpha(brandPrimary, 0.08),
                  border: `1.5px solid ${alpha(brandPrimary, 0.3)}`
                }}
              >
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5, color: brandPrimary }}>
                  Ingresa el Carnet de Identidad (CI) del otro estudiante:
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    inputRef={ciOtroHijoRef}
                    placeholder="Número de CI del otro hijo..."
                    value={ciOtroHijo}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9\s\-]/g, '');
                      setCiOtroHijo(val);
                      if (errorValidacion) setErrorValidacion(null);
                    }}
                    disabled={isBuscandoOtro}
                    autoFocus
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&.Mui-focused fieldset': {
                          borderColor: brandPrimary,
                          borderWidth: '2px'
                        }
                      }
                    }}
                    slotProps={{
                      input: {
                        startAdornment: <BadgeIcon sx={{ color: brandPrimary, mr: 1 }} />,
                        endAdornment: ciOtroHijo ? (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setCiOtroHijo('');
                              ciOtroHijoRef.current?.focus();
                            }}
                            edge="end"
                            aria-label="Limpiar campo"
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        ) : null
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    disabled={isBuscandoOtro || !ciOtroHijo.trim()}
                    onClick={() => handleBuscarYAgregar(ciOtroHijo, false)}
                    sx={primaryBtnStyle}
                  >
                    {isBuscandoOtro ? 'Buscando...' : 'Agregar Estudiante'}
                  </Button>
                  <Button
                    variant="text"
                    color="inherit"
                    onClick={() => {
                      setMostrarAgregarOtro(false);
                      setCiOtroHijo('');
                    }}
                    sx={{ textTransform: 'none', borderRadius: '12px' }}
                  >
                    Cancelar
                  </Button>
                </Stack>
              </Paper>
            )}

            {/* Si no hay ningún estudiante que continúe, mostrar aviso amigable y NO abrir los datos del tutor */}
            {!algunoContinuara && (
              <Box
                sx={{
                  mt: 3,
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: '16px',
                  bgcolor: isDark ? alpha('#ef4444', 0.12) : '#fef2f2',
                  border: `1.5px dashed ${isDark ? '#ef4444' : '#f87171'}`,
                  textAlign: 'center'
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    bgcolor: alpha('#ef4444', 0.15),
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.5
                  }}
                >
                  <CancelIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" fontWeight={800} sx={{ color: isDark ? '#f87171' : '#b91c1c', mb: 1 }}>
                  No se registrará reserva de cupo
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto', mb: 3 }}>
                  Has marcado que el estudiante <strong>no continuará</strong> en la institución para la Gestión 2027.
                  Por ello, <strong>el apartado de datos del tutor no se habilitará</strong> y no se emitirá cupo de reserva.
                  Si deseas apartar su cupo, activa nuevamente la opción <strong>&quot;Continuará&quot;</strong> en la tarjeta de arriba.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => setActiveStep(0)}
                    sx={outlineBtnStyle}
                  >
                    Volver a Consultar otro CI
                  </Button>
                </Stack>
              </Box>
            )}

            {/* SECCIÓN: DATOS DE QUIEN REALIZA LA RESERVA (Solo se abre dinámicamente si continuará) */}
            <Collapse in={algunoContinuara} unmountOnExit>
              <Divider sx={{ my: 4 }} />

              <form onSubmit={handleConfirmarReserva}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" fontWeight={800} color={brandPrimary} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FamilyIcon sx={{ color: brandPrimary }} /> Datos de la Persona que Realiza la Reserva
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Indica quién realiza el trámite en este momento (Tía, Madre, Padre, Abuelo, etc.) y su número de WhatsApp para contacto.
                  </Typography>

                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <TextField
                        fullWidth
                        label="Nombre Completo de Quien Reserva"
                        placeholder="Ej: Carmen Morales Pérez"
                        value={tutorNombre}
                        onChange={(e) => setTutorNombre(e.target.value)}
                        required
                        disabled={isConfirmando}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '14px',
                            '&.Mui-focused fieldset': {
                              borderColor: brandPrimary,
                              borderWidth: '2px'
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: brandPrimary
                          }
                        }}
                        slotProps={{
                          input: {
                            startAdornment: <PersonIcon sx={{ color: brandPrimary, mr: 1 }} />
                          }
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormControl fullWidth required>
                        <InputLabel sx={{ '&.Mui-focused': { color: brandPrimary } }}>Parentesco</InputLabel>
                        <Select
                          value={tutorParentesco}
                          label="Parentesco"
                          onChange={(e) => setTutorParentesco(e.target.value)}
                          disabled={isConfirmando}
                          sx={{
                            borderRadius: '14px',
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: brandPrimary,
                              borderWidth: '2px'
                            }
                          }}
                        >
                          {PARENTESCOS.map((p) => (
                            <MenuItem key={p} value={p}>
                              {p}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Carnet de Identidad (CI)"
                        placeholder="Ej: 5423891 CB"
                        value={tutorCi}
                        onChange={(e) => setTutorCi(e.target.value)}
                        required
                        disabled={isConfirmando}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '14px',
                            '&.Mui-focused fieldset': {
                              borderColor: brandPrimary,
                              borderWidth: '2px'
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: brandPrimary
                          }
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Número de Celular / WhatsApp"
                        placeholder="Ej: 70712345"
                        value={tutorTelefono}
                        onChange={(e) => setTutorTelefono(e.target.value)}
                        required
                        disabled={isConfirmando}
                        helperText="Aquí recibirá la confirmación y avisos del colegio"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '14px',
                            '&.Mui-focused fieldset': {
                              borderColor: brandPrimary,
                              borderWidth: '2px'
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: brandPrimary
                          }
                        }}
                        slotProps={{
                          input: {
                            startAdornment: <PhoneIcon sx={{ color: '#10b981', mr: 1 }} />
                          }
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Observaciones (Opcional)"
                        placeholder="Ej: Trámite realizado por la tía a cargo..."
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        disabled={isConfirmando}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '14px',
                            '&.Mui-focused fieldset': {
                              borderColor: brandPrimary,
                              borderWidth: '2px'
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: brandPrimary
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Botones de Navegación con alto contraste y estilo PreInscripción */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(0)}
                    disabled={isConfirmando}
                    startIcon={<ArrowBackIcon />}
                    sx={outlineBtnStyle}
                  >
                    Volver Atrás
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={isConfirmando}
                    endIcon={isConfirmando ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                    sx={confirmBtnStyle}
                  >
                    {isConfirmando
                      ? 'Guardando Reserva...'
                      : estudiantesSeleccionados.filter(i => i.confirma_continuidad).length > 1
                        ? `Confirmar Reserva de los ${estudiantesSeleccionados.filter(i => i.confirma_continuidad).length} Estudiantes`
                        : 'Confirmar y Emitir Recibo Oficial'}
                  </Button>
                </Stack>
              </form>
            </Collapse>
          </Paper>
        )}

        {/* ========================================================
            PASO 3: RECIBO OFICIAL DE RESERVA (CONFIRMACIÓN)
        ======================================================== */}
        {activeStep === 2 && reservasConfirmadas.length > 0 && (
          <ReciboReservaCard
            reservas={reservasConfirmadas}
            onNuevaReserva={handleReiniciar}
          />
        )}
      </Container>

      {/* Modal elegante cuando el CI no es válido, ya está en la lista o no se encuentra */}
      <ModalEstudianteNoEncontrado
        open={modalNoEncontradoOpen}
        onClose={() => setModalNoEncontradoOpen(false)}
        onRetry={handleRetryModal}
        ci={ciConsultadoModal}
        errorTipo={modalErrorTipo}
        errorMessage={modalErrorMensaje}
        nombreEstudiante={modalNombreEstudiante}
      />
    </Box>
  );
}
