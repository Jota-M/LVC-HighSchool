import React from "react";
import { Box, Typography, Grid, useTheme } from "@mui/material";
import Title from "./Title";
import Paragrafth from "./Paragrafth";
import Pils from "./Pils";

interface ItemProps {
  title: string;
  text: string;
  isDark: boolean;
  centered: boolean;
}

function About() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Box id='Nosotros'
      sx={{
        backgroundColor: isDarkMode ? "#010c17" : "#fff",
        color: isDarkMode ? "#fff" : "#000",
        py: 10,
        transition: "background-color 0.5s ease, color 0.5s ease",
        overflowX: "hidden",
      }}
    >
      <Grid
        container
        spacing={6}
        justifyContent="center"
        alignItems="flex-start"
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          px: 3,
        }}
      >
        {/* --- Propósito --- */}
          <Grid size={{ xs: 12, md: 6, lg: 6 }}>
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Title text="Sobre Nosotros" />
              <Typography
            variant="h3"
            sx={{
              color: '#01579b',
              fontWeight: 'bold',
              fontSize: {
                xs: '1.8rem',
                sm: '2rem',
                md: '2.5rem',
                lg: '3rem',
              },
              lineHeight: 1.3,
              mb: 2,
              textShadow: '0 0 8px rgba(21, 101, 192, 0.3)',
            }}
          >
            Una educación con{' '}
            <Box component="span" sx={{ color: '#facc15', textShadow: '0 0 10px rgba(250, 204, 21, 0.5)' }}>
              propósito eterno
            </Box>
             </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 2,
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.15rem" },
                  lineHeight: 1.6,
                  color: isDarkMode ? "#ccc" : "#555",
                }}
              >
                Formamos estudiantes íntegros a través de una educación de excelencia académica fundamentada en principios bíblicos. Nuestro compromiso es desarrollar el potencial de cada niño y joven, preparándolos para ser líderes transformadores en la sociedad con un corazón conforme al de Cristo.
              </Typography>
            </Box>
          </Grid>


        {/* --- Imagen con fade suave --- */}
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <Box
            component="img"
            src="fondo.jpg"
            alt="Estudiantes realizando actividades vocacionales"
            loading="lazy"
            sx={{
              width: "100%",
              borderRadius: 4,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              objectFit: "cover",
              opacity: 0,
              animation: "fadeIn 1.5s ease forwards",
            }}
          />
        </Grid>

  {/* --- Misión --- */}
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoCard
            title="Misión"
            text="Proporcionar una educación integral centrada en principios cristianos, promoviendo el desarrollo académico, espiritual y social de nuestros estudiantes."
            isDark={isDarkMode}
            centered
          />
        </Grid>

        {/* --- Visión --- */}
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoCard
            title="Visión"
            text="Ser una unidad educativa modelo en la formación de ciudadanos con valores, excelencia académica y compromiso con el bienestar de su entorno."
            isDark={isDarkMode}
            centered
          />
        </Grid>        
        {/* --- Pilares --- */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ textAlign: "center", mt: 8 }}>
            <Title text="Nuestros Pilares Fundamentales" />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 4,
              mt: 5,
              transition: "transform 0.3s ease",
            }}
          >
            {[
              { title: "Fe", img: "/Pils-1.jpg" },
              { title: "Educación", img: "/Pils-2.jpg" },
              { title: "Servicio", img: "/Pils-3.jpg" },
              { title: "Comunidad", img: "/Pils-4.jpg" },
            ].map((p) => (
              <Box
                key={p.title}
                sx={{
                  animation: "fadeUp 1s ease forwards",
                  opacity: 0,
                  transform: "translateY(30px)",
                  "&:nth-of-type(2)": { animationDelay: "0.2s" },
                  "&:nth-of-type(3)": { animationDelay: "0.4s" },
                  "&:nth-of-type(4)": { animationDelay: "0.6s" },
                }}
              >
                <Pils image={p.img} title={p.title} description="" />
              </Box>
            ))}
          </Box>
        </Grid>

        {/* --- Versículo --- */}
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              mt: 3,
              textAlign: "center",
              fontStyle: "italic",
              fontSize: { xs: "1.4rem", sm: "1.6rem", md: "1.8rem" },
              lineHeight: 1.7,
              color: isDarkMode ? "#FFD700" : "#FFAA00",
              px: { xs: 2, sm: 4, md: 6 },
              py: 4,
              borderRadius: 3,
              background: isDarkMode 
                ? "linear-gradient(135deg, rgba(255,215,0,0.05), rgba(255,215,0,0.15))" 
                : "linear-gradient(135deg, rgba(255,170,0,0.05), rgba(255,170,0,0.15))",
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
              border: "1px solid rgba(255,215,0,0.2)",
              transition: "transform 0.4s ease, box-shadow 0.4s ease",
              "&:hover": {
                transform: "scale(1.03)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
              },
              animation: "fadeUp 1s ease forwards",
              opacity: 0,
            }}
          >
            <Box sx={{ mb: 2, height: 2, width: 60, mx: "auto", bgcolor: isDarkMode ? "#FFD700" : "#FFAA00", borderRadius: 1 }} />
            “Instruye al niño en su camino, y aun cuando fuere viejo no se apartará de él.”  
            <br />
            <strong>— Proverbios 22:6</strong>
            <Box sx={{ mt: 2, height: 2, width: 60, mx: "auto", bgcolor: isDarkMode ? "#FFD700" : "#FFAA00", borderRadius: 1 }} />
          </Box>
        </Grid>

      </Grid>

      {/* --- Animaciones globales --- */}
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes fadeUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </Box>
  );
}

/* --- InfoCard Reutilizable --- */
function InfoCard({ title, text, isDark ,centered = false}: ItemProps) {
  return (
    <Box
      sx={{
        border: `1px solid ${isDark ? "#333" : "#ddd"}`,
        borderRadius: 3,
        p: 3,
        backgroundColor: isDark ? "#071929" : "#fafafa",
        boxShadow: isDark
          ? "0 4px 12px rgba(0,0,0,0.4)"
          : "0 4px 12px rgba(0,0,0,0.1)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: isDark
            ? "0 10px 24px rgba(0,0,0,0.6)"
            : "0 10px 24px rgba(0,0,0,0.2)",
        },
        animation: "fadeUp 1s ease forwards",
        opacity: 0,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: "#FFD54F",
          fontWeight: "bold",
          mb: 2,
          textAlign: "center",
        }}
      >
        {title}
      </Typography>
      <Paragrafth  text={text} />
    </Box>
  );
}

export default About;
