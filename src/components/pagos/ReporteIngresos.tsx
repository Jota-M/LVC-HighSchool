// components/pagos/ReporteIngresos.tsx
'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Grid,
  CircularProgress,
  TextField,
  Button,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Download as DownloadIcon } from '@mui/icons-material';
import { usePagos } from '@/hooks/usePagos';
import academicosService from '@/services/academicos';

export const ReporteIngresos: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { ingresos, loadingReportes, cargarIngresos } = usePagos({});

  const [periodoId, setPeriodoId] = useState<number | null>(null);

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
      cargarIngresos({ periodo_academico_id: periodoId });
    }
  }, [periodoId, cargarIngresos]);

  if (loadingReportes) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Preparar datos para gráficas
  const ingresosPorMes = ingresos.reduce((acc: any[], ingreso) => {
    const mesKey = new Date(ingreso.mes).toLocaleDateString('es-BO', {
      month: 'short',
      year: 'numeric',
    });
    
    const existing = acc.find((item) => item.mes === mesKey);
    if (existing) {
      existing.total += ingreso.total_ingreso;
      existing.cantidad += ingreso.cantidad_pagos;
    } else {
      acc.push({
        mes: mesKey,
        total: ingreso.total_ingreso,
        cantidad: ingreso.cantidad_pagos,
      });
    }
    return acc;
  }, []);

  const ingresosPorMetodo = ingresos.reduce((acc: any[], ingreso) => {
  const metodoPago: string = ingreso.metodo_pago ? String(ingreso.metodo_pago) : 'sin_metodo';

  const existing = acc.find((item) => item.metodo_key === metodoPago);

  if (existing) {
    existing.total += Number(ingreso.total_ingreso || 0);
    existing.cantidad += Number(ingreso.cantidad_pagos || 0);
  } else {
    acc.push({
      metodo_key: metodoPago,
      metodo:
        metodoPago === 'sin_metodo'
          ? 'Sin método'
          : metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1),
      total: Number(ingreso.total_ingreso || 0),
      cantidad: Number(ingreso.cantidad_pagos || 0),
    });
  }

  return acc;
}, []);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  const totalIngresos = ingresos.reduce((sum, ing) => sum + ing.total_ingreso, 0);
  const totalPagos = ingresos.reduce((sum, ing) => sum + ing.cantidad_pagos, 0);

  const handleExportar = () => {
    // TODO: Implementar exportación
    console.log('Exportar ingresos');
  };

  return (
    <Box>
      {/* Resumen */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card
            sx={{
              borderRadius: '16px',
              background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
              border: `1px solid ${alpha('#10b981', 0.2)}`,
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Ingresos
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Bs {totalIngresos.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Card
            sx={{
              borderRadius: '16px',
              background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
              border: `1px solid ${alpha('#3b82f6', 0.2)}`,
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Pagos Registrados
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#3b82f6">
                {totalPagos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficas */}
      <Grid container spacing={3}>
        {/* Ingresos por Mes */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            sx={{
              borderRadius: '20px',
              background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Ingresos por Mes
                </Typography>
                <Button
                  color='secondary'
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportar}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                  }}
                >
                  Exportar
                </Button>
              </Box>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ingresosPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha('#999', 0.2)} />
                  <XAxis
                    dataKey="mes"
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: any) =>
                      `Bs ${parseFloat(value).toLocaleString('es-BO', {
                        minimumFractionDigits: 2,
                      })}`
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="total"
                    fill={isDark ? '#facc15' : '#0288d1'}
                    radius={[8, 8, 0, 0]}
                    name="Ingresos (Bs)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Ingresos por Método */}
        <Grid size={{ xs: 12, lg: 4 }}>
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
                Por Método de Pago
              </Typography>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ingresosPorMetodo}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payload, percent }) =>
                      `${payload.metodo}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {ingresosPorMetodo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: any) =>
                      `Bs ${parseFloat(value).toLocaleString('es-BO', {
                        minimumFractionDigits: 2,
                      })}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Leyenda personalizada */}
              <Box sx={{ mt: 2 }}>
                {ingresosPorMetodo.map((item, index) => (
                  <Box
                    key={item.metodo}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      borderRadius: '8px',
                      background: alpha(COLORS[index % COLORS.length], 0.1),
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <Typography variant="body2">{item.metodo}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      Bs {item.total.toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};