import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import '@fontsource/roboto';

import {
  Grid,
  Typography,
  Button,
  Box,
  Paper,
  useTheme,
  Chip,
  Container,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import ArchiveIcon from "@mui/icons-material/Archive";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import CheckIcon from "@mui/icons-material/Check";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SendTimeExtensionIcon from "@mui/icons-material/SendTimeExtension";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import CardIns from "../components/CardIns";
import Requisitos from "../components/Requisitos";
import IconPre from "../components/IconPre";
import { keyframes } from "@mui/system";

// Animaciones personalizadas
const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const fadeInDown = keyframes`
  0% { opacity: 0; transform: translateY(-40px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const rotateGradient = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const countUp = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

function Header() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <Grid
      container
      id="Header"
      sx={{
        width: "100%",
        bgcolor: "background.default",
        color: "text.primary",
        pt: { xs: 10, md: 15, lg: 12 },
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
            : "radial-gradient(circle at 30% 20%, rgba(187, 222, 251, 0.4), transparent)",
          animation: `${pulse} 8s ease-in-out infinite`,
          zIndex: 0,
        }}
      />

      

      {/* Hero Section Mejorado */}
      <Grid
        size={{ xs: 12 }}
        sx={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          px: { xs: 2, md: 4 },
          py: { xs: 6, md: 8 },
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Badge animado superior */}
        <Chip
          icon={<RocketLaunchIcon />}
          label="INSCRIPCIONES ABIERTAS 2025-2026"
          color="primary"
          sx={{
            fontWeight: "bold",
            fontSize: "0.85rem",
            px: 2,
            py: 2.5,
            opacity: 0,
            animation: `${fadeInDown} 0.8s ease forwards`,
            boxShadow: "0 4px 20px rgba(1, 87, 155, 0.3)",
            background: "linear-gradient(135deg, #01579b, #0288d1)",
            "& .MuiChip-icon": {
              color: "#fff",
              animation: `${float} 2s ease-in-out infinite`,
            },
          }}
        />

        {/* Título principal con efecto gradiente */}
        <Box
          sx={{
            opacity: 0,
            animation: `${fadeInUp} 1s ease forwards 0.2s`,
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontFamily: 'Roboto',
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem", lg: "4rem" },
              fontWeight: "bold",
              mb: 2,
              background: isDark
                ? "linear-gradient(135deg, #fff, #90caf9)"
                : "linear-gradient(135deg, #01579b, #0288d1, #facc15)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: `${shimmer} 3s linear infinite`,
              textShadow: isDark 
                ? "0 0 40px rgba(144, 202, 249, 0.3)" 
                : "0 0 40px rgba(1, 87, 155, 0.2)",
            }}
          >
            ¡Asegura el futuro de tus hijos!
          </Typography>
          
          <Box
            sx={{
              width: 100,
              height: 4,
              background: "linear-gradient(90deg, #01579b, #facc15)",
              mx: "auto",
              borderRadius: 2,
              mb: 3,
            }}
          />
        </Box>

        {/* Descripción mejorada */}
        <Typography
          variant="h6"
          sx={{
            maxWidth: 700,
            color: "text.secondary",
            lineHeight: 1.8,
            fontSize: { xs: "1rem", md: "1.2rem" },
            opacity: 0,
            animation: `${fadeInUp} 1s ease forwards 0.4s`,
            px: 2,
          }}
        >
          Preinscripciones abiertas para el año lectivo 2025-2026. Completa el
          proceso de forma <strong style={{ color: theme.palette.secondary.main }}>digital</strong> y obtén tu cupo en minutos.
        </Typography>

        {/* Botones CTA mejorados */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
            opacity: 0,
            animation: `${fadeInUp} 1s ease forwards 0.6s`,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<PersonAddIcon />}
            href="/PreInscripcion/registro"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "0.5rem", md: "0.75rem" },
              px: 4,
              py: 1.5,
              borderRadius: "50px",
              boxShadow: "0 8px 25px rgba(1, 87, 155, 0.4)",
              background: "linear-gradient(135deg, #01579b, #0288d1)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                transition: "left 0.6s ease",
              },
              "&:hover": {
                transform: "translateY(-3px) scale(1.05)",
                boxShadow: "0 12px 35px rgba(1, 87, 155, 0.5)",
                "&::before": {
                  left: "100%",
                },
              },
              transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            Iniciar Preinscripción
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            startIcon={<PriorityHighIcon />}
            href="/PreInscripcion/cupos"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "0.5rem", md: "0.75rem" },
              px: 4,
              py: 1.5,
              borderRadius: "50px",
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
                transform: "translateY(-3px)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Ver Cupos Disponibles
          </Button>
        </Box>

        {/* Stats mejorados con contador animado */}
        <Box
          sx={{
            display: "flex",
            gap: { xs: 4, md: 8 },
            flexWrap: "wrap",
            justifyContent: "center",
            mt: 2,
            opacity: 0,
            animation: `${fadeInUp} 1s ease forwards 0.8s`,
          }}
        >
          {[
            { label: "Estudiantes Matriculados", value: "1200+", icon: <TrendingUpIcon />, color: "#01579b" },
            { label: "Tasa de aprobación", value: "98%", icon: <CheckCircleIcon />, color: "#4caf50" },
            { label: "Años de experiencia", value: "25", icon: <AutoAwesomeIcon />, color: "#ff9800" },
          ].map((stat, i) => (
            <Box
              key={i}
              sx={{
                textAlign: "center",
                position: "relative",
                p: 3,
                borderRadius: 3,
                background: isDark 
                  ? "rgba(255,255,255,0.05)" 
                  : "rgba(1, 87, 155, 0.05)",
                backdropFilter: "blur(10px)",
                border: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(1, 87, 155, 0.1)"}`,
                transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                animation: `${countUp} 0.8s ease forwards ${1 + i * 0.2}s`,
                "&:hover": {
                  transform: "translateY(-10px) scale(1.05)",
                  boxShadow: `0 12px 30px ${stat.color}40`,
                  borderColor: stat.color,
                },
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  borderRadius: "50%",
                  background: `${stat.color}20`,
                  color: stat.color,
                  mb: 2,
                }}
              >
                {stat.icon}
              </Box>
              <Typography
                variant="h3"
                sx={{
                  color: stat.color,
                  fontWeight: "bold",
                  fontFamily: 'Roboto',
                  fontSize: { xs: "1rem", md: "1.5rem" },
                  mb: 1,
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontFamily: 'Roboto',
                  fontWeight: 500,
                }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Botón estudiante regular mejorado */}
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          color="success"
          size="large"
          href="/PreInscripcion/regular"
          sx={{
            fontWeight: "bold",
            fontFamily: 'Roboto',
            px: 4,
            py: 1.5,
            borderRadius: "50px",
            fontSize: { xs: "0.5rem", md: "0.75rem" },
            boxShadow: "0 8px 25px rgba(76, 175, 80, 0.4)",
            opacity: 0,
            animation: `${fadeInUp} 1s ease forwards 1.2s`,
            "&:hover": {
              transform: "translateY(-3px) scale(1.05)",
              boxShadow: "0 12px 35px rgba(76, 175, 80, 0.5)",
            },
            transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          Estudiante Regular
        </Button>
      
      </Grid>
      <Box
            sx={{
              width: 1000,
              height: 4,
              background: "linear-gradient(90deg, #01579b, #facc15)",
              mx: "auto",
              borderRadius: 2,
            }}
          />
      {/* Proceso de Preinscripción Mejorado */}
      <Grid
        size={{ xs: 12 }}
        sx={{
          textAlign: "center",
          py: 8,
          px: 2,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            opacity: 0,
            animation: `${fadeInUp} 1s ease forwards`,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: "bold",
              fontSize: "0.9rem",
              letterSpacing: 2,
            }}
          >
            PROCESO SIMPLE Y RÁPIDO
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: isDark ? "#fff" : "text.primary",
              mb: 2,
              fontSize: { xs: "2rem", md: "2.5rem" },
            }}
          >
            Proceso de Preinscripción
          </Typography>
          <Typography
            variant="body1"
            sx={{
              maxWidth: 700,
              mx: "auto",
              color: "text.secondary",
              mb: 6,
              fontSize: { xs: "1rem", md: "1.1rem" },
              lineHeight: 1.8,
            }}
          >
            Sigue estos simples pasos para completar la preinscripción de tu hijo
            de manera rápida y segura
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 4,
            mt: 4,
          }}
        >
          <Box
            sx={{
              opacity: 0,
              animation: `${scaleIn} 0.8s ease forwards 0.3s`,
            }}
          >
            <CardIns
              color="#01579b"
              backgroundcolor="#bbdefb"
              icon={<LooksOneIcon />}
              icon2={<PersonAddIcon />}
              title="Datos del estudiante"
              paragraph="Completa la información personal, académica y médica del estudiante"
            />
          </Box>
          <Box
            sx={{
              opacity: 0,
              animation: `${scaleIn} 0.8s ease forwards 0.5s`,
            }}
          >
            <CardIns
              color="#ffcc80"
              backgroundcolor="#fff9c4"
              icon={<LooksTwoIcon color="primary" />}
              icon2={<ArchiveIcon color="info" />}
              title="Documentos"
              paragraph="Sube los documentos requeridos: cédula, certificado de notas, certificado médico"
            />
          </Box>
          <Box
            sx={{
              opacity: 0,
              animation: `${scaleIn} 0.8s ease forwards 0.7s`,
            }}
          >
            <CardIns
              color="#00e676"
              backgroundcolor="#b9f6ca"
              icon={<Looks3Icon color="primary" />}
              icon2={<CheckCircleIcon color="success" />}
              title="Confirmación"
              paragraph="Recibe la confirmación inmediata y el seguimiento del estado de tu solicitud"
            />
          </Box>
        </Box>
      </Grid>

      {/* Requisitos Mejorados */}
      <Grid size={{ xs: 12, lg: 10 }} offset={{ lg: 1 }} sx={{ position: "relative", zIndex: 1, pb: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            bgcolor: isDark ? "rgba(255,255,255,0.05)" : "background.paper",
            border: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(1, 87, 155, 0.1)"}`,
            backdropFilter: "blur(10px)",
            boxShadow: isDark 
              ? "0 20px 60px rgba(0,0,0,0.5)" 
              : "0 20px 60px rgba(1, 87, 155, 0.1)",
            position: "relative",
            overflow: "hidden",
            opacity: 0,
            animation: `${fadeInUp} 1s ease forwards`,
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "4px",
              background: "linear-gradient(90deg, #01579b, #0288d1, #facc15)",
            },
          }}
        >
          <Typography
            variant="h3"
            textAlign="center"
            sx={{
              fontWeight: "bold",
              color: isDark ? 'grey.100' : 'text.primary',
              mb: 2,
              fontSize: { xs: "1.8rem", md: "2.5rem" },
            }}
          >
            Requisitos de inscripción
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            sx={{
              color: "text.secondary",
              mb: 6,
              fontSize: { xs: "1rem", md: "1.1rem" },
            }}
          >
            Asegúrate de tener toda la documentación necesaria antes de comenzar
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid
              size={{ xs: 12, md: 4 }}
              sx={{
                opacity: 0,
                animation: `${fadeInUp} 0.8s ease forwards 0.2s`,
              }}
            >
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: isDark 
                    ? "rgba(92, 195, 255, 0.1)" 
                    : "rgba(92, 195, 255, 0.1)",
                  border: "2px solid #5CC3FF40",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 10px 30px #5CC3FF40",
                  },
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  <IconPre
                    backgroundcolor="#5CC3FF"
                    icon={<PersonAddIcon />}
                    color={theme.palette.primary.main}
                  />
                  Documentos del estudiante
                </Typography>
                <Requisitos icon={<CheckIcon color="success" />} text="Cédula de identidad" />
                <Requisitos icon={<CheckIcon color="success" />} text="Certificado de nacimiento" />
                <Requisitos icon={<CheckIcon color="success" />} text="Libreta de notas" />
              </Box>
            </Grid>

            <Grid
              size={{ xs: 12, md: 4 }}
              sx={{
                opacity: 0,
                animation: `${fadeInUp} 0.8s ease forwards 0.4s`,
              }}
            >
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: isDark 
                    ? `${theme.palette.warning.dark}20` 
                    : `${theme.palette.warning.light}40`,
                  border: `2px solid ${theme.palette.warning.main}40`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: `0 10px 30px ${theme.palette.warning.main}40`,
                  },
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  <IconPre
                    backgroundcolor={theme.palette.warning.light}
                    icon={<FamilyRestroomIcon />}
                    color={theme.palette.warning.main}
                  />
                  Documentos del representante
                </Typography>
                <Requisitos icon={<CheckIcon color="success" />} text="Cédula de identidad" />
                <Requisitos icon={<CheckIcon color="success" />} text="Planilla de servicios básicos" />
                <Requisitos icon={<CheckIcon color="success" />} text="2 referencias personales" />
              </Box>
            </Grid>

            <Grid
              size={{ xs: 12, md: 4 }}
              sx={{
                opacity: 0,
                animation: `${fadeInUp} 0.8s ease forwards 0.6s`,
              }}
            >
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: isDark 
                    ? `${theme.palette.success.dark}20` 
                    : `${theme.palette.success.light}40`,
                  border: `2px solid ${theme.palette.success.main}40`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: `0 10px 30px ${theme.palette.success.main}40`,
                  },
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  <IconPre
                    backgroundcolor={theme.palette.success.light}
                    icon={<FamilyRestroomIcon />}
                    color={theme.palette.success.main}
                  />
                  Información adicional
                </Typography>
                <Requisitos icon={<AccessTimeIcon color="info" />} text="Revisión: 2-3 días hábiles" />
                <Requisitos icon={<CalendarMonthIcon color="primary" />} text="Fecha límite: 15 de febrero" />
                <Requisitos icon={<SendTimeExtensionIcon color="secondary" />} text="Cupos limitados" />
                <Requisitos icon={<LocalPhoneIcon color="success" />} text="Soporte: +591 69624189 - 76162425 - 68420862" />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Header;