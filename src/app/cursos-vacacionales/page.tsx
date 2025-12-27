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
} from "@mui/material";
import {
  EventAvailable,
  Schedule,
  AttachMoney,
  ChevronLeft,
  ChevronRight,
  School,
  CalendarMonth,
} from "@mui/icons-material";
import { keyframes } from "@mui/system";
import { usePeriodoActivo, useCursosPublicos } from "@/hooks/useCursosVacacionales";
import ModalInscripcion from "../components/ModalInscripcion";
import { CursoVacacional } from "@/types/cursoVacacionalTypes";

// Animaciones
const fadeSlideIn = keyframes`
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

export default function CursosVacacionalesPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  
  const [cursoSeleccionado, setCursoSeleccionado] = useState<CursoVacacional | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Hook del periodo activo
  const { periodo, isLoading: loadingPeriodo, hayPeriodoActivo } = usePeriodoActivo();
  
  // ✅ FIX: Usar useMemo para evitar recreación de filtros
  const filtrosCursos = useMemo(() => {
    if (!periodo?.id) return null;
    
    return {
      periodo_vacacional_id: periodo.id,
      activo: true,
      con_cupos: true,
    };
  }, [periodo?.id]);

  // ✅ Hook de cursos públicos
  const { 
    cursos, 
    isLoading: loadingCursos 
  } = useCursosPublicos(
    filtrosCursos || {},
    {
      enabled: !!filtrosCursos,
    }
  );

  // Fix hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug
  useEffect(() => {
    console.log('📊 Debug Info:', {
      periodoId: periodo?.id,
      hayPeriodo: !!periodo?.id,
      filtrosCursos,
      cursosEncontrados: cursos.length,
      loadingCursos,
      loadingPeriodo,
    });
  }, [periodo?.id, cursos.length, loadingCursos, loadingPeriodo, filtrosCursos]);

  const handleInscribirse = (curso: CursoVacacional) => {
    setCursoSeleccionado(curso);
    setModalOpen(true);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(cursos.length / 3));
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(cursos.length / 3)) % Math.ceil(cursos.length / 3));
  };

  if (!mounted) {
    return null;
  }

  if (loadingPeriodo) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4, mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{xs:12, md:4}}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (!hayPeriodoActivo) {
    return (
      <Container maxWidth="lg" sx={{ py: 12, textAlign: "center" }}>
        <Box
          sx={{
            background: isDark
              ? "linear-gradient(135deg, rgba(21, 101, 192, 0.1), rgba(2, 136, 209, 0.1))"
              : "linear-gradient(135deg, rgba(1, 87, 155, 0.05), rgba(2, 136, 209, 0.05))",
            borderRadius: 4,
            p: 8,
            border: `2px dashed ${isDark ? "#1565c0" : "#01579b"}`,
          }}
        >
          <CalendarMonth sx={{ fontSize: 80, color: isDark ? "#1565c0" : "#01579b", mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
            No hay inscripciones abiertas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Actualmente no hay un periodo vacacional activo. Vuelve pronto para conocer las próximas fechas.
          </Typography>
        </Box>
      </Container>
    );
  }

  const cursosSlice = cursos.slice(currentSlide * 3, (currentSlide + 1) * 3);

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          background: isDark
            ? "linear-gradient(135deg, #0d47a1 0%, #01579b 50%, #006064 100%)"
            : "linear-gradient(135deg, #01579b 0%, #0288d1 50%, #0097a7 100%)",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{xs:12, md:7}}>
              <Chip
                label={`🎉 ${periodo?.tipo === "verano" ? "Vacaciones de Verano" : "Vacaciones de Invierno"} ${periodo?.anio || ""}`}
                sx={{
                  mb: 3,
                  background: "rgba(250, 204, 21, 0.2)",
                  color: "#facc15",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  px: 2,
                  py: 1,
                  animation: `${pulse} 2s infinite`,
                }}
              />

              <Typography
                variant="h2"
                sx={{
                  fontFamily: "Montserrat, sans-serif",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
                  lineHeight: 1.2,
                  mb: 3,
                  animation: `${fadeSlideIn} 1s forwards`,
                  animationDelay: "0.2s",
                }}
              >
                {periodo?.nombre || "Cursos Vacacionales"}
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  mb: 4,
                  lineHeight: 1.6,
                  animation: `${fadeSlideIn} 1s forwards`,
                  animationDelay: "0.4s",
                }}
              >
                {periodo?.descripcion || "Aprovecha las vacaciones para reforzar conocimientos"}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  animation: `${fadeSlideIn} 1s forwards`,
                  animationDelay: "0.6s",
                }}
              >
                <Chip
                  icon={<EventAvailable />}
                  label={periodo ? `Del ${new Date(periodo.fecha_inicio).toLocaleDateString()} al ${new Date(periodo.fecha_fin).toLocaleDateString()}` : "Por definir"}
                  sx={{ background: "rgba(255, 255, 255, 0.2)", color: "#fff" }}
                />
                <Chip
                  icon={<School />}
                  label={`${cursos.length} cursos disponibles`}
                  sx={{ background: "rgba(250, 204, 21, 0.3)", color: "#facc15" }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Cursos Section */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: "bold",
              color: isDark ? "#fff" : "#01579b",
              mb: 2,
            }}
          >
            Cursos Disponibles
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
            Selecciona el curso que más te interese y completa tu inscripción
          </Typography>
        </Box>

        {loadingCursos ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid key={i} size={{xs:12, sm:6, md:4}}>
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : cursos.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body1">
              No hay cursos disponibles en este momento.
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Periodo ID: {periodo?.id || 'N/A'} | Cursos encontrados: {cursos.length}
            </Typography>
          </Alert>
        ) : (
          <>
            <Box sx={{ position: "relative", px: { xs: 2, md: 8 } }}>
              {cursos.length > 3 && (
                <>
                  <IconButton
                    onClick={handlePrevSlide}
                    sx={{
                      position: "absolute",
                      left: -20,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: isDark ? "rgba(21, 101, 192, 0.9)" : "rgba(1, 87, 155, 0.9)",
                      color: "#fff",
                      zIndex: 10,
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>

                  <IconButton
                    onClick={handleNextSlide}
                    sx={{
                      position: "absolute",
                      right: -20,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: isDark ? "rgba(21, 101, 192, 0.9)" : "rgba(1, 87, 155, 0.9)",
                      color: "#fff",
                      zIndex: 10,
                    }}
                  >
                    <ChevronRight />
                  </IconButton>
                </>
              )}

              <Grid container spacing={3}>
                {cursosSlice.map((curso, index) => (
                  <Grid key={curso.id} size={{xs:12, sm:6, md:4}}>
                    <Zoom in timeout={(index + 1) * 200}>
                      <Card
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          transition: "all 0.3s",
                          "&:hover": {
                            transform: "translateY(-10px)",
                            boxShadow: 8,
                          },
                        }}
                      >
                        <CardMedia
                          component="div"
                          sx={{
                            height: 200,
                            background: `linear-gradient(135deg, ${isDark ? "#1565c0" : "#01579b"}, ${isDark ? "#0288d1" : "#0288d1"})`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <School sx={{ fontSize: 80, color: "rgba(255, 255, 255, 0.3)" }} />
                        </CardMedia>

                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", flex: 1 }}>
                              {curso.nombre}
                            </Typography>
                            <Chip
                              label={`${curso.cupos_disponibles} cupos`}
                              size="small"
                              color={curso.cupos_disponibles > 10 ? "success" : "warning"}
                            />
                          </Box>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {curso.descripcion}
                          </Typography>

                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {curso.dias_semana && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <CalendarMonth fontSize="small" color="action" />
                                <Typography variant="body2">{curso.dias_semana}</Typography>
                              </Box>
                            )}
                            {curso.hora_inicio && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Schedule fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {curso.hora_inicio} - {curso.hora_fin}
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <AttachMoney fontSize="small" color="action" />
                              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#facc15" }}>
                                Bs. {curso.costo}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>

                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => handleInscribirse(curso)}
                            disabled={curso.cupos_disponibles === 0}
                            sx={{
                              background: isDark
                                ? "linear-gradient(135deg, #1565c0, #0288d1)"
                                : "linear-gradient(135deg, #01579b, #0288d1)",
                              fontWeight: "bold",
                            }}
                          >
                            {curso.cupos_disponibles === 0 ? "Sin cupos" : "Inscribirse Ahora"}
                          </Button>
                        </CardActions>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </Container>

      {/* Modal de Inscripción */}
      <ModalInscripcion
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCursoSeleccionado(null);
        }}
        curso={cursoSeleccionado}
      />
    </>
  );
}