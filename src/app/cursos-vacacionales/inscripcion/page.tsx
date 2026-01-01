"use client";
import React, { useState, useEffect, Suspense } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  Chip,
  Stack,
  Divider,
  useTheme,
  alpha,
  CardMedia,
  Skeleton,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  School,
  Person,
  ContactPhone,
  Payment,
  CloudUpload,
  QrCode2,
  KeyboardArrowRight,
  Star,
  CalendarMonth,
  AccessTime,
  Savings,
  LocalOffer,
  EventSeat,
  AttachMoney,
  LocationOn,
  Description,
  Phone,
  Email,
  FamilyRestroom,
  Info,
  PersonAdd,
} from "@mui/icons-material";
import { keyframes } from "@mui/system";
import { useRouter, useSearchParams } from "next/navigation";
import { useSnackbar } from "notistack";
import {
  usePaqueteVacacional,
  useCursosPublicos,
  usePeriodoActivo,
  useCursoPublico,
  useInscripcionesVacacionales,
} from "@/hooks/useCursosVacacionales";
import Navbar from "../../login/Header";

// Animaciones
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseQr = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

function InscripcionContent() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();

  // Detectar tipo de inscripción
  const paqueteId = searchParams.get("paquete");
  const cursoId = searchParams.get("curso");
  const esPaquete = !!paqueteId;
  const esIndividual = !!cursoId;

  // Hooks
  const { paquete, isLoading: loadingPaquete } = usePaqueteVacacional(
    paqueteId ? parseInt(paqueteId) : null
  );
  const { curso: cursoIndividual, isLoading: loadingCurso } = useCursoPublico(
    cursoId ? parseInt(cursoId) : null
  );
  const { periodo } = usePeriodoActivo();
  const { cursos, isLoading: loadingCursos } = useCursosPublicos(
    periodo?.id && esPaquete
      ? {
          periodo_vacacional_id: periodo.id,
          activo: true,
          con_cupos: true,
          limit: 100,
        }
      : {},
    { enabled: !!periodo?.id && esPaquete }
  );
  const { inscribirPublico, isInscribiendo } = useInscripcionesVacacionales();

  // Estados
  const [activeStep, setActiveStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cursosSeleccionados, setCursosSeleccionados] = useState<number[]>([]);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    ci: "",
    genero: "masculino",
    telefono: "",
    email: "",
    nombre_tutor: "",
    telefono_tutor: "",
    email_tutor: "",
    parentesco_tutor: "padre",
    monto_pagado: 0,
    numero_comprobante: "",
    fecha_pago: new Date().toISOString().split("T")[0],
  });

  // Si es individual, pre-seleccionar el curso
  useEffect(() => {
    if (esIndividual && cursoId) {
      setCursosSeleccionados([parseInt(cursoId)]);
    }
  }, [esIndividual, cursoId]);

  // Actualizar monto según el tipo
  useEffect(() => {
    if (esPaquete && paquete) {
      setFormData((prev) => ({ ...prev, monto_pagado: paquete.precio }));
    } else if (esIndividual && cursoIndividual) {
      setFormData((prev) => ({ ...prev, monto_pagado: cursoIndividual.costo }));
    }
  }, [esPaquete, esIndividual, paquete, cursoIndividual]);

  // Validar que se especificó paquete o curso
  useEffect(() => {
    if (!paqueteId && !cursoId) {
      enqueueSnackbar("No se especificó paquete ni curso", { variant: "error" });
      router.push("/cursos-vacacionales");
    }
  }, [paqueteId, cursoId, router, enqueueSnackbar]);

  const handleCursoToggle = (cursoIdToggle: number) => {
    setCursosSeleccionados((prev) => {
      if (prev.includes(cursoIdToggle)) {
        return prev.filter((id) => id !== cursoIdToggle);
      } else {
        if (paquete && prev.length >= paquete.cantidad_cursos) {
          enqueueSnackbar(
            `Solo puedes seleccionar ${paquete.cantidad_cursos} curso(s)`,
            { variant: "warning" }
          );
          return prev;
        }
        return [...prev, cursoIdToggle];
      }
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, comprobante: "El archivo es muy grande (máximo 5MB)" }));
        return;
      }
      setComprobante(file);
      setErrors((prev) => ({ ...prev, comprobante: "" }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    // Step 0: Selección de cursos (solo para paquetes)
    if (step === 0 && esPaquete) {
      if (!paquete) return false;
      if (cursosSeleccionados.length !== paquete.cantidad_cursos) {
        enqueueSnackbar(
          `Debes seleccionar exactamente ${paquete.cantidad_cursos} curso(s)`,
          { variant: "error" }
        );
        return false;
      }
    }

    // Step 1: Datos del estudiante Y tutor (UNIFICADO)
    if ((esPaquete && step === 1) || (esIndividual && step === 0)) {
      // Validar estudiante
      if (!formData.nombres) newErrors.nombres = "Campo requerido";
      if (!formData.apellido_paterno) newErrors.apellido_paterno = "Campo requerido";
      if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = "Campo requerido";
      
      // Validar tutor
      if (!formData.nombre_tutor) newErrors.nombre_tutor = "Campo requerido";
      if (!formData.telefono_tutor) newErrors.telefono_tutor = "Campo requerido";
      else if (formData.telefono_tutor.length < 7)
        newErrors.telefono_tutor = "Mínimo 7 dígitos";
    }

    // Step 2: Pago
    if ((esPaquete && step === 2) || (esIndividual && step === 1)) {
      if (!formData.monto_pagado || formData.monto_pagado <= 0)
        newErrors.monto_pagado = "Monto inválido";
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
      await inscribirPublico({
        cursos: cursosSeleccionados,
        paquete_id: paquete?.id || undefined,
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
        monto_pagado: formData.monto_pagado,
        numero_comprobante: formData.numero_comprobante || undefined,
        fecha_pago: formData.fecha_pago || undefined,
        observaciones: undefined,
        comprobante: comprobante || undefined,
      });

      setShowSuccess(true);
    } catch (error: any) {
      console.error("Error al inscribirse:", error);
    }
  };

  if (loadingPaquete || loadingCursos || loadingCurso) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 4 }} />
      </Container>
    );
  }

  if (esPaquete && !paquete) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">Paquete no encontrado</Alert>
      </Container>
    );
  }

  if (esIndividual && !cursoIndividual) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">Curso no encontrado</Alert>
      </Container>
    );
  }

  if (showSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 12 }}>
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 4,
            background: isDark
              ? `linear-gradient(135deg, ${alpha("#10b981", 0.1)}, ${alpha("#059669", 0.1)})`
              : `linear-gradient(135deg, ${alpha("#d1fae5", 1)}, ${alpha("#a7f3d0", 1)})`,
            border: `2px solid ${isDark ? "#10b981" : "#059669"}`,
            animation: `${fadeIn} 0.6s ease-out`,
          }}
        >
          <CheckCircle
            sx={{
              fontSize: 120,
              color: "#10b981",
              mb: 3,
              animation: `${pulseQr} 2s infinite`,
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: "#10b981" }}>
            ¡Inscripción Exitosa!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: "auto" }}>
            Tu solicitud ha sido recibida. Nos pondremos en contacto contigo una vez que el pago sea verificado.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push("/cursos-vacacionales")}
              sx={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              Ver Más Cursos
            </Button>
            <Button
              color="secondary"
              variant="outlined"
              size="large"
              onClick={() => router.push("/")}
              sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 700, textTransform: "none" }}
            >
              Ir al Inicio
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  const cursosSeleccionadosData = esPaquete
    ? cursos.filter((c) => cursosSeleccionados.includes(c.id))
    : cursoIndividual
    ? [cursoIndividual]
    : [];

  const cursoData = esIndividual ? cursoIndividual : null;

  // STEPS AJUSTADOS: Unificando estudiante y tutor
  const steps = esPaquete
    ? ["Seleccionar Cursos", "Información Personal", "Pago", "Confirmación"]
    : ["Información Personal", "Pago", "Confirmación"];

  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      transition: "all 0.3s",
      "&:hover": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: isDark ? "#667eea" : "#667eea",
        },
      },
      "&.Mui-focused": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderWidth: "2px",
          borderColor: isDark ? "#667eea" : "#667eea",
        },
      },
    },
  };

  // Calcular progreso
  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <Box sx={{ minHeight: "100vh", pb: 8, background: isDark ? "#0a0e27" : "#f8fafc" }}>
      {/* Header Mejorado */}
      <Navbar />
      <Box
        sx={{
          
          background: isDark
            ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
            : "linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)",
          mt: 15,
          py: 6,
          mb: 6,
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2}}>
          <Button
          color="secondary"
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => router.push("/cursos-vacacionales")}
            sx={{
              color: "secondary",
              p:2,
              mb: 3,
              fontWeight: 600,
              "&:hover": {
                background: alpha("#fff", 0.15),
              },
              textTransform: "none",
            }}
          >
            Volver a Cursos
          </Button>

          <Grid container spacing={4} alignItems="center">
            <Grid size={{xs:12, md:7}}>
              <Chip
                icon={esPaquete ? <Savings /> : <Star />}
                label={esPaquete ? "Paquete Promocional" : "Curso Individual"}
                sx={{
                  mb: 2,
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  color: "#fff",
                  fontWeight: 700,
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  color: "#fff",
                  fontWeight: 900,
                  mb: 2,
                  fontSize: { xs: "2rem", md: "3rem" },
                  textShadow: "0 4px 20px rgba(0,0,0,0.2)",
                }}
              >
                {esPaquete ? paquete?.nombre : cursoIndividual?.nombre}
              </Typography>
              <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.95)", mb: 3, lineHeight: 1.6 }}>
                {esPaquete
                  ? `Inscríbete en ${paquete?.cantidad_cursos} cursos y ahorra hasta un 30%`
                  : cursoIndividual?.descripcion}
              </Typography>

              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                {esIndividual && (
                  <>
                    <Chip
                      icon={<EventSeat />}
                      label={`${cursoIndividual?.cupos_disponibles} cupos disponibles`}
                      sx={{
                        background: alpha("#fff", 0.2),
                        backdropFilter: "blur(10px)",
                        color: "#fff",
                        fontWeight: 600,
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      }}
                    />
                    {cursoIndividual?.dias_semana && (
                      <Chip
                        icon={<CalendarMonth />}
                        label={cursoIndividual?.dias_semana}
                        sx={{
                          background: alpha("#fff", 0.2),
                          backdropFilter: "blur(10px)",
                          color: "#fff",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                        }}
                      />
                    )}
                    {cursoIndividual?.hora_inicio && (
                      <Chip
                        icon={<AccessTime />}
                        label={`${cursoIndividual.hora_inicio} - ${cursoIndividual.hora_fin}`}
                        sx={{
                          background: alpha("#fff", 0.2),
                          backdropFilter: "blur(10px)",
                          color: "#fff",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                        }}
                      />
                    )}
                  </>
                )}
                {esPaquete && paquete && (
                  <Chip
                    icon={<School />}
                    label={`${paquete.cantidad_cursos} cursos incluidos`}
                    sx={{
                      background: alpha("#fff", 0.2),
                      backdropFilter: "blur(10px)",
                      color: "#fff",
                      fontWeight: 600,
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  />
                )}
              </Stack>
            </Grid>

            <Grid size={{xs:12, md:5}}>
              {esIndividual && cursoIndividual?.foto_url ? (
                <Box
                  component="img"
                  src={cursoIndividual.foto_url}
                  alt={cursoIndividual.nombre}
                  sx={{
                    width: "100%",
                    height: 300,
                    objectFit: "cover",
                    borderRadius: 4,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                    border: "3px solid rgba(255, 255, 255, 0.2)",
                  }}
                />
              ) : (
                <Paper
                  sx={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 4,
                    background: alpha("#fff", 0.1),
                    backdropFilter: "blur(20px)",
                    border: "3px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {esPaquete ? (
                    <Savings sx={{ fontSize: 120, color: alpha("#fff", 0.4) }} />
                  ) : (
                    <School sx={{ fontSize: 120, color: alpha("#fff", 0.4) }} />
                  )}
                </Paper>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Formulario de Inscripción */}
          <Grid size={{xs:12, md:8}}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: `1px solid ${isDark ? alpha("#fff", 0.1) : alpha("#000", 0.08)}`,
                background: isDark ? "#1a1f3a" : "#fff",
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                Formulario de Inscripción
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Completa todos los datos para finalizar tu inscripción
              </Typography>

              {/* Barra de Progreso */}
              <Box sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Paso {activeStep + 1} de {steps.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(progress)}% completado
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: isDark ? alpha("#fff", 0.1) : alpha("#000", 0.05),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: "linear-gradient(90deg, #667eea, #764ba2)",
                    }
                  }}
                />
              </Box>

              <Stepper 
                activeStep={activeStep} 
                sx={{ 
                  mb: 5,
                  '& .MuiStepLabel-label': {
                    fontWeight: 600,
                    display: { xs: 'none', sm: 'block' }
                  },
                  '& .MuiStepIcon-root': {
                    fontSize: '2rem',
                  },
                  '& .MuiStepIcon-root.Mui-active': {
                    color: '#667eea',
                  },
                  '& .MuiStepIcon-root.Mui-completed': {
                    color: '#10b981',
                  }
                }}
                orientation="horizontal"
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box sx={{ animation: `${fadeIn} 0.4s ease-out` }}>
                {/* Step 0: Selección de Cursos (solo paquetes) */}
                {activeStep === 0 && esPaquete && (
                  <Box>
                    <Alert severity="info" icon={<Info />} sx={{ mb: 4, borderRadius: 3 }}>
                      Selecciona <strong>{paquete?.cantidad_cursos}</strong> curso(s) de los disponibles
                      <Chip 
                        label={`${cursosSeleccionados.length}/${paquete?.cantidad_cursos}`}
                        size="small"
                        sx={{ ml: 2, fontWeight: 700 }}
                      />
                    </Alert>

                    <Grid container spacing={3}>
                      {cursos.map((curso) => {
                        const isSelected = cursosSeleccionados.includes(curso.id);
                        const isDisabled =
                          !isSelected &&
                          cursosSeleccionados.length >= (paquete?.cantidad_cursos ?? 0);

                        return (
                          <Grid size={{xs:12, sm:6, md:4}} key={curso.id}>
                            <Card
                              sx={{
                                height: "100%",
                                position: "relative",
                                cursor: isDisabled ? "not-allowed" : "pointer",
                                opacity: isDisabled ? 0.5 : 1,
                                border: isSelected
                                  ? `3px solid #10b981`
                                  : `2px solid ${isDark ? alpha("#fff", 0.1) : alpha("#000", 0.08)}`,
                                borderRadius: 3,
                                transition: "all 0.3s",
                                background: isDark ? "#0a0e27" : "#fff",
                                "&:hover": {
                                  transform: isDisabled ? "none" : "translateY(-4px)",
                                  boxShadow: isDisabled
                                    ? "none"
                                    : `0 8px 24px ${alpha(isSelected ? "#10b981" : "#667eea", 0.3)}`,
                                },
                              }}
                              onClick={() => !isDisabled && handleCursoToggle(curso.id)}
                            >
                              {isSelected && (
                                <Chip
                                  icon={<CheckCircle />}
                                  label="Seleccionado"
                                  size="small"
                                  sx={{
                                    position: "absolute",
                                    top: 12,
                                    right: 12,
                                    zIndex: 2,
                                    fontWeight: 700,
                                    background: "#10b981",
                                    color: "#fff",
                                  }}
                                />
                              )}

                              <Box
                                sx={{
                                  height: 160,
                                  background: curso.foto_url
                                    ? "transparent"
                                    : `linear-gradient(135deg, #667eea, #764ba2)`,
                                  overflow: "hidden",
                                }}
                              >
                                {curso.foto_url ? (
                                  <CardMedia
                                    component="img"
                                    image={curso.foto_url}
                                    alt={curso.nombre}
                                    sx={{ height: "100%", objectFit: "cover" }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      height: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <School sx={{ fontSize: 80, color: alpha("#fff", 0.4) }} />
                                  </Box>
                                )}
                              </Box>

                              <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, minHeight: 50 }}>
                                  {curso.nombre}
                                </Typography>

                                <Stack spacing={1}>
                                  {curso.dias_semana && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <CalendarMonth sx={{ fontSize: 18, color: "#667eea" }} />
                                      <Typography variant="caption">{curso.dias_semana}</Typography>
                                    </Stack>
                                  )}
                                  {curso.hora_inicio && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <AccessTime sx={{ fontSize: 18, color: "#10b981" }} />
                                      <Typography variant="caption">
                                        {curso.hora_inicio} - {curso.hora_fin}
                                      </Typography>
                                    </Stack>
                                  )}
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <EventSeat sx={{ fontSize: 18, color: "#f59e0b" }} />
                                    <Typography variant="caption">
                                      {curso.cupos_disponibles} cupos disponibles
                                    </Typography>
                                  </Stack>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}

                {/* Step 1 (paquetes) o Step 0 (individual): INFORMACIÓN PERSONAL UNIFICADA */}
                {((esPaquete && activeStep === 1) || (esIndividual && activeStep === 0)) && (
                  <Box>
                    {/* Datos del Estudiante */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: 3,
                        background: isDark ? alpha("#667eea", 0.08) : alpha("#eff6ff", 1),
                        border: `2px solid ${isDark ? alpha("#667eea", 0.2) : "#bfdbfe"}`,
                        animation: `${slideIn} 0.4s ease-out`,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                        <Avatar sx={{ background: "linear-gradient(135deg, #667eea, #764ba2)", width: 48, height: 48 }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Datos del Estudiante
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Información personal del inscrito
                          </Typography>
                        </Box>
                      </Stack>

                      <Grid container spacing={3}>
                        <Grid size={{xs:12, md:6}} >
                          <TextField
                            label="Nombres *"
                            fullWidth
                            value={formData.nombres}
                            onChange={(e) => handleChange("nombres", e.target.value)}
                            error={!!errors.nombres}
                            helperText={errors.nombres}
                            sx={textFieldStyle}
                          />
                        </Grid>

                        <Grid size={{xs:12, md:6}} >
                          <TextField
                            label="Apellido Paterno *"
                            fullWidth
                            value={formData.apellido_paterno}
                            onChange={(e) => handleChange("apellido_paterno", e.target.value)}
                            error={!!errors.apellido_paterno}
                            helperText={errors.apellido_paterno}
                            sx={textFieldStyle}
                          />
                        </Grid>

                        <Grid size={{xs:12, md:6}} >
                          <TextField
                            label="Apellido Materno"
                            fullWidth
                            value={formData.apellido_materno}
                            onChange={(e) => handleChange("apellido_materno", e.target.value)}
                            sx={textFieldStyle}
                          />
                        </Grid>

                        <Grid size={{xs:12, md:6}} >
                          <TextField
                            label="Fecha de Nacimiento *"
                            type="date"
                            fullWidth
                            value={formData.fecha_nacimiento}
                            onChange={(e) => handleChange("fecha_nacimiento", e.target.value)}
                            error={!!errors.fecha_nacimiento}
                            helperText={errors.fecha_nacimiento}
                            InputLabelProps={{ shrink: true }}
                            sx={textFieldStyle}
                          />
                        </Grid>

                        <Grid size={{xs:12, md:6}} >
                          <TextField
                            label="CI "
                            fullWidth
                            value={formData.ci}
                            onChange={(e) => handleChange("ci", e.target.value)}
                            sx={textFieldStyle}
                          />
                        </Grid>

                        <Grid size={{xs:12, md:6}} >
                          <TextField
                            label="Género"
                            fullWidth
                            select
                            value={formData.genero}
                            onChange={(e) => handleChange("genero", e.target.value)}
                            sx={textFieldStyle}
                            SelectProps={{ native: true }}
                          >
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                            <option value="otro">Otro</option>
                          </TextField>
                        </Grid>

                        <Grid size={{xs:12, md:6}} >
                          <TextField
                            label="Teléfono del Estudiante"
                            fullWidth
                            value={formData.telefono}
                            onChange={(e) => handleChange("telefono", e.target.value)}
                            placeholder="Opcional"
                            sx={textFieldStyle}
                          />
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Datos del Tutor/Responsable */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: isDark ? alpha("#10b981", 0.08) : alpha("#d1fae5", 1),
                        border: `2px solid ${isDark ? alpha("#10b981", 0.2) : "#6ee7b7"}`,
                        animation: `${slideIn} 0.4s ease-out 0.1s both`,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                        <Avatar sx={{ background: "linear-gradient(135deg, #10b981, #059669)", width: 48, height: 48 }}>
                          <FamilyRestroom />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Datos del Tutor/Responsable
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Información del padre, madre o tutor legal
                          </Typography>
                        </Box>
                      </Stack>

                      <Grid container spacing={3}>
                        <Grid size={{xs:12, md:6}} >
                          <TextField
                            label="Nombre Completo del Tutor *"
                            fullWidth
                            value={formData.nombre_tutor}
                            onChange={(e) => handleChange("nombre_tutor", e.target.value)}
                            error={!!errors.nombre_tutor}
                            helperText={errors.nombre_tutor}
                            sx={textFieldStyle}
                          />
                        </Grid>

                        <Grid size={{xs:12, md:6}} >
                          <TextField
                            label="Parentesco"
                            fullWidth
                            select
                            value={formData.parentesco_tutor}
                            onChange={(e) => handleChange("parentesco_tutor", e.target.value)}
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

                        <Grid size={{xs:12, md:6}} >
                          <TextField
                            label="Teléfono del Tutor *"
                            fullWidth
                            value={formData.telefono_tutor}
                            onChange={(e) => handleChange("telefono_tutor", e.target.value)}
                            error={!!errors.telefono_tutor}
                            helperText={errors.telefono_tutor}
                            sx={textFieldStyle}
                          />
                        </Grid>

                        
                      </Grid>
                    </Paper>
                  </Box>
                )}

                {/* Step 2 (paquetes) o Step 1 (individual): Información de Pago */}
                {((esPaquete && activeStep === 2) || (esIndividual && activeStep === 1)) && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Avatar sx={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", width: 48, height: 48 }}>
                        <Payment />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Información de Pago
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Realiza el pago y adjunta tu comprobante
                        </Typography>
                      </Box>
                    </Stack>

                    <Alert 
                      severity="info" 
                      icon={<QrCode2 />} 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 3,
                        background: isDark ? alpha("#3b82f6", 0.1) : alpha("#eff6ff", 1),
                      }}
                    >
                      Escanea el código QR en la barra lateral para realizar el pago o usa los datos bancarios proporcionados
                    </Alert>

                    <Grid container spacing={3}>
                      <Grid size={{xs:12, md:6}} >
                        <TextField
                          label="Monto Pagado *"
                          type="number"
                          fullWidth
                          value={formData.monto_pagado}
                          onChange={(e) => handleChange("monto_pagado", parseFloat(e.target.value))}
                          error={!!errors.monto_pagado}
                          helperText={
                            errors.monto_pagado ||
                            `Monto ${esPaquete ? "del paquete" : "del curso"}: Bs. ${
                              esPaquete ? paquete?.precio : cursoIndividual?.costo
                            }`
                          }
                          sx={textFieldStyle}
                        />
                      </Grid>

                      <Grid size={{xs:12, md:6}} >
                        <TextField
                          label="Número de Comprobante"
                          fullWidth
                          value={formData.numero_comprobante}
                          onChange={(e) => handleChange("numero_comprobante", e.target.value)}
                          placeholder="Ej: 123456789"
                          sx={textFieldStyle}
                        />
                      </Grid>

                      <Grid size={{xs:12, md:6}} >
                        <TextField
                          label="Fecha de Pago"
                          type="date"
                          fullWidth
                          value={formData.fecha_pago}
                          onChange={(e) => handleChange("fecha_pago", e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={textFieldStyle}
                        />
                      </Grid>

                      <Grid size={{xs:12, md:6}} >
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          startIcon={<CloudUpload />}
                          sx={{
                            height: 56,
                            borderRadius: 2,
                            borderColor: isDark ? alpha("#667eea", 0.5) : alpha("#667eea", 0.5),
                            color: isDark ? "#667eea" : "#667eea",
                            fontWeight: 600,
                            textTransform: "none",
                            "&:hover": {
                              borderColor: "#667eea",
                              background: isDark ? alpha("#667eea", 0.1) : alpha("#667eea", 0.05),
                            },
                          }}
                        >
                          {comprobante ? "Cambiar Comprobante" : "Subir Comprobante"}
                          <input
                            type="file"
                            hidden
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                          />
                        </Button>
                        {comprobante && (
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                            <CheckCircle sx={{ color: "#10b981", fontSize: 18 }} />
                            <Typography variant="caption" color="text.secondary">
                              {comprobante.name} ({(comprobante.size / 1024).toFixed(2)} KB)
                            </Typography>
                          </Stack>
                        )}
                        {errors.comprobante && (
                          <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                            {errors.comprobante}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Step 3 (paquetes) o Step 2 (individual): Confirmación */}
                {((esPaquete && activeStep === 3) || (esIndividual && activeStep === 2)) && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Avatar sx={{ background: "linear-gradient(135deg, #10b981, #059669)", width: 48, height: 48 }}>
                        <CheckCircle />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Confirma tu Inscripción
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Revisa que todos los datos sean correctos antes de finalizar
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack spacing={3}>
                      {/* Cursos Seleccionados */}
                      {cursosSeleccionadosData.length > 0 && (
                        <Paper
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: isDark ? alpha("#667eea", 0.1) : alpha("#e0e7ff", 1),
                            border: `2px solid ${isDark ? alpha("#667eea", 0.3) : "#c7d2fe"}`,
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                            <School sx={{ color: "#667eea", fontSize: 28 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#667eea" }}>
                              {esPaquete ? "Cursos Seleccionados" : "Curso"}
                            </Typography>
                          </Stack>
                          <Stack spacing={1.5}>
                            {cursosSeleccionadosData.map((curso) => (
                              <Box
                                key={curso.id}
                                sx={{
                                  p: 2,
                                  background: isDark ? alpha("#fff", 0.05) : alpha("#fff", 0.8),
                                  borderRadius: 2,
                                  border: `1px solid ${isDark ? alpha("#fff", 0.1) : alpha("#000", 0.05)}`,
                                }}
                              >
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {curso.nombre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {curso.dias_semana} • {curso.hora_inicio} - {curso.hora_fin}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Paper>
                      )}

                      {/* Información del Estudiante */}
                      <Paper
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: isDark ? alpha("#667eea", 0.1) : alpha("#eff6ff", 1),
                          border: `2px solid ${isDark ? alpha("#667eea", 0.3) : "#bfdbfe"}`,
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <Person sx={{ color: "#667eea", fontSize: 28 }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#667eea" }}>
                            Información del Estudiante
                          </Typography>
                        </Stack>
                        <Grid container spacing={2}>
                          <Grid size={{xs:12, md:6}} >
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              Nombre Completo
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formData.nombres} {formData.apellido_paterno} {formData.apellido_materno}
                            </Typography>
                          </Grid>
                          <Grid size={{xs:12, md:6}} >
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              Fecha de Nacimiento
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {new Date(formData.fecha_nacimiento).toLocaleDateString('es-ES', { 
                                day: '2-digit', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </Typography>
                          </Grid>
                          {formData.ci && (
                            <Grid size={{xs:12, md:6}} >
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                CI / Documento
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {formData.ci}
                              </Typography>
                            </Grid>
                          )}
                          <Grid size={{xs:12, md:6}} >
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              Género
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formData.genero.charAt(0).toUpperCase() + formData.genero.slice(1)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>

                      {/* Información del Tutor */}
                      <Paper
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: isDark ? alpha("#10b981", 0.1) : alpha("#d1fae5", 1),
                          border: `2px solid ${isDark ? alpha("#10b981", 0.3) : "#6ee7b7"}`,
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <FamilyRestroom sx={{ color: "#10b981", fontSize: 28 }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#10b981" }}>
                            Información del Tutor
                          </Typography>
                        </Stack>
                        <Grid container spacing={2}>
                          <Grid size={{xs:12, md:6}} >
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              Nombre Completo
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formData.nombre_tutor}
                            </Typography>
                          </Grid>
                          <Grid size={{xs:12, md:6}} >
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              Teléfono
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formData.telefono_tutor}
                            </Typography>
                          </Grid>
                          <Grid size={{xs:12, md:6}} >
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              Parentesco
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formData.parentesco_tutor.charAt(0).toUpperCase() +
                                formData.parentesco_tutor.slice(1)}
                            </Typography>
                          </Grid>
                          {formData.email_tutor && (
                            <Grid size={{xs:12, md:6}} >
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Email
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {formData.email_tutor}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>

                      {/* Información de Pago */}
                      <Paper
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: isDark ? alpha("#f59e0b", 0.1) : alpha("#fef3c7", 1),
                          border: `2px solid ${isDark ? alpha("#f59e0b", 0.3) : "#fcd34d"}`,
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <Payment sx={{ color: "#f59e0b", fontSize: 28 }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#f59e0b" }}>
                            Información de Pago
                          </Typography>
                        </Stack>
                        <Grid container spacing={2}>
                          <Grid size={{xs:12, md:6}} >
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              Monto Pagado
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: "#f59e0b" }}>
                              Bs. {formData.monto_pagado}
                            </Typography>
                          </Grid>
                          {formData.numero_comprobante && (
                            <Grid size={{xs:12, md:6}} >
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                N° Comprobante
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {formData.numero_comprobante}
                              </Typography>
                            </Grid>
                          )}
                          <Grid size={{xs:12, md:6}} >
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              Fecha de Pago
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {new Date(formData.fecha_pago).toLocaleDateString('es-ES', { 
                                day: '2-digit', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </Typography>
                          </Grid>
                          {comprobante && (
                            <Grid size={{xs:12, md:6}} >
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Comprobante Adjunto
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <CheckCircle sx={{ color: "#10b981", fontSize: 20 }} />
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {comprobante.name}
                                </Typography>
                              </Stack>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>

                      <Alert severity="warning" sx={{ borderRadius: 3 }}>
                        Al confirmar la inscripción, aceptas los términos y condiciones. Tu pago será verificado en las próximas 24-48 horas.
                      </Alert>
                    </Stack>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Botones de Navegación */}
              <Stack direction="row" justifyContent="space-between">
                <Button
                color="secondary"
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  disabled={activeStep === 0 || isInscribiendo}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: "none",
                    borderColor: isDark ? alpha("#fff", 0.2) : alpha("#000", 0.2),
                  }}
                >
                  Atrás
                </Button>

                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    endIcon={<KeyboardArrowRight />}
                    onClick={handleNext}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: "none",
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #764ba2, #f093fb)",
                      },
                    }}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={handleSubmit}
                    disabled={isInscribiendo}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: "none",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #059669, #047857)",
                      },
                    }}
                  >
                    {isInscribiendo ? "Procesando..." : "Confirmar Inscripción"}
                  </Button>
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* Sidebar - Detalles y QR */}
          <Grid size={{xs:12, md:4}}>
            <Stack spacing={3}>
              {/* Resumen del Curso/Paquete */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: `1px solid ${isDark ? alpha("#fff", 0.1) : alpha("#000", 0.08)}`,
                  background: isDark ? "#1a1f3a" : "#fff",
                  position: "sticky",
                  top: 24,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  {esPaquete ? "Resumen del Paquete" : "Resumen del Curso"}
                </Typography>

                <Stack spacing={2.5}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                      <AttachMoney sx={{ color: "#f59e0b", fontSize: 24 }} />
                      <Typography variant="body2" color="text.secondary">
                        {esPaquete ? "Inversión Total" : "Precio"}
                      </Typography>
                    </Stack>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: "#f59e0b", mb: 0.5 }}>
                      Bs. {esPaquete ? paquete?.precio : cursoIndividual?.costo}
                    </Typography>
                    {esPaquete && (
                      <Typography variant="caption" color="text.secondary">
                        {paquete?.cantidad_cursos ?? 0} cursos • Bs. {(
                          (paquete?.precio ?? 0) / (paquete?.cantidad_cursos || 1)
                        ).toFixed(2)} c/u
                      </Typography>
                    )}
                  </Box>

                  <Divider />

                  {esIndividual && cursoData && (
                    <List disablePadding>
                      {cursoData.dias_semana && (
                        <ListItem disablePadding sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <CalendarMonth sx={{ color: "#667eea" }} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Días"
                            secondary={cursoData.dias_semana}
                            primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                            secondaryTypographyProps={{ variant: "body1", fontWeight: 600 }}
                          />
                        </ListItem>
                      )}

                      {cursoData.hora_inicio && (
                        <ListItem disablePadding sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <AccessTime sx={{ color: "#10b981" }} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Horario"
                            secondary={`${cursoData.hora_inicio} - ${cursoData.hora_fin}`}
                            primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                            secondaryTypographyProps={{ variant: "body1", fontWeight: 600 }}
                          />
                        </ListItem>
                      )}

                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <EventSeat sx={{ color: "#f59e0b" }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Cupos Disponibles"
                          secondary={`${cursoData.cupos_disponibles} de ${cursoData.cupos_totales}`}
                          primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                          secondaryTypographyProps={{ variant: "body1", fontWeight: 600 }}
                        />
                      </ListItem>

                      {cursoData.aula && (
                        <ListItem disablePadding sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <LocationOn sx={{ color: "#ef4444" }} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Aula"
                            secondary={cursoData.aula}
                            primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                            secondaryTypographyProps={{ variant: "body1", fontWeight: 600 }}
                          />
                        </ListItem>
                      )}
                    </List>
                  )}

                  {esPaquete && paquete && (
                    <Alert severity="success" icon={<LocalOffer />} sx={{ borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        ¡Ahorro de Bs. {((250 * (paquete?.cantidad_cursos ?? 0)) - (paquete?.precio ?? 0)).toFixed(2)}!
                      </Typography>
                      <Typography variant="caption">
                        {(((250 * (paquete?.cantidad_cursos ?? 0)) - (paquete?.precio ?? 0)) / (250 * (paquete?.cantidad_cursos ?? 1)) * 100).toFixed(0)}% de descuento
                      </Typography>
                    </Alert>
                  )}

                  {esIndividual && cursoData?.requisitos && (
                    <>
                      <Divider />
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                          <Description sx={{ color: "#667eea", fontSize: 20 }} />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Requisitos
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                          {cursoData.requisitos}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </Paper>

              {/* QR para Pago */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: `3px dashed ${isDark ? "#f59e0b" : "#d97706"}`,
                  background: isDark ? alpha("#f59e0b", 0.08) : alpha("#fef3c7", 1),
                  textAlign: "center",
                }}
              >
                <Chip
                  icon={<QrCode2 />}
                  label="Código QR de Pago"
                  sx={{
                    mb: 2,
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                />

                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: "1/1",
                    background: "#fff",
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    animation: `${pulseQr} 3s infinite`,
                    border: "4px solid #f59e0b",
                    boxShadow: "0 8px 24px rgba(245, 158, 11, 0.3)",
                    overflow: "hidden",
                  }}
                >
                  <img src="/Qr.png" alt="QR de pago" style={{ width: "90%", height: "90%", objectFit: "contain" }} />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Escanea el código QR con tu app bancaria
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Datos Bancarios
                </Typography>

                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Banco
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Banco BISA
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Número de Cuenta
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      23124010
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Titular
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      La Voz de Cristo High School
                    </Typography>
                  </Box>
                </Stack>

                <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Recuerda adjuntar tu comprobante de pago para validar la inscripción
                  </Typography>
                </Alert>
              </Paper>

              {/* Información de Contacto */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: `1px solid ${isDark ? alpha("#fff", 0.1) : alpha("#000", 0.08)}`,
                  background: isDark ? alpha("#667eea", 0.08) : alpha("#eff6ff", 1),
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                  ¿Necesitas Ayuda?
                </Typography>

                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ background: "linear-gradient(135deg, #10b981, #059669)", width: 40, height: 40 }}>
                      <Phone sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        WhatsApp / Teléfono
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        +591 69624189
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ background: "linear-gradient(135deg, #667eea, #764ba2)", width: 40, height: 40 }}>
                      <Email sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Correo Electrónico
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                        lavozdecristochighschool@gmail.com
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
                  Horario de atención: Lunes a Viernes de 8:00 AM a 6:00 PM
                </Typography>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default function InscripcionPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 4 }} />
        </Container>
      }
    >
      <InscripcionContent />
    </Suspense>
  );
}