'use client';

import { Box, Grid, Card, CardContent, Typography, alpha, CircularProgress } from '@mui/material';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';

export default function DashboardPage() {
  const { user, loading } = useAuthGuard();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return null;

  const stats = [
    {
      title: 'Total Estudiantes',
      value: '1,234',
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: '#0288d1',
    },
    {
      title: 'Total Docentes',
      value: '87',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#f44336',
    },
    {
      title: 'Cursos Activos',
      value: '42',
      icon: <ClassIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
    },
    {
      title: 'Preinscripciones',
      value: '12',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Bienvenido, {user.username}! 👋
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Este es tu panel de control.
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid size={{xs:12, sm:6, md:3}} key={stat.title}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: alpha(stat.color, 0.1),
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Tu Información
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              <strong>Usuario:</strong> {user.username}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography variant="body2">
              <strong>Roles:</strong> {user.roles?.map((r) => r.nombre).join(', ')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
