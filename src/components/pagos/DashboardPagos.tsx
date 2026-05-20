// components/pagos/DashboardPagos.tsx
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
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  AttachMoney,
  Warning,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import { usePagos } from '@/hooks/usePagos';
import { ResumenPagos } from '@/types/pagos';
import academicosService from '@/services/academicos';

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
  progress?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  progress,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: '20px',
        background: isDark
          ? alpha('#fff', 0.05)
          : alpha('#fff', 0.9),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(color, 0.2)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: alpha(color, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
            }}
          >
            {icon}
          </Box>
          {trend && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: trend.isPositive ? '#10b981' : '#ef4444',
              }}
            >
              {trend.isPositive ? <TrendingUp /> : <TrendingDown />}
              <Typography variant="body2" fontWeight={600}>
                {trend.value}%
              </Typography>
            </Box>
          )}
        </Box>

        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ mb: 0.5, color: color }}
        >
          {value}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={600}
          sx={{ mb: subtitle ? 1 : 0 }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}

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
                  backgroundColor: color,
                  borderRadius: 4,
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: 'block' }}
            >
              {progress.toFixed(1)}% completado
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

interface MetodoPagoCardProps {
  metodo: string;
  cantidad: number;
  total: number;
  color: string;
  icon: string;
}

const MetodoPagoCard: React.FC<MetodoPagoCardProps> = ({
  metodo,
  cantidad,
  total,
  color,
  icon,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        borderRadius: '16px',
        background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography fontSize={32}>{icon}</Typography>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {metodo}
            </Typography>
            <Typography variant="h6" fontWeight={700} color={color}>
              Bs {total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {cantidad} pagos
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const DashboardPagos: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [periodoId, setPeriodoId] = useState<number | null>(null);
  
  const { resumen, loading, cargarResumen } = usePagos({});

  useEffect(() => {
  const cargarPeriodoActivo = async () => {
    try {
      const response = await academicosService.obtenerPeriodoActivo();
      setPeriodoId(response.data.periodo.id);
    } catch (error) {
      console.error('Error al obtener periodo activo:', error);
    }
  };

  cargarPeriodoActivo();
}, []);

  useEffect(() => {
  if (periodoId) {
    cargarResumen(periodoId);
  }
}, [periodoId, cargarResumen]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!resumen) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No hay datos disponibles
        </Typography>
      </Box>
    );
  }

  const metodosIconos: Record<string, string> = {
    efectivo: '💵',
    transferencia: '🏦',
    qr: '📱',
    tarjeta: '💳',
  };

  const metodosColores: Record<string, string> = {
    efectivo: '#10b981',
    transferencia: '#3b82f6',
    qr: '#8b5cf6',
    tarjeta: '#f59e0b',
  };

  return (
    <Box>
      {/* Header con botón refresh */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Resumen General
        </Typography>
        <Tooltip title="Actualizar datos">
          <IconButton
            onClick={() => periodoId && cargarResumen(periodoId)}
            sx={{
              color: isDark ? '#facc15' : '#0288d1',
            }}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{xs:12, sm:6, md:3}}>
          <StatCard
            title="Total Estudiantes"
            value={resumen.estudiantes.total}
            icon={<People fontSize="large" />}
            color={isDark ? '#facc15' : '#0288d1'}
          />
        </Grid>

        <Grid size={{xs:12, sm:6, md:3}}>
          <StatCard
            title="Mensualidades Pagadas"
            value={`${resumen.mensualidades.pagadas}/${resumen.mensualidades.total}`}
            subtitle={`Bs ${resumen.mensualidades.monto_pagado.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`}
            icon={<CheckCircle fontSize="large" />}
            color="#10b981"
            progress={parseFloat(resumen.porcentajes.mensualidades_pagadas)}
          />
        </Grid>

        <Grid size={{xs:12, sm:6, md:3}}>
          <StatCard
            title="Mensualidades Pendientes"
            value={resumen.mensualidades.pendientes}
            subtitle={`Bs ${resumen.mensualidades.monto_pendiente.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`}
            icon={<Warning fontSize="large" />}
            color="#f59e0b"
            progress={parseFloat(resumen.porcentajes.mensualidades_pendientes)}
          />
        </Grid>

        <Grid size={{xs:12, sm:6, md:3}}>
          <StatCard
            title="Morosidad"
            value={`${resumen.mensualidades.vencidas} vencidas`}
            subtitle={`Bs ${resumen.mensualidades.monto_vencido.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`}
            icon={<TrendingDown fontSize="large" />}
            color="#ef4444"
            progress={parseFloat(resumen.porcentajes.morosidad)}
          />
        </Grid>
      </Grid>

      {/* Ingresos y Métodos de Pago */}
      <Grid container spacing={3}>
        <Grid size={{xs:12, md:6}}>
          <Card
            sx={{
              borderRadius: '20px',
              background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Ingresos Totales
              </Typography>

              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Bs {resumen.ingresos.total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pagos de mensualidades
                </Typography>
              </Box>

              {resumen.pagos_anuales.total > 0 && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    background: alpha('#10b981', 0.1),
                    border: `1px solid ${alpha('#10b981', 0.2)}`,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Pagos Anuales Completos
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="#10b981">
                    Bs {resumen.pagos_anuales.monto_total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {resumen.pagos_anuales.total} estudiantes
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs:12, md:6}}>
          <Card
            sx={{
              borderRadius: '20px',
              background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Métodos de Pago
              </Typography>

              <Grid container spacing={2}>
                {resumen.ingresos.por_metodo.map((metodo) => (
                  <Grid size={{xs:12, sm:6}} key={metodo.metodo_pago}>
                    <MetodoPagoCard
                      metodo={metodo.metodo_pago.charAt(0).toUpperCase() + metodo.metodo_pago.slice(1)}
                      cantidad={metodo.cantidad}
                      total={metodo.total}
                      color={metodosColores[metodo.metodo_pago] || '#6b7280'}
                      icon={metodosIconos[metodo.metodo_pago] || '💰'}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};