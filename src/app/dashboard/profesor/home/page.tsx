'use client';
import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, LinearProgress, Chip, Avatar, useTheme } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { styled } from '@mui/system';

const ResumenCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: (theme.shadows as any)[3],
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: (theme.shadows as any)[6],
  },
}));

const TodayScheduleCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: (theme.shadows as any)[3],
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: (theme.shadows as any)[6],
  },
}));

const ActionCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: (theme.shadows as any)[3],
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: (theme.shadows as any)[6],
  },
}));

export default function DashboardPage() {
  const theme = useTheme();

  // Simulación de datos para el Dashboard
  const resumen = {
    estudiantes: 156,
    materias: 8,
    asistencia: 92,
    alertasPendientes: 7,
  };

  const horarios = [
    { hora: '08:00', materia: 'Matemáticas - 10mo A', aula: 'Aula 201', estudiantes: 28, estado: 'En curso' },
    { hora: '10:00', materia: 'Álgebra - 11vo B', aula: 'Aula 203', estudiantes: 25, estado: 'Próxima' },
    { hora: '14:00', materia: 'Cálculo - 12vo A', aula: 'Aula 205', estudiantes: 22, estado: 'Pendiente' },
  ];

  return (
    <Box sx={{ p: 1, bgcolor: theme.palette.background.default }}>
      {/* Resumen General */}
      <Typography variant="h1" color="text.secondary" fontWeight="bold" sx={{m:1}}>
         Resumen General
        </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ResumenCard>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">
                Estudiantes
              </Typography>
              <Typography variant="h4" color="text.primary">
                {resumen.estudiantes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +12% vs mes anterior
              </Typography>
            </CardContent>
          </ResumenCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ResumenCard>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">
                Materias Asignadas
              </Typography>
              <Typography variant="h4" color="text.primary">
                {resumen.materias}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3 cursos diferentes
              </Typography>
            </CardContent>
          </ResumenCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ResumenCard>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">
                Asistencia Promedio
              </Typography>
              <Typography variant="h4" color="text.primary">
                {resumen.asistencia}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +5% vs semana anterior
              </Typography>
            </CardContent>
          </ResumenCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ResumenCard>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">
                Alertas Pendientes
              </Typography>
              <Typography variant="h4" color="error">
                {resumen.alertasPendientes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Requieren atención
              </Typography>
            </CardContent>
          </ResumenCard>
        </Grid>
      </Grid>

      {/* Horario de Hoy */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 8 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
            Horario de Hoy - Lunes, 15 Enero 2024
        </Typography>
        {horarios.map((horario, index) => (
            <TodayScheduleCard sx={{ mb: 2 }} key={index}>
            <CardContent>
                <Grid container alignItems="center">
                <Grid size={{ xs: 3 }}>
                    <Typography variant="h6" color="text.primary">
                    {horario.hora}
                    </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                    <Typography variant="body1" color="text.primary">
                    {horario.materia}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                    {horario.aula} - {horario.estudiantes} estudiantes
                    </Typography>
                </Grid>
                <Grid size={{ xs: 3 }}>
                    <Chip
                    label={horario.estado}
                    color={horario.estado === 'En curso' ? 'success' : horario.estado === 'Próxima' ? 'info' : 'warning'}
                    sx={{ fontWeight: 600 }}
                    />
                </Grid>
                </Grid>
            </CardContent>
            </TodayScheduleCard>
      ))}
      </Grid>

      {/* Rendimiento por Materia */}
      
        {/* Alertas Recientes */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ResumenCard>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">
                Alertas Recientes
              </Typography>
              <Box>
                <Chip
                  label="Juan Pérez - 10mo A"
                  color="error"
                  icon={<WarningIcon />}
                  sx={{ marginBottom: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  3 faltas consecutivas
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip
                  label="Elvis Rodrigo - 11vo B"
                  color="error"
                  icon={<WarningIcon />}
                  sx={{ marginBottom: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Tercera practica consecutiva no entregada
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip
                  label="Tarea pendiente"
                  color="warning"
                  icon={<NotificationsActiveIcon />}
                  sx={{ marginBottom: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Álgebra - Ejercicios Cap. 5
                </Typography>
              </Box>
            </CardContent>
          </ResumenCard>
          <ActionCard sx={{mt:2}}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">
                Acciones Rápidas
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Button variant="contained" color="primary" startIcon={<ScheduleIcon />}>
                  Registrar Notas
                </Button>
                <Button variant="contained" color="secondary" startIcon={<CheckCircleIcon />}>
                  Tomar Asistencia
                </Button>
              </Box>
            </CardContent>
          </ActionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
