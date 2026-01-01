import React from "react";
import '@fontsource/roboto';
import {
  Typography,
  useTheme,
  Button,
  Box,
  keyframes
} from "@mui/material";
import Navbar from "./Navbar";

function Landing() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Animaciones simples para mobile, completas para desktop
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

  // Animaciones complejas solo para desktop
  const glowPulse = keyframes`
    0%, 100% {
      text-shadow: 
        0 0 10px rgba(250, 204, 21, 0.5),
        0 0 20px rgba(250, 204, 21, 0.4),
        0 0 30px rgba(250, 204, 21, 0.3),
        0 0 40px rgba(250, 204, 21, 0.2),
        0 5px 15px rgba(0, 0, 0, 0.3);
    }
    50% {
      text-shadow: 
        0 0 20px rgba(250, 204, 21, 0.8),
        0 0 30px rgba(250, 204, 21, 0.6),
        0 0 40px rgba(250, 204, 21, 0.4),
        0 0 60px rgba(250, 204, 21, 0.3),
        0 5px 20px rgba(0, 0, 0, 0.4);
    }
  `;

  const shimmer = keyframes`
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  `;

  return (
    <Box
      id="Inicio"
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        backgroundImage: "url('/Fondos/fondo.png')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(to right, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)",
          zIndex: 0,
        },
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800;900&family=Bebas+Neue&display=swap" rel="stylesheet"></link>
      <Navbar />

      <Box
        sx={{
          maxWidth: "1200px",
          width: "100%",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          alignItems: "center",
          gap: 6,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", md: "90%" },
            textAlign: { xs: "center", md: "left" },
          }}
        >
          {/* Título principal mejorado */}
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="h1"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: { xs: "1.2rem", sm: "1.8rem", md: "2.5rem", lg: "3rem" },
                fontWeight: "900",
                color: "#facc15",
                animation: `${fadeInUp} 0.6s ease-out forwards`,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                lineHeight: 1.2,
                mb: 1,
                textShadow: {
                  xs: "0 2px 8px rgba(0, 0, 0, 0.5)",
                  md: `0 0 20px rgba(250, 204, 21, 0.4),
                       0 5px 15px rgba(0, 0, 0, 0.5),
                       0 10px 30px rgba(0, 0, 0, 0.3)`
                },
              }}
            >
              Educación Con
            </Typography>

            <Typography
              variant="h1"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: { xs: "2rem", sm: "2.8rem", md: "3.5rem", lg: "3rem" },
                fontWeight: "900",
                color: "#facc15",
                animation: {
                  xs: `${fadeInUp} 0.6s ease-out 0.15s forwards`,
                  md: `${fadeInUp} 1s ease-out 0.2s forwards, ${glowPulse} 3s ease-in-out 1.5s infinite`
                },
                opacity: 0,
                animationFillMode: "forwards",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                lineHeight: 1.2,
                textShadow: {
                  xs: "0 2px 8px rgba(0, 0, 0, 0.5)",
                  md: `0 0 20px rgba(250, 204, 21, 0.4),
                       0 5px 15px rgba(0, 0, 0, 0.5),
                       0 10px 30px rgba(0, 0, 0, 0.3)`
                },
              }}
            >
              Valores Cristianos
            </Typography>
          </Box>

          {/* Excelencia Académica con diseño impactante */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3.2rem", lg: "2.8rem" },
                fontWeight: "400",
                color: "#fff",
                animation: {
                  xs: `${fadeInUp} 0.6s ease-out 0.3s forwards`,
                  md: `${fadeInUp} 0.8s ease-out 0.4s forwards`
                },
                opacity: 0,
                animationFillMode: "forwards",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                position: "relative",
                display: "inline-block",
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "50%",
                  left: "-10px",
                  right: "-10px",
                  height: "60%",
                  background: "rgba(2, 119, 189, 0.15)",
                  transform: "translateY(-50%) skewX(-10deg)",
                  zIndex: -1,
                  borderRadius: "8px",
                  display: { xs: "none", md: "block" }
                },
                
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: "-8px",
                  left: "0",
                  width: "100%",
                  height: "4px",
                  background: "linear-gradient(90deg, transparent, #facc15, transparent)",
                  animation: {
                    xs: "none",
                    md: `${shimmer} 3s ease-in-out 2s infinite`
                  },
                  display: { xs: "none", md: "block" }
                }
              }}
            >
              y Excelencia Académica
            </Typography>
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: "1rem", sm: "1.25rem", md: "1rem" },
              color: "rgba(255,255,255,0.95)",
              fontFamily: "'Montserrat', sans-serif",
              animation: `${fadeIn} 0.6s ease forwards 0.5s`,
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            Unidad Educativa Particular La Voz de Cristo.
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              justifyContent: { xs: "center", md: "flex-start" },
              mt: 4,
              animation: `${fadeIn} 0.6s ease forwards 0.7s`,
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            <Button
            href="#Nosotros"
              variant="contained"
              sx={{
                backgroundColor: "#facc15",
                color: "#111",
                px: 4,
                py: 1.5,
                fontWeight: "bold",
                borderRadius: "10px",
                boxShadow: "0px 4px 15px rgba(0,0,0,0.3)",
                "&:hover": {
                  backgroundColor: "#f57f17",
                  transform: { xs: "none", md: "translateY(-3px)" },
                  boxShadow: {
                    xs: "0px 4px 15px rgba(0,0,0,0.3)",
                    md: "0px 8px 25px rgba(249, 168, 37, 0.4)"
                  },
                },
                transition: "all 0.3s ease"
              }}
            >
              Conócenos
            </Button>

            <Button
              href="#Contactos"
              variant="outlined"
              sx={{
                color: "#fff",
                borderColor: "#0277bd",
                borderWidth: 2,
                px: 4,
                py: 1.5,
                fontWeight: "bold",
                borderRadius: "10px",
                "&:hover": {
                  backgroundColor: "#0277bd",
                  color: "#fff",
                  transform: { xs: "none", md: "translateY(-3px)" },
                  boxShadow: {
                    xs: "none",
                    md: "0px 8px 25px rgba(2, 119, 189, 0.4)"
                  },
                },
                transition: "all 0.3s ease"
              }}
            >
              Solicitar información
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Landing;