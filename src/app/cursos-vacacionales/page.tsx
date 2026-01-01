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
  Chip,
  useTheme,
  Skeleton,
  Alert,
  Stack,
  Paper,
  alpha,
  Pagination,
  Fade,
  Avatar,
  LinearProgress,
  Divider,
} from "@mui/material";
import {
  EventAvailable,
  School,
  CalendarMonth,
  Star,
  AccessTime,
  CheckCircle,
  EventSeat,
  Savings,
  EmojiEvents,
  CardGiftcard,
  WorkspacePremium,
  AutoAwesome,
  GridView,
  ViewList,
  Group,
  TrendingUp,
  Bolt,
  LocalOffer,
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

// Animaciones
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
`;

const slideUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

export default function CursosVacacionalesPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const router = useRouter();
  
  const [vistaGrid, setVistaGrid] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Hooks con datos reales
  const { periodo, isLoading: loadingPeriodo, hayPeriodoActivo } = usePeriodoActivo();
  const { paquetes, isLoading: loadingPaquetes } = usePaquetesVacacionales();
  
  // CORREGIDO: Filtros con límite aumentado
  const filtrosCursos = useMemo(() => {
    if (!periodo?.id) return null;
    return {
      periodo_vacacional_id: periodo.id,
      activo: true,
      con_cupos: true,
      limit: 100, // Aumentar límite para obtener todos los cursos
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

  // CORREGIDO: Paginación con 12 cursos por página
  const cursosPerPage = 12;
  const totalPages = Math.ceil(cursos.length / cursosPerPage);
  const startIndex = (currentPage - 1) * cursosPerPage;
  const cursosPaginados = cursos.slice(startIndex, startIndex + cursosPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 900, behavior: 'smooth' });
  };

  const getPaqueteIcon = (cantidad: number) => {
    switch(cantidad) {
      case 1: return <CardGiftcard sx={{ fontSize: 40 }} />;
      case 2: return <WorkspacePremium sx={{ fontSize: 40 }} />;
      case 3: return <EmojiEvents sx={{ fontSize: 40 }} />;
      default: return <Savings sx={{ fontSize: 40 }} />;
    }
  };

  if (!mounted) return null;

  if (loadingPeriodo) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4, mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid size={{xs:12, md:4}} key={i}>
              <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 3 }} />
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
      <Navbar />
      
      {/* Hero Section Ultra Moderno */}
      <Box
        sx={{
          position: "relative",
          minHeight: "75vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          background: isDark
            ? "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2a2f4a 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          "&::before": {
            content: '""',
            position: "absolute",
            width: "150%",
            height: "150%",
            background: isDark
              ? "radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)",
            animation: `${float} 20s ease-in-out infinite`,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "150px",
            background: isDark
              ? "linear-gradient(to top, #0a0e27, transparent)"
              : "linear-gradient(to top, #f8fafc, transparent)",
          },
        }}
      >
        {/* Decoración */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            right: "10%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: alpha("#667eea", 0.1),
            animation: `${float} 8s ease-in-out infinite`,
          }}
        />

        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2, pt: 12, mt:5}}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{xs:12,md:7}} >
              <Fade in timeout={800}>
                <Box>
                  <Typography
                    variant="h1"
                    sx={{
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: { xs: "2.5rem", md: "4rem", lg: "4.5rem" },
                      lineHeight: 1.1,
                      mb: 3,
                      letterSpacing: "-0.02em",
                      textShadow: "0 10px 40px rgba(0,0,0,0.3)",
                    }}
                  >
                    {periodo?.nombre || "Cursos Vacacionales"}
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      color: "rgba(255, 255, 255, 0.9)",
                      mb: 5,
                      lineHeight: 1.7,
                      fontWeight: 400,
                      fontSize: { xs: "1.1rem", md: "1.25rem" },
                    }}
                  >
                    {periodo?.descripcion || "Aprovecha las vacaciones para reforzar conocimientos y descubrir nuevas habilidades"}
                  </Typography>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<School />}
                      onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })}
                      sx={{
                        background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                        color: "#000",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        px: 4,
                        py: 1.8,
                        borderRadius: 3,
                        textTransform: "none",
                        boxShadow: "0 10px 30px rgba(251, 191, 36, 0.4)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                          transform: "translateY(-3px)",
                          boxShadow: "0 15px 40px rgba(251, 191, 36, 0.5)",
                        },
                        transition: "all 0.3s",
                      }}
                    >
                      Ver Cursos
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<LocalOffer />}
                      onClick={() => window.scrollTo({ top: 700, behavior: 'smooth' })}
                      sx={{
                        color: "#fff",
                        borderColor: "rgba(255, 255, 255, 0.5)",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        px: 4,
                        py: 1.8,
                        borderRadius: 3,
                        textTransform: "none",
                        backdropFilter: "blur(10px)",
                        background: "rgba(255, 255, 255, 0.1)",
                        "&:hover": {
                          borderColor: "#fff",
                          background: "rgba(255, 255, 255, 0.2)",
                          transform: "translateY(-3px)",
                        },
                        transition: "all 0.3s",
                      }}
                    >
                      Ver Ofertas
                    </Button>
                  </Stack>
                </Box>
              </Fade>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: "none", md: "block" } }}>
              <Fade in timeout={1000}>
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: `${float} 6s ease-in-out infinite`,
                  }}
                >
                  {/* Círculos decorativos de fondo */}
                  <Box
                    sx={{
                      position: "absolute",
                      width: 350,
                      height: 350,
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "2px solid rgba(255, 255, 255, 0.1)",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      width: 280,
                      height: 280,
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "2px solid rgba(255, 255, 255, 0.15)",
                    }}
                  />
                  
                  {/* Iconos centrales en grid */}
                  <Box
                    sx={{
                      width: 200,
                      height: 200,
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 2,
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    <Paper
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(251, 191, 36, 0.2)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 3,
                        border: "2px solid rgba(251, 191, 36, 0.3)",
                      }}
                    >
                      <School sx={{ fontSize: 40, color: "#fbbf24" }} />
                    </Paper>
                    <Paper
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(16, 185, 129, 0.2)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 3,
                        border: "2px solid rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      <Star sx={{ fontSize: 40, color: "#10b981" }} />
                    </Paper>
                    <Paper
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(102, 126, 234, 0.2)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 3,
                        border: "2px solid rgba(102, 126, 234, 0.3)",
                      }}
                    >
                      <AutoAwesome sx={{ fontSize: 40, color: "#667eea" }} />
                    </Paper>
                    <Paper
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(240, 147, 251, 0.2)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 3,
                        border: "2px solid rgba(240, 147, 251, 0.3)",
                      }}
                    >
                      <EmojiEvents sx={{ fontSize: 40, color: "#f093fb" }} />
                    </Paper>
                  </Box>
                  
                  {/* Elementos flotantes alrededor */}
                  <Avatar
                    sx={{
                      position: "absolute",
                      top: "5%",
                      right: "15%",
                      width: 60,
                      height: 60,
                      background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                      animation: `${float} 4s ease-in-out infinite`,
                      boxShadow: "0 10px 30px rgba(251, 191, 36, 0.5)",
                    }}
                  >
                    <CalendarMonth sx={{ fontSize: 30 }} />
                  </Avatar>

                  <Avatar
                    sx={{
                      position: "absolute",
                      bottom: "10%",
                      left: "10%",
                      width: 55,
                      height: 55,
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      animation: `${float} 5s ease-in-out infinite 1s`,
                      boxShadow: "0 10px 30px rgba(16, 185, 129, 0.5)",
                    }}
                  >
                    <EventAvailable sx={{ fontSize: 28 }} />
                  </Avatar>

                  <Avatar
                    sx={{
                      position: "absolute",
                      top: "50%",
                      right: "5%",
                      width: 50,
                      height: 50,
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      animation: `${float} 4.5s ease-in-out infinite 0.5s`,
                      boxShadow: "0 10px 30px rgba(102, 126, 234, 0.5)",
                    }}
                  >
                    <Bolt sx={{ fontSize: 26 }} />
                  </Avatar>
                </Box>
              </Fade>
            </Grid>
          </Grid>

          {/* Stats Cards */}
          <Fade in timeout={1200}>
            <Grid container spacing={3} sx={{ mt: 6 }}>
              <Grid size={{ xs: 12, md: 4 }} >
                <Paper
                  sx={{
                    p: 3,
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: 3,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", width: 56, height: 56 }}>
                      <EventAvailable sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                        Periodo
                      </Typography>
                      <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
                        {periodo?.fecha_inicio && periodo?.fecha_fin && (
                          <>
                            {new Date(periodo.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - {new Date(periodo.fecha_fin).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                          </>
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  sx={{
                    p: 3,
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: 3,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ background: "linear-gradient(135deg, #10b981, #059669)", width: 56, height: 56 }}>
                      <School sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                        Cursos Disponibles
                      </Typography>
                      <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
                        {cursos.length} cursos
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  sx={{
                    p: 3,
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: 3,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ background: "linear-gradient(135deg, #f093fb, #f5576c)", width: 56, height: 56 }}>
                      <LocalOffer sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                        Paquetes
                      </Typography>
                      <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
                        {paquetes.length} ofertas
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Fade>
        </Container>
      </Box>

      {/* Paquetes Promocionales MEJORADOS */}
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <Box sx={{ textAlign: "center", mb: 7 }}>
          <Chip
            icon={<LocalOffer />}
            label="OFERTAS ESPECIALES"
            sx={{
              mb: 2,
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              color: "#000",
              fontWeight: 700,
              fontSize: "0.95rem",
              px: 2.5,
              py: 2,
              height: "auto",
            }}
          />
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 900, 
              mb: 2,
              fontSize: { xs: "2rem", md: "3rem" },
              background: isDark
                ? "linear-gradient(135deg, #fff, #e0e0e0)"
                : "linear-gradient(135deg, #1a1a1a, #4a4a4a)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Paquetes Promocionales
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 650, mx: "auto" }}>
            Ahorra hasta un 30% inscribiéndote en múltiples cursos
          </Typography>
        </Box>

        {loadingPaquetes ? (
          <Grid container spacing={4} justifyContent="center">
            {[1, 2, 3].map((i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 4 }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {paquetes.map((paquete, index) => {
              const esMasPopular = paquete.cantidad_cursos === 3;
              const precioIndividual = (paquete.precio / paquete.cantidad_cursos).toFixed(2);
              const precioOriginal = 250 * paquete.cantidad_cursos;
              const ahorro = precioOriginal - paquete.precio;
              const porcentajeAhorro = ((ahorro / precioOriginal) * 100).toFixed(0);
              
              return (
                <Grid size={{ xs: 12, md: 4 }} key={paquete.id}>
                  <Fade in timeout={300 + index * 100}>
                    <Card
                      sx={{
                        height: "100%",
                        position: "relative",
                        overflow: "visible",
                        borderRadius: 4,
                        border: esMasPopular
                          ? "3px solid #fbbf24"
                          : `1px solid ${isDark ? alpha("#fff", 0.1) : alpha("#000", 0.08)}`,
                        background: isDark 
                          ? "linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%)"
                          : "#fff",
                        transform: esMasPopular ? "scale(1.05)" : "scale(1)",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          transform: esMasPopular ? "scale(1.08) translateY(-10px)" : "scale(1.03) translateY(-8px)",
                          boxShadow: esMasPopular
                            ? "0 20px 60px rgba(251, 191, 36, 0.4)"
                            : isDark
                            ? "0 15px 50px rgba(102, 126, 234, 0.3)"
                            : "0 15px 50px rgba(0, 0, 0, 0.15)",
                        },
                      }}
                    >
                      {esMasPopular && (
                        <Chip
                          icon={<Bolt />}
                          label="MÁS POPULAR"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: -15,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                            color: "#000",
                            fontWeight: 800,
                            zIndex: 2,
                            boxShadow: "0 6px 20px rgba(251, 191, 36, 0.6)",
                            fontSize: "0.8rem",
                            px: 2,
                            py: 2,
                            height: "auto",
                          }}
                        />
                      )}

                      <Box
                        sx={{
                          background: esMasPopular
                            ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                            : isDark
                            ? "linear-gradient(135deg, #667eea, #764ba2)"
                            : "linear-gradient(135deg, #667eea, #764ba2)",
                          p: 4,
                          textAlign: "center",
                          position: "relative",
                        }}
                      >
                        <Box sx={{ color: esMasPopular ? "#000" : "#fff", mb: 1.5 }}>
                          {getPaqueteIcon(paquete.cantidad_cursos)}
                        </Box>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 900, 
                            color: esMasPopular ? "#000" : "#fff",
                            mb: 0.5,
                          }}
                        >
                          {paquete.nombre}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: esMasPopular ? alpha("#000", 0.7) : alpha("#fff", 0.9),
                            fontSize: "0.95rem",
                          }}
                        >
                          {paquete.cantidad_cursos} {paquete.cantidad_cursos === 1 ? "curso" : "cursos"}
                        </Typography>
                      </Box>

                      <CardContent sx={{ p: 4 }}>
                        <Stack spacing={3}>
                          <Box sx={{ textAlign: "center" }}>
                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} sx={{ mb: 1.5 }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  color: "text.secondary",
                                  textDecoration: "line-through",
                                  fontWeight: 500,
                                }}
                              >
                                Bs. {precioOriginal}
                              </Typography>
                              <Chip 
                                label={`-${porcentajeAhorro}%`}
                                size="small"
                                sx={{
                                  background: alpha("#10b981", 0.2),
                                  color: "#10b981",
                                  fontWeight: 800,
                                  fontSize: "0.9rem",
                                  height: 28,
                                }}
                              />
                            </Stack>
                            <Typography 
                              variant="h2" 
                              sx={{ 
                                fontWeight: 900,
                                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                mb: 1,
                              }}
                            >
                              Bs. {paquete.precio}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Bs. {precioIndividual} por curso
                            </Typography>
                          </Box>

                          <Paper
                            elevation={0}
                            sx={{
                              background: isDark
                                ? alpha("#10b981", 0.15)
                                : alpha("#10b981", 0.1),
                              borderRadius: 2,
                              p: 2,
                              textAlign: "center",
                              border: `2px solid ${alpha("#10b981", 0.3)}`,
                            }}
                          >
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                color: "#10b981",
                                fontWeight: 800,
                              }}
                            >
                              ¡Ahorras Bs. {ahorro.toFixed(2)}!
                            </Typography>
                          </Paper>

                          <Divider />

                          <Stack spacing={2}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <CheckCircle sx={{ color: "#10b981", fontSize: 24 }} />
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {paquete.cantidad_cursos} {paquete.cantidad_cursos === 1 ? "curso completo" : "cursos completos"}
                              </Typography>
                            </Stack>

                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <CheckCircle sx={{ color: "#10b981", fontSize: 24 }} />
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                Pago único
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <CheckCircle sx={{ color: "#10b981", fontSize: 24 }} />
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                Certificado al finalizar
                              </Typography>
                            </Stack>
                          </Stack>

                          <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={() => handleSeleccionarPaquete(paquete.id)}
                            sx={{
                              background: esMasPopular
                                ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                                : isDark
                                ? "linear-gradient(135deg, #667eea, #764ba2)"
                                : "linear-gradient(135deg, #667eea, #764ba2)",
                              color: esMasPopular ? "#000" : "#fff",
                              fontWeight: 700,
                              py: 1.8,
                              fontSize: "1.05rem",
                              borderRadius: 2,
                              textTransform: "none",
                              boxShadow: esMasPopular 
                                ? "0 8px 24px rgba(251, 191, 36, 0.4)"
                                : "0 8px 24px rgba(102, 126, 234, 0.3)",
                              "&:hover": {
                                background: esMasPopular
                                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                                  : isDark
                                  ? "linear-gradient(135deg, #764ba2, #f093fb)"
                                  : "linear-gradient(135deg, #764ba2, #f093fb)",
                                transform: "scale(1.03)",
                                boxShadow: esMasPopular
                                  ? "0 12px 32px rgba(251, 191, 36, 0.5)"
                                  : "0 12px 32px rgba(102, 126, 234, 0.4)",
                              },
                              transition: "all 0.3s",
                            }}
                          >
                            Seleccionar Paquete
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      {/* Cursos Individuales */}
      <Box sx={{ background: isDark ? "#0a0e27" : "#f8fafc", py: 10 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center", mb: 7 }}>
            <Chip
              icon={<TrendingUp />}
              label="CURSOS INDIVIDUALES"
              sx={{
                mb: 2,
                background: isDark
                  ? alpha("#667eea", 0.2)
                  : alpha("#667eea", 0.15),
                color: "#667eea",
                fontWeight: 700,
                fontSize: "0.95rem",
                px: 2.5,
                py: 2,
                height: "auto",
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: 2,
                fontSize: { xs: "2rem", md: "3rem" },
                background: isDark
                  ? "linear-gradient(135deg, #fff, #e0e0e0)"
                  : "linear-gradient(135deg, #1a1a1a, #4a4a4a)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Explora Nuestros Cursos
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ maxWidth: 700, mx: "auto", mb: 4 }}
            >
              También puedes inscribirte en cursos individuales. Encuentra el curso perfecto para ti.
            </Typography>

            {/* Toggle Vista */}
            <Paper
              elevation={0}
              sx={{
                display: "inline-flex",
                p: 0.5,
                borderRadius: 2,
                background: isDark ? alpha("#fff", 0.05) : alpha("#000", 0.05),
              }}
            >
              <Button
                onClick={() => setVistaGrid(true)}
                startIcon={<GridView />}
                sx={{
                  px: 3,
                  py: 1.2,
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  background: vistaGrid 
                    ? "linear-gradient(135deg, #667eea, #764ba2)"
                    : "transparent",
                  color: vistaGrid ? "#fff" : "text.secondary",
                  "&:hover": {
                    background: vistaGrid
                      ? "linear-gradient(135deg, #667eea, #764ba2)"
                      : alpha("#000", 0.05),
                  },
                }}
              >
                Cuadrícula
              </Button>
              <Button
                onClick={() => setVistaGrid(false)}
                startIcon={<ViewList />}
                sx={{
                  px: 3,
                  py: 1.2,
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  background: !vistaGrid
                    ? "linear-gradient(135deg, #667eea, #764ba2)"
                    : "transparent",
                  color: !vistaGrid ? "#fff" : "text.secondary",
                  "&:hover": {
                    background: !vistaGrid
                      ? "linear-gradient(135deg, #667eea, #764ba2)"
                      : alpha("#000", 0.05),
                  },
                }}
              >
                Lista
              </Button>
            </Paper>
          </Box>

          {loadingCursos ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid size={{ xs: 12, sm: vistaGrid ? 6 : 12, md: vistaGrid ? 4 : 12 }} key={i}>
                  <Skeleton variant="rectangular" height={vistaGrid ? 450 : 200} sx={{ borderRadius: 3 }} />
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
            <>
              {/* Vista Grid */}
              {vistaGrid ? (
                <Grid container spacing={3}>
                  {cursosPaginados.map((curso, index) => {
                    const ocupacion = ((curso.cupos_totales - curso.cupos_disponibles) / curso.cupos_totales) * 100;
                    const esPopular = ocupacion > 70;
                    const cuposColor = curso.cupos_disponibles > 10 
                      ? "#10b981"
                      : curso.cupos_disponibles > 5
                      ? "#f59e0b"
                      : "#ef4444";

                    return (
                      <Grid size={{ xs: 12, md: 4 }} key={curso.id}>
                        <Fade in timeout={200 + index * 50}>
                          <Card
                            sx={{
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              borderRadius: 3,
                              overflow: "hidden",
                              border: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.05)}`,
                              position: "relative",
                              background: isDark ? "#1a1f3a" : "#fff",
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              "&:hover": {
                                transform: "translateY(-8px)",
                                boxShadow: isDark
                                  ? "0 12px 40px rgba(102, 126, 234, 0.3)"
                                  : "0 12px 40px rgba(0, 0, 0, 0.12)",
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
                                  top: 12,
                                  right: 12,
                                  zIndex: 2,
                                  background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                                  color: "#000",
                                  fontWeight: 700,
                                  boxShadow: "0 4px 12px rgba(251, 191, 36, 0.5)",
                                }}
                              />
                            )}

                            <Box
                              sx={{
                                position: "relative",
                                height: 220,
                                overflow: "hidden",
                                background: curso.foto_url
                                  ? "transparent"
                                  : `linear-gradient(135deg, ${isDark ? "#667eea" : "#667eea"}, ${isDark ? "#764ba2" : "#764ba2"})`,
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
                                    transition: "transform 0.5s",
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
                                  <School sx={{ fontSize: 80, color: alpha("#fff", 0.4) }} />
                                </Box>
                              )}
                              
                              <Box
                                sx={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                                  p: 1.5,
                                }}
                              >
                                <Chip
                                  icon={<EventSeat />}
                                  label={`${curso.cupos_disponibles} cupos disponibles`}
                                  size="small"
                                  sx={{
                                    background: alpha(cuposColor, 0.95),
                                    color: "#fff",
                                    fontWeight: 700,
                                  }}
                                />
                              </Box>
                            </Box>

                            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 700,
                                  mb: 1.5,
                                  lineHeight: 1.3,
                                  minHeight: 50,
                                }}
                              >
                                {curso.nombre}
                              </Typography>

                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  mb: 2.5,
                                  lineHeight: 1.6,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  minHeight: 48,
                                }}
                              >
                                {curso.descripcion}
                              </Typography>

                              <Stack spacing={1.5}>
                                {curso.dias_semana && (
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <CalendarMonth sx={{ color: "#667eea", fontSize: 20 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {curso.dias_semana}
                                    </Typography>
                                  </Stack>
                                )}
                                
                                {curso.hora_inicio && (
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <AccessTime sx={{ color: "#10b981", fontSize: 20 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {curso.hora_inicio} - {curso.hora_fin}
                                    </Typography>
                                  </Stack>
                                )}

                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Group sx={{ color: "#f59e0b", fontSize: 20 }} />
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {curso.cupos_totales - curso.cupos_disponibles}/{curso.cupos_totales} inscritos
                                  </Typography>
                                </Stack>

                                <LinearProgress 
                                  variant="determinate" 
                                  value={ocupacion} 
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: isDark ? alpha("#fff", 0.1) : alpha("#000", 0.05),
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 3,
                                      background: `linear-gradient(90deg, ${cuposColor}, ${alpha(cuposColor, 0.7)})`,
                                    }
                                  }}
                                />
                              </Stack>
                            </CardContent>

                            <Box sx={{ p: 3, pt: 0 }}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Precio
                                  </Typography>
                                  <Typography 
                                    variant="h4" 
                                    sx={{ 
                                      fontWeight: 900,
                                      background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
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
                                      : "linear-gradient(135deg, #667eea, #764ba2)",
                                    color: "#fff",
                                    fontWeight: 700,
                                    px: 3,
                                    py: 1.2,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    "&:hover": {
                                      background: curso.cupos_disponibles === 0
                                        ? "grey"
                                        : "linear-gradient(135deg, #764ba2, #f093fb)",
                                      transform: "translateY(-2px)",
                                    },
                                    transition: "all 0.2s",
                                  }}
                                >
                                  {curso.cupos_disponibles === 0 ? "Agotado" : "Inscribirme"}
                                </Button>
                              </Stack>

                              <Paper
                                elevation={0}
                                sx={{
                                  background: isDark 
                                    ? alpha("#667eea", 0.1)
                                    : alpha("#667eea", 0.08),
                                  borderRadius: 2,
                                  p: 1.5,
                                  textAlign: "center",
                                }}
                              >
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: "#667eea",
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <Savings sx={{ fontSize: 16 }} />
                                  Ahorra con un paquete
                                </Typography>
                              </Paper>
                            </Box>
                          </Card>
                        </Fade>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                // Vista Lista
                <Stack spacing={3}>
                  {cursosPaginados.map((curso, index) => {
                    const ocupacion = ((curso.cupos_totales - curso.cupos_disponibles) / curso.cupos_totales) * 100;
                    const esPopular = ocupacion > 70;
                    const cuposColor = curso.cupos_disponibles > 10 
                      ? "#10b981"
                      : curso.cupos_disponibles > 5
                      ? "#f59e0b"
                      : "#ef4444";

                    return (
                      <Fade in timeout={200 + index * 50} key={curso.id}>
                        <Card
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            overflow: "hidden",
                            borderRadius: 3,
                            border: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.05)}`,
                            background: isDark ? "#1a1f3a" : "#fff",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            position: "relative",
                            "&:hover": {
                              transform: "translateX(8px)",
                              boxShadow: isDark
                                ? "0 8px 40px rgba(102, 126, 234, 0.3)"
                                : "0 8px 40px rgba(0, 0, 0, 0.12)",
                              "& .curso-image-list": {
                                transform: "scale(1.08)",
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
                                top: 12,
                                left: { xs: 12, sm: 220 },
                                zIndex: 2,
                                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                                color: "#000",
                                fontWeight: 700,
                                boxShadow: "0 4px 12px rgba(251, 191, 36, 0.5)",
                              }}
                            />
                          )}

                          {/* Imagen */}
                          <Box
                            sx={{
                              width: { xs: "100%", sm: 280 },
                              height: { xs: 200, sm: "auto" },
                              minHeight: { sm: 220 },
                              position: "relative",
                              overflow: "hidden",
                              background: curso.foto_url
                                ? "transparent"
                                : `linear-gradient(135deg, #667eea, #764ba2)`,
                            }}
                          >
                            {curso.foto_url ? (
                              <CardMedia
                                component="img"
                                image={curso.foto_url}
                                alt={curso.nombre}
                                className="curso-image-list"
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  transition: "transform 0.5s",
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <School sx={{ fontSize: 80, color: alpha("#fff", 0.4) }} />
                              </Box>
                            )}

                            <Chip
                              icon={<EventSeat />}
                              label={`${curso.cupos_disponibles} cupos`}
                              size="small"
                              sx={{
                                position: "absolute",
                                bottom: 12,
                                left: 12,
                                background: alpha(cuposColor, 0.95),
                                color: "#fff",
                                fontWeight: 700,
                              }}
                            />
                          </Box>

                          {/* Contenido */}
                          <Box
                            sx={{
                              flex: 1,
                              display: "flex",
                              flexDirection: { xs: "column", md: "row" },
                              p: 3,
                            }}
                          >
                            <Box sx={{ flex: 1, mb: { xs: 3, md: 0 }, pr: { md: 3 } }}>
                              <Typography 
                                variant="h5" 
                                sx={{ 
                                  fontWeight: 700,
                                  mb: 1.5,
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
                                }}
                              >
                                {curso.descripcion}
                              </Typography>

                              <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                                {curso.dias_semana && (
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <CalendarMonth sx={{ color: "#667eea", fontSize: 22 }} />
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                        Días
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {curso.dias_semana}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                )}
                                
                                {curso.hora_inicio && (
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <AccessTime sx={{ color: "#10b981", fontSize: 22 }} />
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                        Horario
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {curso.hora_inicio} - {curso.hora_fin}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                )}

                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Group sx={{ color: "#f59e0b", fontSize: 22 }} />
                                  <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                      Inscritos
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {curso.cupos_totales - curso.cupos_disponibles} / {curso.cupos_totales}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Stack>

                              <Box sx={{ mt: 2 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={ocupacion} 
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: isDark ? alpha("#fff", 0.1) : alpha("#000", 0.05),
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 4,
                                      background: `linear-gradient(90deg, ${cuposColor}, ${alpha(cuposColor, 0.7)})`,
                                    }
                                  }}
                                />
                              </Box>
                            </Box>

                            {/* Precio y acción */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                alignItems: { xs: "stretch", md: "flex-end" },
                                minWidth: { md: 220 },
                              }}
                            >
                              <Box sx={{ textAlign: { xs: "left", md: "right" }, mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                                  Precio individual
                                </Typography>
                                <Typography 
                                  variant="h3" 
                                  sx={{ 
                                    fontWeight: 900,
                                    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    mb: 1.5,
                                  }}
                                >
                                  Bs. {curso.costo}
                                </Typography>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    background: isDark 
                                      ? alpha("#667eea", 0.15)
                                      : alpha("#667eea", 0.1),
                                    borderRadius: 2,
                                    px: 2,
                                    py: 1,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <Savings sx={{ fontSize: 16, color: "#667eea" }} />
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: "#667eea",
                                      fontWeight: 700,
                                    }}
                                  >
                                    Ahorra con paquete
                                  </Typography>
                                </Paper>
                              </Box>

                              <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                onClick={() => handleInscribirse(curso)}
                                disabled={curso.cupos_disponibles === 0}
                                sx={{
                                  background: curso.cupos_disponibles === 0
                                    ? "grey"
                                    : "linear-gradient(135deg, #667eea, #764ba2)",
                                  color: "#fff",
                                  fontWeight: 700,
                                  py: 1.8,
                                  borderRadius: 2,
                                  textTransform: "none",
                                  fontSize: "1.05rem",
                                  "&:hover": {
                                    background: curso.cupos_disponibles === 0
                                      ? "grey"
                                      : "linear-gradient(135deg, #764ba2, #f093fb)",
                                    transform: "translateY(-2px)",
                                  },
                                  transition: "all 0.2s",
                                }}
                              >
                                {curso.cupos_disponibles === 0 ? "Curso Agotado" : "Inscribirme Ahora"}
                              </Button>
                            </Box>
                          </Box>
                        </Card>
                      </Fade>
                    );
                  })}
                </Stack>
              )}

              {/* Paginación */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                  <Pagination 
                    count={totalPages} 
                    page={currentPage} 
                    onChange={handlePageChange}
                    size="large"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        "&.Mui-selected": {
                          background: "linear-gradient(135deg, #667eea, #764ba2)",
                          color: "#fff",
                          "&:hover": {
                            background: "linear-gradient(135deg, #764ba2, #f093fb)",
                          },
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
    </>
  );
}