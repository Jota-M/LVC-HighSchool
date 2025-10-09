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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import SchoolIcon from "@mui/icons-material/School";
import Card from "@/app/components/DashAdmin/Card";
// import EstudianteTable from "@/app/components/DashAdmin/EstudianteTable"; 
// Update the import path below if the file exists elsewhere:
import EstudianteTable from "../../components/DashAdmin/EstudianteTable";

export default function Page() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Simulando fetch de estudiantes (puedes adaptar luego con tu API real)
    const fetchStudents = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/students");
        const data = await res.json();
        const studentsArray = Array.isArray(data) ? data : data.students;

        setStudents(
          studentsArray.map((s: any) => ({
            name: `${s.first_name} ${s.last_name} ${s.mother_last_name || ""}`,
            email: s.email,
            status: s.status || "Activo",
            lastAccess: "Hace 2 horas",
            color: "blueAccent",
          }))
        );
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Grid container spacing={3}>
      {/* Encabezado y búsqueda */}
      <Grid
        size={{ xs: 12, md: 6, lg: 12 }}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexDirection="row"
        sx={{
          backgroundColor: colors.primary[400],
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          height: "100%",
          width: "100%",
          p: 2,
        }}
      >
        <Box display="flex" flexDirection="column">
          <Typography variant="h2" gutterBottom>
            Gestión de Estudiantes
          </Typography>
          <Typography variant="h5">
            Administra a los estudiantes y su información académica
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            label="Buscar estudiantes"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="secondary"
            href="/dashboard/estudiantes/nuevo"
          >
            <AddIcon sx={{ mr: 1 }} />
            Agregar Estudiante
          </Button>
        </Box>
      </Grid>

      {/* Cards */}
      <Grid
        size={{ lg: 12 }}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr 1fr",
          },
          gap: 2,
        }}
      >
        <Card
          icon={SchoolIcon}
          title="Total Estudiantes"
          value={students.length}
          change={0}
          goal={500}
          description="Total de estudiantes registrados en la plataforma."
        />
        <Card
          icon={SchoolIcon}
          title="Activos"
          value={students.filter((s) => s.status === "Activo").length}
          change={0}
          goal={450}
          description="Número de estudiantes actualmente activos."
        />
        <Card
          icon={SchoolIcon}
          title="Inactivos"
          value={students.filter((s) => s.status === "Inactivo").length}
          change={0}
          goal={50}
          description="Número de estudiantes inactivos."
        />
        <Card
          icon={SchoolIcon}
          title="Total"
          value={students.length}
          goal={500}
          description="Número total de estudiantes activos e inactivos."
        />
      </Grid>

      {/* Tabla de estudiantes */}
      <Grid
        size={{ xs: 12 }}
        sx={{
          backgroundColor: colors.primary[400],
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          p: 2,
        }}
      >
        {loading ? (
          <Typography>Cargando...</Typography>
        ) : (
          <EstudianteTable users={filteredStudents} />
        )}
      </Grid>
    </Grid>
  );
}
