// components/transporte/RutasStats.tsx
'use client';
import React from 'react';
import { Grid, Paper, Box, Typography, useTheme, alpha } from '@mui/material';
import {
  DirectionsBus as BusIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingIcon,
  EventSeat as SeatIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import type { RutaTransporte } from '@/types/transporte';

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
        borderRadius: '24px',
        background: isDark
          ? `linear-gradient(135deg, ${alpha(color, 0.12)} 0%, ${alpha(color, 0.04)} 100%)`
          : `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.03)} 100%)`,
        border: `2px solid ${alpha(color, 0.25)}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 16px 32px ${alpha(color, 0.25)}`,
          borderColor: `${alpha(color, 0.5)}`,
        },
      }}
    >
      {/* Icono de fondo decorativo */}
      <Box
        sx={{
          position: 'absolute',
          right: -15,
          top: -15,
          opacity: 0.08,
          transform: 'rotate(15deg)',
          '& svg': { fontSize: 120 },
          color: color,
        }}
      >
        {icon}
      </Box>

      {/* Contenido */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${alpha(color, 0.25)} 0%, ${alpha(color, 0.15)} 100%)`,
              boxShadow: `0 4px 12px ${alpha(color, 0.25)}`,
              '& svg': { fontSize: 28, color },
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: '0.7rem',
            }}
          >
            {title}
          </Typography>
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            color: 'text.primary',
            mb: 0.5,
            background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 600,
              display: 'block',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

interface RutasStatsProps {
  rutas: RutaTransporte[];
}

export const RutasStats: React.FC<RutasStatsProps> = ({ rutas }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const yellowColor = isDark ? '#facc15' : '#f59e0b';

  // Calcular estadísticas
  const totalRutas = rutas.length;
  const rutasActivas = rutas.filter(r => r.activo).length;
  const rutasInactivas = rutas.filter(r => !r.activo).length;
  
  const totalCupos = rutas.reduce((sum, r) => sum + r.capacidad_maxima, 0);
  const cuposOcupados = rutas.reduce((sum, r) => sum + (r.cupos_ocupados || 0), 0);
  const ocupacionPromedio = totalCupos > 0 ? (cuposOcupados / totalCupos) * 100 : 0;

  const totalEstudiantes = rutas.reduce((sum, r) => sum + (r.estudiantes_asignados || 0), 0);
  
  const costoPromedio = totalRutas > 0 
    ? rutas.reduce((sum, r) => sum + r.costo_mensual, 0) / totalRutas 
    : 0;

  const rutasCriticas = rutas.filter(r => (r.porcentaje_ocupacion || 0) >= 90).length;

  const statsCards = [
    {
      title: 'Total Rutas',
      value: totalRutas,
      icon: <BusIcon />,
      color: yellowColor,
      subtitle: 'Rutas registradas',
    },
    {
      title: 'Rutas Activas',
      value: rutasActivas,
      icon: <CheckIcon />,
      color: '#10b981',
      subtitle: `${totalRutas > 0 ? ((rutasActivas / totalRutas) * 100).toFixed(1) : 0}% del total`,
    },
    {
      title: 'Rutas Inactivas',
      value: rutasInactivas,
      icon: <CancelIcon />,
      color: '#ef4444',
      subtitle: rutasInactivas > 0 ? 'Requieren atención' : 'Todo en orden',
    },
    {
      title: 'Ocupación Promedio',
      value: `${ocupacionPromedio.toFixed(1)}%`,
      icon: <TrendingIcon />,
      color: ocupacionPromedio >= 80 ? '#ef4444' : ocupacionPromedio >= 60 ? '#f59e0b' : '#10b981',
      subtitle: `${cuposOcupados} / ${totalCupos} cupos`,
    },
    {
      title: 'Total Estudiantes',
      value: totalEstudiantes,
      icon: <PersonIcon />,
      color: '#3b82f6',
      subtitle: 'Usando transporte',
    },
    {
      title: 'Costo Promedio',
      value: `Bs ${costoPromedio.toFixed(2)}`,
      icon: <MoneyIcon />,
      color: '#8b5cf6',
      subtitle: 'Por ruta mensual',
    },
    {
      title: 'Capacidad Total',
      value: totalCupos,
      icon: <SeatIcon />,
      color: '#06b6d4',
      subtitle: 'Cupos disponibles',
    },
    {
      title: 'Rutas Críticas',
      value: rutasCriticas,
      icon: <WarningIcon />,
      color: '#f59e0b',
      subtitle: '≥ 90% ocupación',
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statsCards.map((stat, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <StatCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
};

export default RutasStats;