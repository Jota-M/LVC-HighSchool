'use client';
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  Grid,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Fade,
} from "@mui/material";
import Navbar from "@/app/PreInscripcion/Navbar";
import SchoolIcon from "@mui/icons-material/School";
import DownloadIcon from "@mui/icons-material/Download";
import AdjustIcon from "@mui/icons-material/Adjust";
import SubjectCard from "@/app/components/HomePage/SubjectCard";

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
  objetivos: Objetivo[]; // ahora es un array
  materias: Materia[];
}

interface ItemsProps {
  levelTitle: string;
  levelDescription: string;
  gradesContent: Record<string, GradeContent>;
  toggleLabels: string[];
}

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

  // Mostrar página con animación
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // 👇 Mostrar el primer curso por defecto al cargar
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
      <Grid
        sx={{
          bgcolor: "background.default",
          color: "text.primary",
          pt: { xs: 10, md: 15 },
          minHeight: "100vh",
          transition: "background-color 0.5s ease",
        }}
      >
        <Navbar />

        {/* CABECERA */}
        <Grid
          sx={{
            mx: { xs: 2, md: 5, lg: 8 },
            p: { xs: 3, md: 5, lg: 6 },
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: `0 4px 30px ${theme.palette.primary.main}25`,
            transition: "all 0.5s ease",
            "&:hover": {
              boxShadow: `0 6px 40px ${theme.palette.primary.main}40`,
              transform: "scale(1.01)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <SchoolIcon
              sx={{
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                color: isDark ? "#facc15" : "#01579b",
                transition: "transform 0.4s ease",
                "&:hover": { transform: "rotate(-8deg) scale(1.1)" },
              }}
            />
            <Box>
              <Typography
                variant="h3"
                fontWeight="bold"
                sx={{
                  fontSize: { xs: "1.5rem", md: "2.4rem" },
                  textShadow: `0 0 8px ${theme.palette.primary.main}40`,
                  color: isDark ? "#facc15" : "#01579b",
                }}
              >
                {levelTitle}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: { xs: "0.7rem", md: "1rem" },
                  color: isDark ? "#27BBF5" : "#facc15",
                }}
              >
                {levelDescription}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* SELECCIÓN DE GRADO */}
        <Box
          sx={{
            mt: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Typography
            fontWeight="bold"
            sx={{
              mb: 2,
              fontSize: { xs: "1rem", md: "1.4rem" },
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
              gap: 1,
              borderRadius: 3,
              "& .MuiToggleButton-root": {
                color: theme.palette.text.primary,
                border: "none",
                padding: { xs: "6px 10px", md: "8px 16px" },
                fontSize: { xs: "0.6rem", md: "0.9rem" },
                transition: "all 0.3s ease",
                "&.Mui-selected": {
                  backgroundColor: isDark ? "#01579b" : "#facc15",
                  color: theme.palette.primary.contrastText,
                  transform: "scale(1.05)",
                  boxShadow: `0 0 10px ${theme.palette.primary.main}60`,
                },
                "&:hover": {
                  backgroundColor: isDark ? "#01579b" : "#fde047",
                  transform: "scale(1.05)",
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

        {/* SECCIÓN DETALLE */}
        <Fade in={!!current} timeout={500}>
          <Grid container sx={{ p: 4, mt: 3 }}>
            {/* Encabezado del grado */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                mb: 3,
              }}
            >
              <Box>
                <Typography
                  fontWeight="bold"
                  sx={{ fontSize: { xs: "1rem", md: "2rem" } }}
                >
                  {current.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontSize: { xs: "0.7rem", md: "1rem" } }}
                >
                  {current.subtitle}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DownloadIcon />}
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                Descargar Plan PDF
              </Button>
            </Box>

            {/* Objetivos */}
            {current.objetivos.map((obj, index) => (
              <Box
                key={index}
                sx={{
                  m: 1,
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                }}
              >
                <AdjustIcon
                  sx={{
                    fontSize: "3rem",
                    mr: 2,
                    color: theme.palette.secondary.main,
                  }}
                />
                <Box>
                  <Typography sx={{ fontWeight: 500 }}>
                    {obj.titulo}
                  </Typography>
                  <Typography variant="body2">
                    {obj.descripcion}
                  </Typography>
                </Box>
              </Box>
            ))}

            {/* Materias */}
            <Typography
              sx={{
                width: "100%",
                mt: 4,
                fontWeight: "bold",
                fontSize: { xs: "1rem", md: "1.5rem" },
              }}
            >
              Materias Principales
            </Typography>

            <Grid
              container
              spacing={2}
              sx={{
                mt: 1,
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {current.materias.map((m, i) => (
                <Grid
                  key={i}
                  size={{ xs: 12, md: 3 }}
                  sx={{
                    opacity: animateSubjects ? 1 : 0,
                    transform: animateSubjects
                      ? "translateY(0)"
                      : "translateY(30px)",
                    transition: `all 0.3s ease ${i * 0.1}s`,
                  }}
                >
                  <SubjectCard {...m} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Fade>
      </Grid>
    </Fade>
  );
}
