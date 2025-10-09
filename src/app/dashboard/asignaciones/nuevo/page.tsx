"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Grid,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from '@mui/material/styles';
import { tokens } from '@/app/dashboard/theme';

const horariosLunes = ["8:00-9:00", "9:00-10:00", "10:00-11:00"];
const horariosMartes = ["8:00-9:00", "9:00-10:00", "10:00-11:00"];

export default function HorariosPage() {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [asignado, setAsignado] = useState(true);

  return (
    <Box p={{ xs: 2, sm: 3, md: 4, lg:1}}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}
        sx={{
            backgroundColor: colors.primary[400],
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            height: '100%',
        }}>
          <Box p={3} borderRadius={2} boxShadow={2}>
            <Typography variant="h6" gutterBottom>
              Selección de Materias
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={2}
                  border="1px solid"
                  borderColor="divider"
                  borderRadius={2}
                >
                  <Box>
                    <Typography variant="subtitle1">🧪 Ciencias Naturales</Typography>
                    <Typography variant="body2">1er Grado - Sección A</Typography>
                  </Box>
                  <Typography>3h</Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={2}
                  border="1px solid"
                  borderColor="divider"
                  borderRadius={2}
                >
                  <Box>
                    <Typography variant="subtitle1">📘 Lenguaje y Literatura</Typography>
                    <Typography variant="body2">1er Grado - Sección A</Typography>
                  </Box>
                  <Typography>5h ✅</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Configuración de Horarios */}
        <Grid size={{ xs: 12 }}
        sx={{
            backgroundColor: colors.primary[400],
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            height: '100%',
        }}>
          <Box p={3} borderRadius={2} boxShadow={2}>
            <Typography variant="h6" gutterBottom>
              Configuración de Horarios
            </Typography>

            <Box mt={2}>
              <Typography fontWeight="bold">Lunes</Typography>
              <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                {horariosLunes.map((slot, index) => (
                  <Chip key={index} label={slot} color="warning" variant="outlined" />
                ))}
              </Box>

              <Typography mt={2} fontWeight="bold">
                Martes
              </Typography>
              <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                {horariosMartes.map((slot, index) => (
                  <Chip key={index} label={slot} color="secondary" variant="outlined" />
                ))}
              </Box>
            </Box>

            <Box display="flex" gap={2} mt={3}>
              <Button variant="outlined" color="inherit">
                Cancelar
              </Button>
              <Button variant="contained" color="primary">
                Confirmar Asignación
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Asignaciones Actuales */}
        <Grid size={{ xs: 12 }}
        sx={{
            backgroundColor: colors.primary[400],
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            height: '100%',
        }}>
          <Box p={3} borderRadius={2} boxShadow={2}>
            <Typography variant="h6" gutterBottom>
              Asignaciones Actuales
            </Typography>

            {/* Docente */}
            <Box
              display="flex"
              alignItems="center"
              p={2}
              border="1px solid"
              borderColor="divider"
              borderRadius={2}
              mb={2}
            >
              <Avatar sx={{ mr: 2 }}>MG</Avatar>
              <Box>
                <Typography variant="subtitle1">María González</Typography>
                <Typography variant="body2" color="text.secondary">
                  Docente de Matemáticas
                </Typography>
                <Box mt={1}>
                  <Chip label="Matemáticas - 1A" sx={{ mr: 1 }} />
                  <Chip label="Matemáticas - 1B" />
                  <Typography variant="body2" mt={1}>
                    ⏱️ 20 horas semanales
                  </Typography>
                </Box>
              </Box>
              <Box ml="auto">
                <IconButton>
                  <EditIcon />
                </IconButton>
                <IconButton>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Estudiante */}
            <Box
              display="flex"
              alignItems="center"
              p={2}
              border="1px solid"
              borderColor="divider"
              borderRadius={2}
            >
              <Avatar sx={{ mr: 2, bgcolor: "orange" }}>JP</Avatar>
              <Box>
                <Typography variant="subtitle1">Juan Pérez Martínez</Typography>
                <Typography variant="body2" color="text.secondary">
                  Estudiante - 1er Grado A
                </Typography>
                <Typography variant="body2" mt={1}>
                  👨‍👦 Padre: Carlos Pérez - 📞 +1 234 567 8901
                </Typography>
              </Box>
              <Box ml="auto">
                <Chip label="Curso: 1ro C" color="info" />
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
