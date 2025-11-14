'use client';

import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import '@fontsource/roboto';
import {
  Grid,
  Typography,
  Box,
  useTheme,
  Paper,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Fade,
  Chip,
  Container,
} from "@mui/material";

import ChildCareIcon from '@mui/icons-material/ChildCare';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CardIns from "../../components/Preinscripcion/CardIns";
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
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const progressFill = keyframes`
  0% { width: 0%; }
  100% { width: var(--target-width); }
`;

const countUp = keyframes`
  0% { opacity: 0; transform: translateY(20px) scale(0.8); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

type Nivel = {
  title: string;
  edad: string;
  total: number;
  ocupados: number;
};

type Turno = "mañana" | "tarde";

// Datos separados por turno
const niveles = {
  mañana: {
    inicial: [
      { title: "Pre-Kínder", edad: "3-4 años", total: 30, ocupados: 25 },
      { title: "Kínder", edad: "4-5 años", total: 50, ocupados: 10 },
    ],
    primaria: [
      { title: "1° Primaria", edad: "6-7 años", total: 30, ocupados: 27 },
      { title: "2° Primaria", edad: "7-8 años", total: 30, ocupados: 26 },
      { title: "3° Primaria", edad: "8-9 años", total: 30, ocupados: 29 },
      { title: "4° Primaria", edad: "9-10 años", total: 30, ocupados: 28 },
      { title: "5° Primaria", edad: "10-11 años", total: 30, ocupados: 19 },
      { title: "6° Primaria", edad: "11-12 años", total: 30, ocupados: 16 },
    ],
    secundaria: [
      { title: "1° Secundaria", edad: "12-13 años", total: 32, ocupados: 29 },
      { title: "2° Secundaria", edad: "13-14 años", total: 30, ocupados: 27 },
      { title: "3° Secundaria", edad: "14-15 años", total: 28, ocupados: 24 },
      { title: "4° Secundaria", edad: "15-16 años", total: 25, ocupados: 20 },
      { title: "5° Secundaria", edad: "15-16 años", total: 29, ocupados: 13 },
      { title: "6° Secundaria", edad: "15-16 años", total: 30, ocupados: 23 },
    ],
  },
  tarde: {
    inicial: [
      { title: "Pre-Kínder", edad: "3-4 años", total: 30, ocupados: 18 },
      { title: "Kínder", edad: "4-5 años", total: 28, ocupados: 16 },
    ],
    primaria: [
      { title: "1° Primaria", edad: "6-7 años", total: 30, ocupados: 10 },
      { title: "2° Primaria", edad: "7-8 años", total: 30, ocupados: 21 },
      { title: "3° Primaria", edad: "8-9 años", total: 30, ocupados: 24 },
      { title: "4° Primaria", edad: "9-10 años", total: 30, ocupados: 9 },
      { title: "5° Primaria", edad: "10-11 años", total: 16, ocupados: 15 },
      { title: "6° Primaria", edad: "11-12 años", total: 25, ocupados: 14 },
    ],
    secundaria: [
      { title: "1° Secundaria", edad: "12-13 años", total: 32, ocupados: 29 },
      { title: "2° Secundaria", edad: "13-14 años", total: 30, ocupados: 17 },
      { title: "3° Secundaria", edad: "14-15 años", total: 28, ocupados: 14 },
      { title: "4° Secundaria", edad: "15-16 años", total: 25, ocupados: 20 },
      { title: "5° Secundaria", edad: "15-16 años", total: 29, ocupados: 23 },
      { title: "6° Secundaria", edad: "15-16 años", total: 30, ocupados: 13 },
    ],
  },
};

// Cálculo general
function getStats(turno: Turno) {
  const allGrados = [
    ...niveles[turno].inicial,
    ...niveles[turno].primaria,
    ...niveles[turno].secundaria,
  ];
  const totalCupos = allGrados.reduce((acc, g) => acc + g.total, 0);
  const totalOcupados = allGrados.reduce((acc, g) => acc + g.ocupados, 0);
  const totalDisponibles = totalCupos - totalOcupados;
  const porcentajeOcupacion = Math.round((totalOcupados / totalCupos) * 100);

  return { totalCupos, totalOcupados, totalDisponibles, porcentajeOcupacion };
}

function Header() {
  const theme = useTheme();
  const [turno, setTurno] = useState<Turno>("mañana");
  const [isVisible, setIsVisible] = useState(false);
  const stats = getStats(turno);
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleTurnoChange = (_: any, newTurno: Turno | null) => {
    if (newTurno) setTurno(newTurno);
  };

  return (
    <Box sx={{ width: "100%", position: "relative", overflow: "hidden" }}>
      <Navbar />

      {/* Fondo animado decorativo */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "600px",
          background: isDark
            ? "radial-gradient(circle at 30% 20%, rgba(1, 87, 155, 0.15), transparent)"
            : "radial-gradient(circle at 30% 20%, rgba(187, 222, 251, 0.3), transparent)",
          animation: `${pulse} 10s ease-in-out infinite`,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, pt: { xs: 12, md: 18 } }}>
        {/* Hero Section Mejorado */}
        <Box
          sx={{
            textAlign: "center",
            pb: { xs: 4, md: 3 },
            opacity: 0,
            animation: `${fadeInDown} 1s ease forwards`,
          }}
        >
          {/* Badge superior */}
          <Chip
            icon={<AutoAwesomeIcon />}
            label="CUPOS DISPONIBLES 2025"
            sx={{
              mb: 3,
              px: 2,
              py: 2.5,
              fontWeight: "bold",
              fontSize: "0.85rem",
              background: "linear-gradient(135deg, #01579b, #0288d1)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(1, 87, 155, 0.3)",
              animation: `${float} 3s ease-in-out infinite`,
              "& .MuiChip-icon": {
                color: "#facc15",
              },
            }}
          />

          {/* Título principal */}
          <Typography
            variant="h2"
            sx={{
              fontFamily: 'Roboto',
              fontSize: { xs: "1.5rem", md: "3rem" },
              fontWeight: "bold",
              mb: 2,
              background: isDark
                ? "linear-gradient(135deg, #facc15, #ffd54f)"
                : "linear-gradient(135deg, #01579b, #0288d1)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: `${shimmer} 3s linear infinite`,
            }}
          >
            Plataforma de Preinscripción 2025
          </Typography>

          <Typography
            variant="h6"
            sx={{
              maxWidth: 700,
              mx: "auto",
              color: "text.secondary",
              fontSize: { xs: "0.785rem", md: "1rem" },
              lineHeight: 1.7,
            }}
          >
            Consulta el estado actual de los cupos y estadísticas por turno en tiempo real
          </Typography>

          {/* Toggle Turno Mejorado */}
          <Box
            sx={{
              mt: 5,
              display: "flex",
              justifyContent: "center",
              opacity: 0,
              animation: `${scaleIn} 0.8s ease forwards 0.3s`,
            }}
          >
            <ToggleButtonGroup
              value={turno}
              exclusive
              onChange={handleTurnoChange}
              sx={{
                borderRadius: "50px",
                overflow: "hidden",
                background: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.03)",
                border: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
                backdropFilter: "blur(10px)",
                boxShadow: isDark
                  ? "0 8px 25px rgba(0,0,0,0.3)"
                  : "0 8px 25px rgba(0,0,0,0.1)",
              }}
            >
              {[
                { label: "Turno Mañana", value: "mañana", color: "#42A5F5", icon: <WbSunnyIcon /> },
                { label: "Turno Tarde", value: "tarde", color: "#FFA726", icon: <NightsStayIcon /> },
              ].map((btn) => (
                <ToggleButton
                  key={btn.value}
                  value={btn.value}
                  sx={{
                    px: 4,
                    py: 1.5,
                    border: "none",
                    borderRadius: "50px",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: turno === btn.value ? "#fff" : "text.secondary",
                    background: turno === btn.value
                      ? `linear-gradient(135deg, ${btn.color}, ${theme.palette.primary.main})`
                      : "transparent",
                    boxShadow: turno === btn.value
                      ? `0 4px 20px ${btn.color}60`
                      : "none",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    "&:hover": {
                      background: turno === btn.value
                        ? `linear-gradient(135deg, ${btn.color}, ${theme.palette.primary.main})`
                        : isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  {btn.icon}
                  <span>{btn.label}</span>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* Estadísticas Globales Mejoradas */}
        <Grid
          container
          spacing={3}
          sx={{
            mb: 6,
            opacity: 0,
            animation: `${fadeInUp} 0.8s ease forwards 0.5s`,
          }}
        >
          {[
            { label: "Total de Cupos", value: stats.totalCupos, icon: <SchoolIcon />, color: "#01579b" },
            { label: "Cupos Ocupados", value: stats.totalOcupados, icon: <CheckCircleIcon />, color: "#4caf50" },
            { label: "Cupos Disponibles", value: stats.totalDisponibles, icon: <TrendingUpIcon />, color: "#facc15" },
            { label: "Ocupación", value: `${stats.porcentajeOcupacion}%`, icon: <AutoAwesomeIcon />, color: "#ff9800" },
          ].map((stat, i) => (
            <Grid size={{xs:6, sm:6, md:3}}  key={i}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  textAlign: "center",
                  background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
                  border: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: stat.color,
                  },
                  "&:hover": {
                    transform: "translateY(-8px) scale(1.03)",
                    boxShadow: `0 15px 40px ${stat.color}30`,
                    borderColor: stat.color,
                  },
                }}
              >
                {/* Icono */}
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    mx: "auto",
                    mb: 2,
                    borderRadius: "50%",
                    background: `${stat.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: stat.color,
                    fontSize: "2rem",
                  }}
                >
                  {stat.icon}
                </Box>

                {/* Valor */}
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    color: stat.color,
                    animation: `${countUp} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards ${0.7 + i * 0.1}s`,
                  }}
                >
                  {stat.value}
                </Typography>

                {/* Etiqueta */}
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Barra de progreso mejorada */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 4,
            mb: 8,
            background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
            border: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
            opacity: 0,
            animation: `${fadeInUp} 0.8s ease forwards 0.7s`,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              Porcentaje de Ocupación Total
            </Typography>
            <Chip
              label={`${stats.porcentajeOcupacion}%`}
              sx={{
                fontWeight: "bold",
                fontSize: "1rem",
                background: stats.porcentajeOcupacion > 80
                  ? "linear-gradient(135deg, #f44336, #e91e63)"
                  : stats.porcentajeOcupacion > 60
                  ? "linear-gradient(135deg, #ff9800, #ffa726)"
                  : "linear-gradient(135deg, #4caf50, #66bb6a)",
                color: "#fff",
              }}
            />
          </Box>

          <Box
            sx={{
              position: "relative",
              height: 15,
              borderRadius: 12,
              overflow: "hidden",
              background: isDark ? "rgba(255,255,255,0.1)" : "#e0e0e0",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${stats.porcentajeOcupacion}%`,
                background: stats.porcentajeOcupacion > 80
                  ? "linear-gradient(90deg, #f44336, #e91e63)"
                  : stats.porcentajeOcupacion > 60
                  ? "linear-gradient(90deg, #ff9800, #ffa726)"
                  : "linear-gradient(90deg, #4caf50, #66bb6a)",
                borderRadius: 12,
                transition: "width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                boxShadow: stats.porcentajeOcupacion > 80
                  ? "0 0 20px rgba(244, 67, 54, 0.5)"
                  : stats.porcentajeOcupacion > 60
                  ? "0 0 20px rgba(255, 152, 0, 0.5)"
                  : "0 0 20px rgba(76, 175, 80, 0.5)",
              }}
            />
          </Box>
        </Paper>

        {/* Secciones por nivel */}
        {[
          {
            titulo: "Nivel Inicial",
            data: niveles[turno].inicial,
            cursos: [
              { title: "Pre-Kínder", color: "#FF7043", icon: <ChildCareIcon /> },
              { title: "Kínder", color: "#FFA726", icon: <ChildCareIcon /> },
            ],
          },
          {
            titulo: "Educación Primaria",
            data: niveles[turno].primaria,
            cursos: [
              { title: "1° Primaria", color: "#42A5F5", icon: <MenuBookIcon /> },
              { title: "2° Primaria", color: "#29B6F6", icon: <MenuBookIcon /> },
              { title: "3° Primaria", color: "#26C6DA", icon: <MenuBookIcon /> },
              { title: "4° Primaria", color: "#00ACC1", icon: <MenuBookIcon /> },
              { title: "5° Primaria", color: "#0097A7", icon: <MenuBookIcon /> },
              { title: "6° Primaria", color: "#00838F", icon: <MenuBookIcon /> },
            ],
          },
          {
            titulo: "Educación Secundaria",
            data: niveles[turno].secundaria,
            cursos: [
              { title: "1° Secundaria", color: "#7E57C2", icon: <SchoolIcon /> },
              { title: "2° Secundaria", color: "#8E24AA", icon: <SchoolIcon /> },
              { title: "3° Secundaria", color: "#AB47BC", icon: <SchoolIcon /> },
              { title: "4° Secundaria", color: "#BA68C8", icon: <SchoolIcon /> },
              { title: "5° Secundaria", color: "#CE93D8", icon: <SchoolIcon /> },
              { title: "6° Secundaria", color: "#E1BEE7", icon: <SchoolIcon /> },
            ],
          },
        ].map((nivel, idx) => (
          <Box key={idx} sx={{ mb: 8 }}>
            {/* Header de sección */}
            <Box
              sx={{
                textAlign: "center",
                mb: 5,
                opacity: 0,
                animation: `${fadeInUp} 0.8s ease forwards ${1 + idx * 0.2}s`,
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1.8rem", md: "2.5rem" },
                  mb: 1,
                  background: isDark
                    ? "linear-gradient(135deg, #fff, #90caf9)"
                    : "linear-gradient(135deg, #01579b, #0288d1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {nivel.titulo}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Estado de cupos para el turno de {turno}
              </Typography>
            </Box>

            {/* Grid de cards */}
            <Grid container spacing={3} justifyContent="center">
              {nivel.cursos.map((curso, i) => {
                const g = nivel.data.find((c) => c.title === curso.title);
                if (!g) return null;
                const disponibles = g.total - g.ocupados;
                return (
                  <Grid
                    size={{xs:12, sm:6, md:nivel.cursos.length <= 2 ? 4 : 3}}
                    key={i}
                    sx={{
                      opacity: 0,
                      animation: `${fadeInUp} 0.6s ease forwards ${1.2 + idx * 0.2 + i * 0.1}s`,
                    }}
                  >
                    <CardIns
                      title={g.title}
                      edad={g.edad}
                      total={g.total}
                      disponibles={disponibles}
                      color={curso.color}
                      icon={curso.icon}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))}

        <Divider sx={{ my: 8, opacity: 0.3 }} />

        {/* Footer */}
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            color: "text.secondary",
            opacity: 0,
            animation: `${fadeInUp} 0.8s ease forwards 3s`,
          }}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            © {new Date().getFullYear()} Unidad Educativa Particular "La Voz de Cristo"
          </Typography>
          <Typography variant="caption">
            Plataforma de Preinscripción — Sistema de Gestión de Cupos
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Header;