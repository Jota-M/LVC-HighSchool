// components/cursosVacacionales/DashboardStats.tsx
'use client';
import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Skeleton,
  useTheme,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  People,
  CheckCircle,
  HourglassEmpty,
  AttachMoney,
  School,
  Cancel,
  PersonAdd,
} from '@mui/icons-material';
import { EstadisticasPeriodo } from '@/types/cursoVacacionalTypes';

interface DashboardStatsProps {
  estadisticas: EstadisticasPeriodo | undefined;
  isLoading: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  progress?: number;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  progress,
  isLoading,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (isLoading) {
    return (
      <Card
        sx={{
          height: '100%',
          borderRadius: '20px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(color, 0.1)}`,
        }}
      >
        <CardContent>
          <Skeleton variant="circular" width={56} height={56} />
          <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
          <Skeleton variant="text" width="40%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: '20px',
        background: isDark
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(color, 0.1)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(color, 0.2)}`,
          border: `1px solid ${alpha(color, 0.3)}`,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: isDark ? '#fff' : '#000',
                mb: 0.5,
                fontSize: { xs: '1.75rem', md: '2.5rem' },
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
                <TrendingUp sx={{ fontSize: 16, color: '#10b981' }} />
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: alpha(color, 0.1),
              color: color,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(color, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: color,
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const DashboardStats: React.FC<DashboardStatsProps> = ({ estadisticas, isLoading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const colorPrimary = isDark ? '#facc15' : '#0288d1';
  const colorSuccess = '#10b981';
  const colorWarning = '#f59e0b';
  const colorError = '#ef4444';
  const colorInfo = '#3b82f6';

  const stats = [
    {
      title: 'Total Inscripciones',
      value: estadisticas?.total_inscripciones || 0,
      subtitle: 'Inscritos en total',
      icon: <People />,
      color: colorPrimary,
      trend: '+12% vs mes anterior',
    },
    {
      title: 'Pendientes',
      value: estadisticas?.pendientes || 0,
      subtitle: 'Por verificar pago',
      icon: <HourglassEmpty />,
      color: colorWarning,
    },
    {
      title: 'Verificadas',
      value: estadisticas?.verificadas || 0,
      subtitle: 'Pagos confirmados',
      icon: <CheckCircle />,
      color: colorSuccess,
      progress: estadisticas
        ? (Number(estadisticas.verificadas) / Number(estadisticas.total_inscripciones)) * 100
        : 0,
    },
    {
      title: 'Activas',
      value: estadisticas?.activas || 0,
      subtitle: 'Cursando actualmente',
      icon: <School />,
      color: colorInfo,
    },
    {
      title: 'Completadas',
      value: estadisticas?.completadas || 0,
      subtitle: 'Finalizaron el curso',
      icon: <PersonAdd />,
      color: colorSuccess,
    },
    {
      title: 'Retiradas',
      value: estadisticas?.retiradas || 0,
      subtitle: 'Abandonaron el curso',
      icon: <Cancel />,
      color: colorError,
    },
    {
      title: 'Total Ingresos',
      value: `Bs. ${Number(estadisticas?.total_ingresos || 0).toLocaleString('es-BO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtitle: `${estadisticas?.pagos_verificados || 0} pagos verificados`,
      icon: <AttachMoney />,
      color: colorSuccess,
      trend: '+8% vs periodo anterior',
    },
    {
      title: 'Tasa Verificación',
      value: estadisticas
        ? `${Math.round((Number(estadisticas.pagos_verificados) / Number(estadisticas.total_inscripciones)) * 100)}%`
        : '0%',
      subtitle: 'Pagos confirmados',
      icon: <CheckCircle />,
      color: colorInfo,
      progress: estadisticas
        ? (Number(estadisticas.pagos_verificados) / Number(estadisticas.total_inscripciones)) * 100
        : 0,
    },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid size={{xs:12, sm:6, md:4, lg:3}} key={index}>
          <StatCard {...stat} isLoading={isLoading} />
        </Grid>
      ))}
    </Grid>
  );
};