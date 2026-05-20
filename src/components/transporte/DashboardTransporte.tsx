// components/transporte/DashboardTransporte.tsx
'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  CircularProgress,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Route as RouteIcon,
  EventSeat as SeatIcon,
  TrendingUp as TrendingIcon,
  InfoOutlined as InfoIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useTransporte } from '@/hooks/useTransporte';
import { keyframes } from '@mui/system';

// Animaciones
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const rotateGradient = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
  info?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  trend, 
  delay = 0,
  info 
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: isDark
          ? `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.05)} 100%)`
          : `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.03)} 100%)`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(color, isDark ? 0.3 : 0.2)}`,
        borderRadius: '24px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `${fadeInUp} 0.6s ease-out ${delay}s both`,
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 20px 40px ${alpha(color, 0.3)}`,
          borderColor: alpha(color, 0.5),
          '&::before': {
            opacity: 1,
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, transparent 100%)`,
          opacity: 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Efecto de brillo animado */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.1)}, transparent)`,
          animation: hovered ? `${shimmer} 2s infinite` : 'none',
          pointerEvents: 'none',
        }}
      />

      {/* Partículas decorativas */}
      <Box
        sx={{
          position: 'absolute',
          right: -20,
          top: -20,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(color, 0.15)} 0%, transparent 70%)`,
          filter: 'blur(30px)',
          animation: `${float} 6s ease-in-out infinite`,
          pointerEvents: 'none',
        }}
      />

      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography
                variant="body2"
                sx={{ 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  letterSpacing: 1.2,
                  background: isDark 
                    ? `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.6)} 100%)`
                    : `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '0.75rem',
                }}
              >
                {title}
              </Typography>
              {info && (
                <Tooltip title={info} arrow placement="top">
                  <InfoIcon sx={{ fontSize: 14, color: 'text.secondary', opacity: 0.5 }} />
                </Tooltip>
              )}
            </Box>
            
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 0.5,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                lineHeight: 1,
                transition: 'all 0.3s ease',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {value}
            </Typography>
            
            {subtitle && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
              boxShadow: `0 8px 24px ${alpha(color, 0.4)}`,
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              transform: hovered ? 'rotate(5deg) scale(1.1)' : 'rotate(0deg) scale(1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, ${alpha('#fff', 0.2)} 0%, transparent 100%)`,
              },
              '& svg': {
                fontSize: 32,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              },
            }}
          >
            {icon}
          </Box>
        </Box>
        
        {trend && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mt: 2,
              p: 1.5,
              borderRadius: '12px',
              background: alpha(trend.isPositive ? '#10b981' : '#ef4444', 0.1),
              border: `1px solid ${alpha(trend.isPositive ? '#10b981' : '#ef4444', 0.2)}`,
            }}
          >
            <TrendingIcon
              sx={{
                fontSize: 20,
                color: trend.isPositive ? '#10b981' : '#ef4444',
                transform: trend.isPositive ? 'rotate(0deg)' : 'rotate(180deg)',
                animation: `${pulse} 2s ease-in-out infinite`,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: trend.isPositive ? '#10b981' : '#ef4444',
                fontWeight: 700,
                fontSize: '0.875rem',
              }}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              vs mes anterior
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

interface DetailCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
  delay?: number;
}

const DetailCard: React.FC<DetailCardProps> = ({ title, icon, color, children, delay = 0 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: isDark
          ? `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.05)} 100%)`
          : `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.02)} 100%)`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(color, 0.2)}`,
        borderRadius: '24px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `${fadeInUp} 0.6s ease-out ${delay}s both`,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 16px 32px ${alpha(color, 0.25)}`,
          borderColor: alpha(color, 0.4),
        },
      }}
    >
      {/* Gradiente animado de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.5)}, ${color})`,
          backgroundSize: '200% 100%',
          animation: hovered ? `${rotateGradient} 3s ease infinite` : 'none',
        }}
      />

      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
              boxShadow: `0 4px 16px ${alpha(color, 0.3)}`,
              color: '#fff',
              transition: 'all 0.3s ease',
              transform: hovered ? 'rotate(-5deg) scale(1.1)' : 'rotate(0deg) scale(1)',
              '& svg': {
                fontSize: 24,
              },
            }}
          >
            {icon}
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {title}
          </Typography>
        </Box>
        
        {children}
      </CardContent>
    </Card>
  );
};

interface DataRowProps {
  label: string;
  value: string | number;
  color?: string;
  showProgress?: boolean;
  progressValue?: number;
  isChip?: boolean;
}

const DataRow: React.FC<DataRowProps> = ({ 
  label, 
  value, 
  color, 
  showProgress, 
  progressValue,
  isChip = false 
}) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 2.5, '&:last-child': { mb: 0 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: showProgress ? 1 : 0 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          {label}
        </Typography>
        
        {isChip && color ? (
          <Chip
            label={value}
            size="small"
            sx={{
              bgcolor: alpha(color, 0.15),
              color: color,
              fontWeight: 700,
              borderRadius: '10px',
              border: `1px solid ${alpha(color, 0.3)}`,
              fontSize: '0.813rem',
              height: 28,
              '& .MuiChip-label': {
                px: 1.5,
              },
            }}
          />
        ) : (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 700,
              color: color || 'text.primary',
              fontSize: '0.938rem',
            }}
          >
            {value}
          </Typography>
        )}
      </Box>
      
      {showProgress && progressValue !== undefined && (
        <LinearProgress
          variant="determinate"
          value={progressValue}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: alpha(color || '#000', 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: `linear-gradient(90deg, ${color} 0%, ${alpha(color || '#000', 0.7)} 100%)`,
              boxShadow: `0 2px 8px ${alpha(color || '#000', 0.3)}`,
            },
          }}
        />
      )}
    </Box>
  );
};

export const DashboardTransporte: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [periodoId, setPeriodoId] = useState<number>(3);

  const {
    estadisticasRutas,
    estadisticasAsignaciones,
    cargarEstadisticasRutas,
    cargarEstadisticasAsignaciones,
    loadingEstadisticas,
    error,
  } = useTransporte();

  useEffect(() => {
    cargarEstadisticasRutas();
    cargarEstadisticasAsignaciones(periodoId);
  }, [periodoId]);

  if (loadingEstadisticas) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 400,
          gap: 2,
        }}
      >
        <CircularProgress 
          sx={{ 
            color: '#facc15',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }} 
          size={48}
          thickness={4}
        />
        <Typography variant="body2" color="text.secondary">
          Cargando estadísticas...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: '16px',
          background: alpha('#ef4444', 0.1),
          border: `1px solid ${alpha('#ef4444', 0.3)}`,
        }}
      >
        <Typography color="error" variant="h6" fontWeight={600}>
          {error}
        </Typography>
      </Box>
    );
  }

  const yellowColor = isDark ? '#facc15' : '#f59e0b';
  const greenColor = '#10b981';
  const blueColor = '#3b82f6';
  const purpleColor = '#a855f7';
  const orangeColor = '#f59e0b';

  const ocupacionPromedio = Number(estadisticasRutas?.ocupacion_promedio || 0);

  return (
    <Box>
      {/* Estadísticas principales con stagger animation */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{xs:12,sm:6,md:3}}>
          <StatCard
            title="Rutas Activas"
            value={estadisticasRutas?.rutas_activas || 0}
            subtitle={`de ${estadisticasRutas?.total_rutas || 0} totales`}
            icon={<RouteIcon />}
            color={yellowColor}
            delay={0}
            info="Total de rutas actualmente operativas"
          />
        </Grid>

        <Grid size={{xs:12,sm:6,md:3}}>
          <StatCard
            title="Estudiantes"
            value={estadisticasAsignaciones?.estudiantes_usando_transporte || 0}
            subtitle="usando transporte"
            icon={<PeopleIcon />}
            color={greenColor}
            delay={0.1}
            info="Estudiantes con servicio de transporte activo"
          />
        </Grid>

        <Grid size={{xs:12,sm:6,md:3}}>
          <StatCard
            title="Ocupación"
            value={`${ocupacionPromedio.toFixed(1)}%`}
            subtitle="promedio de rutas"
            icon={<SeatIcon />}
            color={blueColor}
            trend={{
              value: 5.2,
              isPositive: true,
            }}
            delay={0.2}
            info="Porcentaje de ocupación promedio en todas las rutas"
          />
        </Grid>

        <Grid size={{xs:12,sm:6,md:3}}>
          <StatCard
            title="Ingreso Mensual"
            value={`Bs ${(estadisticasAsignaciones?.ingreso_mensual_proyectado || 0).toLocaleString()}`}
            subtitle="proyectado"
            icon={<MoneyIcon />}
            color={purpleColor}
            delay={0.3}
            info="Ingreso mensual proyectado basado en asignaciones activas"
          />
        </Grid>
      </Grid>

      {/* Tarjetas de resumen adicional con animaciones */}
      <Grid container spacing={3}>
        <Grid size={{xs:12,md:6}}>
          <DetailCard
            title="Capacidad de Rutas"
            icon={<SpeedIcon />}
            color={yellowColor}
            delay={0.4}
          >
            <Box>
              <DataRow
                label="Capacidad Total"
                value={`${estadisticasRutas?.capacidad_total || 0} cupos`}
                showProgress
                progressValue={100}
                color={yellowColor}
              />
              
              <DataRow
                label="Cupos Ocupados"
                value={`${estadisticasRutas?.cupos_ocupados_total || 0} cupos`}
                color={greenColor}
                isChip
                showProgress
                progressValue={
                  estadisticasRutas?.capacidad_total 
                    ? (estadisticasRutas.cupos_ocupados_total / estadisticasRutas.capacidad_total) * 100
                    : 0
                }
              />
              
              <DataRow
                label="Cupos Disponibles"
                value={`${estadisticasRutas?.cupos_disponibles_total || 0} cupos`}
                color={blueColor}
                isChip
                showProgress
                progressValue={
                  estadisticasRutas?.capacidad_total 
                    ? (estadisticasRutas.cupos_disponibles_total / estadisticasRutas.capacidad_total) * 100
                    : 0
                }
              />
            </Box>
          </DetailCard>
        </Grid>

        <Grid size={{xs:12,md:6}}>
          <DetailCard
            title="Estado de Asignaciones"
            icon={<BusIcon />}
            color={greenColor}
            delay={0.5}
          >
            <Box>
              <DataRow
                label="Asignaciones Activas"
                value={estadisticasAsignaciones?.activas || 0}
                color={greenColor}
                isChip
                showProgress
                progressValue={
                  estadisticasAsignaciones?.total_asignaciones
                    ? (estadisticasAsignaciones.activas / estadisticasAsignaciones.total_asignaciones) * 100
                    : 0
                }
              />
              
              <DataRow
                label="Suspendidas"
                value={estadisticasAsignaciones?.suspendidas || 0}
                color={orangeColor}
                isChip
                showProgress
                progressValue={
                  estadisticasAsignaciones?.total_asignaciones
                    ? (estadisticasAsignaciones.suspendidas / estadisticasAsignaciones.total_asignaciones) * 100
                    : 0
                }
              />
              
              <DataRow
                label="Total de Asignaciones"
                value={estadisticasAsignaciones?.total_asignaciones || 0}
              />
            </Box>
          </DetailCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardTransporte;