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

  const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  `;

  const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  `;

  const bounceSlow = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  `;

  return (
    <Box
      id="Inicio"
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        backgroundImage: "url('/Fondo.svg')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Navbar />

      <Box
        sx={{
          maxWidth: "1200px",
          width: "100%",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          alignItems: "center",
          gap: 6
        }}
      >
        {/* Texto */}
        <Box
          sx={{
            textAlign: { xs: "center", md: "left" },
            animation: `${fadeIn} 1s ease forwards`
          }}
        >
          {/* Primera parte con gradiente azul */}
          <Typography
            variant="h1"
            sx={{
              fontFamily: "Roboto",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem", lg: "3.6rem" },
              fontWeight: "bold",
              mb: 1,
              background: isDark
                ? "linear-gradient(135deg, #90caf9, #bbdefb)"
                : "linear-gradient(135deg, #01579b, #0288d1, #29b6f6)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: `${shimmer} 3s linear infinite`,
              textShadow: isDark
                ? "0 0 40px rgba(144, 202, 249, 0.3)"
                : "0 0 40px rgba(1, 87, 155, 0.2)"
            }}
          >
            Educación Con Valores Cristianos y
          </Typography>

          {/* Segunda parte con amarillo */}
          <Typography
            variant="h1"
            sx={{
              fontFamily: "Roboto",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem", lg: "3.6rem" },
              fontWeight: "bold",
              color: isDark ? "#fdd835" : "#facc15",
              textShadow: isDark
                ? "0 0 20px rgba(255, 235, 59, 0.5)"
                : "0 0 20px rgba(251, 192, 45, 0.5)",
              animation: "pulse 2s ease-in-out infinite alternate",
              "@keyframes pulse": {
                from: { opacity: 1 },
                to: { opacity: 0.7 }
              }
            }}
          >
             Excelencia Académica.
          </Typography>

          <Typography
            variant="h2"
            sx={{
              color: "rgba(255,255,255,0.9)",
              mt: 2,
              animation: `${fadeIn} 1.5s ease forwards`
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
              animation: `${fadeIn} 2s ease forwards`
            }}
          >
            <Button
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
                  backgroundColor: "#fbc02d",
                  transform: "scale(1.05)"
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
                color: isDark ? "#fff" : "#000",
                borderColor: isDark ? "#90caf9" : "#0288d1",
                px: 4,
                py: 1.5,
                fontWeight: "bold",
                borderRadius: "10px",
                "&:hover": {
                  backgroundColor: isDark ? "#90caf9" : "#0288d1",
                  color: "#fff",
                  transform: "scale(1.05)"
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
