"use client";
import React from "react";
import Grid from "@mui/material/Grid";
import { Typography, Button, useTheme, Box, Tooltip, Fade } from "@mui/material";
import Card from "./Card";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

function Nivels() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

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
        {/* ✨ Fondo dinámico animado */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: isDark
              ? "radial-gradient(circle at 20% 20%, #0d47a1, #000)"
              : "radial-gradient(circle at 20% 20%, #bbdefb, #fff)",
            opacity: 0.15,
            animation: "bgPulse 10s infinite alternate ease-in-out",
            zIndex: 0,
          }}
        />

        <Grid
          size={{ xs: 10, sm: 10, md: 10, lg: 10 }}
          offset={{ xs: 1 }}
          sx={{
            paddingTop: { xs: 5, sm: 5, md: 10, lg: 4 },
            zIndex: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: isDark ? "#fff" : "#01579b",
              fontWeight: "bold",
              fontSize: { xs: "1.5rem", md: "2.3rem" },
              lineHeight: 1.5,
              opacity: 0,
              transform: "translateY(20px)",
              animation: "fadeSlideIn 0.8s forwards",
            }}
          >
            Explora Nuestros Programas
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: isDark ? "#ddd" : "black",
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              lineHeight: 2,
              opacity: 0,
              transform: "translateY(20px)",
              animation: "fadeSlideIn 1s forwards",
              animationDelay: "0.2s",
            }}
          >
            Niveles Educativos
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: isDark ? "#aaa" : "#6c757d",
              opacity: 0,
              transform: "translateY(20px)",
              animation: "fadeSlideIn 1.2s forwards",
              animationDelay: "0.4s",
            }}
          >
            Acompañamos el crecimiento de nuestros estudiantes en cada etapa de su formación.
          </Typography>
        </Grid>

        {/* ✨ Cards interactivas con tooltips */}
        {[
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
        ].map((nivel, index) => (
          <Grid
            key={index}
            size={{ xs: 10, sm: 5, md: 3.3, lg: 3 }}
            offset={{ xs: 1.5, sm: index === 0 ? 1 : 0, md: 1, lg: index === 0 ? 1.5 : 0 }}
            sx={{
              zIndex: 2,
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-10px) scale(1.03)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              },
            }}
          >
            <Tooltip
              title="✨ Haz clic para descubrir más sobre este nivel educativo"
              placement="top"
              arrow
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 600 }}
            >
              <Box sx={{ cursor: "pointer" }}>
                <Card {...nivel} />
              </Box>
            </Tooltip>
          </Grid>
        ))}

        {/* ✨ Botón con animación */}
        <Grid
          size={{ xs: 10, sm: 4, md: 4, lg: 4 }}
          offset={{ xs: 1.5, sm: 4, md: 4, lg: 5 }}
          sx={{ textAlign: "center", zIndex: 2 }}
        >
          <Button
            variant="contained"
            endIcon={<ArrowForwardIosIcon />}
            sx={{
              mt: 4,
              background: isDark ? "#1565c0" : "#0288d1",
              fontWeight: "bold",
              borderRadius: "30px",
              padding: "10px 25px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              transition: "all 0.4s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
                background: isDark ? "#1e88e5" : "#0277bd",
              },
            }}
          >
            Explora nuestra malla curricular
          </Button>
        </Grid>
      </Grid>

      <style>{`
        @keyframes fadeSlideIn {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes bgPulse {
          0% { transform: scale(1); opacity: 0.1; }
          100% { transform: scale(1.1); opacity: 0.25; }
        }
      `}</style>
    </>
  );
}

export default Nivels;
