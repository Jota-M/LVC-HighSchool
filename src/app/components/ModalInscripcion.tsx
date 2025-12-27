// app/cursos-vacacionales/components/ModalInscripcion.tsx
"use client";
import React, { useState } from "react";
import {
  Dialog,
  Box,
  Container,
  Paper,
  Button,
  Typography,
  TextField,
  MenuItem,
  Grid,
  useTheme,
  Fade,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Close,
  ArrowBack,
  ArrowForward,
  CloudUpload,
  CheckCircle,
  Person,
  ContactPhone,
  Payment,
} from "@mui/icons-material";
import { keyframes } from "@mui/system";
import { useInscripcionPublica } from "@/hooks/useInscripcionPublica";
import { CursoVacacional, FormInscripcionPublica } from "@/types/cursoVacacionalTypes";
import FormStepperInscripcion from "./FormStepperInscripcion";

interface ModalInscripcionProps {
  open: boolean;
  onClose: () => void;
  curso: CursoVacacional | null;
}

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function ModalInscripcion({ open, onClose, curso }: ModalInscripcionProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [activeStep, setActiveStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { inscribirPublico, isInscribiendo } = useInscripcionPublica();


  // Form data
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
    // Estudiante
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    ci: "",
    genero: "masculino",
    telefono: "",
    email: "",
    // Tutor
    nombre_tutor: "",
    telefono_tutor: "",
    email_tutor: "",
    parentesco_tutor: "padre",
    // Pago
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
    if (!validateStep(activeStep)) return;
    if (!curso) return;

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

  const handleCloseAll = () => {
    setActiveStep(0);
    setShowSuccess(false);
    setFormData({
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
    setComprobante(null);
    setErrors({});
    onClose();
  };

  if (!curso) return null;

  // Modal de éxito
  if (showSuccess) {
    return (
      <Dialog
        open={open}
        onClose={handleCloseAll}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            background: isDark
              ? "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.95))",
            backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box sx={{ p: 6, textAlign: "center" }}>
          <CheckCircle
            sx={{
              fontSize: 100,
              color: "#10b981",
              mb: 3,
              animation: `${pulseGlow} 2s infinite`,
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            ¡Inscripción Exitosa!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Tu solicitud ha sido recibida. Recibirás una confirmación por correo electrónico una vez que se
            verifique tu pago.
          </Typography>
          <Button
            variant="contained"
            onClick={handleCloseAll}
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#fff",
              px: 4,
              py: 1.5,
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              },
            }}
          >
            Entendido
          </Button>
        </Box>
      </Dialog>
    );
  }

  const buttonStyle = {
    borderRadius: "12px",
    textTransform: "none",
    fontWeight: 600,
    px: 4,
    py: 1.5,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      transform: "translateY(-2px)",
    },
  };

  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      transition: "all 0.3s",
      "&:hover": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: isDark ? "#facc15" : "#0288d1",
        },
      },
      "&.Mui-focused": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderWidth: "2px",
          borderColor: isDark ? "#facc15" : "#0288d1",
        },
      },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseAll}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          background: isDark
            ? "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.95))",
          backdropFilter: "blur(20px)",
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          borderBottom: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Inscripción a Curso Vacacional
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {curso.nombre}
          </Typography>
        </Box>
        <IconButton onClick={handleCloseAll}>
          <Close />
        </IconButton>
      </Box>

      {/* Info del curso */}
      <Box sx={{ px: 3, pt: 2 }}>
        <Alert
          severity="info"
          sx={{
            borderRadius: "12px",
            "& .MuiAlert-message": { width: "100%" },
          }}
        >
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip label={`Costo: Bs. ${curso.costo}`} size="small" color="primary" />
            {curso.dias_semana && <Chip label={curso.dias_semana} size="small" variant="outlined" />}
            {curso.hora_inicio && (
              <Chip label={`${curso.hora_inicio} - ${curso.hora_fin}`} size="small" variant="outlined" />
            )}
            <Chip
              label={`${curso.cupos_disponibles} cupos disponibles`}
              size="small"
              color={curso.cupos_disponibles > 10 ? "success" : "warning"}
            />
          </Box>
        </Alert>
      </Box>

      {/* Stepper */}
      <Box sx={{ px: 3, pt: 2 }}>
        <FormStepperInscripcion activeStep={activeStep} />
      </Box>

      {/* Content */}
      <Box sx={{ px: 3, py: 2, overflow: "auto", maxHeight: "50vh" }}>
        <Fade in timeout={300} key={activeStep}>
          <Box sx={{ animation: `${slideIn} 0.4s ease` }}>
            {/* Paso 1: Datos del Estudiante */}
            {activeStep === 0 && (
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Person sx={{ color: "#3b82f6" }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#3b82f6" }}>
                      Información del Estudiante
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
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

                <Grid size={{ xs: 12, md: 6 }}>
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

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Apellido Materno"
                    fullWidth
                    value={formData.apellido_materno}
                    onChange={(e) => handleChange("apellido_materno", e.target.value)}
                    sx={textFieldStyle}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
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

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="CI"
                    fullWidth
                    value={formData.ci}
                    onChange={(e) => handleChange("ci", e.target.value)}
                    sx={textFieldStyle}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
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

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Teléfono"
                    fullWidth
                    value={formData.telefono}
                    onChange={(e) => handleChange("telefono", e.target.value)}
                    sx={textFieldStyle}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
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
            )}

            {/* Paso 2: Datos del Tutor */}
            {activeStep === 1 && (
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <ContactPhone sx={{ color: "#10b981" }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#10b981" }}>
                      Información del Tutor/Responsable
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
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

                <Grid size={{ xs: 12, md: 6 }}>
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

                <Grid size={{ xs: 12, md: 6 }}>
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

                <Grid size={{ xs: 12, md: 6 }}>
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
            )}

            {/* Paso 3: Información de Pago */}
            {activeStep === 2 && (
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Payment sx={{ color: "#f59e0b" }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#f59e0b" }}>
                      Información de Pago
                    </Typography>
                  </Box>
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: "12px" }}>
                    Realiza tu pago y sube el comprobante. Tu inscripción será confirmada una vez verificado
                    el pago.
                  </Alert>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Monto Pagado *"
                    type="number"
                    fullWidth
                    value={formData.monto_pagado}
                    onChange={(e) => handleChange("monto_pagado", parseFloat(e.target.value))}
                    error={!!errors.monto_pagado}
                    helperText={errors.monto_pagado}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">Bs.</InputAdornment>,
                    }}
                    sx={textFieldStyle}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Número de Comprobante"
                    fullWidth
                    value={formData.numero_comprobante}
                    onChange={(e) => handleChange("numero_comprobante", e.target.value)}
                    sx={textFieldStyle}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
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
                      ...buttonStyle,
                      height: 56,
                      justifyContent: "flex-start",
                      borderColor: isDark ? "rgba(250, 204, 21, 0.5)" : "rgba(2, 136, 209, 0.5)",
                      color: isDark ? "#facc15" : "#0288d1",
                      "&:hover": {
                        borderColor: isDark ? "#facc15" : "#0288d1",
                        background: isDark ? "rgba(250, 204, 21, 0.1)" : "rgba(2, 136, 209, 0.1)",
                      },
                    }}
                  >
                    {comprobante ? comprobante.name : "Subir Comprobante de Pago"}
                    <input type="file" hidden accept="image/*,application/pdf" onChange={handleFileChange} />
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
            )}

            {/* Paso 4: Confirmación */}
            {activeStep === 3 && (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                  <CheckCircle sx={{ color: "#ef4444" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#ef4444" }}>
                    Confirma tu Inscripción
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        background: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)",
                        border: `1px solid ${isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.2)"}`,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#3b82f6" }}>
                        📚 Información del Estudiante
                      </Typography>
                      <Typography variant="body2">
                        <strong>Nombre:</strong> {formData.nombres} {formData.apellido_paterno}{" "}
                        {formData.apellido_materno}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Fecha de Nacimiento:</strong> {formData.fecha_nacimiento}
                      </Typography>
                      {formData.ci && (
                        <Typography variant="body2">
                          <strong>CI:</strong> {formData.ci}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>

                  <Grid size={12}>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        background: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)",
                        border: `1px solid ${isDark ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 0.2)"}`,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#10b981" }}>
                        👨‍👩‍👦 Información del Tutor
                      </Typography>
                      <Typography variant="body2">
                        <strong>Nombre:</strong> {formData.nombre_tutor}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Teléfono:</strong> {formData.telefono_tutor}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Parentesco:</strong> {formData.parentesco_tutor}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid size={12}>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        background: isDark ? "rgba(245, 158, 11, 0.1)" : "rgba(245, 158, 11, 0.05)",
                        border: `1px solid ${isDark ? "rgba(245, 158, 11, 0.3)" : "rgba(245, 158, 11, 0.2)"}`,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#f59e0b" }}>
                        💳 Información de Pago
                      </Typography>
                      <Typography variant="body2">
                        <strong>Monto:</strong> Bs. {formData.monto_pagado}
                      </Typography>
                      {formData.numero_comprobante && (
                        <Typography variant="body2">
                          <strong>N° Comprobante:</strong> {formData.numero_comprobante}
                        </Typography>
                      )}
                      {comprobante && (
                        <Typography variant="body2">
                          <strong>Comprobante:</strong> {comprobante.name}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Fade>
      </Box>

      {/* Footer - Navigation */}
      <Box
        sx={{
          p: 3,
          pt: 2,
          display: "flex",
          justifyContent: "space-between",
          borderTop: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          disabled={activeStep === 0 || isInscribiendo}
          sx={{
            ...buttonStyle,
            borderColor: isDark ? "rgba(250, 204, 21, 0.5)" : "rgba(2, 136, 209, 0.5)",
            color: isDark ? "#facc15" : "#0288d1",
          }}
        >
          Atrás
        </Button>

        {activeStep < 3 ? (
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={handleNext}
            sx={{
              ...buttonStyle,
              background: isDark
                ? "linear-gradient(135deg, #facc15 0%, #f59e0b 100%)"
                : "linear-gradient(135deg, #0288d1 0%, #01579b 100%)",
              color: isDark ? "#000" : "#fff",
            }}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={isInscribiendo ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
            onClick={handleSubmit}
            disabled={isInscribiendo}
            sx={{
              ...buttonStyle,
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#fff",
            }}
          >
            {isInscribiendo ? "Procesando..." : "Confirmar Inscripción"}
          </Button>
        )}
      </Box>
    </Dialog>
  );
}