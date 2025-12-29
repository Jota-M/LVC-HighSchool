"use client";
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  Skeleton,
  Alert,
  IconButton,
  Chip,
  Stack,
  Divider,
  alpha,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ArrowBack,
  School,
  CalendarMonth,
  AccessTime,
  AttachMoney,
  EventSeat,
  LocationOn,
  Person,
  ContactPhone,
  Payment,
  CheckCircle,
  CloudUpload,
  QrCode2,
  KeyboardArrowRight,
  Star,
  Schedule,
  Description,
  Phone,
  Email,
} from "@mui/icons-material";
import { keyframes } from "@mui/system";
import { useRouter, useParams } from "next/navigation";
import { useCursoPublico } from "@/hooks/useCursosVacacionales";
import { useInscripcionPublica } from "@/hooks/useInscripcionPublica";
import { FormInscripcionPublica } from "@/types/cursoVacacionalTypes";

// Animaciones
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseQr = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const steps = ["Datos del Estudiante", "Datos del Tutor", "Pago", "Confirmación"];

export default function CursoDetallePage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const router = useRouter();
  const params = useParams();
  const cursoId = params?.id ? parseInt(params.id as string) : null;

  const { curso, isLoading } = useCursoPublico(cursoId);
  const { inscribirPublico, isInscribiendo } = useInscripcionPublica();

  const [activeStep, setActiveStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<{
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    fecha_nacimiento: string;
    ci: string;
    genero: "masculino" | "femenino" | "otro";
    telefono: string;
    email: string;
    nombre_tutor: string;
    telefono_tutor: string;
    email_tutor: string;
    parentesco_tutor: string;
    monto_pagado: number;
    numero_comprobante: string;
    fecha_pago: string;
  }>({
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
    monto_pagado: curso?.costo || 0,
    numero_comprobante: "",
    fecha_pago: new Date().toISOString().split("T")[0],
  });

  const [comprobante, setComprobante] = useState<File | null>(null);

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

    if (step === 0) {
      if (!formData.nombres) newErrors.nombres = "Campo requerido";
      if (!formData.apellido_paterno) newErrors.apellido_paterno = "Campo requerido";
      if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = "Campo requerido";
    }

    if (step === 1) {
      if (!formData.nombre_tutor) newErrors.nombre_tutor = "Campo requerido";
      if (!formData.telefono_tutor) newErrors.telefono_tutor = "Campo requerido";
      else if (formData.telefono_tutor.length < 7)
        newErrors.telefono_tutor = "Mínimo 7 dígitos";
    }

    if (step === 2) {
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
    if (!validateStep(activeStep) || !curso) return;

    const inscripcionData: FormInscripcionPublica = {
      curso_vacacional_id: curso.id,
      nombres: formData.nombres,
      apellido_paterno: formData.apellido_paterno,
      apellido_materno: formData.apellido_materno || undefined,
      fecha_nacimiento: formData.fecha_nacimiento,
      ci: formData.ci || undefined,
      genero: formData.genero,
      telefono: formData.telefono || undefined,
      email: formData.email || undefined,
      nombre_tutor: formData.nombre_tutor,
      telefono_tutor: formData.telefono_tutor,
      email_tutor: formData.email_tutor || undefined,
      parentesco_tutor: formData.parentesco_tutor || undefined,
      monto_pagado: Number(formData.monto_pagado),
      numero_comprobante: formData.numero_comprobante || undefined,
      fecha_pago: formData.fecha_pago || undefined,
      comprobante: comprobante || undefined,
    };

    try {
      await inscribirPublico(inscripcionData);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error al inscribirse:", error);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4, mb: 4 }} />
        <Grid container spacing={4}>
          <Grid size={{xs:12, md:8}}>
            <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 4 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!curso) {
    return (
      <Container maxWidth="lg" sx={{ py: 12, textAlign: "center" }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          No se encontró el curso solicitado
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => router.push("/cursos-vacacionales")}
          sx={{ mt: 3 }}
        >
          Volver a Cursos
        </Button>
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
            <Grid size={{xs:12, md:8}}>
              <Chip
                icon={<Star />}
                label="Curso Vacacional"
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
                {curso.nombre}
              </Typography>
              <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.9)", mb: 3 }}>
                {curso.descripcion}
              </Typography>

              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip
                  icon={<EventSeat />}
                  label={`${curso.cupos_disponibles} cupos disponibles`}
                  sx={{
                    background: curso.cupos_disponibles > 10
                      ? alpha("#10b981", 0.9)
                      : alpha("#f59e0b", 0.9),
                    color: "#fff",
                    fontWeight: 600,
                  }}
                />
                {curso.dias_semana && (
                  <Chip
                    icon={<CalendarMonth />}
                    label={curso.dias_semana}
                    sx={{ background: alpha("#fff", 0.2), color: "#fff" }}
                  />
                )}
                {curso.hora_inicio && (
                  <Chip
                    icon={<Schedule />}
                    label={`${curso.hora_inicio} - ${curso.hora_fin}`}
                    sx={{ background: alpha("#fff", 0.2), color: "#fff" }}
                  />
                )}
              </Stack>
            </Grid>

            <Grid size={{xs:12, md:4}}>
              {curso.foto_url ? (
                <Box
                  component="img"
                  src={curso.foto_url}
                  alt={curso.nombre}
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
                    background: `linear-gradient(135deg, ${alpha("#1e3a8a", 0.3)}, ${alpha("#3b82f6", 0.3)})`,
                  }}
                >
                  <School sx={{ fontSize: 120, color: alpha("#fff", 0.3) }} />
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
                Completa todos los datos para inscribirte en este curso
              </Typography>

              <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box sx={{ animation: `${fadeIn} 0.4s ease-out` }}>
                {/* Paso 1: Datos del Estudiante */}
                {activeStep === 0 && (
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

                {/* Paso 2: Datos del Tutor */}
                {activeStep === 1 && (
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

                {/* Paso 3: Información de Pago */}
                {activeStep === 2 && (
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
                          helperText={errors.monto_pagado || `Monto del curso: Bs. ${curso.costo}`}
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

                      <Grid size={12}>
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

                {/* Paso 4: Confirmación */}
                {activeStep === 3 && (
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
                              {formData.parentesco_tutor.charAt(0).toUpperCase() + formData.parentesco_tutor.slice(1)}
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

                {activeStep < 3 ? (
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

          {/* Sidebar - Detalles del Curso y QR */}
          <Grid size={{xs:12, md:4}}>
            <Stack spacing={3}>
              {/* Resumen del Curso */}
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
                  Detalles del Curso
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                      <AttachMoney sx={{ color: "#f59e0b", fontSize: 24 }} />
                      <Typography variant="body2" color="text.secondary">
                        Inversión
                      </Typography>
                    </Stack>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: "#f59e0b" }}>
                      Bs. {curso.costo}
                    </Typography>
                  </Box>

                  <Divider />

                  <List disablePadding>
                    {curso.dias_semana && (
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <CalendarMonth sx={{ color: "#3b82f6" }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Días"
                          secondary={curso.dias_semana}
                          primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                          secondaryTypographyProps={{ variant: "body1", fontWeight: 600 }}
                        />
                      </ListItem>
                    )}

                    {curso.hora_inicio && (
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <AccessTime sx={{ color: "#10b981" }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Horario"
                          secondary={`${curso.hora_inicio} - ${curso.hora_fin}`}
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
                        secondary={`${curso.cupos_disponibles} de ${curso.cupos_totales}`}
                        primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                        secondaryTypographyProps={{ variant: "body1", fontWeight: 600 }}
                      />
                    </ListItem>

                    {curso.aula && (
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <LocationOn sx={{ color: "#ef4444" }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Aula"
                          secondary={curso.aula}
                          primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                          secondaryTypographyProps={{ variant: "body1", fontWeight: 600 }}
                        />
                      </ListItem>
                    )}
                  </List>

                  {curso.requisitos && (
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
                          {curso.requisitos}
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
                  background: isDark
                    ? alpha("#f59e0b", 0.05)
                    : alpha("#fef3c7", 1),
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
                  <QrCode2 sx={{ fontSize: 180, color: "#0f172a" }} />
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
                  background: isDark
                    ? alpha("#3b82f6", 0.05)
                    : alpha("#eff6ff", 1),
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
                        +591 123 456 789
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
                        info@institucion.edu.bo
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