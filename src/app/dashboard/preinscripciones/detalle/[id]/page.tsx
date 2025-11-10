"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  Paper,
  Divider,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  AlertTitle,
  TextField,
  Avatar,
  useTheme,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InfoIcon from "@mui/icons-material/Info";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import DownloadIcon from "@mui/icons-material/Download";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from "@mui/icons-material/Edit";
import { useParams, useRouter } from "next/navigation";

const API_URL = 'http://localhost:3000/api/preinscripcion';

type Preinscripcion = {
  preinscripcion_id: number;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  ci?: string;
  fecha_nacimiento?: string;
  genero?: string;
  nacionalidad?: string;
  institucion_procedencia?: string;
  ultimo_grado_cursado?: string;
  grado_solicitado?: string;
  repite_grado?: boolean;
  turno?: string;
  discapacidad?: boolean;
  descripcion_discapacidad?: string;
  direccion?: string;
  numero_casa?: string;
  departamento?: string;
  ciudad?: string;
  telefono_domicilio?: string;
  telefono_movil?: string;
  correo?: string;
  tipo_representante?: string;
  representante_nombres?: string;
  representante_apellido_paterno?: string;
  representante_apellido_materno?: string;
  representante_ci?: string;
  profesion?: string;
  lugar_trabajo?: string;
  telefono?: string;
  representante_correo?: string;
  cedula_estudiante?: string;
  certificado_nacimiento?: string;
  libreta_notas?: string;
  cedula_representante?: string;
  fecha_subida?: string;
  estado?: string;
};

const getGradoLabel = (grado?: string) => {
  const grados: Record<string, string> = {
    'PRIMERO_SEC': '1ro Secundaria',
    'SEGUNDO_SEC': '2do Secundaria',
    'TERCERO_SEC': '3ro Secundaria',
    'CUARTO_SEC': '4to Secundaria',
    'QUINTO_SEC': '5to Secundaria',
    'SEXTO_SEC': '6to Secundaria',
  };
  return grados[grado || ''] || grado || 'No especificado';
};

const pasos = [
  {
    label: "Verificación de Documentos",
    descripcion: "Revisar y validar todos los documentos adjuntados",
    estimado: "1-2 días",
  },
  {
    label: "Verificación de datos personales padre/hijo",
    descripcion: "Confirmar la exactitud de la información proporcionada",
    estimado: "2-3 días",
  },
  {
    label: "Decisión Final",
    descripcion: "Resolución final del proceso de admisión",
    estimado: "1 día",
  },
];

export default function RevisionEvaluacionPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [preinscripcion, setPreinscripcion] = useState<Preinscripcion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [notas, setNotas] = useState("");
  const [notasVerificacionDatos, setNotasVerificacionDatos] = useState("");
  const [notasDecisionFinal, setNotasDecisionFinal] = useState("");
  const [decisionFinal, setDecisionFinal] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<any>(null);
  
  const handleVerDocumento = (documento: any) => {
  if (documento.disponible && documento.archivo) {
    setDocumentoSeleccionado(documento);
    setModalOpen(true);
  } else {
    showSnackbar('Documento no disponible', 'error');
  }
};

const handleCerrarModal = () => {
  setModalOpen(false);
  setDocumentoSeleccionado(null);
};
  useEffect(() => {
    const fetchPreinscripcion = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Error al cargar la preinscripción');
        const data = await response.json();
        setPreinscripcion(data);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        showSnackbar(message, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPreinscripcion();
    }
  }, [id]);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleContinuarDocumentos = () => {
    setActiveStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinuarDatos = () => {
    setActiveStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmarDecision = async () => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: decisionFinal }),
      });
      
      if (!response.ok) throw new Error('Error al actualizar el estado');
      
      showSnackbar('Decisión confirmada y notificación enviada exitosamente', 'success');
      setTimeout(() => router.push('/dashboard/preinscripciones'), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      showSnackbar(message, 'error');
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={80} thickness={4} />
        <Typography variant="h6" color="text.secondary" mt={3}>
          Cargando información de la preinscripción...
        </Typography>
      </Box>
    );
  }

  if (error || !preinscripcion) {
    return (
      <Box p={4}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error || 'No se pudo cargar la información de la preinscripción'}
        </Alert>
      </Box>
    );
  }

  const nombreCompleto = `${preinscripcion.nombres || ''} ${preinscripcion.apellido_paterno || ''} ${preinscripcion.apellido_materno || ''}`.trim();
  const nombreRepresentante = `${preinscripcion.representante_nombres || ''} ${preinscripcion.representante_apellido_paterno || ''} ${preinscripcion.representante_apellido_materno || ''}`.trim();
  const iniciales = `${preinscripcion.nombres?.[0] || ''}${preinscripcion.apellido_paterno?.[0] || ''}`;
  
  const calcularEdad = (fechaNacimiento?: string) => {
    if (!fechaNacimiento) return 'No especificada';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return `${edad} años`;
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-BO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const documentos = [
    {
      id: 1,
      nombre: "Cédula de Identidad del Estudiante",
      archivo: preinscripcion.cedula_estudiante || "No adjuntado",
      disponible: !!preinscripcion.cedula_estudiante,
      icon: "📄",
    },
    {
      id: 2,
      nombre: "Certificado de Nacimiento",
      archivo: preinscripcion.certificado_nacimiento || "No adjuntado",
      disponible: !!preinscripcion.certificado_nacimiento,
      icon: "📜",
    },
    {
      id: 3,
      nombre: "Libreta de Notas",
      archivo: preinscripcion.libreta_notas || "No adjuntado",
      disponible: !!preinscripcion.libreta_notas,
      icon: "📚",
    },
    {
      id: 4,
      nombre: "Cédula del Representante",
      archivo: preinscripcion.cedula_representante || "No adjuntado",
      disponible: !!preinscripcion.cedula_representante,
      icon: "🪪",
    },
  ];

  const criteriosVerificacion = [
    { criterio: "Documentos legibles y de buena calidad", cumple: true },
    { criterio: "Información consistente entre documentos", cumple: true },
    { criterio: "Fechas de vigencia actualizadas", cumple: true },
    { criterio: "Firmas y sellos oficiales presentes", cumple: true },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Alert de Éxito */}
      <Alert
        icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
        severity="success"
        sx={{
          borderRadius: 4,
          mb: 4,
          border: "2px solid #10b981",
          boxShadow: "0 8px 24px rgba(16, 185, 129, 0.2)",
        }}
      >
        <AlertTitle sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
          ¡Revisión Iniciada Exitosamente!
        </AlertTitle>
        <Typography variant="body2">
          El proceso de evaluación de {nombreCompleto} ha comenzado. Se han enviado las notificaciones correspondientes.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Panel Izquierdo - Progreso */}
        <Grid size={{xs:12, lg:4}} >
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              position: 'sticky',
              top: 20,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Progreso de la Evaluación
              </Typography>

              <Stepper activeStep={activeStep} orientation="vertical">
                {pasos.map((paso, index) => (
                  <Step key={paso.label} expanded>
                    <StepLabel
                      StepIconComponent={() => (
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: index <= activeStep ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" : "#e2e8f0",
                            color: index <= activeStep ? "#fff" : "#64748b",
                            fontWeight: 700,
                            fontSize: "1rem",
                            border: index === activeStep ? "3px solid #3b82f6" : "2px solid #cbd5e1",
                            boxShadow: index === activeStep ? "0 0 0 4px #3b82f620" : "none",
                          }}
                        >
                          {index + 1}
                        </Box>
                      )}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: index === activeStep ? 700 : 600,
                            color: index === activeStep ? "#3b82f6" : isDark ? "#e0e0e0" : "#111827",
                          }}
                        >
                          {paso.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {paso.descripcion}
                        </Typography>
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ mt: 1, mb: 2 }}>
                        <Chip
                          icon={index === activeStep ? <ScheduleIcon /> : <PendingIcon />}
                          label={index === activeStep ? "En progreso" : "Pendiente"}
                          size="small"
                          sx={{
                            mr: 1,
                            background: index === activeStep ? "#3b82f615" : "#f1f5f9",
                            color: index === activeStep ? "#3b82f6" : "#64748b",
                            fontWeight: 600,
                          }}
                        />
                        <Chip
                          label={`Estimado: ${paso.estimado}`}
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: "#e2e8f0" }}
                        />
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              <Divider sx={{ my: 3 }} />

              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: "#f1f5f915",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <InfoIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Información del Proceso
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6" }} />
                    <Typography variant="body2" color="text.secondary">
                      Cada paso debe completarse antes de continuar
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                    <Typography variant="body2" color="text.secondary">
                      Puedes pausar el proceso en cualquier momento
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
                    <Typography variant="body2" color="text.secondary">
                      Los padres recibirán actualizaciones automáticas
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel Derecho - Contenido Dinámico */}
        <Grid size={{xs:12, lg:8}}>
          {/* PASO 1: Verificación de Documentos */}
          {activeStep === 0 && (
            <>
              <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 3,
                          background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                        }}
                      >
                        <DescriptionIcon sx={{ color: "#fff", fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                          Verificación de Documentos
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Revisar y validar todos los documentos adjuntados
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      icon={<AccessTimeIcon />}
                      label={`Subido: ${formatearFecha(preinscripcion.fecha_subida)}`}
                      sx={{
                        background: "#10b98115",
                        color: "#10b981",
                        fontWeight: 600,
                        border: "1px solid #10b98130",
                      }}
                    />
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={33}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#e2e8f0",
                      "& .MuiLinearProgress-bar": {
                        background: "linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)",
                        borderRadius: 4,
                      },
                    }}
                  />
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Lista de Documentos a Verificar:
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {documentos.map((doc) => (
                      <Paper
                        key={doc.id}
                        elevation={0}
                        sx={(theme) => ({
                          p: 3,
                          borderRadius: 3,
                          backgroundColor: doc.disponible
                            ? theme.palette.mode === "dark"
                              ? theme.palette.background.paper
                              : theme.palette.grey[50]
                            : theme.palette.mode === "dark"
                            ? theme.palette.error.dark + "15"
                            : theme.palette.error.light + "20",
                          border: `2px solid ${doc.disponible ? theme.palette.divider : theme.palette.error.main + '40'}`,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: doc.disponible ? "translateX(8px)" : "none",
                            boxShadow: doc.disponible
                              ? theme.palette.mode === "dark"
                                ? "0 8px 20px rgba(0,0,0,0.5)"
                                : "0 8px 20px rgba(0,0,0,0.1)"
                              : "none",
                          },
                        })}
                      >
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box display="flex" alignItems="center" gap={2} flex={1}>
                            <Box
                              sx={(theme) => ({
                                width: 48,
                                height: 48,
                                borderRadius: 2,
                                backgroundColor: doc.disponible
                                  ? theme.palette.mode === "dark"
                                    ? theme.palette.success.main + "25"
                                    : theme.palette.success.light + "30"
                                  : theme.palette.mode === "dark"
                                  ? theme.palette.error.main + "25"
                                  : theme.palette.error.light + "30",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.5rem",
                              })}
                            >
                              {doc.icon}
                            </Box>

                            <Box flex={1}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                                {doc.nombre}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {doc.archivo}
                              </Typography>
                            </Box>
                          </Box>

                          <Box display="flex" alignItems="center" gap={1}>
                            {doc.disponible ? (
                              <>
                                <IconButton
                                  onClick={() => handleVerDocumento(doc)}
                                  sx={(theme) => ({
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    color: theme.palette.text.primary,
                                    "&:hover": {
                                      backgroundColor: theme.palette.mode === "dark"
                                        ? theme.palette.info.main + "20"
                                        : theme.palette.info.light + "30",
                                      borderColor: theme.palette.info.main,
                                      color: theme.palette.info.main,
                                    },
                                  })}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                                <IconButton
                                  sx={(theme) => ({
                                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                    color: "#fff",
                                    "&:hover": {
                                      background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                                    },
                                  })}
                                >
                                  <CheckCircleIcon />
                                </IconButton>

                                <IconButton
                                  sx={(theme) => ({
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    color: theme.palette.text.primary,
                                    "&:hover": {
                                      backgroundColor: theme.palette.mode === "dark"
                                        ? theme.palette.error.main + "20"
                                        : theme.palette.error.light + "30",
                                      borderColor: theme.palette.error.main,
                                      color: theme.palette.error.main,
                                    },
                                  })}
                                >
                                  <CloseIcon />
                                </IconButton>
                              </>
                            ) : (
                              <Chip
                                label="Faltante"
                                size="small"
                                color="error"
                                sx={{ fontWeight: 600 }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Criterios de Verificación:
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {criteriosVerificacion.map((criterio, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 2,
                          borderRadius: 2,
                          background: "#10b98110",
                          border: "1px solid #10b98130",
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                          {criterio.criterio}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              <Card
                sx={(theme) => ({
                  borderRadius: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.palette.mode === "dark"
                    ? "0 8px 24px rgba(0,0,0,0.5)"
                    : "0 8px 24px rgba(0,0,0,0.08)",
                  mb: 3,
                  backgroundColor: theme.palette.background.paper,
                })}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Notas de Verificación:
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Agrega observaciones o comentarios sobre la verificación de documentos..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    sx={(theme) => ({
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        backgroundColor: theme.palette.mode === "dark"
                          ? theme.palette.background.default
                          : theme.palette.grey[50],
                        "& fieldset": {
                          borderColor: theme.palette.divider,
                        },
                        "&:hover fieldset": {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    })}
                  />

                  <Divider sx={{ my: 3 }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        sx={(theme) => ({
                          borderColor: theme.palette.divider,
                          color: theme.palette.text.primary,
                          "&:hover": {
                            borderColor: theme.palette.info.main,
                            backgroundColor: theme.palette.mode === "dark"
                              ? theme.palette.info.main + "25"
                              : theme.palette.info.light + "30",
                            color: theme.palette.info.main,
                          },
                        })}
                      >
                        Descargar Todo
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        sx={(theme) => ({
                          borderColor: theme.palette.divider,
                          color: theme.palette.text.primary,
                          "&:hover": {
                            borderColor: theme.palette.warning.main,
                            backgroundColor: theme.palette.mode === "dark"
                              ? theme.palette.warning.main + "25"
                              : theme.palette.warning.light + "30",
                            color: theme.palette.warning.main,
                          },
                        })}
                      >
                        Solicitar Corrección
                      </Button>
                    </Box>

                    <Box display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        sx={(theme) => ({
                          borderColor: theme.palette.error.main,
                          color: theme.palette.error.main,
                          "&:hover": {
                            backgroundColor: theme.palette.mode === "dark"
                              ? theme.palette.error.main + "25"
                              : theme.palette.error.light + "30",
                            borderColor: theme.palette.error.dark,
                            color: theme.palette.error.dark,
                          },
                        })}
                      >
                        Rechazar
                      </Button>

                      <Button
                        variant="contained"
                        startIcon={<TaskAltIcon />}
                        onClick={handleContinuarDocumentos}
                        sx={(theme) => ({
                          background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                          color: "#fff",
                          boxShadow: theme.palette.mode === "dark"
                            ? "0 4px 12px rgba(0,0,0,0.6)"
                            : "0 4px 15px rgba(16, 185, 129, 0.3)",
                          "&:hover": {
                            background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                            boxShadow: theme.palette.mode === "dark"
                              ? "0 6px 20px rgba(0,0,0,0.7)"
                              : "0 6px 20px rgba(16, 185, 129, 0.4)",
                          },
                        })}
                      >
                        Aprobar y Continuar
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </>
          )}

          {/* PASO 2: Verificación de Datos Personales */}
          {activeStep === 1 && (
            <>
              <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2} flexWrap="wrap" gap={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 3,
                          background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
                        }}
                      >
                        <PersonIcon sx={{ color: "#fff", fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                          Verificación de Datos Personales
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Confirmar la exactitud de la información del padre e hijo
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      icon={<AccessTimeIcon />}
                      label="En progreso"
                      sx={{
                        background: "#8b5cf615",
                        color: "#8b5cf6",
                        fontWeight: 600,
                        border: "1px solid #8b5cf630",
                      }}
                    />
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={66}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#e2e8f0",
                      "& .MuiLinearProgress-bar": {
                        background: "linear-gradient(90deg, #8b5cf6 0%, #6d28d9 100%)",
                        borderRadius: 4,
                      },
                    }}
                  />
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Datos del Estudiante
                  </Typography>

                  <Grid container spacing={3}>
                    {[
                      { label: "Nombre Completo", value: nombreCompleto },
                      { label: "Cédula de Identidad", value: preinscripcion.ci || 'No especificada' },
                      { label: "Fecha de Nacimiento", value: formatearFecha(preinscripcion.fecha_nacimiento) },
                      { label: "Edad", value: calcularEdad(preinscripcion.fecha_nacimiento) },
                      { label: "Género", value: preinscripcion.genero || 'No especificado' },
                      { label: "Nacionalidad", value: preinscripcion.nacionalidad || 'No especificada' },
                      { label: "Institución de Procedencia", value: preinscripcion.institucion_procedencia || 'No especificada' },
                      { label: "Último Grado Cursado", value: preinscripcion.ultimo_grado_cursado || 'No especificado' },
                      { label: "Grado Solicitado", value: getGradoLabel(preinscripcion.grado_solicitado) },
                      { label: "Turno", value: preinscripcion.turno || 'No especificado' },
                      { label: "Teléfono Domicilio", value: preinscripcion.telefono_domicilio || 'No especificado' },
                      { label: "Teléfono Móvil", value: preinscripcion.telefono_movil || 'No especificado' },
                    ].map((item, idx) => (
                      <Grid size={{xs:12, sm:6}}  key={idx}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: "#f1f5f915",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {item.label}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}

                    <Grid size={{xs:12}} >
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: "#f1f5f915",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Dirección Completa
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                          {preinscripcion.direccion || 'No especificada'}, 
                          {preinscripcion.numero_casa ? ` #${preinscripcion.numero_casa}, ` : ' '}
                          {preinscripcion.ciudad || ''}, {preinscripcion.departamento || ''}
                        </Typography>
                      </Box>
                    </Grid>

                    {preinscripcion.correo && (
                      <Grid size={{xs:12}} >
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: "#f1f5f915",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Correo Electrónico
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                            {preinscripcion.correo}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {preinscripcion.discapacidad && (
                      <Grid size={{xs:12}} >
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: "#f59e0b15",
                            border: "1px solid #f59e0b30",
                          }}
                        >
                          <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
                            Discapacidad
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                            {preinscripcion.descripcion_discapacidad || 'Sin descripción'}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Datos del {preinscripcion.tipo_representante || 'Representante'}
                  </Typography>

                  <Grid container spacing={3}>
                    {[
                      { label: "Nombre Completo", value: nombreRepresentante },
                      { label: "Cédula de Identidad", value: preinscripcion.representante_ci || 'No especificada' },
                      { label: "Teléfono", value: preinscripcion.telefono || 'No especificado' },
                      { label: "Email", value: preinscripcion.representante_correo || 'No especificado' },
                      { label: "Profesión", value: preinscripcion.profesion || 'No especificada' },
                      { label: "Lugar de Trabajo", value: preinscripcion.lugar_trabajo || 'No especificado' },
                    ].map((item, idx) => (
                      <Grid size={{xs:12, sm:6}} key={idx}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: "#f1f5f915",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {item.label}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Verificación de Consistencia
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {[
                      "Datos coinciden con documentos adjuntos",
                      "Información de contacto verificada",
                      "Relación representante-estudiante confirmada",
                      "Dirección validada",
                    ].map((criterio, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 2,
                          borderRadius: 2,
                          background: "#10b98110",
                          border: "1px solid #10b98130",
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                          {criterio}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Notas de Verificación:
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Agrega observaciones sobre la verificación de datos personales..."
                    value={notasVerificacionDatos}
                    onChange={(e) => setNotasVerificacionDatos(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        background: "#f1f5f915",
                      },
                    }}
                  />

                  <Divider sx={{ my: 3 }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Button
                      variant="outlined"
                      onClick={() => setActiveStep(0)}
                      sx={{
                        borderColor: "#e2e8f0",
                        "&:hover": {
                          borderColor: "#8b5cf6",
                          background: "#8b5cf615",
                        },
                      }}
                    >
                      Volver
                    </Button>

                    <Box display="flex" gap={2} flexWrap="wrap">
                      <Button
                        variant="outlined"
                        sx={{
                          borderColor: "#ef4444",
                          color: "#ef4444",
                          "&:hover": {
                            background: "#ef444415",
                            borderColor: "#dc2626",
                          },
                        }}
                      >
                        Rechazar
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<TaskAltIcon />}
                        onClick={handleContinuarDatos}
                        sx={{
                          background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                          boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 20px rgba(139, 92, 246, 0.4)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        Aprobar y Continuar
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </>
          )}

          {/* PASO 3: Decisión Final */}
          {activeStep === 2 && (
            <>
              <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2} flexWrap="wrap" gap={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 3,
                          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)",
                        }}
                      >
                        <TaskAltIcon sx={{ color: "#fff", fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                          Decisión Final
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Resolución final del proceso de admisión
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      icon={<AccessTimeIcon />}
                      label="Última etapa"
                      sx={{
                        background: "#f59e0b15",
                        color: "#f59e0b",
                        fontWeight: 600,
                        border: "1px solid #f59e0b30",
                      }}
                    />
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#e2e8f0",
                      "& .MuiLinearProgress-bar": {
                        background: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)",
                        borderRadius: 4,
                      },
                    }}
                  />
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Resumen de Evaluación
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{xs:12, md:4}} >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: "#10b98110",
                          border: "2px solid #10b98130",
                          textAlign: "center",
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 40, color: "#10b981", mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#10b981" }}>
                          Documentos
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Verificados
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid size={{xs:12, md:4}} >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: "#10b98110",
                          border: "2px solid #10b98130",
                          textAlign: "center",
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 40, color: "#10b981", mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#10b981" }}>
                          Datos Personales
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Confirmados
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid size={{xs:12, md:4}} >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: "#f1f5f915",
                          border: "2px solid #e2e8f0",
                          textAlign: "center",
                        }}
                      >
                        <PendingIcon sx={{ fontSize: 40, color: "#f59e0b", mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#f59e0b" }}>
                          Decisión Final
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pendiente
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Información del Estudiante
                  </Typography>

                  <Box display="flex" alignItems="center" gap={3} mb={3} flexWrap="wrap">
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                        fontSize: "2rem",
                        fontWeight: 700,
                      }}
                    >
                      {iniciales}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {nombreCompleto}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Solicitante de admisión • {calcularEdad(preinscripcion.fecha_nacimiento)}
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{xs:12, sm:6}}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: "#f1f5f915",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Curso Anterior
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {preinscripcion.ultimo_grado_cursado || 'No especificado'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{xs:12, sm:6}}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: "#f1f5f915",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Curso Solicitado
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {getGradoLabel(preinscripcion.grado_solicitado)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Decisión de Admisión
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                    {[
                      {
                        key: "aprobado",
                        color: "#10b981",
                        gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        title: "Aceptar Estudiante",
                        desc: "Aprobar la admisión del estudiante al curso solicitado",
                        icon: <CheckCircleIcon sx={{ fontSize: 28 }} />,
                      },
                      {
                        key: "rechazado",
                        color: "#ef4444",
                        gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        title: "Rechazar Estudiante",
                        desc: "Denegar la admisión del estudiante",
                        icon: <CloseIcon sx={{ fontSize: 28 }} />,
                      },
                      {
                        key: "documentos_incompletos",
                        color: "#f59e0b",
                        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                        title: "Solicitar Información Adicional",
                        desc: "Requerir documentos o datos adicionales antes de decidir",
                        icon: <PendingIcon sx={{ fontSize: 28 }} />,
                      },
                    ].map(({ key, color, gradient, title, desc, icon }) => (
                      <Paper
                        key={key}
                        elevation={0}
                        onClick={() => setDecisionFinal(key)}
                        sx={(theme) => {
                          const isSelected = decisionFinal === key;
                          const bgDefault = theme.palette.mode === "dark"
                            ? theme.palette.background.paper
                            : theme.palette.grey[50];

                          return {
                            p: 3,
                            borderRadius: 3,
                            backgroundColor: isSelected ? `${color}20` : bgDefault,
                            border: `2px solid ${isSelected ? color : theme.palette.divider}`,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateX(8px)",
                              borderColor: color,
                            },
                          };
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              background: gradient,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                            }}
                          >
                            {icon}
                          </Box>
                          <Box flex={1}>
                            <Typography
                              variant="h6"
                              sx={(theme) => ({
                                fontWeight: 700,
                                color,
                                [theme.breakpoints.down("sm")]: { fontSize: "1rem" },
                              })}
                            >
                              {title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {desc}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Justificación de la decisión o comentarios adicionales..."
                    value={notasDecisionFinal}
                    onChange={(e) => setNotasDecisionFinal(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        background: "#f1f5f915",
                      },
                    }}
                  />
                </CardContent>
              </Card>

              <Card
                sx={(theme) => ({
                  borderRadius: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.palette.mode === "dark"
                    ? "0 8px 24px rgba(0,0,0,0.5)"
                    : "0 8px 24px rgba(0,0,0,0.08)",
                  mb: 3,
                  backgroundColor: theme.palette.background.paper,
                })}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <NotificationsActiveIcon
                      sx={(theme) => ({
                        color: theme.palette.info.main,
                        fontSize: 24,
                      })}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Notificaciones Automáticas
                    </Typography>
                  </Box>

                  <Alert
                    severity="info"
                    sx={(theme) => ({
                      borderRadius: 2,
                      backgroundColor: theme.palette.mode === "dark"
                        ? theme.palette.info.dark + "20"
                        : theme.palette.info.light + "40",
                      border: `1px solid ${theme.palette.info.main}30`,
                      color: theme.palette.text.primary,
                      "& .MuiAlert-icon": {
                        color: theme.palette.info.main,
                      },
                    })}
                  >
                    <AlertTitle sx={{ fontWeight: 600 }}>
                      Se enviarán las siguientes notificaciones:
                    </AlertTitle>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                      <Typography variant="body2">
                        • Email a {preinscripcion.representante_correo || 'el representante'} con la decisión final
                      </Typography>
                      <Typography variant="body2">
                        • SMS de confirmación al número {preinscripcion.telefono || 'registrado'}
                      </Typography>
                      <Typography variant="body2">
                        • Actualización en el portal del estudiante
                      </Typography>
                      <Typography variant="body2">
                        • Registro en el sistema de admisiones
                      </Typography>
                    </Box>
                  </Alert>
                </CardContent>
              </Card>
              <Card
                sx={(theme) => ({
                  borderRadius: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 8px 24px rgba(0,0,0,0.5)"
                      : "0 8px 24px rgba(0,0,0,0.08)",
                  backgroundColor: theme.palette.background.paper,
                })}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={2}
                  >
                    {/* --- Botón Volver --- */}
                    <Button
                      variant="outlined"
                      onClick={() => setActiveStep(1)}
                      sx={(theme) => ({
                        borderColor: theme.palette.divider,
                        color: theme.palette.text.primary,
                        "&:hover": {
                          borderColor: theme.palette.warning.main,
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? theme.palette.warning.main + "25"
                              : theme.palette.warning.light + "20",
                        },
                      })}
                    >
                      Volver
                    </Button>

                    {/* --- Botones de acción --- */}
                    <Box display="flex" gap={2} flexWrap="wrap">
                      {/* Descargar */}
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        sx={(theme) => ({
                          borderColor: theme.palette.divider,
                          color: theme.palette.text.primary,
                          "&:hover": {
                            borderColor: theme.palette.info.main,
                            backgroundColor:
                              theme.palette.mode === "dark"
                                ? theme.palette.info.main + "25"
                                : theme.palette.info.light + "20",
                          },
                        })}
                      >
                        Descargar Reporte
                      </Button>

                      {/* Confirmar */}
                      <Button
                        variant="contained"
                        startIcon={<SendIcon />}
                        disabled={!decisionFinal}
                        sx={(theme) => {
                          const active = !!decisionFinal;
                          const primaryGradient = active
                            ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                            : theme.palette.action.disabledBackground;

                          return {
                            background: primaryGradient,
                            color: active
                              ? "#fff"
                              : theme.palette.text.disabled,
                            boxShadow: active
                              ? "0 4px 15px rgba(245, 158, 11, 0.3)"
                              : "none",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              background: active
                                ? "linear-gradient(135deg, #d97706 0%, #b45309 100%)"
                                : theme.palette.action.disabledBackground,
                              transform: active ? "translateY(-2px)" : "none",
                              boxShadow: active
                                ? "0 6px 20px rgba(245, 158, 11, 0.4)"
                                : "none",
                            },
                            "&.Mui-disabled": {
                              background: theme.palette.action.disabledBackground,
                              color: theme.palette.text.disabled,
                            },
                          };
                        }}
                      >
                        Confirmar y Enviar Notificación
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

            </>
          )}
        </Grid>
      </Grid>
      {/* Modal de Previsualización */}
      <Dialog
        open={modalOpen}
        onClose={handleCerrarModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: '80vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <DescriptionIcon color="primary" />
          <Box flex={1}>
            <Typography variant="h6" fontWeight={700}>
              {documentoSeleccionado?.nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {documentoSeleccionado?.archivo}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3, height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'grey.100' }}>
    {documentoSeleccionado?.archivo && (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'auto',
          bgcolor: isDark ? 'grey.900' : 'grey.50',
          borderRadius: 2,
        }}
      >
        {documentoSeleccionado.archivo.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
          // Para imágenes
          <img
            src={documentoSeleccionado.archivo}
            alt={documentoSeleccionado.nombre}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        ) : documentoSeleccionado.archivo.match(/\.pdf$/i) ? (
          // Para PDFs
          <iframe
            src={documentoSeleccionado.archivo}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '8px',
            }}
            title="Vista previa del documento"
          />
        ) : (
          // Para otros tipos de archivo
          <Box textAlign="center" p={4}>
            <DescriptionIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Vista previa no disponible
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Este tipo de archivo no se puede previsualizar
            </Typography>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => window.open(documentoSeleccionado?.archivo, '_blank')}
              variant="contained"
            >
              Descargar archivo
            </Button>
          </Box>
        )}
      </Box>
    )}
  </DialogContent>
        
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            startIcon={<DownloadIcon />}
            onClick={() => window.open(documentoSeleccionado?.archivo, '_blank')}
            variant="outlined"
          >
            Descargar
          </Button>
          <Button
            onClick={handleCerrarModal}
            variant="contained"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      ></Snackbar>
    </Box>
  );
}