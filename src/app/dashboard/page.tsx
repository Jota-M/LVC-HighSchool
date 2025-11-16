'use client';

import { Box, Typography, Grid } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import StatsCards from './components/StatsCards';
import RecentActivity from './components/RecentActivity';
import QuickActions from './components/QuickActions';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          fontWeight={800}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          ¡Bienvenido, {user?.username}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight={500}>
          Este es tu panel de control. Aquí tienes un resumen de la actividad.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <StatsCards />
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <QuickActions />
      </Box>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid size={{xs:12, lg:8}}>
          <RecentActivity />
        </Grid>
        <Grid size={{xs:12, lg:4}}>
          <Box>{/* Aquí puedes agregar un componente de calendario o notificaciones */}</Box>
        </Grid>
      </Grid>
    </Box>
  );
}