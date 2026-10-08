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
  CancelOutlined as CancelIcon,
  Star as StarIcon,
  HourglassTop as HourglassTopIcon,
  GroupAdd as GroupAddIcon
} from '@mui/icons-material';
import Header from '../login/Header';
import reservaCupoService from '@/services/reservaCupoService';
import {
  EstudianteSeleccionadoParaReserva,
  ReservaCupoData,
  ReservaCupoHermanoData,
  HermanoParaReserva
} from '@/types/reservaCupoTypes';
import ReciboReservaCard from '@/components/reservaCupo/ReciboReservaCard';
import ModalEstudianteNoEncontrado from '@/components/reservaCupo/ModalEstudianteNoEncontrado';
import ModalAgregarHermano from '@/components/reservaCupo/ModalAgregarHermano';
import ModalHermanoConfirmadoExito from '@/components/reservaCupo/ModalHermanoConfirmadoExito';
import ModalAgregarHermanoRegular from '@/components/reservaCupo/ModalAgregarHermanoRegular';

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

  // Hermanos de estudiantes regulares para nueva admisión (prioridad familiar)
  const [hermanosSeleccionados, setHermanosSeleccionados] = useState<HermanoParaReserva[]>([]);
  const [modalHermanoOpen, setModalHermanoOpen] = useState(false);

  // Modal para agregar hermano directamente desde una reserva ya confirmada (consulta de CI)
  const [modalHermanoDesdeReciboOpen, setModalHermanoDesdeReciboOpen] = useState(false);
  const [modalHermanoRegularOpen, setModalHermanoRegularOpen] = useState(false);
  const [reservaActivaParaHermano, setReservaActivaParaHermano] = useState<any>(null);
  const [isGuardandoHermanoRecibo, setIsGuardandoHermanoRecibo] = useState(false);

  // Modal de éxito tras confirmar la postulación del hermano
  const [modalExitoHermanoOpen, setModalExitoHermanoOpen] = useState(false);
  const [hermanoConfirmadoData, setHermanoConfirmadoData] = useState<any>(null);
  const [reciboTabIndex, setReciboTabIndex] = useState(0);

  // Honeypot anti-bots (campo señuelo invisible) y control de tiempo anti-scripting
  const [hpField, setHpField] = useState('');
  const stepStartTimeRef = useRef<number>(Date.now());

  // Datos de quien realiza la reserva
  const [tutorNombre, setTutorNombre] = useState('');
  const [tutorCi, setTutorCi] = useState('');
  const [tutorParentesco, setTutorParentesco] = useState('Padre');
  const [tutorTelefono, setTutorTelefono] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [isConfirmando, setIsConfirmando] = useState(false);
  const [errorConfirmacion, setErrorConfirmacion] = useState<string | null>(null);

  // Resultados de la reserva confirmada (incluye regulares y hermanos)
  const [reservasConfirmadas, setReservasConfirmadas] = useState<(ReservaCupoData | ReservaCupoHermanoData)[]>([]);

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
    // Detección de caracteres de scripting o HTML
    if (/<[^>]*>|javascript:|data:\s*text\/html|on\w+\s*=/i.test(ciLimpio)) {
      return {
        valido: false,
        mensaje: 'Por motivos de seguridad, no se permiten caracteres especiales o secuencias de código en el CI.'
      };
    }
    // Debe contener al menos 4 dígitos numéricos
    const digitos = ciLimpio.replace(/\D/g, '');
    if (digitos.length < 4) {
      return {
        valido: false,
        mensaje: 'El Carnet de Identidad debe contener al menos 4 dígitos numéricos (ej: 16721370).'
      };
    }
    // Longitud máxima de seguridad
    if (ciLimpio.length > 20) {
      return {
        valido: false,
        mensaje: 'El Carnet de Identidad no puede exceder 20 caracteres.'
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
    // Si el honeypot fue llenado por un bot, abortar silenciosamente
    if (hpField) return;

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
          const listaRegulares = (data.todas_las_reservas && data.todas_las_reservas.length > 0)
            ? data.todas_las_reservas
            : [data.reserva];
          const todasLasReservas = [...listaRegulares, ...(data.hermanos || [])];
          setReservasConfirmadas(todasLasReservas);
          setReciboTabIndex(0);
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
        stepStartTimeRef.current = Date.now();
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

      // Abrir modal estilizado si no se encontró el estudiante, no es regular, bachiller o si fue anulada
      if (
        errorTipo === 'ESTUDIANTE_NO_ENCONTRADO' ||
        errorTipo === 'NO_ES_REGULAR' ||
        errorTipo === 'BACHILLER_EGRESADO' ||
        errorTipo === 'RESERVA_ANULADA' ||
        errorTipo === 'MATRICULA_INACTIVA' ||
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

  const handleSetContinuidad = (estudianteId: number, continuar: boolean) => {
    setEstudiantesSeleccionados(prev =>
      prev.map(item =>
        item.estudiante.id === estudianteId
          ? { ...item, confirma_continuidad: continuar }
          : item
      )
    );
  };

  const handleMotivoNoContinuaChange = (estudianteId: number, motivo: string) => {
    // Sanitizar motivo eliminando tags
    const motivoLimpio = motivo.replace(/<[^>]*>?/gm, '').slice(0, 300);
    setEstudiantesSeleccionados(prev =>
      prev.map(item =>
        item.estudiante.id === estudianteId
          ? { ...item, motivo_no_continua: motivoLimpio }
          : item
      )
    );
  };

  const handleQuitarEstudiante = (estudianteId: number) => {
    const filtrados = estudiantesSeleccionados.filter(item => item.estudiante.id !== estudianteId);
    setEstudiantesSeleccionados(filtrados);
    // Si se quitan todos los regulares, también limpiar hermanos vinculados si no queda ninguno
    if (filtrados.length === 0) {
      setHermanosSeleccionados([]);
      setActiveStep(0);
    } else {
      // Filtrar hermanos cuyo hermano regular ya no esté en la lista
      setHermanosSeleccionados(prev => prev.filter(h => filtrados.some(e => e.estudiante.id === h.hermano_regular_id)));
    }
  };

  const handleAgregarHermano = (nuevoHermano: HermanoParaReserva) => {
    setHermanosSeleccionados(prev => [...prev, nuevoHermano]);
  };

  const handleQuitarHermano = (index: number) => {
    setHermanosSeleccionados(prev => prev.filter((_, idx) => idx !== index));
  };

  // Abrir modal de postulación de hermano nuevo desde el recibo de una reserva ya confirmada
  const handleAbrirModalHermanoDesdeRecibo = (reservaTarget: any) => {
    setReservaActivaParaHermano(reservaTarget);
    setModalHermanoDesdeReciboOpen(true);
  };

  // Abrir modal para añadir hermano regular (estudiante del colegio) desde el recibo
  const handleAbrirModalHermanoRegular = (reservaTarget: any) => {
    setReservaActivaParaHermano(reservaTarget);
    setModalHermanoRegularOpen(true);
  };

  // Callback cuando se confirma con éxito un hermano regular
  const handleHermanoRegularConfirmado = (nuevaReserva: any) => {
    setReservasConfirmadas(prev => {
      const nuevaLista = [...prev, nuevaReserva];
      setReciboTabIndex(nuevaLista.length - 1);
      return nuevaLista;
    });
    setHermanoConfirmadoData(nuevaReserva);
    setModalExitoHermanoOpen(true);
  };

  // Guardar hermano directamente en el servidor cuando se postula desde una reserva ya confirmada
  const handleGuardarHermanoDesdeRecibo = async (nuevoHermano: HermanoParaReserva) => {
    if (!reservaActivaParaHermano) return;
    setIsGuardandoHermanoRecibo(true);

    try {
      const response = await reservaCupoService.confirmarReserva({
        periodo_academico_id: reservaActivaParaHermano.periodo_academico_id,
        estudiantes: [],
        hermanos: [
          {
            ...nuevoHermano,
            hermano_regular_id: reservaActivaParaHermano.estudiante_id,
          }
        ],
        tutor_nombre: reservaActivaParaHermano.tutor_nombre,
        tutor_ci: reservaActivaParaHermano.tutor_ci,
        tutor_parentesco: reservaActivaParaHermano.tutor_parentesco,
        tutor_telefono: reservaActivaParaHermano.tutor_telefono,
        observaciones: nuevoHermano.observaciones || `Hermano postulado con prioridad familiar vinculado a ${reservaActivaParaHermano.estudiante_nombre_completo || reservaActivaParaHermano.estudiante_nombres}`
      });

      const hermanoCreado = response?.hermanos?.[0] || response?.reserva_principal;
      if (hermanoCreado) {
        setReservasConfirmadas(prev => {
          const nuevaLista = [...prev, hermanoCreado];
          setReciboTabIndex(nuevaLista.length - 1);
          return nuevaLista;
        });
        setHermanoConfirmadoData(hermanoCreado);
        setModalExitoHermanoOpen(true);
      }
      setModalHermanoDesdeReciboOpen(false);
    } catch (err: any) {
      console.error('Error al registrar hermano desde recibo:', err);
      const msg = err.response?.data?.message || err.message || 'Error al registrar el hermano';
      alert(msg);
    } finally {
      setIsGuardandoHermanoRecibo(false);
    }
  };

  // ========================================================
  // CONFIRMACIÓN
  // ========================================================

  const handleConfirmarReserva = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorConfirmacion(null);

    // 1. Detección de bots automatizados vía Honeypot
    if (hpField) {
      console.warn('Envío bloqueado por control anti-automatización');
      return;
    }

    // 2. Control de tiempo de interacción (anti-scripting automático ultra-rápido)
    if (Date.now() - stepStartTimeRef.current < 1200) {
      setErrorConfirmacion('Por favor revisa cuidadosamente la información antes de enviar.');
      return;
    }

    if (estudiantesSeleccionados.length === 0) {
      setErrorConfirmacion('Debe tener al menos un estudiante regular agregado para realizar el registro.');
      return;
    }

    const nombreLimpio = tutorNombre.replace(/<[^>]*>?/gm, '').trim();
    const ciLimpio = tutorCi.replace(/<[^>]*>?/gm, '').trim();
    const telefonoLimpio = tutorTelefono.replace(/<[^>]*>?/gm, '').trim();
    const obsLimpia = observaciones.replace(/<[^>]*>?/gm, '').trim();

    // 3. Detección de patrones de scripting o inyección de código
    const PATRON_SCRIPT = /<[^>]*>|javascript:|data:\s*text\/html|vbscript:|on\w+\s*=/i;
    if (
      PATRON_SCRIPT.test(tutorNombre) ||
      PATRON_SCRIPT.test(tutorCi) ||
      PATRON_SCRIPT.test(tutorTelefono) ||
      PATRON_SCRIPT.test(observaciones)
    ) {
      setErrorConfirmacion('Por motivos de seguridad, no se permiten caracteres especiales ni secuencias de código en el formulario.');
      return;
    }

    // 4. Validación de campos obligatorios y formatos
    if (!nombreLimpio || nombreLimpio.length < 3) {
      setErrorConfirmacion('Debe ingresar el nombre completo de la persona que realiza el trámite (mínimo 3 caracteres)');
      return;
    }
    if (nombreLimpio.length > 100) {
      setErrorConfirmacion('El nombre no puede exceder 100 caracteres');
      return;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.\,\'-]+$/.test(nombreLimpio)) {
      setErrorConfirmacion('El nombre solo debe contener letras, espacios y acentos');
      return;
    }

    if (!ciLimpio || ciLimpio.length < 4) {
      setErrorConfirmacion('Debe ingresar el carnet de identidad (CI) de quien realiza el trámite (mínimo 4 caracteres)');
      return;
    }
    if (ciLimpio.length > 20) {
      setErrorConfirmacion('El carnet de identidad no puede exceder 20 caracteres');
      return;
    }
    if (!/^[a-zA-Z0-9\s\-]+$/.test(ciLimpio)) {
      setErrorConfirmacion('El carnet de identidad solo debe contener números, letras o guiones');
      return;
    }

    if (!telefonoLimpio || telefonoLimpio.length < 7) {
      setErrorConfirmacion('Debe ingresar el número de celular / WhatsApp (mínimo 7 dígitos)');
      return;
    }
    if (telefonoLimpio.length > 25) {
      setErrorConfirmacion('El número de celular no puede exceder 25 caracteres');
      return;
    }
    if (!/^[\+0-9\s\-]{7,25}$/.test(telefonoLimpio)) {
      setErrorConfirmacion('El número de celular solo debe contener dígitos, espacios, guiones o signo +');
      return;
    }

    if (obsLimpia.length > 400) {
      setErrorConfirmacion('Las observaciones no pueden exceder 400 caracteres');
      return;
    }

    setIsConfirmando(true);
    try {
      const periodoDestinoId = estudiantesSeleccionados[0]?.proyeccion_siguiente.periodo_id;

      const payload = {
        periodo_academico_id: periodoDestinoId,
        estudiantes: estudiantesSeleccionados.map(item => ({
          estudiante_id: item.estudiante.id,
          grado_actual_id: item.gestion_actual.grado_id || null,
          grado_destino_id: item.proyeccion_siguiente.grado_id,
          turno_destino_id: item.turno_seleccionado_id,
          continua: item.confirma_continuidad,
          confirma_continuidad: item.confirma_continuidad,
          motivo_no_continua: !item.confirma_continuidad ? (item.motivo_no_continua || undefined) : undefined
        })),
        hermanos: hermanosSeleccionados.map(h => ({
          hermano_regular_id: h.hermano_regular_id,
          grado_solicitado_id: h.grado_solicitado_id,
          turno_solicitado_id: h.turno_solicitado_id,
          nombres: h.nombres,
          apellido_paterno: h.apellido_paterno,
          apellido_materno: h.apellido_materno || '',
          ci: h.ci || '',
          fecha_nacimiento: h.fecha_nacimiento,
          genero: h.genero,
          observaciones: h.observaciones || ''
        })),
        tutor_nombre: nombreLimpio,
        tutor_ci: ciLimpio,
        tutor_parentesco: tutorParentesco.trim(),
        tutor_telefono: telefonoLimpio,
        observaciones: obsLimpia || undefined,
        hp_website: hpField || undefined
      };

      const resultado = await reservaCupoService.confirmarReserva(payload);
      const todasLasReservas = [
        ...(resultado.reservas || []),
        ...(resultado.hermanos || [])
      ];
      setReservasConfirmadas(todasLasReservas);
      setActiveStep(2);

    } catch (err: any) {
      console.error('Error al confirmar reserva:', err);
      const msg = err.response?.data?.message || 'Error al guardar la información. Por favor intenta nuevamente.';
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
    setHermanosSeleccionados([]);
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

      <Container maxWidth={activeStep === 1 ? 'xl' : 'md'} sx={{ pt: { xs: 4, md: 6 }, transition: 'max-width 0.3s ease' }}>
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
              {/* Honeypot anti-bots (trampa invisible para scripts maliciosos) */}
              <div
                style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, height: 0, width: 0, overflow: 'hidden' }}
                aria-hidden="true"
              >
                <input
                  type="text"
                  name="hp_website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={hpField}
                  onChange={(e) => setHpField(e.target.value)}
                />
              </div>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    inputRef={ciInputRef}
                    label="Carnet de Identidad (CI) del Estudiante"
                    placeholder="Ej: 167211270 o 16826793"
                    value={ciInput}
                    onChange={(e) => {
                      // Permitir solo números, letras, espacios y guiones, máx 20 caracteres
                      const val = e.target.value.replace(/[^a-zA-Z0-9\s\-]/g, '').slice(0, 20);
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
                      htmlInput: { maxLength: 20 },
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

            {/* ESTRUCTURA RESPONSIVA: 50% INFO ESTUDIANTE / 50% INFO PADRE EN DESKTOP */}
            <Grid container spacing={{ xs: 3, md: 4 }} alignItems="flex-start">
              {/* ── COLUMNA IZQUIERDA: ESTUDIANTES Y HERMANOS (50% EN DESKTOP) ── */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
                  <SchoolIcon sx={{ color: brandPrimary }} />
                  <Typography variant="h6" fontWeight={800} color={brandPrimary}>
                    1. Estudiante(s) y Continuidad
                  </Typography>
                </Box>

                {/* LISTA DE TARJETAS POR CADA ESTUDIANTE */}
                <Stack spacing={3} sx={{ mb: 3.5 }}>
                  {estudiantesSeleccionados.map((item, index) => (
                    <Card
                      key={item.estudiante.id}
                      variant="outlined"
                      sx={{
                        borderRadius: '20px',
                        bgcolor: item.confirma_continuidad
                          ? (isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff')
                          : (isDark ? 'linear-gradient(180deg, rgba(239, 68, 68, 0.12) 0%, rgba(30, 41, 59, 0.85) 100%)' : 'linear-gradient(180deg, #fff5f5 0%, #ffffff 100%)'),
                        border: `1.5px solid ${item.confirma_continuidad
                          ? (isDark ? 'rgba(250, 204, 21, 0.6)' : '#0288d1')
                          : (isDark ? '#ef4444' : '#f87171')
                          }`,
                        boxShadow: item.confirma_continuidad
                          ? (isDark ? '0 10px 25px rgba(250, 204, 21, 0.15)' : '0 10px 25px rgba(2, 136, 209, 0.12)')
                          : (isDark ? '0 10px 25px rgba(239, 68, 68, 0.22)' : '0 10px 25px rgba(239, 68, 68, 0.14)'),
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

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.5, pr: estudiantesSeleccionados.length > 1 ? 5 : 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Chip
                              size="small"
                              label={`Estudiante #${index + 1}`}
                              sx={{ bgcolor: alpha(brandPrimary, 0.15), color: brandPrimary, fontWeight: 800 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              CI: <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>{item.estudiante.ci}</strong>
                            </Typography>
                          </Box>

                          <Chip
                            size="small"
                            icon={item.confirma_continuidad ? <CheckCircleIcon sx={{ fontSize: '14px !important', color: '#fff !important' }} /> : <CancelIcon sx={{ fontSize: '14px !important', color: '#fff !important' }} />}
                            label={item.confirma_continuidad ? 'RESERVA 2027 ACTIVA' : 'NO CONTINUARÁ'}
                            sx={{
                              bgcolor: item.confirma_continuidad ? '#10b981' : '#ef4444',
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: '0.7rem',
                              height: '24px'
                            }}
                          />
                        </Box>

                        <Typography variant="h5" fontWeight={800} sx={{ color: isDark ? '#ffffff' : '#0f172a', mb: 0.5 }}>
                          {item.estudiante.nombre_completo}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                          Actualmente cursa: <strong>{item.gestion_actual.grado_nombre}</strong>
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



                          {/* SELECTOR ADAPTABLE Y ELEGANTE DE CONTINUIDAD (100% RESPONSIVE MOBILE/DESKTOP) */}
                          <Grid size={{ xs: 12 }}>
                            <Box
                              sx={{
                                mt: 1.5,
                                p: { xs: 1.75, sm: 2.25 },
                                borderRadius: '18px',
                                bgcolor: isDark ? 'rgba(15, 23, 42, 0.75)' : '#f8fafc',
                                border: `1.5px solid ${item.confirma_continuidad
                                  ? (isDark ? alpha('#10b981', 0.4) : '#86efac')
                                  : (isDark ? alpha('#ef4444', 0.4) : '#fca5a5')
                                  }`,
                                transition: 'all 0.25s ease'
                              }}
                            >
                              {/* PREGUNTA Y SUBTÍTULO CLAROS */}
                              <Box sx={{ mb: 1.75 }}>
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: 800,
                                    fontSize: { xs: '0.96rem', sm: '1.05rem' },
                                    color: isDark ? '#f8fafc' : '#0f172a',
                                    lineHeight: 1.3
                                  }}
                                >
                                  ¿Su hijo/a continuará en el colegio en la Gestión 2027?
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: isDark ? '#94a3b8' : '#64748b',
                                    mt: 0.3,
                                    fontSize: { xs: '0.82rem', sm: '0.86rem' }
                                  }}
                                >
                                  Marque esta opción si desea reservar su plaza para la próxima gestión.
                                </Typography>
                              </Box>

                              {/* SELECTOR SEGMENTADO RESPONSIVE (Pill Bar táctil de 2 opciones) */}
                              <Box
                                sx={{
                                  p: '4px',
                                  borderRadius: '14px',
                                  bgcolor: isDark ? 'rgba(2, 6, 23, 0.65)' : '#e2e8f0',
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr',
                                  gap: '4px',
                                  position: 'relative'
                                }}
                              >
                                {/* BOTÓN 1: SÍ, CONTINUARÁ */}
                                <Button
                                  onClick={() => handleSetContinuidad(item.estudiante.id, true)}
                                  startIcon={<CheckCircleIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                                  sx={{
                                    py: { xs: 1.1, sm: 1.3 },
                                    px: { xs: 1, sm: 2 },
                                    borderRadius: '11px',
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    fontSize: { xs: '0.84rem', sm: '0.92rem' },
                                    color: item.confirma_continuidad
                                      ? '#ffffff !important'
                                      : (isDark ? '#94a3b8' : '#475569'),
                                    bgcolor: item.confirma_continuidad
                                      ? '#10b981'
                                      : 'transparent',
                                    backgroundImage: item.confirma_continuidad
                                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                      : 'none',
                                    boxShadow: item.confirma_continuidad
                                      ? '0 3px 12px rgba(16, 185, 129, 0.4)'
                                      : 'none',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                      bgcolor: item.confirma_continuidad
                                        ? '#059669'
                                        : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')
                                    }
                                  }}
                                >
                                  Sí, continuará
                                </Button>

                                {/* BOTÓN 2: NO CONTINUARÁ */}
                                <Button
                                  onClick={() => handleSetContinuidad(item.estudiante.id, false)}
                                  startIcon={<CancelIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                                  sx={{
                                    py: { xs: 1.1, sm: 1.3 },
                                    px: { xs: 1, sm: 2 },
                                    borderRadius: '11px',
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    fontSize: { xs: '0.84rem', sm: '0.92rem' },
                                    color: !item.confirma_continuidad
                                      ? '#ffffff !important'
                                      : (isDark ? '#94a3b8' : '#475569'),
                                    bgcolor: !item.confirma_continuidad
                                      ? '#ef4444'
                                      : 'transparent',
                                    backgroundImage: !item.confirma_continuidad
                                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                      : 'none',
                                    boxShadow: !item.confirma_continuidad
                                      ? '0 3px 12px rgba(239, 68, 68, 0.4)'
                                      : 'none',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                      bgcolor: !item.confirma_continuidad
                                        ? '#dc2626'
                                        : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')
                                    }
                                  }}
                                >
                                  No continuará
                                </Button>
                              </Box>

                              {/* MENSAJE EXPLICATIVO SEGÚN LA ELECCIÓN */}
                              <Box
                                sx={{
                                  mt: 1.5,
                                  px: 1.5,
                                  py: 0.9,
                                  borderRadius: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  bgcolor: item.confirma_continuidad
                                    ? (isDark ? alpha('#10b981', 0.12) : '#f0fdf4')
                                    : (isDark ? alpha('#ef4444', 0.12) : '#fef2f2'),
                                  border: `1px solid ${item.confirma_continuidad
                                    ? (isDark ? alpha('#10b981', 0.25) : '#bbf7d0')
                                    : (isDark ? alpha('#ef4444', 0.25) : '#fecaca')
                                    }`
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: item.confirma_continuidad ? '#10b981' : '#ef4444',
                                    flexShrink: 0
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: { xs: '0.78rem', sm: '0.82rem' },
                                    color: item.confirma_continuidad
                                      ? (isDark ? '#4ade80' : '#15803d')
                                      : (isDark ? '#f87171' : '#b91c1c')
                                  }}
                                >
                                  {item.confirma_continuidad
                                    ? 'Se reservará y garantizará el cupo escolar para la Gestión 2027.'
                                    : 'Se liberará el cupo y se emitirá la Constancia Oficial de No Continuidad.'}
                                </Typography>
                              </Box>

                              {/* CAMPO DE MOTIVO SI MARCA NO CONTINUARÁ */}
                              <Collapse in={!item.confirma_continuidad} timeout={250}>
                                <Box
                                  sx={{
                                    mt: 1.75,
                                    pt: 1.75,
                                    borderTop: `1px dashed ${isDark ? 'rgba(239,68,68,0.35)' : '#fca5a5'}`
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 700,
                                      color: isDark ? '#fca5a5' : '#b91c1c',
                                      display: 'block',
                                      mb: 0.8,
                                      fontSize: '0.82rem'
                                    }}
                                  >
                                    Motivo de no continuidad (opcional):
                                  </Typography>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Ej: Cambio de colegio, mudanza de ciudad, motivos personales..."
                                    value={item.motivo_no_continua || ''}
                                    onChange={(e) => handleMotivoNoContinuaChange(item.estudiante.id, e.target.value)}
                                    sx={{
                                      bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : '#ffffff',
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px'
                                      }
                                    }}
                                  />
                                </Box>
                              </Collapse>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>

                {/* LISTA DE HERMANOS NUEVOS AGREGADOS (PRIORIDAD FAMILIAR) */}
                {hermanosSeleccionados.length > 0 && (
                  <Box sx={{ mb: 3.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <StarIcon sx={{ color: isDark ? '#facc15' : '#f59e0b', fontSize: 24 }} />
                      <Typography variant="h6" fontWeight={800} sx={{ color: isDark ? '#facc15' : '#0288d1' }}>
                        Hermanos Postulantes a Nueva Admisión ({hermanosSeleccionados.length})
                      </Typography>
                    </Box>

                    <Stack spacing={2.5}>
                      {hermanosSeleccionados.map((h, hIdx) => {
                        const esEspera = h.es_lista_espera ?? !h.tiene_cupo_inmediato;
                        const nombreGrado = h.grado_nombre || h.grado_solicitado_nombre || 'Grado Solicitado';
                        const nombreTurno = h.turno_nombre || h.turno_solicitado_nombre || (h.turno_solicitado_id === 1 ? 'Mañana' : 'Tarde');

                        return (
                          <Card
                            key={hIdx}
                            variant="outlined"
                            sx={{
                              borderRadius: '18px',
                              bgcolor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
                              border: `1.5px solid ${esEspera ? (isDark ? '#f59e0b' : '#fcd34d') : (isDark ? '#10b981' : '#86efac')}`,
                              boxShadow: esEspera
                                ? (isDark ? '0 8px 25px rgba(245, 158, 11, 0.15)' : '0 8px 25px rgba(245, 158, 11, 0.1)')
                                : (isDark ? '0 8px 25px rgba(16, 185, 129, 0.15)' : '0 8px 25px rgba(16, 185, 129, 0.1)'),
                              p: { xs: 2.5, sm: 3 },
                              position: 'relative'
                            }}
                          >
                            <Tooltip title="Quitar hermano de la solicitud">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleQuitarHermano(hIdx)}
                                sx={{ position: 'absolute', top: 16, right: 16 }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, pr: 5 }}>
                              <Chip
                                size="small"
                                label={`Hermano #${hIdx + 1}`}
                                sx={{ bgcolor: alpha('#f59e0b', 0.15), color: '#d97706', fontWeight: 800 }}
                              />
                              <Chip
                                size="small"
                                icon={esEspera ? <ScheduleIcon sx={{ fontSize: '14px !important', color: '#fff !important' }} /> : <CheckCircleIcon sx={{ fontSize: '14px !important', color: '#fff !important' }} />}
                                label={esEspera ? `LISTA DE ESPERA · PUESTO #${h.posicion_espera || 1}` : 'CUPO DIRECTO CONFIRMADO'}
                                sx={{
                                  bgcolor: esEspera ? '#f59e0b' : '#10b981',
                                  color: '#ffffff',
                                  fontWeight: 800,
                                  fontSize: '0.72rem'
                                }}
                              />
                            </Box>

                            <Typography variant="h5" fontWeight={800} sx={{ color: isDark ? '#ffffff' : '#0f172a', mb: 0.5 }}>
                              {h.nombres} {h.apellido_paterno} {h.apellido_materno || ''}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Hermano/a del estudiante regular: <strong>{h.hermano_regular_nombre || 'Estudiante regular'}</strong>
                              {h.ci ? ` · CI: ${h.ci}` : ''}
                            </Typography>

                            <Divider sx={{ my: 1.5 }} />

                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Grado Solicitado:
                                </Typography>
                                <Chip
                                  icon={<SchoolIcon fontSize="small" sx={{ color: '#fff !important' }} />}
                                  label={nombreGrado}
                                  sx={{
                                    bgcolor: esEspera ? '#f59e0b' : '#10b981',
                                    color: '#fff',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    py: 1.8,
                                    px: 1.5,
                                    mt: 0.5,
                                    borderRadius: '10px'
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Turno Solicitado:
                                </Typography>
                                <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5 }}>
                                  {nombreTurno}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Card>
                        );
                      })}
                    </Stack>
                  </Box>
                )}

                {/* BOTONES PARA AGREGAR OTRO HIJO REGULAR O REGISTRAR HERMANO */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{ mb: 4, justifyContent: 'center', alignItems: 'stretch' }}
                >
                  {!mostrarAgregarOtro && (
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
                        px: 3,
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
                      + Agregar otro hijo regular (por CI)
                    </Button>
                  )}

                  <Button
                    variant="contained"
                    startIcon={<StarIcon sx={{ color: isDark ? '#facc15' : '#f59e0b' }} />}
                    onClick={() => setModalHermanoOpen(true)}
                    sx={{
                      borderRadius: '14px',
                      textTransform: 'none',
                      fontWeight: 800,
                      px: 3,
                      py: 1.4,
                      bgcolor: isDark ? alpha('#f59e0b', 0.15) : '#eff6ff',
                      border: `2px solid ${isDark ? '#f59e0b' : '#3b82f6'}`,
                      color: isDark ? '#facc15' : '#1d4ed8',
                      boxShadow: isDark
                        ? '0 6px 20px rgba(245, 158, 11, 0.2)'
                        : '0 6px 20px rgba(59, 130, 246, 0.15)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: isDark ? alpha('#f59e0b', 0.25) : '#dbeafe',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    ⭐ + Registrar hermanito nuevo (Ingreso Gestión 2027)
                  </Button>
                </Stack>

                {mostrarAgregarOtro && (
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
                      Ingresa el Carnet de Identidad (CI) del otro estudiante regular:
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        inputRef={ciOtroHijoRef}
                        placeholder="Número de CI del otro hijo..."
                        value={ciOtroHijo}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^a-zA-Z0-9\s\-]/g, '').slice(0, 20);
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
                          htmlInput: { maxLength: 20 },
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

                {/* Si no continúa ningún estudiante, mostramos una alerta informativa clara de no continuidad, pero MANTENEMOS el formulario habilitado para registrar al tutor y emitir la constancia */}
                {!algunoContinuara && (
                  <Box
                    sx={{
                      mt: 3,
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: '16px',
                      bgcolor: isDark ? alpha('#f59e0b', 0.12) : '#fffbeb',
                      border: `1.5px solid ${isDark ? alpha('#f59e0b', 0.4) : '#fcd34d'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        bgcolor: alpha('#f59e0b', 0.2),
                        color: '#d97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <CancelIcon sx={{ fontSize: 26 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800} sx={{ color: isDark ? '#fbbf24' : '#b45309' }}>
                        Declaración Formal de No Continuidad para la Gestión 2027
                      </Typography>
                      <Typography variant="caption" sx={{ color: isDark ? '#e2e8f0' : '#475569', display: 'block', mt: 0.25 }}>
                        Complete los datos de la persona que realiza el trámite abajo para formalizar la no continuidad y emitir la <strong>Constancia Oficial</strong>.
                      </Typography>
                    </Box>
                  </Box>
                )}

              </Grid>

              {/* ── COLUMNA DERECHA: DATOS DE QUIEN REALIZA EL TRÁMITE (PADRE / TUTOR) (50% EN DESKTOP) ── */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 3.5 },
                    borderRadius: '20px',
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.45)' : 'rgba(248, 250, 252, 0.85)',
                    border: `1.5px solid ${isDark ? 'rgba(250, 204, 21, 0.25)' : 'rgba(1, 87, 155, 0.15)'}`,
                    boxShadow: isDark
                      ? '0 10px 30px rgba(0,0,0,0.3)'
                      : '0 10px 30px rgba(1, 87, 155, 0.06)',
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight={800} color={brandPrimary} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FamilyIcon sx={{ color: brandPrimary }} /> {algunoContinuara ? '2. Datos de Quien Realiza la Reserva' : '2. Datos de Quien Declara No Continuidad'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {algunoContinuara
                        ? 'Indica los datos del padre, madre o tutor y su número de WhatsApp para enviar la confirmación y avisos.'
                        : 'Indica los datos del tutor o persona responsable que formaliza la constancia de no continuidad.'}
                    </Typography>
                  </Box>

                  <form onSubmit={handleConfirmarReserva}>
                    {/* Honeypot anti-bots (trampa invisible para scripts maliciosos) */}
                    <div
                      style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, height: 0, width: 0, overflow: 'hidden' }}
                      aria-hidden="true"
                    >
                      <input
                        type="text"
                        name="hp_website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={hpField}
                        onChange={(e) => setHpField(e.target.value)}
                      />
                    </div>

                    <Grid container spacing={2.5}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Nombre Completo de Quien Reserva"
                          placeholder="Ej: Carmen Morales Pérez"
                          value={tutorNombre}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.\,\'-]/g, '').slice(0, 100);
                            setTutorNombre(val);
                          }}
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
                            htmlInput: { maxLength: 100 },
                            input: {
                              startAdornment: <PersonIcon sx={{ color: brandPrimary, mr: 1 }} />
                            }
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
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
                          placeholder="Ej: 54238011"
                          value={tutorCi}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^a-zA-Z0-9\s\-]/g, '').slice(0, 20);
                            setTutorCi(val);
                          }}
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
                            htmlInput: { maxLength: 20 }
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Número de Celular / WhatsApp"
                          placeholder="Ej: 70712345"
                          value={tutorTelefono}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9\+\s\-]/g, '').slice(0, 25);
                            setTutorTelefono(val);
                          }}
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
                            htmlInput: { maxLength: 25 },
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
                          onChange={(e) => {
                            const val = e.target.value.replace(/<[^>]*>?/gm, '').slice(0, 400);
                            setObservaciones(val);
                          }}
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
                            htmlInput: { maxLength: 400 }
                          }}
                        />
                      </Grid>
                    </Grid>

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
                          ? 'Procesando...'
                          : hermanosSeleccionados.length > 0
                            ? `Confirmar Trámite (${estudiantesSeleccionados.length} Regular(es) + ${hermanosSeleccionados.length} Hermano(s))`
                            : algunoContinuara && estudiantesSeleccionados.some(i => !i.confirma_continuidad)
                              ? `Confirmar Trámite de los ${estudiantesSeleccionados.length} Estudiantes`
                              : !algunoContinuara
                                ? (estudiantesSeleccionados.length > 1
                                  ? `Emitir Constancias de No Continuidad (${estudiantesSeleccionados.length})`
                                  : 'Emitir Constancia de No Continuidad')
                                : (estudiantesSeleccionados.length > 1
                                  ? `Confirmar Reserva de los ${estudiantesSeleccionados.length} Estudiantes`
                                  : 'Confirmar y Emitir Recibo Oficial')}
                      </Button>
                    </Stack>
                  </form>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* ========================================================
            PASO 3: RECIBO OFICIAL DE RESERVA (CONFIRMACIÓN)
        ======================================================== */}
        {activeStep === 2 && reservasConfirmadas.length > 0 && (
          <ReciboReservaCard
            reservas={reservasConfirmadas}
            onNuevaReserva={handleReiniciar}
            onPostularHermano={handleAbrirModalHermanoDesdeRecibo}
            onAgregarHermanoRegular={handleAbrirModalHermanoRegular}
            tabIndexActivo={reciboTabIndex}
            onTabChange={setReciboTabIndex}
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

      {/* Modal para registrar hermanito nuevo con prioridad familiar (en formulario inicial) */}
      <ModalAgregarHermano
        open={modalHermanoOpen}
        onClose={() => setModalHermanoOpen(false)}
        onAgregar={handleAgregarHermano}
        estudiantesRegulares={estudiantesSeleccionados}
        periodoId={estudiantesSeleccionados[0]?.proyeccion_siguiente?.periodo_id}
      />

      {/* Modal para registrar hermanito directamente cuando la reserva del regular ya está confirmada */}
      <ModalAgregarHermano
        open={modalHermanoDesdeReciboOpen}
        onClose={() => setModalHermanoDesdeReciboOpen(false)}
        onAgregar={handleGuardarHermanoDesdeRecibo}
        estudiantesRegulares={
          reservaActivaParaHermano
            ? [
                {
                  id: reservaActivaParaHermano.estudiante_id,
                  nombre_completo:
                    reservaActivaParaHermano.estudiante_nombre_completo ||
                    `${reservaActivaParaHermano.estudiante_nombres || ''} ${reservaActivaParaHermano.estudiante_apellido_paterno || ''}`.trim(),
                  ci: reservaActivaParaHermano.estudiante_ci || 'S/N',
                },
              ]
            : []
        }
        periodoId={reservaActivaParaHermano?.periodo_academico_id}
      />

      {/* Modal para registrar a un hermano que también es estudiante regular del colegio */}
      <ModalAgregarHermanoRegular
        open={modalHermanoRegularOpen}
        onClose={() => setModalHermanoRegularOpen(false)}
        reservaPrincipal={reservaActivaParaHermano}
        onHermanoRegularConfirmado={handleHermanoRegularConfirmado}
      />

      {/* Modal de confirmación y éxito tras registrar al nuevo hermanito o hermano regular */}
      <ModalHermanoConfirmadoExito
        open={modalExitoHermanoOpen}
        onClose={() => setModalExitoHermanoOpen(false)}
        hermano={hermanoConfirmadoData}
        onVerComprobante={() => {
          setModalExitoHermanoOpen(false);
          setReciboTabIndex(reservasConfirmadas.length - 1);
        }}
      />
    </Box>
  );
}
