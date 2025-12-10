// components/docentes/DocentesStats.tsx - CON DATOS REALES Y DISEÑO MEJORADO
'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  WorkOutline as ContractIcon,
  Psychology as FormacionIcon,
} from '@mui/icons-material';
import docenteService from '@/services/docenteService';
import { toast } from 'react-hot-toast';

interface DocenteStats {
  total_docentes: number;
  activos: number;
  inactivos: number;
  por_tipo_contrato: {
    planta: number;
    contrato: number;
    honorarios: number;
    medio_tiempo: number;
  };
  por_nivel_formacion: {
    bachiller: number;
    licenciatura: number;
    maestria: number;
    doctorado: number;
  };
  total_asignaciones: number;
  promedio_asignaciones: number;
  docentes_con_asignaciones: number;
  top_especialidades?: Array<{ especialidad: string; cantidad: number }>;
}

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

interface DistributionCardProps {
  title: string;
  data: { label: string; value: number; color: string }[];
  icon: React.ReactNode;
}

const DistributionCard: React.FC<DistributionCardProps> = ({ title, data, icon }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '20px',
        background: isDark
          ? alpha(theme.palette.background.paper, 0.8)
          : alpha(theme.palette.background.paper, 0.9),
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDark
              ? alpha('#facc15', 0.15)
              : alpha('#0288d1', 0.15),
            '& svg': {
              fontSize: 20,
              color: isDark ? '#facc15' : '#0288d1',
            },
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;

          return (
            <Box key={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {item.value}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: item.color }}>
                    {percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  height: 8,
                  borderRadius: '4px',
                  backgroundColor: alpha(item.color, 0.2),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: item.color,
                    borderRadius: '4px',
                  },
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export const DocentesStats: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [stats, setStats] = useState<DocenteStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setIsLoading(true);
    try {
      // Llamada REAL al endpoint de estadísticas
      const response = await docenteService.obtenerEstadisticas();
      setStats(response.data.estadisticas);
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
      toast.error('Error al cargar estadísticas');
      
      // En caso de error, establecer valores por defecto
      setStats({
        total_docentes: 0,
        activos: 0,
        inactivos: 0,
        por_tipo_contrato: {
          planta: 0,
          contrato: 0,
          honorarios: 0,
          medio_tiempo: 0,
        },
        por_nivel_formacion: {
          bachiller: 0,
          licenciatura: 0,
          maestria: 0,
          doctorado: 0,
        },
        total_asignaciones: 0,
        promedio_asignaciones: 0,
        docentes_con_asignaciones: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const porcentajeActivos = (stats.activos / (stats.total_docentes || 1)) * 100;
  const porcentajeConAsignaciones = (stats.docentes_con_asignaciones / (stats.total_docentes || 1)) * 100;

  const statsCards = [
    {
      title: 'Total Docentes',
      value: stats.total_docentes,
      icon: <GroupIcon />,
      color: isDark ? '#facc15' : '#0288d1',
      subtitle: 'Registrados en el sistema',
    },
    {
      title: 'Activos',
      value: stats.activos,
      icon: <ActiveIcon />,
      color: '#10b981',
      subtitle: `${porcentajeActivos.toFixed(1)}% del total`,
    },
    {
      title: 'Inactivos',
      value: stats.inactivos,
      icon: <InactiveIcon />,
      color: '#ef4444',
      subtitle: stats.inactivos > 0 ? 'Requieren atención' : 'Todo en orden',
    },
    {
      title: 'Total Asignaciones',
      value: stats.total_asignaciones,
      icon: <AssignmentIcon />,
      color: '#f59e0b',
      subtitle: 'Materias asignadas',
    },
    {
      title: 'Promedio Asignaciones',
      value: stats.promedio_asignaciones.toFixed(1),
      icon: <TrendingUpIcon />,
      color: '#8b5cf6',
      subtitle: 'Por docente',
    },
    {
      title: 'Con Asignaciones',
      value: stats.docentes_con_asignaciones,
      icon: <SchoolIcon />,
      color: '#06b6d4',
      subtitle: `${porcentajeConAsignaciones.toFixed(1)}% del total`,
    },
  ];

  return (
    <Box>
      {/* Tarjetas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Distribuciones */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionCard
            title="Distribución por Tipo de Contrato"
            icon={<ContractIcon />}
            data={[
              {
                label: 'Planta',
                value: stats.por_tipo_contrato.planta,
                color: '#10b981',
              },
              {
                label: 'Contrato',
                value: stats.por_tipo_contrato.contrato,
                color: '#3b82f6',
              },
              {
                label: 'Honorarios',
                value: stats.por_tipo_contrato.honorarios,
                color: '#f59e0b',
              },
              {
                label: 'Medio Tiempo',
                value: stats.por_tipo_contrato.medio_tiempo,
                color: '#8b5cf6',
              },
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionCard
            title="Distribución por Nivel de Formación"
            icon={<FormacionIcon />}
            data={[
              {
                label: 'Doctorado',
                value: stats.por_nivel_formacion.doctorado,
                color: '#7c3aed',
              },
              {
                label: 'Maestría',
                value: stats.por_nivel_formacion.maestria,
                color: '#4f46e5',
              },
              {
                label: 'Licenciatura',
                value: stats.por_nivel_formacion.licenciatura,
                color: '#3b82f6',
              },
              {
                label: 'Bachiller',
                value: stats.por_nivel_formacion.bachiller,
                color: '#06b6d4',
              },
            ]}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocentesStats;