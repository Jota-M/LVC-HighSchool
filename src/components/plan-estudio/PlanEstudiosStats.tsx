'use client';
import React from 'react';
import { Box, Typography, alpha, useTheme, Skeleton, Paper } from '@mui/material';
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
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Box
      sx={{
        position: 'relative',
        p: 3,
        borderRadius: '16px',
        background: isDark
          ? `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.05)} 100%)`
          : `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `2px solid ${alpha(color, 0.3)}`,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `slideUp 0.6s ease-out ${delay}s both`,
        '@keyframes slideUp': {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        },
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 16px 32px ${alpha(color, 0.25)}`,
          borderColor: alpha(color, 0.6),
          '& .stat-icon': {
            transform: 'scale(1.15) rotate(5deg)',
          },
          '& .stat-value': {
            transform: 'scale(1.08)',
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 120,
          height: 120,
          background: `radial-gradient(circle, ${alpha(color, 0.2)} 0%, transparent 70%)`,
          transform: 'translate(35%, -35%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box
          className="stat-icon"
          sx={{
            width: 56,
            height: 56,
            borderRadius: '14px',
            background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 20px ${alpha(color, 0.5)}`,
            transition: 'transform 0.3s ease',
            '& svg': { 
              color: 'white', 
              fontSize: 28,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            }
          }}
        >
          {icon}
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Typography
            className="stat-value"
            variant="h3"
            sx={{
              fontWeight: 800,
              color: color,
              lineHeight: 1,
              transition: 'transform 0.3s ease',
              textShadow: `0 2px 12px ${alpha(color, 0.3)}`,
              mb: 0.5,
            }}
          >
            {value}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              fontSize: '0.7rem',
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
  const isDark = theme.palette.mode === 'dark';

  if (!grado) return null;

  if (loading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="rounded" height={120} sx={{ borderRadius: '20px', mb: 3 }} />
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 2
        }}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: '16px' }} />
          ))}
        </Box>
      </Box>
    );
  }

  const stats = [
    {
      icon: <BookIcon />,
      value: resumen.total_materias,
      label: 'Materias',
      color: isDark ? '#facc15' : '#0288d1'
    },
    {
      icon: <ClockIcon />,
      value: resumen.total_horas,
      label: 'Horas/Semana',
      color: '#06b6d4'
    },
    {
      icon: <StarIcon />,
      value: resumen.total_creditos,
      label: 'Créditos',
      color: '#f59e0b'
    },
    {
      icon: <CheckIcon />,
      value: resumen.materias_obligatorias,
      label: 'Obligatorias',
      color: '#10b981'
    }
  ];

  // Calcular progreso (ejemplo: basado en un mínimo de 10 materias)
  const progressPercent = Math.min((resumen.total_materias / 15) * 100, 100);

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header del grado mejorado */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: '20px',
          background: isDark
            ? `linear-gradient(135deg, ${alpha('#facc15', 0.15)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha('#0288d1', 0.15)} 0%, ${alpha('#01579b', 0.05)} 100%)`,
          border: `2px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decoración de fondo */}
        <Box
          sx={{
            position: 'absolute',
            right: -40,
            top: -40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(isDark ? '#facc15' : '#0288d1', 0.15)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 3,
          position: 'relative',
          zIndex: 1,
        }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <SparkleIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
              <Typography 
                variant="overline" 
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 700,
                  letterSpacing: 1.5,
                }}
              >
                Plan de Estudios
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              {grado.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {grado.nivel_nombre} {grado.codigo && `• ${grado.codigo}`}
            </Typography>
          </Box>

          {/* Progress ring mejorado */}
          <Box sx={{
            position: 'relative',
            width: 100,
            height: 100,
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={alpha(isDark ? '#facc15' : '#0288d1', 0.15)}
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={isDark ? '#facc15' : '#0288d1'}
                strokeWidth="8"
                strokeDasharray={`${(progressPercent / 100) * 264} 264`}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dasharray 0.6s ease',
                  filter: `drop-shadow(0 0 8px ${alpha(isDark ? '#facc15' : '#0288d1', 0.5)})`,
                }}
              />
            </svg>
            <Box sx={{
              position: 'absolute',
              textAlign: 'center'
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 800,
                  color: isDark ? '#facc15' : '#0288d1',
                  lineHeight: 1,
                }}
              >
                {Math.round(progressPercent)}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                completo
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Stats Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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