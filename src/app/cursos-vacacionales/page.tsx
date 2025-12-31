"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  useTheme,
  Skeleton,
  Alert,
  IconButton,
  Zoom,
  Stack,
  Paper,
  alpha,
  Badge,
  Divider,
} from "@mui/material";
import {
  EventAvailable,
  Schedule,
  AttachMoney,
  ChevronLeft,
  ChevronRight,
  School,
  CalendarMonth,
  People,
  Star,
  TrendingUp,
  LocalOffer,
  AccessTime,
  CheckCircle,
  EventSeat,
  Image as ImageIcon,
  Savings,
} from "@mui/icons-material";
import { keyframes } from "@mui/system";
import { useRouter } from "next/navigation";
import { 
  usePeriodoActivo, 
  useCursosPublicos,
  usePaquetesVacacionales 
} from "@/hooks/useCursosVacacionales";
import { CursoVacacional } from "@/types/cursoVacacionalTypes";
import Navbar from "../login/Header";

// Animaciones mejoradas
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const gradientShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(250, 204, 21, 0.3); }
  50% { box-shadow: 0 0 40px rgba(250, 204, 21, 0.6); }
`;

const scaleIn = keyframes`
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

export default function CursosVacacionalesPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const router = useRouter();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Hooks
  const { periodo, isLoading: loadingPeriodo, hayPeriodoActivo } = usePeriodoActivo();
  const { paquetes, isLoading: loadingPaquetes } = usePaquetesVacacionales();
  
  const filtrosCursos = useMemo(() => {
    if (!periodo?.id) return null;
    return {
      periodo_vacacional_id: periodo.id,
      activo: true,
      con_cupos: true,
    };
  }, [periodo?.id]);

  const { cursos, isLoading: loadingCursos } = useCursosPublicos(
    filtrosCursos || {},
    { enabled: !!filtrosCursos }
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInscribirse = (curso: CursoVacacional) => {
    router.push(`/cursos-vacacionales/inscripcion?curso=${curso.id}`);
  };

  const handleSeleccionarPaquete = (paqueteId: number) => {
    router.push(`/cursos-vacacionales/inscripcion?paquete=${paqueteId}`);
  };

  const cursosPerPage = 3;
  const totalSlides = Math.ceil(cursos.length / cursosPerPage);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const cursosSlice = cursos.slice(
    currentSlide * cursosPerPage,
    (currentSlide + 1) * cursosPerPage
  );

  if (!mounted) return null;

  if (loadingPeriodo) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 4, mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid size={{xs:12, md:4}} key={i}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (!hayPeriodoActivo) {
    return (
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Paper
          elevation={0}
          sx={{
            background: isDark
              ? `linear-gradient(135deg, ${alpha("#1e3a8a", 0.2)}, ${alpha("#0891b2", 0.2)})`
              : `linear-gradient(135deg, ${alpha("#eff6ff", 1)}, ${alpha("#e0f2fe", 1)})`,
            borderRadius: 4,
            p: 8,
            textAlign: "center",
            border: `2px dashed ${isDark ? "#3b82f6" : "#0284c7"}`,
          }}
        >
          <CalendarMonth 
            sx={{ 
              fontSize: 100, 
              color: isDark ? "#3b82f6" : "#0284c7",
              mb: 3,
              animation: `${floatAnimation} 3s ease-in-out infinite`,
            }} 
          />
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            No hay inscripciones abiertas
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
            Actualmente no hay un periodo vacacional activo. Vuelve pronto para conocer las próximas fechas de inscripción.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <>
      {/* Hero Section Mejorado */}
      <Navbar />
      <Box
        sx={{
          background: isDark
            ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
            : "linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0891b2 100%)",
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark
              ? "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)"
              : "radial-gradient(circle at 20% 50%, rgba(250, 204, 21, 0.15) 0%, transparent 50%)",
            animation: `${gradientShift} 10s ease infinite`,
            backgroundSize: "200% 200%",
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2 , mt: 18,}}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{xs:12, md:7}}>
              <Chip
                icon={<Star />}
                label={`${periodo?.tipo === "verano" ? "☀️ Verano" : "❄️ Invierno"} ${periodo?.anio || ""}`}
                sx={{
                  mb: 3,
                  background: "linear-gradient(135deg, #facc15 0%, #f59e0b 100%)",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  px: 3,
                  py: 2.5,
                  height: "auto",
                  animation: `${pulseGlow} 2s infinite`,
                  "& .MuiChip-icon": {
                    color: "#000",
                  },
                }}
              />

              <Typography
                variant="h1"
                sx={{
                  fontFamily: "'Poppins', 'Montserrat', sans-serif",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: { xs: "2.5rem", md: "4rem", lg: "4.5rem" },
                  lineHeight: 1.1,
                  mb: 3,
                  textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  animation: `${scaleIn} 0.8s ease-out`,
                }}
              >
                {periodo?.nombre || "Cursos Vacacionales"}
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  color: "rgba(255, 255, 255, 0.95)",
                  mb: 5,
                  lineHeight: 1.7,
                  fontWeight: 400,
                  animation: `${scaleIn} 0.8s ease-out 0.2s both`,
                }}
              >
                {periodo?.descripcion || "Aprovecha las vacaciones para reforzar conocimientos y descubrir nuevas pasiones"}
              </Typography>

              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 4 }}>
                <Paper
                  elevation={4}
                  sx={{
                    px: 3,
                    py: 2,
                    background: alpha("#fff", 0.15),
                    backdropFilter: "blur(10px)",
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <EventAvailable sx={{ color: "#facc15", fontSize: 28 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", display: "block" }}>
                      Periodo
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>
                      {periodo?.fecha_inicio && periodo?.fecha_fin && (
                        <>
                          {new Date(periodo.fecha_inicio).toLocaleDateString()} - {new Date(periodo.fecha_fin).toLocaleDateString()}
                        </>
                      )}
                    </Typography>
                  </Box>
                </Paper>

                <Paper
                  elevation={4}
                  sx={{
                    px: 3,
                    py: 2,
                    background: alpha("#fff", 0.15),
                    backdropFilter: "blur(10px)",
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <School sx={{ color: "#10b981", fontSize: 28 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", display: "block" }}>
                      Cursos
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>
                      {cursos.length} disponibles
                    </Typography>
                  </Box>
                </Paper>
              </Stack>
            </Grid>

            <Grid size={{xs:12, md:5}} sx={{ display: { xs: "none", md: "block" } }}>
              <Box
                sx={{
                  position: "relative",
                  animation: `${floatAnimation} 6s ease-in-out infinite`,
                }}
              >
                <School
                  sx={{
                    fontSize: 400,
                    color: alpha("#fff", 0.1),
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Sección de Paquetes Promocionales */}
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Chip
            icon={<LocalOffer />}
            label="OFERTAS ESPECIALES"
            sx={{
              mb: 2,
              background: "linear-gradient(135deg, #facc15, #f59e0b)",
              color: "#000",
              fontWeight: 700,
              fontSize: "1rem",
              px: 2,
              py: 2,
              height: "auto",
            }}
          />
          <Typography 
            variant="h2" 
            sx={{ 
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800, 
              mb: 2,
              color: isDark ? "#fff" : "#0f172a",
            }}
          >
            Paquetes Promocionales
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: "auto" }}>
            Ahorra inscribiéndote en múltiples cursos con nuestros paquetes especiales
          </Typography>
        </Box>

        {loadingPaquetes ? (
          <Grid container spacing={4} justifyContent="center">
            {[1, 2, 3].map((i) => (
              <Grid size={{xs:12, sm:6, md:4}} key={i}>
                <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 4 }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {paquetes.map((paquete) => {
              const esMasPopular = paquete.cantidad_cursos === 3;
              const precioIndividual = (paquete.precio / paquete.cantidad_cursos).toFixed(2);
              
              return (
                <Grid size={{xs:12, sm:6, md:4}} key={paquete.id}>
                  <Zoom in timeout={300}>
                    <Card
                      sx={{
                        height: "100%",
                        position: "relative",
                        overflow: "visible",
                        borderRadius: 4,
                        border: esMasPopular
                          ? "3px solid #facc15"
                          : `2px solid ${isDark ? alpha("#fff", 0.1) : alpha("#000", 0.08)}`,
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        background: isDark
                          ? alpha("#1e293b", 0.6)
                          : "#fff",
                        "&:hover": {
                          transform: "translateY(-12px) scale(1.02)",
                          boxShadow: esMasPopular
                            ? "0 20px 50px rgba(250, 204, 21, 0.4)"
                            : isDark
                            ? "0 20px 40px rgba(59, 130, 246, 0.3)"
                            : "0 20px 40px rgba(0, 0, 0, 0.15)",
                        },
                      }}
                    >
                      {esMasPopular && (
                        <Chip
                          icon={<Star />}
                          label="MÁS POPULAR"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: -12,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "linear-gradient(135deg, #facc15, #f59e0b)",
                            color: "#000",
                            fontWeight: 700,
                            zIndex: 2,
                            boxShadow: "0 4px 12px rgba(250, 204, 21, 0.5)",
                            fontSize: "0.85rem",
                            px: 2,
                            py: 2,
                            height: "auto",
                          }}
                        />
                      )}

                      <Box
                        sx={{
                          background: esMasPopular
                            ? "linear-gradient(135deg, #facc15, #f59e0b)"
                            : isDark
                            ? "linear-gradient(135deg, #1e3a8a, #3b82f6)"
                            : "linear-gradient(135deg, #0369a1, #0891b2)",
                          p: 4,
                          textAlign: "center",
                          position: "relative",
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background: esMasPopular
                              ? "linear-gradient(90deg, #facc15, #f59e0b, #facc15)"
                              : "linear-gradient(90deg, #3b82f6, #2563eb, #3b82f6)",
                            backgroundSize: "200% 100%",
                            animation: `${shimmer} 3s linear infinite`,
                          },
                        }}
                      >
                        <Savings 
                          sx={{ 
                            fontSize: 60, 
                            color: esMasPopular ? "#000" : "#fff",
                            mb: 1,
                          }} 
                        />
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 800, 
                            color: esMasPopular ? "#000" : "#fff",
                          }}
                        >
                          {paquete.nombre}
                        </Typography>
                      </Box>

                      <CardContent sx={{ p: 4, textAlign: "center" }}>
                        <Stack 
                          direction="row" 
                          alignItems="baseline" 
                          justifyContent="center"
                          spacing={1}
                          sx={{ mb: 3 }}
                        >
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: "text.secondary",
                              textDecoration: "line-through",
                            }}
                          >
                            Bs. {(250 * paquete.cantidad_cursos).toFixed(2)}
                          </Typography>
                          <Typography 
                            variant="h2" 
                            sx={{ 
                              fontWeight: 900,
                              background: "linear-gradient(135deg, #facc15, #f59e0b)",
                              backgroundClip: "text",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            Bs. {paquete.precio}
                          </Typography>
                        </Stack>

                        <Paper
                          elevation={0}
                          sx={{
                            background: isDark
                              ? alpha("#10b981", 0.15)
                              : alpha("#10b981", 0.1),
                            borderRadius: 2,
                            p: 2,
                            mb: 3,
                          }}
                        >
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: "#10b981",
                              fontWeight: 700,
                            }}
                          >
                            Ahorro: Bs. {((250 * paquete.cantidad_cursos) - paquete.precio).toFixed(2)}
                          </Typography>
                        </Paper>

                        <Divider sx={{ my: 3 }} />

                        <Stack spacing={2.5}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <CheckCircle sx={{ color: "#10b981", fontSize: 24 }} />
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {paquete.cantidad_cursos} {paquete.cantidad_cursos === 1 ? "curso completo" : "cursos completos"}
                            </Typography>
                          </Stack>

                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <CheckCircle sx={{ color: "#10b981", fontSize: 24 }} />
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              Bs. {precioIndividual} por curso
                            </Typography>
                          </Stack>

                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <CheckCircle sx={{ color: "#10b981", fontSize: 24 }} />
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              Un solo pago
                            </Typography>
                          </Stack>

                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <CheckCircle sx={{ color: "#10b981", fontSize: 24 }} />
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              Matrícula incluida
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardContent>

                      <Box sx={{ p: 4, pt: 0 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          onClick={() => handleSeleccionarPaquete(paquete.id)}
                          sx={{
                            background: esMasPopular
                              ? "linear-gradient(135deg, #facc15, #f59e0b)"
                              : isDark
                              ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                              : "linear-gradient(135deg, #0369a1, #0891b2)",
                            color: esMasPopular ? "#000" : "#fff",
                            fontWeight: 700,
                            py: 1.8,
                            fontSize: "1.1rem",
                            borderRadius: 3,
                            textTransform: "none",
                            "&:hover": {
                              background: esMasPopular
                                ? "linear-gradient(135deg, #f59e0b, #facc15)"
                                : isDark
                                ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                                : "linear-gradient(135deg, #0284c7, #0369a1)",
                              transform: "scale(1.02)",
                              boxShadow: esMasPopular
                                ? "0 8px 24px rgba(250, 204, 21, 0.5)"
                                : "0 8px 24px rgba(59, 130, 246, 0.4)",
                            },
                            transition: "all 0.3s",
                          }}
                        >
                          Seleccionar Paquete
                        </Button>
                      </Box>
                    </Card>
                  </Zoom>
                </Grid>
              );
            })}
          </Grid>
        )}

        <Alert 
          severity="info" 
          icon={<LocalOffer />}
          sx={{ 
            mt: 6, 
            borderRadius: 3, 
            fontSize: "1rem",
            py: 2,
            "& .MuiAlert-message": {
              width: "100%",
            },
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
            ¿Cómo funcionan los paquetes?
          </Typography>
          <Typography variant="body2">
            Selecciona un paquete, elige los cursos que deseas (según la cantidad del paquete), 
            completa tus datos y realiza un solo pago. ¡Es así de simple!
          </Typography>
        </Alert>
      </Container>

      {/* Cursos Individuales Section */}
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Chip
            icon={<TrendingUp />}
            label="CURSOS INDIVIDUALES"
            sx={{
              mb: 2,
              background: isDark
                ? alpha("#3b82f6", 0.2)
                : alpha("#3b82f6", 0.1),
              color: "#3b82f6",
              fontWeight: 700,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              color: isDark ? "#fff" : "#0f172a",
              mb: 2,
            }}
          >
            Descubre Nuestros Cursos
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ maxWidth: 700, mx: "auto", fontWeight: 400 }}
          >
            También puedes inscribirte en cursos individuales al precio regular
          </Typography>
        </Box>

        {loadingCursos ? (
          <Grid container spacing={4}>
            {[1, 2, 3].map((i) => (
              <Grid size={{xs:12, sm:6, md:4}} key={i}>
                <Skeleton variant="rectangular" height={450} sx={{ borderRadius: 4 }} />
              </Grid>
            ))}
          </Grid>
        ) : cursos.length === 0 ? (
          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: 3,
              fontSize: "1.1rem",
              py: 3,
            }}
          >
            No hay cursos disponibles en este momento. Por favor, vuelve más tarde.
          </Alert>
        ) : (
          <Box sx={{ position: "relative" }}>
            {cursos.length > cursosPerPage && (
              <>
                <IconButton
                  onClick={handlePrevSlide}
                  sx={{
                    position: "absolute",
                    left: { xs: -10, md: -30 },
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: isDark
                      ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                      : "linear-gradient(135deg, #0369a1, #0284c7)",
                    color: "#fff",
                    zIndex: 10,
                    width: 56,
                    height: 56,
                    "&:hover": {
                      background: isDark
                        ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                        : "linear-gradient(135deg, #0284c7, #0369a1)",
                      transform: "translateY(-50%) scale(1.1)",
                    },
                    transition: "all 0.3s",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  }}
                >
                  <ChevronLeft sx={{ fontSize: 32 }} />
                </IconButton>

                <IconButton
                  onClick={handleNextSlide}
                  sx={{
                    position: "absolute",
                    right: { xs: -10, md: -30 },
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: isDark
                      ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                      : "linear-gradient(135deg, #0369a1, #0284c7)",
                    color: "#fff",
                    zIndex: 10,
                    width: 56,
                    height: 56,
                    "&:hover": {
                      background: isDark
                        ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                        : "linear-gradient(135deg, #0284c7, #0369a1)",
                      transform: "translateY(-50%) scale(1.1)",
                    },
                    transition: "all 0.3s",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  }}
                >
                  <ChevronRight sx={{ fontSize: 32 }} />
                </IconButton>
              </>
            )}

            <Grid container spacing={4}>
              {cursosSlice.map((curso, index) => {
                const ocupacion = ((curso.cupos_totales - curso.cupos_disponibles) / curso.cupos_totales) * 100;
                const esPopular = ocupacion > 70;

                return (
                  <Grid size={{xs:12, sm:6, md:4}} key={curso.id}>
                    <Zoom in timeout={(index + 1) * 200}>
                      <Card
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          borderRadius: 4,
                          overflow: "hidden",
                          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          border: `2px solid ${isDark ? alpha("#fff", 0.1) : alpha("#000", 0.05)}`,
                          position: "relative",
                          "&:hover": {
                            transform: "translateY(-12px)",
                            boxShadow: isDark
                              ? "0 20px 40px rgba(59, 130, 246, 0.3)"
                              : "0 20px 40px rgba(0, 0, 0, 0.15)",
                            "& .curso-image": {
                              transform: "scale(1.1)",
                            },
                          },
                        }}
                      >
                        {esPopular && (
                          <Chip
                            icon={<Star />}
                            label="Popular"
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 16,
                              right: 16,
                              zIndex: 2,
                              background: "linear-gradient(135deg, #facc15, #f59e0b)",
                              color: "#000",
                              fontWeight: 700,
                              boxShadow: "0 4px 12px rgba(250, 204, 21, 0.4)",
                            }}
                          />
                        )}

                        <Box
                          sx={{
                            position: "relative",
                            height: 240,
                            overflow: "hidden",
                            background: curso.foto_url
                              ? "transparent"
                              : `linear-gradient(135deg, ${isDark ? "#1e3a8a" : "#0369a1"}, ${isDark ? "#3b82f6" : "#0284c7"})`,
                          }}
                        >
                          {curso.foto_url ? (
                            <CardMedia
                              component="img"
                              image={curso.foto_url}
                              alt={curso.nombre}
                              className="curso-image"
                              sx={{
                                height: "100%",
                                objectFit: "cover",
                                transition: "transform 0.4s",
                                }}
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
                                <School sx={{ fontSize: 100, color: alpha("#fff", 0.3) }} />
                                </Box>
                                )}
                                {/* Overlay con info rápida */}
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                          p: 2,
                        }}
                      >
                        <Chip
                          icon={<EventSeat />}
                          label={`${curso.cupos_disponibles} cupos`}
                          size="small"
                          sx={{
                            background: curso.cupos_disponibles > 10 
                              ? alpha("#10b981", 0.9)
                              : curso.cupos_disponibles > 5
                              ? alpha("#f59e0b", 0.9)
                              : alpha("#ef4444", 0.9),
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700,
                          mb: 2,
                          color: isDark ? "#fff" : "#0f172a",
                        }}
                      >
                        {curso.nombre}
                      </Typography>

                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 3,
                          lineHeight: 1.7,
                          minHeight: 48,
                        }}
                      >
                        {curso.descripcion}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Stack spacing={1.5}>
                        {curso.dias_semana && (
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <CalendarMonth sx={{ color: "#3b82f6", fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {curso.dias_semana}
                            </Typography>
                          </Stack>
                        )}
                        
                        {curso.hora_inicio && (
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <AccessTime sx={{ color: "#10b981", fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {curso.hora_inicio} - {curso.hora_fin}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>

                    <Box sx={{ p: 3, pt: 0 }}>
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Precio individual
                            </Typography>
                            <Typography 
                              variant="h4" 
                              sx={{ 
                                fontWeight: 800,
                                background: "linear-gradient(135deg, #facc15, #f59e0b)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                              }}
                            >
                              Bs. {curso.costo}
                            </Typography>
                          </Box>

                          <Button
                            variant="contained"
                            size="large"
                            onClick={() => handleInscribirse(curso)}
                            disabled={curso.cupos_disponibles === 0}
                            sx={{
                              background: curso.cupos_disponibles === 0
                                ? "grey"
                                : isDark
                                ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                                : "linear-gradient(135deg, #0369a1, #0284c7)",
                              color: "#fff",
                              fontWeight: 700,
                              px: 4,
                              py: 1.5,
                              borderRadius: 3,
                              textTransform: "none",
                              fontSize: "1rem",
                              "&:hover": {
                                background: curso.cupos_disponibles === 0
                                  ? "grey"
                                  : isDark
                                  ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                                  : "linear-gradient(135deg, #0284c7, #0369a1)",
                                transform: "translateY(-2px)",
                                boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
                              },
                              transition: "all 0.3s",
                            }}
                          >
                            {curso.cupos_disponibles === 0 ? "Agotado" : "Inscribirme"}
                          </Button>
                        </Box>

                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.5,
                          }}
                        >
                          <Savings sx={{ fontSize: 16 }} />
                          O inscríbete en un paquete y ahorra
                        </Typography>
                      </Stack>
                    </Box>
                  </Card>
                </Zoom>
              </Grid>
            );
          })}
        </Grid>

        {/* Indicadores de página */}
        {cursos.length > cursosPerPage && (
          <Stack 
            direction="row" 
            spacing={1} 
            justifyContent="center" 
            sx={{ mt: 6 }}
          >
            {Array.from({ length: totalSlides }).map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentSlide(index)}
                sx={{
                  width: currentSlide === index ? 32 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: currentSlide === index
                    ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                    : alpha("#000", 0.2),
                  cursor: "pointer",
                  transition: "all 0.3s",
                  "&:hover": {
                    background: currentSlide === index
                      ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                      : alpha("#000", 0.4),
                  },
                }}
              />
            ))}
          </Stack>
        )}
      </Box>
    )}
  </Container>
</>    );
}