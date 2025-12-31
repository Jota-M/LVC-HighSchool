// app/cursos-vacacionales/inscripcion/page.tsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  useTheme,
  alpha,
  IconButton,
  CardMedia,
  Skeleton,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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

// Animaciones
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseQr = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
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

    // Step 1: Datos del estudiante
    if (step === 1) {
      if (!formData.nombres) newErrors.nombres = "Campo requerido";
      if (!formData.apellido_paterno) newErrors.apellido_paterno = "Campo requerido";
      if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = "Campo requerido";
    }

    // Step 2: Datos del tutor
    if (step === 2) {
      if (!formData.nombre_tutor) newErrors.nombre_tutor = "Campo requerido";
      if (!formData.telefono_tutor) newErrors.telefono_tutor = "Campo requerido";
      else if (formData.telefono_tutor.length < 7)
        newErrors.telefono_tutor = "Mínimo 7 dígitos";
    }

    // Step 3: Pago
    if (step === 3) {
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
            Tu solicitud ha sido recibida. Recibirás una confirmación por correo electrónico una vez que se
            verifique tu pago.
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
              }}
            >
              Ver Más Cursos
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push("/")}
              sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 700 }}
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

  // Ajustar steps según el tipo
  const steps = esPaquete
    ? ["Seleccionar Cursos", "Datos del Estudiante", "Datos del Tutor", "Pago", "Confirmación"]
    : ["Datos del Estudiante", "Datos del Tutor", "Pago", "Confirmación"];

  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      transition: "all 0.3s",
      "&:hover": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: isDark ? "#3b82f6" : "#0284c7",
        },
      },
      "&.Mui-focused": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderWidth: "2px",
          borderColor: isDark ? "#3b82f6" : "#0284c7",
        },
      },
    },
  };

  return (
    <Box sx={{ minHeight: "100vh", pb: 8 }}>
      {/* Header */}
      <Box
        sx={{
          background: isDark
            ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
            : "linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)",
          py: 6,
          mb: 6,
        }}
      >
        <Container maxWidth="xl">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push("/cursos-vacacionales")}
            sx={{
              color: "#fff",
              mb: 3,
              "&:hover": {
                background: alpha("#fff", 0.1),
              },
            }}
          >
            Volver a Cursos
          </Button>

          <Grid container spacing={4} alignItems="center">
            <Grid size={{xs:12, md:7}}>
              <Chip
                icon={esPaquete ? <Savings /> : <Star />}
                label={esPaquete ? "Paquete Vacacional" : "Curso Vacacional"}
                sx={{
                  mb: 2,
                  background: "linear-gradient(135deg, #facc15, #f59e0b)",
                  color: "#000",
                  fontWeight: 700,
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  color: "#fff",
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: "2rem", md: "3rem" },
                }}
              >
                {esPaquete ? paquete?.nombre : cursoIndividual?.nombre}
              </Typography>
              <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.9)", mb: 3 }}>
                {esPaquete
                  ? `Inscríbete en ${paquete?.cantidad_cursos} cursos y ahorra`
                  : cursoIndividual?.descripcion}
              </Typography>

              <Stack direction="row" spacing={2} flexWrap="wrap">
                {esIndividual && (
                  <>
                    <Chip
                      icon={<EventSeat />}
                      label={`${cursoIndividual?.cupos_disponibles} cupos disponibles`}
                      sx={{
                        background:
                          cursoIndividual?.cupos_disponibles && cursoIndividual.cupos_disponibles > 10
                            ? alpha("#10b981", 0.9)
                            : alpha("#f59e0b", 0.9),
                        color: "#fff",
                        fontWeight: 600,
                      }}
                    />
                    {cursoIndividual?.dias_semana && (
                      <Chip
                        icon={<CalendarMonth />}
                        label={cursoIndividual?.dias_semana}
                        sx={{ background: alpha("#fff", 0.2), color: "#fff" }}
                      />
                    )}
                    {cursoIndividual?.hora_inicio && (
                      <Chip
                        icon={<AccessTime />}
                        label={`${cursoIndividual.hora_inicio} - ${cursoIndividual.hora_fin}`}
                        sx={{ background: alpha("#fff", 0.2), color: "#fff" }}
                      />
                    )}
                  </>
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
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
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
                    background: `linear-gradient(135deg, ${alpha(esPaquete ? "#facc15" : "#1e3a8a", 0.3)}, ${alpha(esPaquete ? "#f59e0b" : "#3b82f6", 0.3)})`,
                  }}
                >
                  {esPaquete ? (
                    <Savings sx={{ fontSize: 120, color: alpha("#fff", 0.3) }} />
                  ) : (
                    <School sx={{ fontSize: 120, color: alpha("#fff", 0.3) }} />
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
                border: `1px solid ${isDark ? alpha("#fff", 0.1) : alpha("#000", 0.1)}`,
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Formulario de Inscripción
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Completa todos los datos para inscribirte
              </Typography>

              <Stepper 
                activeStep={activeStep} 
                sx={{ 
                  mb: 5,
                  '& .MuiStepLabel-label': {
                    display: { xs: 'none', sm: 'block' }
                  },
                  '& .MuiStepLabel-iconContainer': {
                    pr: { xs: 0, sm: 1 }
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
                    <Alert severity="info" icon={<School />} sx={{ mb: 4, borderRadius: 3 }}>
                      Selecciona <strong>{paquete?.cantidad_cursos}</strong> curso(s) de los disponibles
                      ({cursosSeleccionados.length}/{paquete?.cantidad_cursos} seleccionados)
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
                                  ? `3px solid ${alpha("#10b981", 0.8)}`
                                  : `2px solid ${alpha("#000", 0.1)}`,
                                borderRadius: 3,
                                transition: "all 0.3s",
                                "&:hover": {
                                  transform: isDisabled ? "none" : "translateY(-4px)",
                                  boxShadow: isDisabled
                                    ? "none"
                                    : `0 8px 24px ${alpha("#000", 0.15)}`,
                                },
                              }}
                              onClick={() => !isDisabled && handleCursoToggle(curso.id)}
                            >
                              {isSelected && (
                                <Chip
                                  icon={<CheckCircle />}
                                  label="Seleccionado"
                                  color="success"
                                  size="small"
                                  sx={{
                                    position: "absolute",
                                    top: 12,
                                    right: 12,
                                    zIndex: 2,
                                    fontWeight: 700,
                                  }}
                                />
                              )}

                              <Box
                                sx={{
                                  height: 160,
                                  background: curso.foto_url
                                    ? "transparent"
                                    : `linear-gradient(135deg, ${isDark ? "#1e3a8a" : "#0369a1"}, ${isDark ? "#3b82f6" : "#0284c7"})`,
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
                                    <School sx={{ fontSize: 80, color: alpha("#fff", 0.3) }} />
                                  </Box>
                                )}
                              </Box>

                              <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                  {curso.nombre}
                                </Typography>

                                <Stack spacing={1}>
                                  {curso.dias_semana && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <CalendarMonth sx={{ fontSize: 18, color: "#3b82f6" }} />
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

                {/* Step 1: Datos del Estudiante */}
                {((esPaquete && activeStep === 1) || (esIndividual && activeStep === 0)) && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Avatar sx={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>
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
                      <Grid size={{xs:12, md:6}}>
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

                      <Grid size={{xs:12, md:6}}>
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

                      <Grid size={{xs:12, md:6}}>
                        <TextField
                          label="Apellido Materno"
                          fullWidth
                          value={formData.apellido_materno}
                          onChange={(e) => handleChange("apellido_materno", e.target.value)}
                          sx={textFieldStyle}
                        />
                      </Grid>

                      <Grid size={{xs:12, md:6}}>
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

                      <Grid size={{xs:12, md:6}}>
                        <TextField
                          label="CI"
                          fullWidth
                          value={formData.ci}
                          onChange={(e) => handleChange("ci", e.target.value)}
                          sx={textFieldStyle}
                        />
                      </Grid>

                      <Grid size={{xs:12, md:6}}>
                        <TextField
                          label="Género"
                          fullWidth
                          select
                          value={formData.genero}
                          onChange={(e) => handleChange("genero", e.target.value)}
                          sx={textFieldStyle}
                        >
                          <MenuItem value="masculino">Masculino</MenuItem>
                          <MenuItem value="femenino">Femenino</MenuItem>
                          <MenuItem value="otro">Otro</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid size={{xs:12, md:6}}>
                        <TextField
                          label="Teléfono"
                          fullWidth
                          value={formData.telefono}
                          onChange={(e) => handleChange("telefono", e.target.value)}
                          sx={textFieldStyle}
                        />
                      </Grid>

                      <Grid size={{xs:12, md:6}}>
                        <TextField
                          label="Email"
                          type="email"
                          fullWidth
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          sx={textFieldStyle}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Step 2: Datos del Tutor */}
                {((esPaquete && activeStep === 2) || (esIndividual && activeStep === 1)) && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Avatar sx={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                        <ContactPhone />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Datos del Tutor/Responsable
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Información del padre, madre o tutor
                        </Typography>
                      </Box>
                    </Stack>

                    <Grid container spacing={3}>
                      <Grid size={{xs:12, md:6}}>
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

                      <Grid size={{xs:12, md:6}}>
                        <TextField
                          label="Parentesco"
                          fullWidth
                          select
                          value={formData.parentesco_tutor}
                          onChange={(e) => handleChange("parentesco_tutor", e.target.value)}
                          sx={textFieldStyle}
                        >
                          <MenuItem value="padre">Padre</MenuItem>
                          <MenuItem value="madre">Madre</MenuItem>
                          <MenuItem value="tutor">Tutor</MenuItem>
                          <MenuItem value="abuelo">Abuelo/a</MenuItem>
                          <MenuItem value="tio">Tío/a</MenuItem>
                          <MenuItem value="hermano">Hermano/a</MenuItem>
                          <MenuItem value="otro">Otro</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid size={{xs:12, md:6}}>
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

                      <Grid size={{xs:12, md:6}}>
                        <TextField
                          label="Email del Tutor"
                          type="email"
                          fullWidth
                          value={formData.email_tutor}
                          onChange={(e) => handleChange("email_tutor", e.target.value)}
                          sx={textFieldStyle}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Step 3: Información de Pago */}
                {((esPaquete && activeStep === 3) || (esIndividual && activeStep === 2)) && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Avatar sx={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
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

                    <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                      Escanea el código QR para realizar el pago o usa los datos bancarios proporcionados
                    </Alert>

                    <Grid container spacing={3}>
                      <Grid size={{xs:12, md:6}}>
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

                      <Grid size={{xs:12, md:6}}>
                        <TextField
                          label="Número de Comprobante"
                          fullWidth
                          value={formData.numero_comprobante}
                          onChange={(e) => handleChange("numero_comprobante", e.target.value)}
                          sx={textFieldStyle}
                        />
                      </Grid>

                      <Grid size={{xs:12, md:6}}>
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

                      <Grid size={{xs:12, md:6}}>
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          startIcon={<CloudUpload />}
                          sx={{
                            height: 56,
                            borderRadius: 2,
                            borderColor: isDark ? alpha("#3b82f6", 0.5) : alpha("#0284c7", 0.5),
                            color: isDark ? "#3b82f6" : "#0284c7",
                            "&:hover": {
                              borderColor: isDark ? "#3b82f6" : "#0284c7",
                              background: isDark ? alpha("#3b82f6", 0.1) : alpha("#0284c7", 0.1),
                            },
                          }}
                        >
                          {comprobante ? comprobante.name : "Subir Comprobante de Pago (Imagen o PDF)"}
                          <input
                            type="file"
                            hidden
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                          />
                        </Button>
                        {comprobante && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                            {comprobante.name} ({(comprobante.size / 1024).toFixed(2)} KB)
                          </Typography>
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

                {/* Step 4: Confirmación */}
                {((esPaquete && activeStep === 4) || (esIndividual && activeStep === 3)) && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Avatar sx={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
                        <CheckCircle />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Confirma tu Inscripción
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Revisa que todos los datos sean correctos
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack spacing={3}>
                      {/* Cursos Seleccionados */}
                      {cursosSeleccionadosData.length > 0 && (
                        <Paper
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            background: isDark ? alpha("#6366f1", 0.1) : alpha("#e0e7ff", 1),
                            border: `1px solid ${isDark ? alpha("#6366f1", 0.3) : "#c7d2fe"}`,
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                            <School sx={{ color: "#6366f1" }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#6366f1" }}>
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
                          borderRadius: 2,
                          background: isDark ? alpha("#3b82f6", 0.1) : alpha("#eff6ff", 1),
                          border: `1px solid ${isDark ? alpha("#3b82f6", 0.3) : "#bfdbfe"}`,
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <Person sx={{ color: "#3b82f6" }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#3b82f6" }}>
                            Información del Estudiante
                          </Typography>
                        </Stack>
                        <Grid container spacing={2}>
                          <Grid size={{xs:12, md:6}}>
                            <Typography variant="body2" color="text.secondary">
                              Nombre Completo
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formData.nombres} {formData.apellido_paterno} {formData.apellido_materno}
                            </Typography>
                          </Grid>
                          <Grid size={{xs:12, md:6}}>
                            <Typography variant="body2" color="text.secondary">
                              Fecha de Nacimiento
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formData.fecha_nacimiento}
                            </Typography>
                          </Grid>
                          {formData.ci && (
                            <Grid size={{xs:12, md:6}}>
                              <Typography variant="body2" color="text.secondary">
                                CI
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {formData.ci}
                              </Typography>
                            </Grid>
                          )}
                          <Grid size={{xs:12, md:6}}>
                            <Typography variant="body2" color="text.secondary">
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
                          borderRadius: 2,
                          background: isDark ? alpha("#10b981", 0.1) : alpha("#d1fae5", 1),
                          border: `1px solid ${isDark ? alpha("#10b981", 0.3) : "#6ee7b7"}`,
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <ContactPhone sx={{ color: "#10b981" }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#10b981" }}>
                            Información del Tutor
                          </Typography>
                        </Stack>
                        <Grid container spacing={2}>
                          <Grid size={{xs:12, md:6}}>
                            <Typography variant="body2" color="text.secondary">
                              Nombre Completo
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formData.nombre_tutor}
                            </Typography>
                          </Grid>
                          <Grid size={{xs:12, md:6}}>
                            <Typography variant="body2" color="text.secondary">
                              Teléfono
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formData.telefono_tutor}
                            </Typography>
                          </Grid>
                          <Grid size={{xs:12, md:6}}>
                            <Typography variant="body2" color="text.secondary">
                              Parentesco
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formData.parentesco_tutor.charAt(0).toUpperCase() +
                                formData.parentesco_tutor.slice(1)}
                            </Typography>
                          </Grid>
                          {formData.email_tutor && (
                            <Grid size={{xs:12, md:6}}>
                              <Typography variant="body2" color="text.secondary">
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
                          borderRadius: 2,
                          background: isDark ? alpha("#f59e0b", 0.1) : alpha("#fef3c7", 1),
                          border: `1px solid ${isDark ? alpha("#f59e0b", 0.3) : "#fcd34d"}`,
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <Payment sx={{ color: "#f59e0b" }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#f59e0b" }}>
                            Información de Pago
                          </Typography>
                        </Stack>
                        <Grid container spacing={2}>
                          <Grid size={{xs:12, md:6}}>
                            <Typography variant="body2" color="text.secondary">
                              Monto Pagado
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              Bs. {formData.monto_pagado}
                            </Typography>
                          </Grid>
                          {formData.numero_comprobante && (
                            <Grid size={{xs:12, md:6}}>
                              <Typography variant="body2" color="text.secondary">
                                N° Comprobante
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {formData.numero_comprobante}
                              </Typography>
                            </Grid>
                          )}
                          <Grid size={{xs:12, md:6}}>
                            <Typography variant="body2" color="text.secondary">
                              Fecha de Pago
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formData.fecha_pago}
                            </Typography>
                          </Grid>
                          {comprobante && (
                            <Grid size={{xs:12, md:6}}>
                              <Typography variant="body2" color="text.secondary">
                                Comprobante Adjunto
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {comprobante.name}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    </Stack>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Botones de Navegación */}
              <Stack direction="row" justifyContent="space-between">
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  disabled={activeStep === 0 || isInscribiendo}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
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
                      background: isDark
                        ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                        : "linear-gradient(135deg, #0369a1, #0284c7)",
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
                      background: "linear-gradient(135deg, #10b981, #059669)",
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
                  border: `1px solid ${isDark ? alpha("#fff", 0.1) : alpha("#000", 0.1)}`,
                  position: "sticky",
                  top: 24,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  {esPaquete ? "Detalles del Paquete" : "Detalles del Curso"}
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                      <AttachMoney sx={{ color: "#f59e0b", fontSize: 24 }} />
                      <Typography variant="body2" color="text.secondary">
                        {esPaquete ? "Total" : "Inversión"}
                      </Typography>
                    </Stack>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: "#f59e0b" }}>
                      Bs. {esPaquete ? paquete?.precio : cursoIndividual?.costo}
                    </Typography>
                    {esPaquete && (
                      <Typography variant="caption" color="text.secondary">
                        {paquete?.cantidad_cursos ?? 0} cursos • Bs. {(
  (paquete?.precio ?? 0) / (paquete?.cantidad_cursos || 1)
).toFixed(2)}

                        c/u
                      </Typography>
                    )}
                  </Box>

                  <Divider />

                  {esIndividual && cursoData && (
                    <List disablePadding>
                      {cursoData.dias_semana && (
                        <ListItem disablePadding sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <CalendarMonth sx={{ color: "#3b82f6" }} />
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

                  {esPaquete && (
                    <Alert severity="success" icon={<LocalOffer />} sx={{ borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        ¡Ahorro de Bs. {(
  (250 * (paquete?.cantidad_cursos ?? 0)) -
  (paquete?.precio ?? 0)
).toFixed(2)}!

                      </Typography>
                    </Alert>
                  )}

                  {esIndividual && cursoData?.requisitos && (
                    <>
                      <Divider />
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                          <Description sx={{ color: "#6366f1", fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Requisitos
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
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
                  border: `2px dashed ${isDark ? "#f59e0b" : "#d97706"}`,
                  background: isDark ? alpha("#f59e0b", 0.05) : alpha("#fef3c7", 1),
                  textAlign: "center",
                }}
              >
                <Chip
                  icon={<QrCode2 />}
                  label="Escanea para Pagar"
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
                  }}
                >
                  <img src="/Qr.png" alt="QR de pago" style={{ width: "100%" }} />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Escanea el código QR con tu aplicación bancaria para realizar el pago
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Datos Bancarios
                </Typography>

                <Stack spacing={1}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Banco:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Banco Nacional de Bolivia
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Cuenta:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      1234567890
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Titular:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Institución Educativa
                    </Typography>
                  </Box>
                </Stack>

                <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
                  <Typography variant="caption">
                    Recuerda adjuntar el comprobante de pago en el formulario para validar tu inscripción
                  </Typography>
                </Alert>
              </Paper>

              {/* Información de Contacto */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: `1px solid ${isDark ? alpha("#fff", 0.1) : alpha("#000", 0.1)}`,
                  background: isDark ? alpha("#3b82f6", 0.05) : alpha("#eff6ff", 1),
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                  ¿Necesitas Ayuda?
                </Typography>

                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ background: "#10b981" }}>
                      <Phone />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Teléfono
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        +591 69624189
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ background: "#3b82f6" }}>
                      <Email />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        lavozdecristochighschool@gmail.com
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
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