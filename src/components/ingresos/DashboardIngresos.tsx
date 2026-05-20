// components/ingresos/DashboardIngresos.tsx
'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  alpha,
  LinearProgress,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  AccountBalance as BankIcon,
  Assessment as AssessmentIcon,
  ShowChart as ChartIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { useIngresos } from '@/hooks/Useingresos';
import ingresosService from '@/services/ingresos';
import { keyframes } from '@mui/system';
import type { CategoriaIngreso, MetodoPago } from '@/types/ingresos';

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
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                lineHeight: 1.2,
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
            <TrendingUpIcon
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

interface CategoryRowProps {
  categoria: CategoriaIngreso;
  monto: number;
  cantidad: number;
  porcentaje: number;
  color: string;
}

const CategoryRow: React.FC<CategoryRowProps> = ({ 
  categoria, 
  monto, 
  cantidad, 
  porcentaje,
  color 
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Box 
      sx={{ mb: 3, '&:last-child': { mb: 0 } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: color,
              boxShadow: `0 0 8px ${alpha(color, 0.5)}`,
              transition: 'all 0.3s ease',
              transform: hovered ? 'scale(1.3)' : 'scale(1)',
            }}
          />
          <Typography 
            variant="body2" 
            fontWeight={600}
            sx={{
              transition: 'all 0.3s ease',
              color: hovered ? color : 'text.primary',
            }}
          >
            {ingresosService.getCategoriaIngresoLabel(categoria)}
          </Typography>
        </Box>
        <Typography 
          variant="body2" 
          fontWeight={700} 
          sx={{ 
            color,
            fontSize: '0.938rem',
          }}
        >
          {ingresosService.formatearMonto(monto)}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={porcentaje}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: alpha(color, 0.15),
          mb: 0.5,
          transition: 'all 0.3s ease',
          transform: hovered ? 'scaleY(1.2)' : 'scaleY(1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
            borderRadius: 4,
            background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
            boxShadow: hovered ? `0 2px 8px ${alpha(color, 0.4)}` : 'none',
          },
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {cantidad} {cantidad === 1 ? 'transacción' : 'transacciones'}
        </Typography>
        <Chip
          label={`${porcentaje.toFixed(1)}%`}
          size="small"
          sx={{
            bgcolor: alpha(color, 0.15),
            color: color,
            fontWeight: 700,
            fontSize: '0.688rem',
            height: 22,
            borderRadius: '8px',
            border: `1px solid ${alpha(color, 0.3)}`,
            '& .MuiChip-label': {
              px: 1,
            },
          }}
        />
      </Box>
    </Box>
  );
};


interface PaymentMethodRowProps {
  metodo: MetodoPago;
  monto: number;
  cantidad: number;
  color: string;
}

const PaymentMethodRow: React.FC<PaymentMethodRowProps> = ({ 
  metodo, 
  monto, 
  cantidad,
  color 
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Box 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2.5,
        mb: 2,
        borderRadius: '16px',
        background: alpha(color, 0.08),
        border: `1px solid ${alpha(color, 0.15)}`,
        transition: 'all 0.3s ease',
        cursor: 'default',
        '&:hover': {
          background: alpha(color, 0.12),
          borderColor: alpha(color, 0.3),
          transform: 'translateX(4px)',
          boxShadow: `0 4px 12px ${alpha(color, 0.2)}`,
        },
        '&:last-child': {
          mb: 0,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
            boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
            transition: 'all 0.3s ease',
            transform: hovered ? 'rotate(-5deg) scale(1.1)' : 'rotate(0deg) scale(1)',
          }}
        >
          <BankIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography 
            variant="body2" 
            fontWeight={600}
            sx={{
              transition: 'color 0.3s ease',
              color: hovered ? color : 'text.primary',
            }}
          >
            {ingresosService.getMetodoPagoLabel(metodo)}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {cantidad} {cantidad === 1 ? 'transacción' : 'transacciones'}
          </Typography>
        </Box>
      </Box>
      <Typography 
        variant="h6" 
        fontWeight={700} 
        sx={{
          background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {ingresosService.formatearMonto(monto)}
      </Typography>
    </Box>
  );
};

export const DashboardIngresos: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const {
    estadisticas,
    resumenCategorias,
    resumenMetodosPago,
    loadingReportes,
    cargarEstadisticas,
    cargarResumenCategorias,
    cargarResumenMetodosPago,
  } = useIngresos();

  const yellowColor = isDark ? '#facc15' : '#f59e0b';
  const greenColor = '#10b981';
  const blueColor = '#3b82f6';
  const purpleColor = '#a855f7';

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const filtros = {
      fecha_desde: ingresosService.obtenerFechaInicioPeriodo('mes'),
      fecha_hasta: ingresosService.obtenerFechaFinPeriodo('mes'),
    };
    
    await Promise.all([
      cargarEstadisticas(filtros),
      cargarResumenCategorias(filtros),
      cargarResumenMetodosPago(filtros),
    ]);
  };

  if (loadingReportes) {
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
            color: yellowColor,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }} 
          size={48}
          thickness={4}
        />
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Cargando estadísticas de ingresos...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Estadísticas Principales con animación stagger */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Ingresos del Mes"
            value={ingresosService.formatearMonto(estadisticas?.monto_total || 0)}
            subtitle="monto total recaudado"
            icon={<MoneyIcon />}
            color={yellowColor}
            delay={0}
            info="Total de ingresos del mes actual"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Transacciones"
            value={estadisticas?.total_ingresos || 0}
            subtitle="operaciones realizadas"
            icon={<ReceiptIcon />}
            color={greenColor}
            delay={0.1}
            info="Número total de transacciones registradas"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Promedio"
            value={ingresosService.formatearMonto(estadisticas?.promedio_ingreso || 0)}
            subtitle="por transacción"
            icon={<ChartIcon />}
            color={blueColor}
            trend={{
              value: 8.5,
              isPositive: true,
            }}
            delay={0.2}
            info="Promedio de monto por cada ingreso registrado"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Estudiantes"
            value={estadisticas?.estudiantes_que_pagaron || 0}
            subtitle="han realizado pagos"
            icon={<PeopleIcon />}
            color={purpleColor}
            delay={0.3}
            info="Total de estudiantes que han efectuado pagos"
          />
        </Grid>
      </Grid>

      {/* Resumen por Categoría y Métodos de Pago */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <DetailCard
            title="Ingresos por Categoría"
            icon={<AssessmentIcon />}
            color={yellowColor}
            delay={0.4}
          >
            <Box>
              {resumenCategorias.map((categoria, index) => {
                const rawColor = ingresosService.getCategoriaColor(categoria.categoria as any);
                const color = rawColor ?? '#9e9e9e';
                const porcentaje = estadisticas?.monto_total
                  ? (categoria.monto_neto / estadisticas.monto_total) * 100
                  : 0;

                return (
                  <CategoryRow
                    key={index}
                    categoria={categoria.categoria}
                    monto={categoria.monto_neto}
                    cantidad={categoria.cantidad_transacciones}
                    porcentaje={porcentaje}
                    color={color}
                  />
                );
              })}
            </Box>
          </DetailCard>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <DetailCard
            title="Métodos de Pago"
            icon={<BankIcon />}
            color={greenColor}
            delay={0.5}
          >
            <Box>
              {resumenMetodosPago.map((metodo, index) => (
                <PaymentMethodRow
                  key={index}
                  metodo={metodo.metodo_pago}
                  monto={metodo.total_monto}
                  cantidad={metodo.cantidad_transacciones}
                  color={yellowColor}
                />
              ))}            </Box>
          </DetailCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardIngresos;