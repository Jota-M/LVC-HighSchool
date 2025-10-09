"use client";
import React from "react";
import Grid from "@mui/material/Grid";
import { Typography, Button, useTheme,Box } from "@mui/material";
import Card from "./Card";

function Nivels() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <>
    <Box sx={{ my: 6, borderTop: '1px solid', borderColor: isDark ? '#333' : '#ccc' }} />
      <Grid
        id="Niveles"
        container
        spacing={2}
        sx={{
          height: { lg: "100vh" },
          padding: { xs: 2, sm: 2, md: 2, lg: 4 },
        }}
      >
        <Grid
          size={{ xs: 10, sm: 10, md: 10, lg: 10 }}
          offset={{ xs: 1 }}
          sx={{ paddingTop: { xs: 5, sm: 5, md: 10, lg: 4 } }}
        >
          <Typography
            variant="h4"
            sx={{
              color: isDark ? "#fff" : "#01579b",
              fontWeight: "bold",
              fontSize: { xs: "1.5rem", md: "2rem" },
              lineHeight: 1.5,
              opacity: 0,
              transform: "translateY(20px)",
              animation: "fadeSlideIn 0.8s forwards",
            }}
          >
            Explora Nuestros programas
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
            Acompañamos el crecimiento de nuestros estudiantes en cada etapa de su formación
          </Typography>
        </Grid>

        <Grid size={{ xs: 10, sm: 5, md: 3.3, lg: 3 }} offset={{ xs: 1.5, sm: 1, md: 1, lg:1.5 }}>
        <Card
          init="Initial"
          imageurl="/Nivels/Initial.jpg"
          title="Educacion Inicial"
          paragraph="Primeros pasos en el aprendizaje con metodología lúdica, desarrollo psicomotor y formación en valores cristianos fundamentales."
          paragraph1="3 a 5 años"
          paragraph2="Desarrollo Integral"
          paragraph3="Valores Cristianos"
        />
      </Grid>

      <Grid size={{ xs: 10, sm: 5, md: 3.3, lg: 3 }} offset={{ xs: 1.5, sm: 0, md: 0, lg:0 }}>
        <Card
          init="Primary"
          imageurl="/Nivels/Primary-3.jpg"
          title="Educacion Primaria"
          paragraph="Formación académica sólida con énfasis en lectoescritura, matemáticas, ciencias y desarrollo del pensamiento crítico con base bíblica"
          paragraph1="6 a 12 años"
          paragraph2="Bases académicas sólidas"
          paragraph3="Pensamiento crítico"
        />
      </Grid>

      <Grid size={{ xs: 10, sm: 6, md: 3.3, lg: 3  }} offset={{ xs: 1.5, sm: 3, md: 0, lg:0 }}>
        <Card
          init="Secondary"
          imageurl="/Nivels/Secondary-1.jpg"
          title="Educacion Secundaria"
          paragraph="Preparación integral para la educación superior con bachillerato en ciencias, desarrollo del liderazgo y servicio comunitario."
          paragraph1="12 a 18 años"
          paragraph2="Bachillerato en ciencias"
          paragraph3="Liderazgo cristiano"
        />
      </Grid>
      <Grid size={{ xs: 10, sm: 4, md: 4, lg: 4 }} offset={{ xs: 1.5, sm: 4, md: 4, lg:5 }}>
        <Button variant="outlined">Explora nuestra malla curricular</Button>
      </Grid>
      </Grid>
      <hr />

      {/** Animaciones CSS */}
      <style>{`
        @keyframes fadeSlideIn {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export default Nivels;
