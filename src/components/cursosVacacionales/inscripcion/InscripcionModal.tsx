import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  Stack,
  Paper,
  Card,
  CardContent,
  Avatar,
  Divider,
  useTheme,
  alpha,
  IconButton,
  Collapse,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Person,
  FamilyRestroom,
  AttachMoney,
  School,
  CalendarMonth,
  AccessTime,
  EventSeat,
  Receipt,
  Savings,
  ExpandMore,
  ExpandLess,
  Info,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

import {
  useCursosVacacionales,
  usePaquetesVacacionales,
  usePeriodoActivo,
  useInscripcionesVacacionales,
} from '@/hooks/useCursosVacacionales';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface InscripcionFormModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InscripcionFormModal({
  open,
  onClose,
}: InscripcionFormModalProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ✅ HOOKS CON DATOS REALES DE LA BD
  const { periodo, isLoading: loadingPeriodo } = usePeriodoActivo();
  const { paquetes, isLoading: loadingPaquetes } = usePaquetesVacacionales();
  const { cursos, isLoading: loadingCursos } = useCursosVacacionales({
    periodo_vacacional_id: periodo?.id,
    activo: true,
    con_cupos: true,
    limit: 100,
  });
  const { inscribir, isInscribiendo } = useInscripcionesVacacionales();

  // Estados
  const [activeStep, setActiveStep] = useState(0);
  const [cursosSeleccionados, setCursosSeleccionados] = useState<number[]>([]);
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedCurso, setExpandedCurso] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    // Estudiante
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    ci: '',
    genero: 'masculino',
    telefono: '',
    email: '',
    
    // Tutor
    nombre_tutor: '',
    telefono_tutor: '',
    email_tutor: '',
    parentesco_tutor: 'padre',
    
    // Pago
    monto_pagado: 0,
    observaciones_pago: '',
    observaciones: '',
  });

  // Steps (ahora son 3 en vez de 4)
  const steps = ['Seleccionar Cursos', 'Datos del Estudiante y Tutor', 'Confirmar y Pagar'];

  // Resetear form al cerrar
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setActiveStep(0);
        setCursosSeleccionados([]);
        setPaqueteSeleccionado(null);
        setFormData({
          nombres: '',
          apellido_paterno: '',
          apellido_materno: '',
          fecha_nacimiento: '',
          ci: '',
          genero: 'masculino',
          telefono: '',
          email: '',
          nombre_tutor: '',
          telefono_tutor: '',
          email_tutor: '',
          parentesco_tutor: 'padre',
          monto_pagado: 0,
          observaciones_pago: '',
          observaciones: '',
        });
        setErrors({});
      }, 300);
    }
  }, [open]);

  // Actualizar monto según selección
  useEffect(() => {
    if (paqueteSeleccionado) {
      const paquete = paquetes.find((p) => p.id === paqueteSeleccionado);
      if (paquete) {
        setFormData((prev) => ({ ...prev, monto_pagado: Number(paquete.precio) }));
      }
    } else if (cursosSeleccionados.length === 1) {
      const curso = cursos.find((c) => c.id === cursosSeleccionados[0]);
      if (curso) {
        setFormData((prev) => ({ ...prev, monto_pagado: Number(curso.costo) }));
      }
    } else if (cursosSeleccionados.length > 1) {
      const total = cursosSeleccionados.reduce((sum, id) => {
        const curso = cursos.find((c) => c.id === id);
        return sum + (Number(curso?.costo) || 0);
      }, 0);
      setFormData((prev) => ({ ...prev, monto_pagado: Number(total) }));
    } else {
      setFormData((prev) => ({ ...prev, monto_pagado: 0 }));
    }
  }, [cursosSeleccionados, paqueteSeleccionado, cursos, paquetes]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleCursoToggle = (cursoId: number) => {
    setCursosSeleccionados((prev) => {
      if (prev.includes(cursoId)) {
        return prev.filter((id) => id !== cursoId);
      } else {
        if (paqueteSeleccionado) {
          const paquete = paquetes.find((p) => p.id === paqueteSeleccionado);
          if (paquete && prev.length >= paquete.cantidad_cursos) {
            return prev;
          }
        }
        return [...prev, cursoId];
      }
    });
  };

  const handlePaqueteSelect = (paqueteId: number | null) => {
    setPaqueteSeleccionado(paqueteId);
    setCursosSeleccionados([]);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (cursosSeleccionados.length === 0) {
        newErrors.cursos = 'Debes seleccionar al menos un curso';
      }
      if (paqueteSeleccionado) {
        const paquete = paquetes.find((p) => p.id === paqueteSeleccionado);
        if (paquete && cursosSeleccionados.length !== paquete.cantidad_cursos) {
          newErrors.cursos = `Debes seleccionar exactamente ${paquete.cantidad_cursos} cursos para este paquete`;
        }
      }
    }

    if (step === 1) {
      if (!formData.nombres.trim()) newErrors.nombres = 'Campo requerido';
      if (!formData.apellido_paterno.trim()) newErrors.apellido_paterno = 'Campo requerido';
      if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = 'Campo requerido';
      if (!formData.nombre_tutor.trim()) newErrors.nombre_tutor = 'Campo requerido';
      if (!formData.telefono_tutor.trim()) newErrors.telefono_tutor = 'Campo requerido';
      else if (formData.telefono_tutor.length < 7)
        newErrors.telefono_tutor = 'Mínimo 7 dígitos';
    }

    if (step === 2) {
      if (!formData.monto_pagado || formData.monto_pagado <= 0)
        newErrors.monto_pagado = 'Monto inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    try {
      await inscribir({
        cursos: cursosSeleccionados,
        paquete_id: paqueteSeleccionado || undefined,
        nombres: formData.nombres,
        apellido_paterno: formData.apellido_paterno,
        apellido_materno: formData.apellido_materno || undefined,
        fecha_nacimiento: formData.fecha_nacimiento,
        ci: formData.ci || undefined,
        genero: formData.genero as any,
        telefono: formData.telefono || undefined,
        email: formData.email || undefined,
        nombre_tutor: formData.nombre_tutor,
        telefono_tutor: formData.telefono_tutor,
        email_tutor: formData.email_tutor || undefined,
        parentesco_tutor: formData.parentesco_tutor || undefined,
        monto_pagado: Number(formData.monto_pagado) || 0,
        metodo_pago: 'efectivo',
        observaciones: formData.observaciones || undefined,
        observaciones_pago: formData.observaciones_pago || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error al inscribir:', error);
    }
  };

  const cursosSeleccionadosData = cursos.filter((c) => cursosSeleccionados.includes(c.id));

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      transition: 'all 0.3s',
      backgroundColor: isDark ? alpha('#facc15', 0.03) : alpha('#facc15', 0.02),
      '&:hover': {
        backgroundColor: isDark ? alpha('#facc15', 0.06) : alpha('#facc15', 0.04),
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: isDark ? '#facc15' : '#f59e0b',
        },
      },
      '&.Mui-focused': {
        backgroundColor: isDark ? alpha('#facc15', 0.08) : alpha('#facc15', 0.05),
        '& .MuiOutlinedInput-notchedOutline': {
          borderWidth: '2px',
          borderColor: isDark ? '#facc15' : '#f59e0b',
        },
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: isDark ? '#facc15' : '#f59e0b',
    },
  };

  // ✅ LOADING STATES
  if (loadingPeriodo || loadingPaquetes || loadingCursos) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogContent sx={{ p: 8, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: isDark ? '#facc15' : '#f59e0b' }} />
          <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
            Cargando información...
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  // ✅ VALIDACIÓN: Sin periodo activo
  if (!periodo) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <CalendarMonth sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            No hay periodo activo
          </Typography>
          <Typography color="text.secondary">
            Actualmente no hay un periodo vacacional disponible para inscripciones.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2 }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // ✅ VALIDACIÓN: Sin cursos disponibles
  if (cursos.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <School sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            No hay cursos disponibles
          </Typography>
          <Typography color="text.secondary">
            Todos los cursos están llenos o no hay cursos activos en este momento.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2 }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          maxHeight: '90vh',
          background: isDark 
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 232, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: isDark ? `1px solid ${alpha('#facc15', 0.2)}` : `1px solid ${alpha('#f59e0b', 0.1)}`,
          boxShadow: isDark 
            ? `0 24px 48px ${alpha('#000', 0.4)}, 0 0 0 1px ${alpha('#facc15', 0.1)}`
            : `0 24px 48px ${alpha('#f59e0b', 0.15)}, 0 0 0 1px ${alpha('#f59e0b', 0.05)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isDark 
            ? `2px solid ${alpha('#facc15', 0.2)}`
            : `2px solid ${alpha('#f59e0b', 0.15)}`,
          pb: 2.5,
          pt: 3,
          px: 3,
          background: isDark
            ? `linear-gradient(135deg, ${alpha('#facc15', 0.08)} 0%, ${alpha('#f59e0b', 0.08)} 100%)`
            : `linear-gradient(135deg, ${alpha('#facc15', 0.05)} 0%, ${alpha('#fef3c7', 1)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar 
            sx={{ 
              width: 56,
              height: 56,
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              boxShadow: isDark
                ? `0 8px 16px ${alpha('#facc15', 0.3)}`
                : `0 8px 16px ${alpha('#f59e0b', 0.3)}`,
            }}
          >
            <Receipt sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 800,
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #fef3c7 100%)'
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              Nueva Inscripción
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: isDark ? alpha('#facc15', 0.7) : alpha('#f59e0b', 0.8),
                fontWeight: 600,
              }}
            >
              💵 Pago en Efectivo - Verificación Automática
            </Typography>
          </Box>
        </Stack>
        <IconButton 
          onClick={onClose} 
          size="small"
          sx={{
            color: isDark ? '#facc15' : '#f59e0b',
            '&:hover': {
              backgroundColor: isDark ? alpha('#facc15', 0.1) : alpha('#f59e0b', 0.1),
              transform: 'rotate(90deg)',
            },
            transition: 'all 0.3s',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 4, px: 4 }}>
        <Alert
          severity="warning"
          icon={<Receipt />}
          sx={{ 
            mb: 4, 
            borderRadius: 3,
            border: isDark ? `1px solid ${alpha('#facc15', 0.3)}` : `1px solid ${alpha('#f59e0b', 0.3)}`,
            background: isDark
              ? `linear-gradient(135deg, ${alpha('#facc15', 0.1)} 0%, ${alpha('#f59e0b', 0.1)} 100%)`
              : `linear-gradient(135deg, ${alpha('#fef3c7', 1)} 0%, ${alpha('#fef3c7', 0.5)} 100%)`,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#facc15' : '#f59e0b' }}>
            💵 Pago en Efectivo - Verificación Automática
          </Typography>
          <Typography variant="caption" sx={{ color: isDark ? alpha('#facc15', 0.8) : alpha('#f59e0b', 0.9) }}>
            Se generará un <strong>recibo interno</strong> automáticamente y el pago se marcará como verificado al momento.
          </Typography>
        </Alert>

        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            mb: 5,
            '& .MuiStepLabel-root .Mui-completed': {
              color: isDark ? '#facc15' : '#f59e0b',
            },
            '& .MuiStepLabel-root .Mui-active': {
              color: isDark ? '#facc15' : '#f59e0b',
            },
            '& .MuiStepConnector-line': {
              borderColor: isDark ? alpha('#facc15', 0.3) : alpha('#f59e0b', 0.3),
            },
            '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
              borderColor: isDark ? '#facc15' : '#f59e0b',
            },
            '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
              borderColor: isDark ? '#facc15' : '#f59e0b',
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 600 } }}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ animation: `${fadeIn} 0.4s ease-out` }}>
          {/* Step 0: Selección de Cursos */}
          {activeStep === 0 && (
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 4,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #fef3c7 100%)'
                    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                📚 Selecciona Cursos o Paquete
              </Typography>

              {/* Paquetes */}
              {paquetes.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 3,
                      color: isDark ? '#facc15' : '#f59e0b',
                    }}
                  >
                    🎁 Paquetes Promocionales
                  </Typography>
                  <Grid container spacing={3}>
                    {paquetes.map((paquete) => (
                      <Grid size={{xs:12,sm:6,md:4}} key={paquete.id}>
                        <Card
                          onClick={() =>
                            handlePaqueteSelect(
                              paqueteSeleccionado === paquete.id ? null : paquete.id
                            )
                          }
                          sx={{
                            cursor: 'pointer',
                            border: paqueteSeleccionado === paquete.id
                              ? isDark ? `3px solid #facc15` : `3px solid #f59e0b`
                              : isDark ? `1px solid ${alpha('#facc15', 0.2)}` : `1px solid ${alpha('#f59e0b', 0.15)}`,
                            borderRadius: 3,
                            transition: 'all 0.3s',
                            background: paqueteSeleccionado === paquete.id
                              ? isDark
                                ? `linear-gradient(135deg, ${alpha('#facc15', 0.15)} 0%, ${alpha('#f59e0b', 0.15)} 100%)`
                                : `linear-gradient(135deg, ${alpha('#fef3c7', 1)} 0%, ${alpha('#fed7aa', 1)} 100%)`
                              : isDark ? alpha('#1e293b', 0.6) : '#fff',
                            '&:hover': {
                              transform: 'translateY(-6px)',
                              boxShadow: isDark
                                ? `0 12px 32px ${alpha('#facc15', 0.3)}`
                                : `0 12px 32px ${alpha('#f59e0b', 0.3)}`,
                              border: isDark ? `2px solid ${alpha('#facc15', 0.5)}` : `2px solid ${alpha('#f59e0b', 0.4)}`,
                            },
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                                  {paquete.nombre}
                                </Typography>
                                <Chip
                                  label={`${paquete.cantidad_cursos} cursos`}
                                  size="small"
                                  sx={{
                                    background: isDark ? alpha('#facc15', 0.2) : alpha('#f59e0b', 0.2),
                                    color: isDark ? '#facc15' : '#f59e0b',
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>
                              {paqueteSeleccionado === paquete.id && (
                                <CheckCircle sx={{ color: isDark ? '#facc15' : '#f59e0b', fontSize: 32 }} />
                              )}
                            </Stack>
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: 900,
                                background: isDark
                                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1,
                              }}
                            >
                              Bs. {paquete.precio}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              💰 Bs. {(paquete.precio / paquete.cantidad_cursos).toFixed(2)} por curso
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              <Divider 
                sx={{ 
                  my: 4,
                  borderColor: isDark ? alpha('#facc15', 0.2) : alpha('#f59e0b', 0.15),
                }} 
              />

              {/* Cursos Individuales */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 700,
                      color: isDark ? '#facc15' : '#f59e0b',
                    }}
                  >
                    📖 Cursos Individuales
                  </Typography>
                  {paqueteSeleccionado && (
                    <Chip
                      label={`${cursosSeleccionados.length}/${
                        paquetes.find((p) => p.id === paqueteSeleccionado)?.cantidad_cursos || 0
                      } seleccionados`}
                      sx={{
                        background: isDark
                          ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                          : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: isDark ? '#000' : '#fff',
                        fontWeight: 700,
                      }}
                      size="small"
                    />
                  )}
                </Stack>

                {errors.cursos && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                    {errors.cursos}
                  </Alert>
                )}

                <Grid container spacing={3}>
                  {cursos.map((curso) => {
                    const isSelected = cursosSeleccionados.includes(curso.id);
                    const isExpanded = expandedCurso === curso.id;

                    return (
                      <Grid size={{xs:12, sm:6}}  key={curso.id}>
                        <Card
                          sx={{
                            border: isSelected
                              ? isDark ? `3px solid #facc15` : `3px solid #f59e0b`
                              : isDark ? `1px solid ${alpha('#facc15', 0.2)}` : `1px solid ${alpha('#f59e0b', 0.15)}`,
                            borderRadius: 3,
                            transition: 'all 0.3s',
                            background: isSelected
                              ? isDark
                                ? `linear-gradient(135deg, ${alpha('#facc15', 0.12)} 0%, ${alpha('#f59e0b', 0.12)} 100%)`
                                : `linear-gradient(135deg, ${alpha('#fef3c7', 0.8)} 0%, ${alpha('#fed7aa', 0.8)} 100%)`
                              : isDark ? alpha('#1e293b', 0.6) : '#fff',
                            '&:hover': {
                              boxShadow: isDark
                                ? `0 8px 24px ${alpha('#facc15', 0.25)}`
                                : `0 8px 24px ${alpha('#f59e0b', 0.25)}`,
                            },
                          }}
                        >
                          <Box
                            onClick={() => handleCursoToggle(curso.id)}
                            sx={{ cursor: 'pointer', p: 2.5 }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
                                  {curso.nombre}
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                  <Chip
                                    icon={<EventSeat />}
                                    label={`${curso.cupos_disponibles} cupos`}
                                    size="small"
                                    sx={{ 
                                      fontSize: '0.7rem',
                                      background: isDark ? alpha('#10b981', 0.2) : alpha('#10b981', 0.15),
                                      color: '#10b981',
                                      fontWeight: 600,
                                    }}
                                  />
                                  <Chip
                                    icon={<AttachMoney />}
                                    label={`Bs. ${curso.costo}`}
                                    size="small"
                                    sx={{ 
                                      fontSize: '0.7rem',
                                      background: isDark ? alpha('#facc15', 0.2) : alpha('#f59e0b', 0.2),
                                      color: isDark ? '#facc15' : '#f59e0b',
                                      fontWeight: 600,
                                    }}
                                    />
                                </Stack>
                              </Box>
                              {isSelected && (
                                <CheckCircle sx={{ color: isDark ? '#facc15' : '#f59e0b', fontSize: 32, ml: 1 }} />
                              )}
                            </Stack>
                          </Box>

                          <Box sx={{ px: 2.5, pb: 1 }}>
                            <Button
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedCurso(isExpanded ? null : curso.id);
                              }}
                              endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                              sx={{ 
                                textTransform: 'none', 
                                fontSize: '0.75rem',
                                color: isDark ? '#facc15' : '#f59e0b',
                                fontWeight: 600,
                                '&:hover': {
                                  backgroundColor: isDark ? alpha('#facc15', 0.1) : alpha('#f59e0b', 0.1),
                                },
                              }}
                            >
                              {isExpanded ? 'Menos detalles' : 'Más detalles'}
                            </Button>
                          </Box>

                          <Collapse in={isExpanded}>
                            <Box sx={{ px: 2.5, pb: 2.5 }}>
                              <Divider sx={{ mb: 2 }} />
                              <Stack spacing={1.5}>
                                {curso.dias_semana && (
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <CalendarMonth sx={{ fontSize: 18, color: isDark ? '#facc15' : '#f59e0b' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                      {curso.dias_semana}
                                    </Typography>
                                  </Stack>
                                )}
                                {curso.hora_inicio && (
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <AccessTime sx={{ fontSize: 18, color: isDark ? '#10b981' : '#059669' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                      {curso.hora_inicio} - {curso.hora_fin}
                                    </Typography>
                                  </Stack>
                                )}
                                {curso.descripcion && (
                                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                    {curso.descripcion}
                                  </Typography>
                                )}
                              </Stack>
                            </Box>
                          </Collapse>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Box>
          )}

          {/* Step 1: Datos del Estudiante y Tutor (UNIFICADO) */}
          {activeStep === 1 && (
            <Box>
              {/* Sección Estudiante */}
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <Avatar 
                  sx={{ 
                    width: 56,
                    height: 56,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    boxShadow: isDark
                      ? `0 8px 16px ${alpha('#facc15', 0.3)}`
                      : `0 8px 16px ${alpha('#f59e0b', 0.3)}`,
                  }}
                >
                  <Person sx={{ fontSize: 28 }} />
                </Avatar>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 800,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #fef3c7 100%)'
                      : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  👤 Datos del Estudiante
                </Typography>
              </Stack>

              <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    label="Nombres *"
                    fullWidth
                    value={formData.nombres}
                    onChange={(e) => handleChange('nombres', e.target.value)}
                    error={!!errors.nombres}
                    helperText={errors.nombres}
                    sx={textFieldStyle}
                  />
                </Grid>

                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    label="Apellido Paterno *"
                    fullWidth
                    value={formData.apellido_paterno}
                    onChange={(e) => handleChange('apellido_paterno', e.target.value)}
                    error={!!errors.apellido_paterno}
                    helperText={errors.apellido_paterno}
                    sx={textFieldStyle}
                  />
                </Grid>

                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    label="Apellido Materno"
                    fullWidth
                    value={formData.apellido_materno}
                    onChange={(e) => handleChange('apellido_materno', e.target.value)}
                    sx={textFieldStyle}
                  />
                </Grid>

                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    label="Fecha de Nacimiento *"
                    type="date"
                    fullWidth
                    value={formData.fecha_nacimiento}
                    onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
                    error={!!errors.fecha_nacimiento}
                    helperText={errors.fecha_nacimiento}
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldStyle}
                  />
                </Grid>

                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    label="CI"
                    fullWidth
                    value={formData.ci}
                    onChange={(e) => handleChange('ci', e.target.value)}
                    sx={textFieldStyle}
                  />
                </Grid>

                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    label="Género"
                    fullWidth
                    select
                    value={formData.genero}
                    onChange={(e) => handleChange('genero', e.target.value)}
                    sx={textFieldStyle}
                    SelectProps={{ native: true }}
                  >
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </TextField>
                </Grid>

                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    label="Teléfono"
                    fullWidth
                    value={formData.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    sx={textFieldStyle}
                  />
                </Grid>

                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    label="Email"
                    fullWidth
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    sx={textFieldStyle}
                  />
                </Grid>
              </Grid>

              <Divider 
                sx={{ 
                  my: 4,
                  borderColor: isDark ? alpha('#facc15', 0.2) : alpha('#f59e0b', 0.15),
                }} 
              />

              {/* Sección Tutor */}
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <Avatar 
                  sx={{ 
                    width: 56,
                    height: 56,
                    background: isDark
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    boxShadow: isDark
                      ? `0 8px 16px ${alpha('#10b981', 0.3)}`
                      : `0 8px 16px ${alpha('#059669', 0.3)}`,
                  }}
                >
                  <FamilyRestroom sx={{ fontSize: 28 }} />
                </Avatar>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 800,
                    background: isDark
                      ? 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)'
                      : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  👨‍👩‍👧 Datos del Tutor/Responsable
                </Typography>
              </Stack>

              <Grid container spacing={3}>
                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    label="Nombre Completo del Tutor *"
                    fullWidth
                    value={formData.nombre_tutor}
                    onChange={(e) => handleChange('nombre_tutor', e.target.value)}
                    error={!!errors.nombre_tutor}
                    helperText={errors.nombre_tutor}
                    sx={textFieldStyle}
                  />
                </Grid>

                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    label="Parentesco"
                    fullWidth
                    select
                    value={formData.parentesco_tutor}
                    onChange={(e) => handleChange('parentesco_tutor', e.target.value)}
                    sx={textFieldStyle}
                    SelectProps={{ native: true }}
                  >
                    <option value="padre">Padre</option>
                    <option value="madre">Madre</option>
                    <option value="tutor">Tutor Legal</option>
                    <option value="abuelo">Abuelo/a</option>
                    <option value="tio">Tío/a</option>
                    <option value="hermano">Hermano/a Mayor</option>
                    <option value="otro">Otro</option>
                  </TextField>
                </Grid>

                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    label="Teléfono del Tutor *"
                    fullWidth
                    value={formData.telefono_tutor}
                    onChange={(e) => handleChange('telefono_tutor', e.target.value)}
                    error={!!errors.telefono_tutor}
                    helperText={errors.telefono_tutor}
                    sx={textFieldStyle}
                  />
                </Grid>

                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    label="Email del Tutor"
                    fullWidth
                    type="email"
                    value={formData.email_tutor}
                    onChange={(e) => handleChange('email_tutor', e.target.value)}
                    sx={textFieldStyle}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 2: Confirmación y Pago */}
          {activeStep === 2 && (
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <Avatar 
                  sx={{ 
                    width: 56,
                    height: 56,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    boxShadow: isDark
                      ? `0 8px 16px ${alpha('#facc15', 0.3)}`
                      : `0 8px 16px ${alpha('#f59e0b', 0.3)}`,
                  }}
                >
                  <AttachMoney sx={{ fontSize: 28 }} />
                </Avatar>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 800,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #fef3c7 100%)'
                      : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  ✅ Confirmar Inscripción y Pago
                </Typography>
              </Stack>

              <Stack spacing={3}>
                {/* Cursos Seleccionados */}
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: isDark 
                      ? `linear-gradient(135deg, ${alpha('#facc15', 0.1)} 0%, ${alpha('#f59e0b', 0.1)} 100%)`
                      : `linear-gradient(135deg, ${alpha('#fef3c7', 1)} 0%, ${alpha('#fed7aa', 0.5)} 100%)`,
                    border: isDark 
                      ? `2px solid ${alpha('#facc15', 0.3)}` 
                      : `2px solid ${alpha('#f59e0b', 0.3)}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <School sx={{ color: isDark ? '#facc15' : '#f59e0b', fontSize: 28 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: isDark ? '#facc15' : '#f59e0b' }}>
                      {paqueteSeleccionado ? '🎁 Paquete Seleccionado' : '📚 Cursos Seleccionados'}
                    </Typography>
                  </Stack>
                  {paqueteSeleccionado && (
                    <Chip
                      icon={<Savings />}
                      label={paquetes.find((p) => p.id === paqueteSeleccionado)?.nombre}
                      sx={{ 
                        mb: 2, 
                        fontWeight: 600,
                        background: isDark ? alpha('#facc15', 0.2) : alpha('#f59e0b', 0.2),
                        color: isDark ? '#facc15' : '#f59e0b',
                      }}
                    />
                  )}
                  <Stack spacing={1}>
                    {cursosSeleccionadosData.map((curso) => (
                      <Box
                        key={curso.id}
                        sx={{
                          p: 1.5,
                          background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.8),
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {curso.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {curso.dias_semana} • Bs. {curso.costo}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>

                {/* Resumen del Estudiante */}
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: isDark 
                      ? alpha('#facc15', 0.08)
                      : alpha('#eff6ff', 1),
                    border: isDark 
                      ? `1px solid ${alpha('#facc15', 0.2)}` 
                      : `1px solid ${alpha('#0288d1', 0.2)}`,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: isDark ? '#facc15' : '#0288d1' }}>
                    👤 Estudiante
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formData.nombres} {formData.apellido_paterno} {formData.apellido_materno}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📅 {new Date(formData.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Typography>
                </Paper>

                {/* Resumen del Tutor */}
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: isDark 
                      ? alpha('#10b981', 0.08)
                      : alpha('#d1fae5', 1),
                    border: isDark 
                      ? `1px solid ${alpha('#10b981', 0.2)}` 
                      : `1px solid ${alpha('#10b981', 0.3)}`,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#10b981' }}>
                    👨‍👩‍👧 Tutor/Responsable
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formData.nombre_tutor}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📞 {formData.telefono_tutor} • {formData.parentesco_tutor}
                  </Typography>
                </Paper>

                {/* Pago */}
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: isDark 
                      ? `linear-gradient(135deg, ${alpha('#facc15', 0.12)} 0%, ${alpha('#f59e0b', 0.12)} 100%)`
                      : `linear-gradient(135deg, ${alpha('#fef3c7', 1)} 0%, ${alpha('#fed7aa', 0.6)} 100%)`,
                    border: isDark 
                      ? `2px solid ${alpha('#facc15', 0.3)}` 
                      : `2px solid ${alpha('#f59e0b', 0.3)}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Receipt sx={{ color: isDark ? '#facc15' : '#f59e0b', fontSize: 28 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: isDark ? '#facc15' : '#f59e0b' }}>
                      💵 Pago en Efectivo
                    </Typography>
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid size={{xs:12, sm:6}}>
                      <TextField
                        label="Monto Pagado *"
                        type="number"
                        fullWidth
                        value={formData.monto_pagado}
                        onChange={(e) => handleChange('monto_pagado', parseFloat(e.target.value))}
                        error={!!errors.monto_pagado}
                        helperText={errors.monto_pagado}
                        sx={textFieldStyle}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1, fontWeight: 600 }}>Bs.</Typography>
                        }}
                      />
                    </Grid>

                    <Grid size={{xs:12, sm:6}}>
                      <Box
                        sx={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 2,
                          borderRadius: 2,
                          background: isDark ? alpha('#10b981', 0.15) : alpha('#d1fae5', 1),
                          border: isDark ? `1px solid ${alpha('#10b981', 0.3)}` : `1px solid ${alpha('#10b981', 0.2)}`,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" align="center" sx={{ fontWeight: 600 }}>
                          💡 Monto calculado automáticamente según selección
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{xs:12, sm:6}}>
                      <TextField
                        label="Observaciones del Pago"
                        fullWidth
                        multiline
                        rows={2}
                        value={formData.observaciones_pago}
                        onChange={(e) => handleChange('observaciones_pago', e.target.value)}
                        placeholder="Ej: Pago completo en efectivo, entregado por el padre..."
                        sx={textFieldStyle}
                      />
                    </Grid>

                    <Grid size={{xs:12, sm:6}}>
                      <TextField
                        label="Observaciones Generales"
                        fullWidth
                        multiline
                        rows={2}
                        value={formData.observaciones}
                        onChange={(e) => handleChange('observaciones', e.target.value)}
                        placeholder="Cualquier nota adicional sobre la inscripción..."
                        sx={textFieldStyle}
                      />
                    </Grid>
                  </Grid>

                  <Alert 
                    severity="success" 
                    icon={<CheckCircle />} 
                    sx={{ 
                      mt: 3,
                      borderRadius: 2,
                      border: isDark ? `1px solid ${alpha('#10b981', 0.3)}` : `1px solid ${alpha('#10b981', 0.2)}`,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ✅ Pago Verificado Automáticamente
                    </Typography>
                    <Typography variant="caption">
                      Se generará un <strong>recibo interno</strong> automáticamente al confirmar la inscripción. El pago se marcará como verificado de inmediato.
                    </Typography>
                  </Alert>
                </Paper>

                {/* Resumen Total */}
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    background: isDark 
                      ? `linear-gradient(135deg, ${alpha('#facc15', 0.15)} 0%, ${alpha('#f59e0b', 0.15)} 100%)`
                      : `linear-gradient(135deg, ${alpha('#fef3c7', 1)} 0%, ${alpha('#fed7aa', 1)} 100%)`,
                    border: isDark 
                      ? `2px solid ${alpha('#facc15', 0.4)}` 
                      : `2px solid ${alpha('#f59e0b', 0.4)}`,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 700,
                          color: isDark ? alpha('#facc15', 0.7) : alpha('#f59e0b', 0.8),
                          letterSpacing: 1,
                        }}
                      >
                        TOTAL A PAGAR
                      </Typography>
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 900,
                          background: isDark
                            ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        Bs. {Number(formData.monto_pagado || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {cursosSeleccionados.length} curso{cursosSeleccionados.length !== 1 ? 's' : ''} seleccionado{cursosSeleccionados.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    <Info sx={{ fontSize: 64, color: isDark ? alpha('#facc15', 0.3) : alpha('#f59e0b', 0.3) }} />
                  </Stack>
                </Paper>
              </Stack>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: isDark 
            ? `2px solid ${alpha('#facc15', 0.2)}`
            : `2px solid ${alpha('#f59e0b', 0.15)}`,
          background: isDark
            ? alpha('#facc15', 0.03)
            : alpha('#fef3c7', 0.3),
        }}
      >
        <Button
          onClick={onClose}
          sx={{ 
            textTransform: 'none', 
            fontWeight: 600,
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
            },
          }}
        >
          Cancelar
        </Button>

        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            startIcon={<ArrowBack />}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600,
              color: isDark ? '#facc15' : '#f59e0b',
              '&:hover': {
                backgroundColor: isDark ? alpha('#facc15', 0.1) : alpha('#f59e0b', 0.1),
              },
            }}
          >
            Atrás
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowForward />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              px: 4,
              py: 1.2,
              borderRadius: 3,
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: isDark ? '#000' : '#fff',
              boxShadow: isDark
                ? `0 8px 16px ${alpha('#facc15', 0.3)}`
                : `0 8px 16px ${alpha('#f59e0b', 0.3)}`,
              '&:hover': {
                background: isDark
                  ? 'linear-gradient(135deg, #fef3c7 0%, #facc15 100%)'
                  : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                transform: 'translateY(-2px)',
                boxShadow: isDark
                  ? `0 12px 24px ${alpha('#facc15', 0.4)}`
                  : `0 12px 24px ${alpha('#f59e0b', 0.4)}`,
              },
              transition: 'all 0.3s',
            }}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isInscribiendo}
            startIcon={isInscribiendo ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              px: 4,
              py: 1.2,
              borderRadius: 3,
              background: isDark
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              boxShadow: isDark
                ? `0 8px 16px ${alpha('#10b981', 0.3)}`
                : `0 8px 16px ${alpha('#059669', 0.3)}`,
              '&:hover': {
                background: isDark
                  ? 'linear-gradient(135deg, #6ee7b7 0%, #10b981 100%)'
                  : 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                transform: 'translateY(-2px)',
                boxShadow: isDark
                  ? `0 12px 24px ${alpha('#10b981', 0.4)}`
                  : `0 12px 24px ${alpha('#059669', 0.4)}`,
              },
              '&:disabled': {
                background: isDark ? alpha('#10b981', 0.3) : alpha('#059669', 0.3),
              },
              transition: 'all 0.3s',
            }}
          >
            {isInscribiendo ? 'Procesando...' : '✅ Confirmar Inscripción'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}