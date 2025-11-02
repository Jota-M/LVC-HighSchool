'use client';
import React, { useEffect, useState } from "react";
import '@fontsource/roboto';
import {
  Box,
  Typography,
  useTheme,
  Grid,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Fade,
  Chip,
  Container,
} from "@mui/material";
import Navbar from "@/app/PreInscripcion/Navbar";
import SchoolIcon from "@mui/icons-material/School";
import DownloadIcon from "@mui/icons-material/Download";
import AdjustIcon from "@mui/icons-material/Adjust";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SubjectCard from "@/app/components/HomePage/SubjectCard";
import { keyframes } from "@mui/system";

interface Materia {
  Materia: string;
  Horas: string;
  color: string;
  Icono: React.ElementType;
  temas: string[];
}

interface Objetivo {
  titulo: string;
  descripcion: string;
}

interface GradeContent {
  title: string;
  subtitle: string;
  objetivos: Objetivo[];
  materias: Materia[];
}

interface ItemsProps {
  levelTitle: string;
  levelDescription: string;
  gradesContent: Record<string, GradeContent>;
  toggleLabels: string[];
}

// Animaciones personalizadas
const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const fadeInDown = keyframes`
  0% { opacity: 0; transform: translateY(-40px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const fadeInLeft = keyframes`
  0% { opacity: 0; transform: translateX(-40px); }
  100% { opacity: 1; transform: translateX(0); }
`;

const fadeInRight = keyframes`
  0% { opacity: 0; transform: translateX(40px); }
  100% { opacity: 1; transform: translateX(0); }
`;

const scaleIn = keyframes`
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(1, 87, 155, 0.3); }
  50% { box-shadow: 0 0 40px rgba(1, 87, 155, 0.6); }
`;

export default function HomeLevelPage({
  levelTitle,
  levelDescription,
  gradesContent,
  toggleLabels,
}: ItemsProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Estados principales
  const [alignment, setAlignment] = useState<string>(
    Object.keys(gradesContent)[0]
  );
  const [visible, setVisible] = useState(false);
  const [animateSubjects, setAnimateSubjects] = useState(false);
  const [currentGrade, setCurrentGrade] = useState(alignment);
  const [headerHovered, setHeaderHovered] = useState(false);

  // Mostrar página con animación
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Mostrar el primer curso por defecto al cargar
  useEffect(() => {
    setCurrentGrade(Object.keys(gradesContent)[0]);
    setAnimateSubjects(true);
  }, [gradesContent]);

  const current = gradesContent[currentGrade];

  // Cambiar grado con animación
  const handleChangeGrade = (newGrade: string) => {
    setAnimateSubjects(false);
    setAlignment(newGrade);
    setTimeout(() => {
      setCurrentGrade(newGrade);
      setAnimateSubjects(true);
    }, 300);
  };

  return (
    <Fade in={visible} timeout={700}>
      <Box
        sx={{
          bgcolor: "background.default",
          color: "text.primary",
          pt: { xs: 10, md: 15 },
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Navbar />

        {/* Fondo animado con partículas */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100%",
            background: isDark
              ? "radial-gradient(circle at 30% 20%, rgba(1, 87, 155, 0.15), transparent)"
              : "radial-gradient(circle at 30% 20%, rgba(187, 222, 251, 0.3), transparent)",
            animation: `${pulse} 10s ease-in-out infinite`,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          {/* CABECERA MEJORADA */}
          <Box
            onMouseEnter={() => setHeaderHovered(true)}
            onMouseLeave={() => setHeaderHovered(false)}
            sx={{
              p: { xs: 3, md: 5, lg: 6 },
              mb: 6,
              bgcolor: isDark ? "rgba(255,255,255,0.05)" : "background.paper",
              borderRadius: 4,
              border: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(1, 87, 155, 0.1)"}`,
              backdropFilter: "blur(10px)",
              position: "relative",
              overflow: "hidden",
              opacity: 0,
              animation: `${fadeInDown} 1s ease forwards`,
              transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: isDark
                  ? "0 20px 60px rgba(250, 204, 21, 0.2)"
                  : "0 20px 60px rgba(1, 87, 155, 0.2)",
                borderColor: isDark ? "#facc15" : "#01579b",
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: "linear-gradient(90deg, #01579b, #0288d1, #facc15)",
                backgroundSize: "200% 100%",
                animation: headerHovered ? `${shimmer} 2s linear infinite` : "none",
              },
            }}
          >
            {/* Badge superior */}
            <Chip
              icon={<AutoAwesomeIcon />}
              label="MALLA CURRICULAR"
              size="small"
              sx={{
                position: "absolute",
                top: 20,
                right: 20,
                fontWeight: "bold",
                background: "linear-gradient(135deg, #01579b, #0288d1)",
                color: "#fff",
                animation: `${float} 3s ease-in-out infinite`,
                "& .MuiChip-icon": {
                  color: "#facc15",
                },
              }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              {/* Icono con animación */}
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    width: { xs: 60, md: 80 },
                    height: { xs: 60, md: 80 },
                    borderRadius: "50%",
                    background: isDark
                      ? "linear-gradient(135deg, #facc15, #ffd54f)"
                      : "linear-gradient(135deg, #01579b, #0288d1)",
                    opacity: 0.2,
                    animation: `${pulse} 3s ease-in-out infinite`,
                  }}
                />
                <SchoolIcon
                  sx={{
                    fontSize: { xs: "2.5rem", md: "4rem" },
                    color: isDark ? "#facc15" : "black",
                    transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transform: headerHovered ? "rotate(-10deg) scale(1.1)" : "rotate(0deg) scale(1)",
                    filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                    zIndex: 1,
                  }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "1.5rem", md: "2.5rem" },
                    mb: 1,
                    background: isDark
                      ? "linear-gradient(135deg, #facc15, #ffd54f)"
                      : "linear-gradient(135deg, #01579b, #0288d1)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    animation: headerHovered ? `${shimmer} 3s linear infinite` : "none",
                  }}
                >
                  {levelTitle}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: "0.75rem", md: "1rem" },
                    color: isDark ? "#90caf9" : "#0288d1",
                    fontWeight: 500,
                  }}
                >
                  {levelDescription}
                </Typography>
              </Box>
            </Box>

            {/* Decoración inferior */}
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                display: "flex",
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              {[
                { icon: <EmojiEventsIcon />, label: "Excelencia Académica", color: "#facc15" },
                { icon: <TrendingUpIcon />, label: "Desarrollo Integral", color: "#4caf50" },
                { icon: <AutoAwesomeIcon />, label: "Metodología Innovadora", color: "#D299DE" },
              ].map((item, i) => (
                <Chip
                  key={i}
                  icon={item.icon}
                  label={item.label}
                  size="small"
                  sx={{
                    fontWeight: 500,
                    background: `${item.color}15`,
                    color: item.color,
                    border: `1px solid ${item.color}30`,
                    opacity: 0,
                    animation: `${fadeInUp} 0.8s ease forwards ${0.5 + i * 0.2}s`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: `0 4px 15px ${item.color}40`,
                    },
                    "& .MuiChip-icon": {
                      color: item.color,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* SELECCIÓN DE GRADO MEJORADA */}
          <Box
            sx={{
              mb: 6,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              opacity: 0,
              animation: `${fadeInUp} 1s ease forwards 0.3s`,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: "bold",
                fontSize: "0.1rem",
                fontFamily:'Roboto',
                letterSpacing: 2,
                mb: 1,
              }}
            >
              EXPLORA POR NIVEL
            </Typography>
            <Typography
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: "bold",
                fontFamily:'Roboto',
                fontSize: { xs: "1rem", md: "1.5rem" },
                color: theme.palette.text.primary,
              }}
            >
              Selecciona el grado que deseas explorar
            </Typography>

            <ToggleButtonGroup
              color="primary"
              value={alignment}
              exclusive
              onChange={(_, value) => value && handleChangeGrade(value)}
              aria-label="Grado"
              sx={{
                gap: 1.5,
                flexWrap: "wrap",
                justifyContent: "center",
                "& .MuiToggleButton-root": {
                  color: theme.palette.text.primary,
                  border: "2px solid",
                  borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(1, 87, 155, 0.2)",
                  borderRadius: "50px !important",
                  padding: { xs: "8px 20px", md: "10px 30px" },
                  fontSize: { xs: "0.5rem", md: "0.7rem" },
                  fontWeight: "600",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    transition: "left 0.5s ease",
                  },
                  "&.Mui-selected": {
                    background: isDark 
                      ? "linear-gradient(135deg, #01579b, #0288d1)" 
                      : "linear-gradient(135deg, #facc15, #ffd54f)",
                    color: isDark ? "#fff" : "#01579b",
                    borderColor: isDark ? "#01579b" : "#facc15",
                    transform: "scale(1.1)",
                    boxShadow: isDark
                      ? "0 4px 20px rgba(1, 87, 155, 0.5)"
                      : "0 4px 20px rgba(250, 204, 21, 0.5)",
                    fontWeight: "bold",
                  },
                  "&:hover": {
                    transform: "scale(1.05)",
                    borderColor: isDark ? "#01579b" : "#facc15",
                    "&::before": {
                      left: "100%",
                    },
                  },
                },
              }}
            >
              {toggleLabels.map((label, i) => {
                const gradeKey = Object.keys(gradesContent)[i];
                return (
                  <ToggleButton key={gradeKey} value={gradeKey}>
                    {label}
                  </ToggleButton>
                );
              })}
            </ToggleButtonGroup>
          </Box>

          {/* SECCIÓN DETALLE MEJORADA */}
          <Fade in={!!current} timeout={500}>
            <Box sx={{ mb: 6 }}>
              {/* Encabezado del grado con diseño moderno */}
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  mb: 4,
                  bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(1, 87, 155, 0.03)",
                  borderRadius: 3,
                  border: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(1, 87, 155, 0.1)"}`,
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "flex-start", md: "center" },
                  justifyContent: "space-between",
                  gap: 3,
                  opacity: 0,
                  animation: `${fadeInLeft} 0.8s ease forwards`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateX(5px)",
                    borderColor: isDark ? "#facc15" : "#01579b",
                  },
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "1rem", md: "1.8rem" },
                      mb: 1,
                      color: isDark ? "#facc15" : "#01579b",
                    }}
                  >
                    {current.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: "0.785rem", md: "0.9rem" },
                      color: "text.secondary",
                    }}
                  >
                    {current.subtitle}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  sx={{
                    background: "linear-gradient(135deg, #01579b, #0288d1)",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: { xs: "0.85rem", md: "0.7rem" },
                    px: 3,
                    py: 1.5,
                    borderRadius: "50px",
                    boxShadow: "0 4px 15px rgba(1, 87, 155, 0.3)",
                    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    "&:hover": {
                      transform: "translateY(-3px) scale(1.05)",
                      boxShadow: "0 8px 25px rgba(1, 87, 155, 0.4)",
                    },
                  }}
                >
                  Descargar Plan PDF
                </Button>
              </Box>

              {/* Objetivos con diseño de tarjetas mejorado */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  fontFamily:'Roboto',
                  mb: 3,
                  fontSize: { xs: "1rem", md: "1.5rem" },
                  opacity: 0,
                  animation: `${fadeInUp} 0.8s ease forwards 0.2s`,
                }}
              >
                Objetivos del Grado
              </Typography>

              <Grid container spacing={3} sx={{ mb: 5 }}>
                {current.objetivos.map((obj, index) => (
                  <Grid
                    key={index}
                    size={{ xs: 12, md: 6 }}
                    sx={{
                      opacity: 0,
                      animation: `${scaleIn} 0.8s ease forwards ${0.3 + index * 0.1}s`,
                    }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        height: "100%",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                        bgcolor: isDark ? "rgba(255,255,255,0.05)" : "background.paper",
                        borderRadius: 3,
                        border: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
                        boxShadow: theme.shadows[2],
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "4px",
                          height: "100%",
                          background: `linear-gradient(180deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                        },
                        "&:hover": {
                          transform: "translateY(-5px) translateX(5px)",
                          boxShadow: isDark
                            ? "0 12px 30px rgba(250, 204, 21, 0.2)"
                            : "0 12px 30px rgba(1, 87, 155, 0.2)",
                          borderColor: isDark ? "#facc15" : "#01579b",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 50,
                          height: 50,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                          color: "#fff",
                          boxShadow: `0 4px 15px ${theme.palette.secondary.main}40`,
                        }}
                      >
                        <AdjustIcon sx={{ fontSize: "1.8rem" }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "bold",
                            mb: 1,
                            fontSize: { xs: "1rem", md: "1.2rem" },
                          }}
                        >
                          {obj.titulo}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            lineHeight: 1.7,
                          }}
                        >
                          {obj.descripcion}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Materias Principales */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  fontFamily:'Roboto',
                  mb: 4,
                  fontSize: { xs: "1srem", md: "1.5rem" },
                  opacity: 0,
                  animation: `${fadeInUp} 0.8s ease forwards 0.5s`,
                }}
              >
                Materias Principales
              </Typography>

              <Grid container spacing={3}>
                {current.materias.map((m, i) => (
                  <Grid
                    key={i}
                    size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                    sx={{
                      opacity: animateSubjects ? 1 : 0,
                      transform: animateSubjects
                        ? "translateY(0) scale(1)"
                        : "translateY(50px) scale(0.9)",
                      transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s`,
                    }}
                  >
                    <SubjectCard {...m} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Fade>
        </Container>
      </Box>
    </Fade>
  );
}