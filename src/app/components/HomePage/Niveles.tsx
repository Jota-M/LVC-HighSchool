// Nivels.tsx - Componente mejorado
"use client";
import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import { Typography, Button, useTheme, Box, Tooltip, Fade } from "@mui/material";
import Card from "./Card";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { keyframes } from "@mui/system";

// Animaciones personalizadas
const fadeSlideIn = keyframes`
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const bgPulse = keyframes`
  0% { transform: scale(1) rotate(0deg); opacity: 0.15; }
  50% { transform: scale(1.1) rotate(5deg); opacity: 0.25; }
  100% { transform: scale(1) rotate(0deg); opacity: 0.15; }
`;

const floatParticle = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px); }
  33% { transform: translateY(-30px) translateX(15px); }
  66% { transform: translateY(-15px) translateX(-15px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

function Nivels() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const niveles = [
    {
      link: "/mallacurricular/inicial",
      init: "Initial",
      imageurl: "/Nivels/Initial.jpg",
      title: "Educación Inicial",
      paragraph:
        "Primeros pasos en el aprendizaje con metodología lúdica, desarrollo psicomotor y formación en valores cristianos.",
      paragraph1: "3 a 5 años",
      paragraph2: "Desarrollo Integral",
      paragraph3: "Valores Cristianos",
    },
    {
      link: "/mallacurricular/primaria",
      init: "Primary",
      imageurl: "/Nivels/Primary-3.jpg",
      title: "Educación Primaria",
      paragraph:
        "Formación académica sólida con énfasis en lectoescritura, matemáticas, ciencias y desarrollo del pensamiento crítico.",
      paragraph1: "6 a 12 años",
      paragraph2: "Bases académicas sólidas",
      paragraph3: "Pensamiento crítico",
    },
    {
      link: "/mallacurricular/secundaria",
      init: "Secondary",
      imageurl: "/Nivels/Secondary-1.jpg",
      title: "Educación Secundaria",
      paragraph:
        "Preparación integral para la educación superior con bachillerato en ciencias, liderazgo y servicio comunitario.",
      paragraph1: "12 a 18 años",
      paragraph2: "Bachillerato en ciencias",
      paragraph3: "Liderazgo cristiano",
    },
  ];

  return (
    <>
      <Grid
        id="Niveles"
        container
        spacing={3}
        sx={{
          minHeight: "100vh",
          padding: { xs: 2, sm: 2, md: 2, lg: 6 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Fondo dinámico mejorado con múltiples capas */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: isDark
              ? "radial-gradient(circle at 20% 20%, #0d47a1, #000)"
              : "radial-gradient(circle at 20% 20%, #bbdefb, #fff)",
            opacity: 0.15,
            animation: `${bgPulse} 15s infinite alternate ease-in-out`,
            zIndex: 0,
          }}
        />

        {/* Segunda capa de fondo */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: isDark
              ? "radial-gradient(circle at 80% 80%, #1565c0, transparent)"
              : "radial-gradient(circle at 20% 20%, #90caf9, transparent)",
            opacity: 0.1,
            animation: `${bgPulse} 20s infinite alternate-reverse ease-in-out`,
            zIndex: 0,
          }}
        />

        {/* Header con badge animado */}
        <Grid
          size={{ xs: 10, sm: 10, md: 10, lg: 10 }}
          offset={{ xs: 1 }}
          sx={{
            paddingTop: { xs: 5, sm: 5, md: 10, lg: 4 },
            zIndex: 2,
            textAlign: "center",
          }}
        >
          {/* Título principal con gradiente */}
          <Typography
            variant="h3"
            sx={{
              color: isDark ? "#fff" : "#01579b",
              fontWeight: "bold",
              fontSize: { xs: "2rem", md: "3rem", lg: "3.5rem" },
              lineHeight: 1.3,
              mb: 2,
              opacity: 0,
              animation: `${fadeSlideIn} 1s forwards`,
              animationDelay: "0.2s",
              "& .highlight": {
                background: "linear-gradient(135deg, #facc15, #ffd54f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "inline-block",
                animation: `${shimmer} 3s infinite linear`,
                backgroundSize: "1000px 100%",
              },
            }}
          >
            Explora Nuestros{" "}
            <Box component="span" className="highlight">
              Niveles Educativos
            </Box>
          </Typography>

          {/* Subtítulo */}
          <Typography
            variant="h6"
            sx={{
              color: isDark ? "#ddd" : "#555",
              fontSize: { xs: "1rem", md: "1.2rem" },
              lineHeight: 1.8,
              maxWidth: "700px",
              mx: "auto",
              opacity: 0,
              animation: `${fadeSlideIn} 1.2s forwards`,
              animationDelay: "0.4s",
            }}
          >
            Acompañamos el crecimiento de nuestros estudiantes en cada etapa de su formación
            académica y espiritual
          </Typography>
        </Grid>

        {/* Cards con animaciones mejoradas */}
        {niveles.map((nivel, index) => (
          <Grid
            key={index}
            size={{ xs: 10, sm: 5, md: 3.3, lg: 3 }}
            offset={{ xs: 1, sm: index === 0 ? 1 : 0, md: 1, lg: index === 0 ? 1.5 : 0 }}
            sx={{
              zIndex: 2,
              opacity: 0,
              transform: "translateY(50px)",
              animation: `${fadeSlideIn} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
              animationDelay: `${0.6 + index * 0.2}s`,
            }}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <Tooltip
              title={
                <Box sx={{ p: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                    Descubre más sobre La {nivel.title}
                  </Typography>
                  <Typography variant="caption">
                    Haz clic para ver el plan de estudios completo
                  </Typography>
                </Box>
              }
              placement="top"
              arrow
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 600 }}
            >
              <Box
                sx={{
                  cursor: "pointer",
                  transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: hoveredCard === index 
                    ? "translateY(-15px) scale(1.03)" 
                    : "translateY(0) scale(1)",
                  filter: hoveredCard !== null && hoveredCard !== index 
                    ? "brightness(0.7) blur(2px)" 
                    : "brightness(1) blur(0px)",
                }}
              >
                <Card {...nivel} />
              </Box>
            </Tooltip>
          </Grid>
        ))}

        {/* Divisor decorativo */}
        <Grid
          size={{ xs: 10 }}
          offset={{ xs: 1 }}
          sx={{
            zIndex: 2,
            display: "flex",
            justifyContent: "center",
            mt: 4,
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 3,
              background: "linear-gradient(90deg, transparent, #01579b, #facc15, transparent)",
              borderRadius: 2,
              opacity: 0,
              animation: `${fadeSlideIn} 1s forwards`,
              animationDelay: "1.4s",
            }}
          />
        </Grid>

        {/* Botón CTA mejorado */}
        <Grid
          size={{ xs: 10, sm: 8, md: 6, lg: 12 }}
          offset={{ xs: 1, sm: 2, md: 3, lg: 0 }}
          sx={{
            textAlign: "center",
            zIndex: 2,
            mt: 2,
            opacity: 0,
            animation: `${fadeSlideIn} 1s forwards`,
            animationDelay: "1.6s",
          }}
        >
          <Button
            variant="contained"
            endIcon={<ArrowForwardIosIcon />}
            href="/mallacurricular"
            sx={{
              mt: 2,
              background: isDark
                ? "linear-gradient(135deg, #1565c0, #0288d1)"
                : "linear-gradient(135deg, #01579b, #0288d1)",
              fontWeight: "bold",
              fontSize: { xs: "0.9rem", md: "1rem" },
              borderRadius: "50px",
              padding: { xs: "12px 30px", md: "14px 40px" },
              boxShadow: "0 8px 25px rgba(1, 87, 155, 0.4)",
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
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                transition: "left 0.6s ease",
              },
              "&:hover": {
                transform: "translateY(-5px) scale(1.05)",
                boxShadow: "0 12px 35px rgba(1, 87, 155, 0.5)",
                background: isDark
                  ? "linear-gradient(135deg, #1e88e5, #039be5)"
                  : "linear-gradient(135deg, #0277bd, #01579b)",
                "&::before": {
                  left: "100%",
                },
              },
            }}
          >
            Explora nuestra malla curricular
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

export default Nivels;