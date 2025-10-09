'use client';

import {  Box,  Typography,  Button,  Grid,  FormControl,  InputLabel,  Select,  MenuItem,  TextField,  Avatar,  Chip,  IconButton,} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '@/app/dashboard/theme';  
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';

const stats = [
  {
    title: 'Docentes Asignados',
    value: '67/72',
    progress: 67 / 72, // Value for progress bar
  },
  {
    title: 'Estudiantes Inscritos',
    value: '892/950',
    progress: 892 / 950,
  },
  {
    title: 'Materias Cubiertas',
    value: '45/48',
    progress: 45 / 48,
  },
  {
    title: 'Asignaciones Pendientes',
    value: '12',
    progress: 12 / 12, // Just to show as an indicator of pending tasks
  },
];

export default function AsignacionesDeUsuarios() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box p={{ xs: 2, sm: 3, md: 4, lg:1 }}>
      {/* Header Section */}
      <Box className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 sm:gap-0">
        <Typography variant="h4" color={colors.grey[100]} className="w-full sm:w-auto">
          Asignaciones
        </Typography>
        <Box className="flex flex-col sm:flex-row gap-4 sm:gap-4 w-full sm:w-auto">
          <FormControl variant="outlined" sx={{ minWidth: 150 }} className="w-full sm:w-auto">
            <InputLabel>Año Escolar</InputLabel>
            <Select defaultValue="2024-2025">
              <MenuItem value="2024-2025">2024-2025</MenuItem>
              <MenuItem value="2023-2024">2023-2024</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="secondary" className="w-full sm:w-auto">
            Nueva Asignación
          </Button>
          <Button variant="contained" color="success" className="w-full sm:w-auto">
            Asignación Masiva
          </Button>
        </Box>
      </Box>

      {/* Resumen de Asignaciones */}
      <Grid container spacing={2} mb={4}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Box
              sx={{
                backgroundColor: colors.primary[400],
                p: 3,
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                height: '100%',
              }}
            >
              <Typography variant="subtitle2" color={colors.grey[300]}>
                {stat.title}
              </Typography>
              <Typography variant="h6" fontWeight="bold" color={colors.grey[100]}>
                {stat.value}
              </Typography>
              <Box
                sx={{
                  height: '8px',
                  backgroundColor: colors.grey[700],
                  borderRadius: '4px',
                  mt: 1,
                  width: '100%',
                  '&::after': {
                    content: '""',
                    display: 'block',
                    height: '100%',
                    width: `${stat.progress * 100}%`,
                    backgroundColor: colors.greenAccent[500],
                    borderRadius: '4px',
                  },
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Estructura Académica Section */}
      <Box
        sx={{
          backgroundColor: colors.primary[400],
          p: 3,
          borderRadius: '8px',
          mb: 4,
        }}
      >
        <Typography variant="h6" color={colors.grey[100]} mb={2}>
          Estructura Académica
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" color={colors.grey[100]}>
            Educación Primaria
          </Typography>
          <Box className="flex flex-wrap gap-2">
            <Chip label="1er Grado" color="primary" />
            <Chip label="2do Grado" color="primary" />
            <Chip label="3er Grado" color="primary" />
          </Box>
        </Box>
        <Box>
          <Typography variant="body1" color={colors.grey[100]}>
            Educación Secundaria
          </Typography>
          <Box className="flex flex-wrap gap-2">
            <Chip label="1er Grado" color="primary" />
            <Chip label="2do Grado" color="primary" />
          </Box>
        </Box>
      </Box>

      {/* Detalles de Asignación Section */}
      <Box
        sx={{
          backgroundColor: colors.primary[400],
          p: 3,
          borderRadius: '8px',
        }}
      >
        <Typography variant="h6" color={colors.grey[100]} mb={2}>
          Detalles de Asignación
        </Typography>

        <TextField
          fullWidth
          label="Seleccionar Usuario"
          variant="outlined"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: colors.grey[500] }} />,
          }}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Asignación</InputLabel>
              <Select defaultValue="Docente">
                <MenuItem value="Docente">Docente</MenuItem>
                <MenuItem value="Estudiante">Estudiante</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Asignación de Materias</InputLabel>
              <Select defaultValue="Matemáticas">
                <MenuItem value="Matemáticas">Matemáticas</MenuItem>
                <MenuItem value="Ciencias Naturales">Ciencias Naturales</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={2} mt={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Horas"
              variant="outlined"
              defaultValue="4h"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: colors.greenAccent[500],
                color: '#fff',
                '&:hover': {
                  backgroundColor: colors.greenAccent[600],
                },
                width: '100%',
              }}
            >
              Guardar
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
