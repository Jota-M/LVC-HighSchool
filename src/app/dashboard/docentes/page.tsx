// Page.tsx – versión mejorada
"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { tokens } from "@/app/dashboard/theme";
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Fade,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PeopleIcon from "@mui/icons-material/People";
import Card from "@/app/components/DashAdmin/Card";
import DocenteTable from "@/app/components/DashAdmin/DocenteTable";
import { keyframes } from "@mui/system";

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function Page() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/teachers");
        const data = await res.json();
        const teachersArray = Array.isArray(data) ? data : data.teachers;

        setTeachers(
          teachersArray.map((t: any) => ({
            name: `${t.first_name} ${t.last_name} ${t.mother_last_name || ""}`,
            email: t.email,
            role: "Docente",
            status: t.status || "Activo",
            lastAccess: "Hace 1 hora",
            department: t.department || "Matemáticas",
            students: Math.floor(Math.random() * 60) + 20,
            courses: Math.floor(Math.random() * 5) + 1,
          }))
        );
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalStudents = teachers.reduce((acc, t) => acc + (t.students || 0), 0);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4 },
        minHeight: "100vh",
        
        backgroundSize: "200% 200%",
        animation: `${gradientMove} 10s ease infinite`,
        transition: "all 0.4s ease",
      }}
    >
      {/* HERO HEADER */}
      <Fade in timeout={800}>
        <Box
          sx={{
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.05)"
                : "rgba(255,255,255,0.6)",
            borderRadius: "20px",
            backdropFilter: "blur(14px)",
            border: `1px solid ${colors.primary[300]}`,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 8px 32px rgba(0,0,0,0.3)"
                : "0 8px 24px rgba(0,0,0,0.1)",
            p: { xs: 3, sm: 4 },
            mb: 4,
            animation: `${fadeUp} 0.7s ease`,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            flexDirection={{ xs: "column", md: "row" }}
            gap={3}
          >
            <Box>
              <Typography
                variant="h2"
                fontWeight={800}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                Gestión de Docentes
              </Typography>
              <Typography variant="h5" color="text.secondary" fontWeight={500}>
                Administra el personal docente y sus asignaciones con estilo ✨
              </Typography>
            </Box>

            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar docentes..."
                size="small"
                variant="outlined"
                sx={{
                  minWidth: 260,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 0 12px rgba(102,126,234,0.3)",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                href="/dashboard/docentes/nuevo"
                sx={{
                  borderRadius: "14px",
                  px: 3,
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 8px 24px rgba(118,75,162,0.6)",
                  },
                }}
              >
                <AddIcon sx={{ mr: 1 }} />
                Agregar Docente
              </Button>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* CARDS DE ESTADÍSTICAS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Fade in timeout={500}>
            <Box>
              <Card
                icon={PeopleIcon}
                title="Total Docentes"
                value={teachers.length}
                change={8}
                goal={100}
                description="Docentes registrados en la plataforma"
                colorScheme="blue"
              />
            </Box>
          </Fade>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Fade in timeout={700}>
            <Box>
              <Card
                icon={PersonAddAlt1Icon}
                title="Activos"
                value={teachers.filter((t) => t.status === "Activo").length}
                change={5}
                goal={100}
                description="Docentes actualmente activos"
                colorScheme="green"
              />
            </Box>
          </Fade>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Fade in timeout={900}>
            <Box>
              <Card
                icon={PersonAddAlt1Icon}
                title="Inactivos"
                value={teachers.filter((t) => t.status === "Inactivo").length}
                change={-2}
                goal={30}
                description="Docentes en estado inactivo"
                colorScheme="red"
              />
            </Box>
          </Fade>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Fade in timeout={1100}>
            <Box>
              <Card
                icon={PeopleIcon}
                title="Total Estudiantes"
                value={totalStudents}
                change={12}
                goal={500}
                description="Estudiantes bajo supervisión"
                colorScheme="purple"
              />
            </Box>
          </Fade>
        </Grid>
      </Grid>

      {/* TABLA DE DOCENTES */}
      <Fade in timeout={1300}>
        <Box>
          {loading ? (
            <Box
              sx={{
                backgroundColor: colors.primary[400],
                borderRadius: "20px",
                p: 5,
                textAlign: "center",
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 8px 24px rgba(0,0,0,0.3)"
                    : "0 8px 24px rgba(0,0,0,0.1)",
              }}
            >
              <Typography
                variant="h6"
                color="text.secondary"
                fontWeight={600}
                sx={{ animation: `${fadeUp} 1s ease infinite alternate` }}
              >
                Cargando datos de docentes...
              </Typography>
            </Box>
          ) : (
            <DocenteTable users={filteredTeachers} />
          )}
        </Box>
      </Fade>
    </Box>
  );
}
