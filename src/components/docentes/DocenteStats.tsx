'use client';
import React, { useEffect, useState } from 'react';
import { Box, Typography, alpha, useTheme, Skeleton } from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignIcon,
  CheckCircle as ActiveIcon,
  WorkOutline as ContractIcon
} from '@mui/icons-material';
import { Docente } from '../../services/docentes';

// Hook para animar los números
const useCounter = (target: number, duration = 900) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        start = target;
        clearInterval(interval);
      }
      setCount(Math.round(start));
    }, 16);
    return () => clearInterval(interval);
  }, [target, duration]);
  return count;
};

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color: string;
  delay: number;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color, delay, subtitle }) => {
  const theme = useTheme();
  const animatedValue = typeof value === 'number' ? useCounter(value) : value;

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
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(color, 0.25)}`,
          '& .stat-icon': { transform: 'scale(1.1) rotate(5deg)' },
          '&::before': { opacity: 0.6 }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          background: `radial-gradient(circle, ${alpha(color, 0.15)} 0%, transparent 70%)`,
          transform: 'translate(20%, -20%)',
          transition: 'opacity 0.3s'
        }
      }}
      onMouseMove={(e) => {
        const { clientX, clientY, currentTarget } = e;
        const rect = currentTarget.getBoundingClientRect();
        const x = clientX - rect.left - rect.width / 2;
        const y = clientY - rect.top - rect.height / 2;
        currentTarget.style.transform = `rotateY(${x / 40}deg) rotateX(${-y / 40}deg) translateY(-4px)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg)';
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, position: 'relative', zIndex: 1 }}>
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
            transition: 'transform 0.3s ease, filter 0.3s ease',
            position: 'relative',
            '& svg': { color: 'white', fontSize: 24 },
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: 2,
              background: color,
              opacity: 0,
              filter: 'blur(12px)',
              transition: 'opacity 0.3s'
            },
            '&:hover::after': { opacity: 0.55 }
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            variant="h3"
            fontWeight="800"
            sx={{ color, lineHeight: 1, textShadow: `0 2px 10px ${alpha(color, 0.2)}` }}
          >
            {animatedValue}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {label}
          </Typography>
          {subtitle && (
            <Typography variant="caption" display="block" sx={{ color: alpha(color, 0.8), fontWeight: 600, mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

interface DocenteStatsProps {
  docentes: Docente[];
  loading: boolean;
}

const DocenteStats: React.FC<DocenteStatsProps> = ({ docentes, loading }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2, mb: 3 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 3 }} />
        ))}
      </Box>
    );
  }

  // Calcular estadísticas
  const totalDocentes = docentes.length;
  const docentesActivos = docentes.filter((d) => d.activo).length;
  const totalAsignaciones = docentes.reduce((sum, d) => sum + (d.total_asignaciones || 0), 0);

  const porTipoContrato = {
    planta: docentes.filter((d) => d.tipo_contrato === 'planta').length,
    contrato: docentes.filter((d) => d.tipo_contrato === 'contrato').length,
    honorarios: docentes.filter((d) => d.tipo_contrato === 'honorarios').length,
    medio_tiempo: docentes.filter((d) => d.tipo_contrato === 'medio_tiempo').length
  };

  const conPosgrado = docentes.filter(
    (d) => d.nivel_formacion === 'maestria' || d.nivel_formacion === 'doctorado'
  ).length;

  const stats = [
    {
      icon: <PeopleIcon />,
      value: totalDocentes,
      label: 'Total Docentes',
      color: theme.palette.primary.main,
      subtitle: `${docentesActivos} activos`
    },
    {
      icon: <AssignIcon />,
      value: totalAsignaciones,
      label: 'Asignaciones',
      color: theme.palette.info.main
    },
    {
      icon: <ContractIcon />,
      value: porTipoContrato.planta,
      label: 'De Planta',
      color: theme.palette.success.main,
      subtitle: `${porTipoContrato.contrato} por contrato`
    },
    {
      icon: <SchoolIcon />,
      value: conPosgrado,
      label: 'Con Posgrado',
      color: theme.palette.warning.main,
      subtitle: `${Math.round((conPosgrado / totalDocentes) * 100) || 0}% del total`
    },
    {
      icon: <ActiveIcon />,
      value: `${Math.round((docentesActivos / totalDocentes) * 100) || 0}%`,
      label: 'Tasa Activos',
      color: theme.palette.secondary.main
    }
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} delay={index * 0.1} />
        ))}
      </Box>
    </Box>
  );
};

export default DocenteStats;
