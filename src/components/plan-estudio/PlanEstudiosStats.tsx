'use client';
import React from 'react';
import { Box, Typography, alpha, useTheme, Skeleton } from '@mui/material';
import {
  MenuBook as BookIcon,
  Schedule as ClockIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  AutoAwesome as SparkleIcon
} from '@mui/icons-material';
import { Grado } from '../../services/niveles';

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color, delay }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        position: 'relative',
        p: 2.5,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `slideUp 0.5s ease-out ${delay}s both`,
        '@keyframes slideUp': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(color, 0.2)}`,
          '& .stat-icon': {
            transform: 'scale(1.1) rotate(5deg)'
          },
          '& .stat-value': {
            transform: 'scale(1.05)'
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 100,
          height: 100,
          background: `radial-gradient(circle, ${alpha(color, 0.15)} 0%, transparent 70%)`,
          transform: 'translate(30%, -30%)'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box
          className="stat-icon"
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${alpha(color, 0.4)}`,
            transition: 'transform 0.3s ease',
            '& svg': { color: 'white', fontSize: 24 }
          }}
        >
          {icon}
        </Box>
        
        <Box>
          <Typography
            className="stat-value"
            variant="h3"
            fontWeight="800"
            sx={{
              color: color,
              lineHeight: 1,
              transition: 'transform 0.3s ease',
              textShadow: `0 2px 10px ${alpha(color, 0.2)}`
            }}
          >
            {value}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              letterSpacing: 0.5
            }}
          >
            {label}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

interface PlanEstudiosStatsProps {
  grado: Grado | null;
  resumen: {
    total_materias: number;
    total_horas: number;
    total_creditos: number;
    materias_obligatorias: number;
    materias_electivas: number;
  };
  loading: boolean;
}

const PlanEstudiosStats: React.FC<PlanEstudiosStatsProps> = ({ grado, resumen, loading }) => {
  const theme = useTheme();

  if (!grado) return null;

  if (loading) {
    return (
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 2
      }}>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 3 }} />
        ))}
      </Box>
    );
  }

  const stats = [
    {
      icon: <BookIcon />,
      value: resumen.total_materias,
      label: 'Materias',
      color: theme.palette.primary.main
    },
    {
      icon: <ClockIcon />,
      value: resumen.total_horas,
      label: 'Horas/Semana',
      color: theme.palette.info.main
    },
    {
      icon: <StarIcon />,
      value: resumen.total_creditos,
      label: 'Créditos',
      color: theme.palette.warning.main
    },
    {
      icon: <CheckIcon />,
      value: resumen.materias_obligatorias,
      label: 'Obligatorias',
      color: theme.palette.success.main
    }
  ];

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header del grado */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 3,
        pb: 2,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <SparkleIcon sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
            <Typography variant="overline" color="text.secondary" fontWeight="600">
              Plan de Estudios
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight="800">
            {grado.nombre}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {grado.nivel_nombre} {grado.codigo && `• ${grado.codigo}`}
          </Typography>
        </Box>

        {/* Progress ring (opcional, decorativo) */}
        <Box sx={{
          position: 'relative',
          width: 80,
          height: 80,
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke={alpha(theme.palette.primary.main, 0.1)}
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke={theme.palette.primary.main}
              strokeWidth="6"
              strokeDasharray={`${(resumen.total_materias / 15) * 220} 220`}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dasharray 0.5s ease'
              }}
            />
          </svg>
          <Box sx={{
            position: 'absolute',
            textAlign: 'center'
          }}>
            <Typography variant="h6" fontWeight="800" color="primary">
              {Math.round((resumen.total_materias / 15) * 100)}%
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 2
      }}>
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} delay={index * 0.1} />
        ))}
      </Box>
    </Box>
  );
};

export default PlanEstudiosStats;