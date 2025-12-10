// components/estudiantes/EstudiantesStats.tsx
import React from 'react';
import { Grid, Paper, Box, Typography, CircularProgress, useTheme } from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  PersonOff as PersonOffIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Accessible as AccessibleIcon,
  VpnKey as KeyIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { estudiantesService } from '@/services/estudiantesService';
import { EstudianteStats } from '@/types/estudianteTypes';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '20px',
        background: isDark
          ? `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`
          : `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
        border: `2px solid ${color}30`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${color}20`,
          borderColor: `${color}60`,
        },
      }}
    >
      {/* Icono de fondo */}
      <Box
        sx={{
          position: 'absolute',
          right: -10,
          top: -10,
          opacity: 0.1,
          transform: 'rotate(15deg)',
          '& svg': { fontSize: 100 },
        }}
      >
        {icon}
      </Box>

      {/* Contenido */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${color}20`,
              '& svg': { fontSize: 24, color },
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Typography>
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 0.5,
          }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export const EstudiantesStats: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: stats, isLoading } = useQuery<EstudianteStats>({
    queryKey: ['estudiantes-stats'],
    queryFn: () => estudiantesService.obtenerEstadisticas(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return null;
  }

  const statsCards = [
    {
      title: 'Total Estudiantes',
      value: stats.total,
      icon: <PeopleIcon />,
      color: isDark ? '#facc15' : '#0288d1',
      subtitle: 'Registrados en el sistema',
    },
    {
      title: 'Activos',
      value: stats.activos,
      icon: <PersonAddIcon />,
      color: '#10b981',
      subtitle: `${((stats.activos / stats.total) * 100).toFixed(1)}% del total`,
    },
    {
      title: 'Inactivos',
      value: stats.inactivos,
      icon: <PersonOffIcon />,
      color: '#ef4444',
      subtitle: stats.inactivos > 0 ? 'Requieren atención' : 'Todo en orden',
    },
    {
      title: 'Hombres',
      value: stats.masculino,
      icon: <MaleIcon />,
      color: '#3b82f6',
      subtitle: `${((stats.masculino / stats.total) * 100).toFixed(1)}%`,
    },
    {
      title: 'Mujeres',
      value: stats.femenino,
      icon: <FemaleIcon />,
      color: '#ec4899',
      subtitle: `${((stats.femenino / stats.total) * 100).toFixed(1)}%`,
    },
    {
      title: 'Con Discapacidad',
      value: stats.con_discapacidad,
      icon: <AccessibleIcon />,
      color: '#f59e0b',
      subtitle: 'Atención especial',
    },
    {
      title: 'Con Usuario',
      value: stats.con_usuario,
      icon: <KeyIcon />,
      color: '#8b5cf6',
      subtitle: 'Pueden acceder al sistema',
    },
    {
      title: 'Edad Promedio',
      value: stats.promedio_edad ? `${stats.promedio_edad.toFixed(1)} años` : 'N/A',
      icon: <TrendingIcon />,
      color: '#06b6d4',
      subtitle: 'Promedio general',
    },
  ];

  return (
    <Grid container spacing={3}>
      {statsCards.map((stat, index) => (
        <Grid size={{xs:12, sm:6, md:3}} key={index}>
          <StatCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
};

export default EstudiantesStats;