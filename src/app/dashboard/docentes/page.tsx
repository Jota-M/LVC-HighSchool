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
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import Card from "@/app/components/DashAdmin/Card";
import DocenteTable from "@/app/components/DashAdmin/DocenteTable";

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
            color: "greenAccent",
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

  return (
    <Grid container spacing={3}>
      {/* Encabezado y búsqueda */}
      <Grid size={{
        xs:12,
        md:6,
        lg:12
      }}
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
            Gestión de Docentes
          </Typography>
          <Typography variant="h5">
            Administra el personal docente y sus asignaciones
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            label="Buscar docentes"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" color="secondary" href="/dashboard/docentes/nuevo">
            <AddIcon sx={{ mr: 1 }} />
            Agregar Docente
          </Button>
        </Box>
      </Grid>

      <Grid
        size={{ lg: 12 }}
        spacing={3}
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
          icon={PersonAddAlt1Icon}
          title="Total Docentes"
          value={teachers.length}
          change={0}
          goal={100}
          description="Total de docentes registrados en la plataforma."
        />
        <Card
          icon={PersonAddAlt1Icon}
          title="Activos"
          value={teachers.filter((t) => t.status === "Activo").length}
          change={0}
          goal={100}
          description="Número de docentes actualmente activos."
        />
        <Card
          icon={PersonAddAlt1Icon}
          title="Inactivos"
          value={teachers.filter((t) => t.status === "Inactivo").length}
          change={0}
          goal={30}
          description="Número de docentes inactivos."
        />
        <Card
          icon={PersonAddAlt1Icon}
          title="Total"
          value={teachers.length}
          goal={100}
          description="Número total de docentes activos e inactivos."
        />
      </Grid>

      {/* Tabla de docentes */}
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
          <DocenteTable users={filteredTeachers} />
        )}
      </Grid>
    </Grid>
  );
}
