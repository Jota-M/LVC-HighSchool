'use client';

import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "../components/HomePage/Footer";
import '@fontsource/roboto';

import {
  Typography,
  Button,
  Box,
  Paper,
  useTheme,
  Chip,
  Container,
  Grid,
} from "@mui/material";
import { keyframes } from "@mui/system";

// Íconos representativos
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@mui/icons-material/Check";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SearchIcon from "@mui/icons-material/Search";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";

// Animaciones inspiradas en la página principal
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const glowPulse = keyframes`
  0%, 100% {
    text-shadow: 
      0 0 10px rgba(250, 204, 21, 0.5),
      0 0 20px rgba(250, 204, 21, 0.4),
      0 0 30px rgba(250, 204, 21, 0.2);
  }
  50% {
    text-shadow: 
      0 0 20px rgba(250, 204, 21, 0.8),
      0 0 30px rgba(250, 204, 21, 0.6),
      0 0 40px rgba(250, 204, 21, 0.3);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

export default function PreInscripcionPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        background: isDark
          ? "linear-gradient(135deg, #010c17 0%, #090B26 50%, #010c17 100%)"
          : "linear-gradient(135deg, #fdfcfb 0%, #f0f7ff 50%, #fdfcfb 100%)",
        color: isDark ? "#ffffff" : "#0f172a",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Fuentes oficiales de la página principal */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Bebas Neue&display=swap"
        rel="stylesheet"
      />

      {/* Navbar simplificado */}
      <Navbar />

      {/* Fondo radial sutil como en About de la página principal */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "500px",
          background: isDark
            ? "radial-gradient(ellipse at top, rgba(1, 87, 155, 0.18), transparent 70%)"
            : "radial-gradient(ellipse at top, rgba(1, 87, 155, 0.08), transparent 70%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: { xs: 15, md: 18 } }}>
        {/* ======================================================== */}
        {/* HERO SECTION                                             */}
        {/* ======================================================== */}
        <Box
          sx={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2.5,
            px: { xs: 2, md: 4 },
            pb: 6,
          }}
        >
          {/* Badge superior animado */}
          <Chip
            icon={<RocketLaunchIcon sx={{ color: "#facc15 !important" }} />}
            label="ADMISIONES & PREINSCRIPCIÓN 2026"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              letterSpacing: "0.08em",
              px: 2,
              py: 2.2,
              borderRadius: "50px",
              bgcolor: isDark ? "rgba(250, 204, 21, 0.12)" : "rgba(1, 87, 155, 0.08)",
              color: isDark ? "#facc15" : "#01579b",
              border: `1.5px solid ${isDark ? "rgba(250, 204, 21, 0.3)" : "rgba(1, 87, 155, 0.2)"}`,
              boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
              animation: `${fadeInUp} 0.6s ease-out forwards`,
              "& .MuiChip-icon": {
                animation: `${float} 2s ease-in-out infinite`,
              },
            }}
          />

          {/* Título Principal */}
          <Box sx={{ animation: `${fadeInUp} 0.8s ease-out forwards` }}>
            <Typography
              variant="h1"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: { xs: "1.9rem", sm: "2.6rem", md: "3.4rem" },
                fontWeight: 900,
                color: isDark ? "#ffffff" : "#01579b",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                lineHeight: 1.2,
                mb: 1,
              }}
            >
              ¡Asegura el futuro de tus hijos!
            </Typography>

            <Typography
              variant="h2"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: { xs: "1.7rem", sm: "2.4rem", md: "3rem" },
                fontWeight: 900,
                color: "#facc15",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                lineHeight: 1.2,
                animation: `${glowPulse} 3s ease-in-out infinite`,
              }}
            >
              Educación con Valores Cristianos
            </Typography>

            <Box
              sx={{
                width: 120,
                height: 4,
                background: "linear-gradient(90deg, #01579b, #facc15)",
                mx: "auto",
                borderRadius: 2,
                mt: 2.5,
                mb: 1,
              }}
            />
          </Box>

          {/* Subtítulo descriptivo */}
          <Typography
            variant="body1"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              maxWidth: 720,
              color: isDark ? "rgba(255, 255, 255, 0.8)" : "#475569",
              lineHeight: 1.8,
              fontSize: { xs: "1rem", md: "1.15rem" },
              px: 2,
              animation: `${fadeIn} 0.8s ease forwards 0.3s`,
            }}
          >
            Inscripciones abiertas para el año lectivo 2026. Completa el proceso de preinscripción de forma{" "}
            <strong style={{ color: isDark ? "#facc15" : "#01579b" }}>100% digital</strong> y asegura tu cupo en pocos pasos.
          </Typography>

          {/* Botones de Acción (Sin Ver Cupos ni Estudiante Regular) */}
          <Box
            sx={{
              display: "flex",
              gap: 2.5,
              flexWrap: "wrap",
              justifyContent: "center",
              mt: 2,
              animation: `${fadeInUp} 0.8s ease forwards 0.4s`,
            }}
          >
            {/* Botón Principal Dorado */}
            <Button
              variant="contained"
              href="/PreInscripcion/registro"
              startIcon={<PersonAddIcon />}
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                backgroundColor: "#facc15",
                color: "#111827",
                px: 4.5,
                py: 1.6,
                fontSize: "0.95rem",
                fontWeight: 900,
                borderRadius: "12px",
                textTransform: "none",
                letterSpacing: "0.02em",
                boxShadow: "0px 6px 20px rgba(250, 204, 21, 0.35)",
                "&:hover": {
                  backgroundColor: "#f57f17",
                  transform: "translateY(-3px)",
                  boxShadow: "0px 10px 25px rgba(249, 168, 37, 0.45)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Iniciar Preinscripción
            </Button>

            {/* Botón Consultar Estado */}
            <Button
              variant="outlined"
              href="/PreInscripcion/estado"
              startIcon={<SearchIcon />}
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                color: isDark ? "#ffffff" : "#01579b",
                borderColor: isDark ? "rgba(255,255,255,0.4)" : "#0277bd",
                borderWidth: 2,
                px: 3.5,
                py: 1.6,
                fontSize: "0.95rem",
                fontWeight: 700,
                borderRadius: "12px",
                textTransform: "none",
                "&:hover": {
                  borderWidth: 2,
                  borderColor: isDark ? "#facc15" : "#01579b",
                  backgroundColor: isDark ? "rgba(250, 204, 21, 0.1)" : "rgba(1, 87, 155, 0.08)",
                  transform: "translateY(-3px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Consultar Estado
            </Button>
          </Box>

          {/* Stats Cards */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: 2.5, md: 5 },
              flexWrap: "wrap",
              justifyContent: "center",
              mt: 4,
              animation: `${fadeInUp} 0.8s ease forwards 0.5s`,
            }}
          >
            {[
              { label: "Plataforma virtual", value: "24/7", icon: <TrendingUpIcon />, color: "#01579b" },
              { label: "Tasa de satisfacción", value: "98%", icon: <CheckCircleIcon />, color: "#10b981" },
              { label: "Niveles Educativos", value: "3", icon: <AutoAwesomeIcon />, color: "#f59e0b" },
            ].map((stat, i) => (
              <Box
                key={i}
                sx={{
                  textAlign: "center",
                  minWidth: { xs: 130, sm: 160 },
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: "18px",
                  background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                  border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(1, 87, 155, 0.12)"}`,
                  boxShadow: isDark ? "0 8px 25px rgba(0,0,0,0.3)" : "0 8px 25px rgba(1, 87, 155, 0.06)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    borderColor: stat.color,
                    boxShadow: `0 12px 30px ${stat.color}30`,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    p: 1,
                    borderRadius: "50%",
                    background: `${stat.color}15`,
                    color: stat.color,
                    mb: 1,
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: stat.color,
                    fontWeight: 900,
                    fontSize: { xs: "1.3rem", md: "1.6rem" },
                    mb: 0.5,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: isDark ? "#94a3b8" : "#64748b",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Línea divisoria de estilo principal */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 1000,
            height: 3,
            background: "linear-gradient(90deg, #01579b, #facc15, #01579b)",
            mx: "auto",
            borderRadius: 2,
            my: { xs: 4, md: 6 },
          }}
        />

        {/* ======================================================== */}
        {/* PROCESO DE PREINSCRIPCIÓN (ADAPTADO AL PROCESO REAL)     */}
        {/* ======================================================== */}
        <Box sx={{ py: { xs: 4, md: 6 }, textAlign: "center" }}>
          <Typography
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              color: isDark ? "#facc15" : "#01579b",
              fontWeight: 800,
              fontSize: "0.85rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            PROCESO SIMPLE Y RÁPIDO
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              color: isDark ? "#ffffff" : "#0f172a",
              mb: 2,
              fontSize: { xs: "1.8rem", md: "2.5rem" },
              textTransform: "uppercase",
            }}
          >
            Proceso de Preinscripción
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              maxWidth: 680,
              mx: "auto",
              color: isDark ? "#94a3b8" : "#64748b",
              mb: 6,
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              lineHeight: 1.7,
            }}
          >
            Sigue estos simples pasos para completar la preinscripción de tu hijo de manera rápida y segura
          </Typography>

          {/* Grid de 3 Pasos Adaptados al Proceso Real */}
          <Grid container spacing={3.5} justifyContent="center">
            {/* Paso 1: Datos del estudiante */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  borderRadius: "20px",
                  background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                  border: `2px solid ${isDark ? "rgba(1, 87, 155, 0.3)" : "rgba(1, 87, 155, 0.15)"}`,
                  boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(1, 87, 155, 0.05)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: "#01579b",
                  },
                  "&:hover": {
                    transform: "translateY(-8px)",
                    borderColor: "#01579b",
                    boxShadow: "0 16px 35px rgba(1, 87, 155, 0.2)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    bgcolor: "rgba(1, 87, 155, 0.12)",
                    color: "#01579b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2.5,
                  }}
                >
                  <LooksOneIcon sx={{ fontSize: 36 }} />
                </Box>

                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "20px",
                    bgcolor: "rgba(1, 87, 155, 0.08)",
                    color: "#01579b",
                    mb: 2,
                  }}
                >
                  <PersonAddIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem", fontWeight: 700 }}>
                    Paso 1
                  </Typography>
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 800,
                    fontSize: "1.25rem",
                    color: isDark ? "#ffffff" : "#0f172a",
                    mb: 1.5,
                  }}
                >
                  Datos del estudiante
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: isDark ? "#94a3b8" : "#64748b",
                    lineHeight: 1.7,
                    fontSize: "0.9rem",
                  }}
                >
                  Completa la información personal, nivel y grado al que postula el estudiante (con opción de registrar hermanos).
                </Typography>
              </Paper>
            </Grid>

            {/* Paso 2: Datos de padres / tutores */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  borderRadius: "20px",
                  background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                  border: `2px solid ${isDark ? "rgba(250, 204, 21, 0.3)" : "rgba(245, 158, 11, 0.2)"}`,
                  boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(245, 158, 11, 0.05)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: "#facc15",
                  },
                  "&:hover": {
                    transform: "translateY(-8px)",
                    borderColor: "#facc15",
                    boxShadow: "0 16px 35px rgba(250, 204, 21, 0.25)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    bgcolor: "rgba(250, 204, 21, 0.15)",
                    color: "#f59e0b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2.5,
                  }}
                >
                  <LooksTwoIcon sx={{ fontSize: 36 }} />
                </Box>

                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "20px",
                    bgcolor: "rgba(250, 204, 21, 0.12)",
                    color: "#f59e0b",
                    mb: 2,
                  }}
                >
                  <FamilyRestroomIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem", fontWeight: 700 }}>
                    Paso 2
                  </Typography>
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 800,
                    fontSize: "1.25rem",
                    color: isDark ? "#ffffff" : "#0f172a",
                    mb: 1.5,
                  }}
                >
                  Datos de los padres
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: isDark ? "#94a3b8" : "#64748b",
                    lineHeight: 1.7,
                    fontSize: "0.9rem",
                  }}
                >
                  Ingresa los datos de los padres o tutor legal y define el contacto principal para las coordinaciones y notificaciones oficiales.
                </Typography>
              </Paper>
            </Grid>

            {/* Paso 3: Confirmación y Código Único */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  borderRadius: "20px",
                  background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                  border: `2px solid ${isDark ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 0.2)"}`,
                  boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(16, 185, 129, 0.05)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: "#10b981",
                  },
                  "&:hover": {
                    transform: "translateY(-8px)",
                    borderColor: "#10b981",
                    boxShadow: "0 16px 35px rgba(16, 185, 129, 0.25)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    bgcolor: "rgba(16, 185, 129, 0.12)",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2.5,
                  }}
                >
                  <Looks3Icon sx={{ fontSize: 36 }} />
                </Box>

                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "20px",
                    bgcolor: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                    mb: 2,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem", fontWeight: 700 }}>
                    Paso 3
                  </Typography>
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 800,
                    fontSize: "1.25rem",
                    color: isDark ? "#ffffff" : "#0f172a",
                    mb: 1.5,
                  }}
                >
                  Confirmación
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: isDark ? "#94a3b8" : "#64748b",
                    lineHeight: 1.7,
                    fontSize: "0.9rem",
                  }}
                >
                  Recibe tu Código Único de Preinscripción para consultar el avance de tu trámite y coordinar la entrevista de admisión.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Línea divisoria */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 1000,
            height: 3,
            background: "linear-gradient(90deg, #01579b, #facc15, #01579b)",
            mx: "auto",
            borderRadius: 2,
            my: { xs: 5, md: 7 },
          }}
        />

        {/* ======================================================== */}
        {/* REQUISITOS DE INSCRIPCIÓN                                */}
        {/* ======================================================== */}
        <Box sx={{ pb: { xs: 10, md: 14 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3.5, sm: 5, md: 6 },
              borderRadius: "24px",
              bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
              border: `2px solid ${isDark ? "rgba(1, 87, 155, 0.3)" : "rgba(1, 87, 155, 0.12)"}`,
              backdropFilter: "blur(12px)",
              boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 60px rgba(1, 87, 155, 0.08)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "5px",
                background: "linear-gradient(90deg, #01579b, #0288d1, #facc15)",
              },
            }}
          >
            <Typography
              variant="h3"
              textAlign="center"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 900,
                color: isDark ? "#ffffff" : "#0f172a",
                mb: 1.5,
                fontSize: { xs: "1.8rem", md: "2.3rem" },
                textTransform: "uppercase",
              }}
            >
              Requisitos de inscripción
            </Typography>

            <Typography
              variant="body1"
              textAlign="center"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                color: isDark ? "#94a3b8" : "#64748b",
                mb: 6,
                fontSize: { xs: "0.95rem", md: "1.05rem" },
              }}
            >
              Asegúrate de tener toda la documentación necesaria antes de comenzar
            </Typography>

            <Grid container spacing={3.5} justifyContent="center">
              {/* Columna 1: Documentos del estudiante */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: "16px",
                    bgcolor: isDark ? "rgba(2, 136, 209, 0.08)" : "rgba(2, 136, 209, 0.04)",
                    border: "1.5px solid",
                    borderColor: isDark ? "rgba(2, 136, 209, 0.3)" : "rgba(2, 136, 209, 0.2)",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 800,
                      fontSize: "1.05rem",
                      color: isDark ? "#38bdf8" : "#01579b",
                      mb: 2.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: "10px",
                        bgcolor: "rgba(2, 136, 209, 0.15)",
                        color: "#0288d1",
                        display: "flex",
                      }}
                    >
                      <PersonAddIcon sx={{ fontSize: 20 }} />
                    </Box>
                    Documentos del estudiante
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8 }}>
                    {["Cédula de identidad (fotocopia legible)", "Certificado de nacimiento original", "Libreta de notas de la última gestión"].map(
                      (text, idx) => (
                        <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                          <CheckIcon sx={{ color: "#10b981", fontSize: 18, flexShrink: 0 }} />
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "'Montserrat', sans-serif",
                              color: isDark ? "#cbd5e1" : "#334155",
                              fontSize: "0.88rem",
                            }}
                          >
                            {text}
                          </Typography>
                        </Box>
                      )
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Columna 2: Documentos del representante */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: "16px",
                    bgcolor: isDark ? "rgba(245, 158, 11, 0.08)" : "rgba(245, 158, 11, 0.04)",
                    border: "1.5px solid",
                    borderColor: isDark ? "rgba(245, 158, 11, 0.3)" : "rgba(245, 158, 11, 0.2)",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 800,
                      fontSize: "1.05rem",
                      color: isDark ? "#fbbf24" : "#d97706",
                      mb: 2.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: "10px",
                        bgcolor: "rgba(245, 158, 11, 0.15)",
                        color: "#f59e0b",
                        display: "flex",
                      }}
                    >
                      <FamilyRestroomIcon sx={{ fontSize: 20 }} />
                    </Box>
                    Documentos del representante
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8 }}>
                    {["Cédula de identidad de padre, madre o tutor", "Teléfono de contacto y WhatsApp activo", "Dirección domiciliaria actual"].map(
                      (text, idx) => (
                        <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                          <CheckIcon sx={{ color: "#10b981", fontSize: 18, flexShrink: 0 }} />
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "'Montserrat', sans-serif",
                              color: isDark ? "#cbd5e1" : "#334155",
                              fontSize: "0.88rem",
                            }}
                          >
                            {text}
                          </Typography>
                        </Box>
                      )
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Columna 3: Información adicional */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: "16px",
                    bgcolor: isDark ? "rgba(16, 185, 129, 0.08)" : "rgba(16, 185, 129, 0.04)",
                    border: "1.5px solid",
                    borderColor: isDark ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 0.2)",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 800,
                      fontSize: "1.05rem",
                      color: isDark ? "#34d399" : "#059669",
                      mb: 2.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: "10px",
                        bgcolor: "rgba(16, 185, 129, 0.15)",
                        color: "#10b981",
                        display: "flex",
                      }}
                    >
                      <AccessTimeIcon sx={{ fontSize: 20 }} />
                    </Box>
                    Información adicional
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <AccessTimeIcon sx={{ color: "#0288d1", fontSize: 18, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ fontFamily: "'Montserrat', sans-serif", color: isDark ? "#cbd5e1" : "#334155", fontSize: "0.88rem" }}>
                        Revisión: 2-3 días hábiles
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <WhatsAppIcon sx={{ color: "#10b981", fontSize: 18, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ fontFamily: "'Montserrat', sans-serif", color: isDark ? "#cbd5e1" : "#334155", fontSize: "0.88rem" }}>
                        Avisos por WhatsApp y Correo
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <LocalPhoneIcon sx={{ color: "#f59e0b", fontSize: 18, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ fontFamily: "'Montserrat', sans-serif", color: isDark ? "#cbd5e1" : "#334155", fontSize: "0.88rem" }}>
                        Soporte: +591 69624189 - 76162425
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>

      {/* Footer oficial de la página principal */}
      <Footer />
    </Box>
  );
}