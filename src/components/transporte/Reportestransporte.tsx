// components/transporte/ReportesTransporte.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  MenuItem,
  TextField,
  Divider,
  useMediaQuery,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon,
  DirectionsBus as BusIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  Route as RouteIcon,
  EventSeat as SeatIcon,
  TrendingUp as TrendingIcon,
  LocalAtm as LocalAtmIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useTransporte } from '@/hooks/useTransporte';
import transporteService from '@/services/transporte';

export const ReportesTransporte: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    estadisticasRutas,
    estadisticasAsignaciones,
    rutas,
    asignaciones,
    pagosTransporte,
    loadingEstadisticas,
    cargarEstadisticasRutas,
    cargarEstadisticasAsignaciones,
    cargarRutas,
    cargarAsignaciones,
    cargarPagosTransporte,
  } = useTransporte();

  const [periodoId] = useState<number>(1); // TODO: Obtener del contexto
  const [tipoReporte, setTipoReporte] = useState('general');

  useEffect(() => {
    cargarDatos();
  }, [periodoId]);

  const cargarDatos = async () => {
    await Promise.all([
      cargarEstadisticasRutas(),
      cargarEstadisticasAsignaciones(periodoId),
      cargarRutas(),
      cargarAsignaciones({ periodo_academico_id: periodoId }),
      cargarPagosTransporte(),
    ]);
  };

  const yellowColor = isDark ? '#facc15' : '#f59e0b';

  // Calcular datos para reportes
  const calcularDatos = () => {
    // Pagos por estado
    const pagosPorEstado = {
      pagados: pagosTransporte.filter(p => p.estado === 'pagado').length,
      pendientes: pagosTransporte.filter(p => p.estado === 'pendiente').length,
      vencidos: pagosTransporte.filter(p => p.estado === 'vencido').length,
    };

    // Rutas más ocupadas
    const rutasOrdenadas = [...rutas]
      .filter(r => r.activo)
      .sort((a, b) => (b.porcentaje_ocupacion || 0) - (a.porcentaje_ocupacion || 0))
      .slice(0, 5);

    // Estudiantes por ruta
    const estudiantesPorRuta = rutas.map(ruta => ({
      ruta: ruta.nombre,
      estudiantes: asignaciones.filter(a => a.ruta_id === ruta.id && a.estado === 'activo').length,
    }));

    // Ingresos por mes
    const ingresosPorMes = pagosTransporte
      .filter(p => p.estado === 'pagado')
      .reduce((acc, pago) => {
        const mes = pago.mes_correspondiente;
        if (!acc[mes]) {
          acc[mes] = 0;
        }
        acc[mes] += pago.monto_pagado;
        return acc;
      }, {} as Record<string, number>);

    return {
      pagosPorEstado,
      rutasOrdenadas,
      estudiantesPorRuta,
      ingresosPorMes,
    };
  };

  const datos = calcularDatos();

  const handleExportarPDF = () => {
    alert('Funcionalidad de exportación a PDF en desarrollo');
  };

  const handleExportarExcel = () => {
    alert('Funcionalidad de exportación a Excel en desarrollo');
  };

  if (loadingEstadisticas) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Box sx={{ width: '100%', maxWidth: 500 }}>
          <Typography variant="h6" align="center" gutterBottom color="text.secondary">
            Cargando reportes de transporte...
          </Typography>
          <LinearProgress 
            sx={{ 
              height: 8,
              borderRadius: 4,
              '& .MuiLinearProgress-bar': { 
                backgroundColor: yellowColor,
                borderRadius: 4,
              } 
            }} 
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Card
        sx={{
          mb: 3,
          borderRadius: '24px',
          background: isDark
            ? `linear-gradient(135deg, ${alpha(yellowColor, 0.15)} 0%, ${alpha(yellowColor, 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha(yellowColor, 0.1)} 0%, ${alpha(yellowColor, 0.02)} 100%)`,
          border: `1px solid ${alpha(yellowColor, 0.2)}`,
          boxShadow: `0 4px 12px ${alpha(yellowColor, 0.1)}`,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: yellowColor,
                  color: isDark ? '#000' : '#fff',
                }}
              >
                <ReportIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Reportes de Transporte
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Análisis detallado de rutas y pagos
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Tooltip title="Actualizar datos" arrow>
                <IconButton
                  onClick={cargarDatos}
                  sx={{
                    backgroundColor: alpha(yellowColor, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(yellowColor, 0.2),
                      transform: 'rotate(180deg)',
                    },
                    transition: 'all 0.5s',
                  }}
                >
                  <RefreshIcon sx={{ color: yellowColor }} />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<PdfIcon />}
                onClick={handleExportarPDF}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  background: `linear-gradient(135deg, #ef4444 0%, #dc2626 100%)`,
                  color: '#fff',
                  borderRadius: '12px',
                  fontWeight: 600,
                  boxShadow: `0 4px 12px ${alpha('#ef4444', 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 20px ${alpha('#ef4444', 0.4)}`,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                {!isMobile && 'PDF'}
              </Button>
              <Button
                variant="contained"
                startIcon={<ExcelIcon />}
                onClick={handleExportarExcel}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`,
                  color: '#fff',
                  borderRadius: '12px',
                  fontWeight: 600,
                  boxShadow: `0 4px 12px ${alpha('#10b981', 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 20px ${alpha('#10b981', 0.4)}`,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                {!isMobile && 'Excel'}
              </Button>
            </Stack>
          </Box>

          <TextField
            select
            fullWidth={isMobile}
            size="small"
            label="Tipo de Reporte"
            value={tipoReporte}
            onChange={(e) => setTipoReporte(e.target.value)}
            sx={{ 
              minWidth: isMobile ? '100%' : 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              },
            }}
          >
            <MenuItem value="general">📊 Reporte General</MenuItem>
            <MenuItem value="rutas">🚌 Rutas y Ocupación</MenuItem>
            <MenuItem value="pagos">💰 Estado de Pagos</MenuItem>
            <MenuItem value="ingresos">💵 Ingresos por Mes</MenuItem>
          </TextField>
        </CardContent>
      </Card>

      {/* Resumen Estadístico */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${alpha(yellowColor, 0.15)} 0%, ${alpha(yellowColor, 0.05)} 100%)`,
              border: `1px solid ${alpha(yellowColor, 0.2)}`,
              boxShadow: `0 8px 24px ${alpha(yellowColor, 0.15)}`,
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 32px ${alpha(yellowColor, 0.25)}`,
              },
              transition: 'all 0.3s',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
                    color: isDark ? '#000' : '#fff',
                    boxShadow: `0 8px 24px ${alpha(yellowColor, 0.4)}`,
                  }}
                >
                  <BusIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Rutas Activas
                  </Typography>
                  <Typography variant="h5" fontWeight={900} color={yellowColor}>
                    {estadisticasRutas?.rutas_activas || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${alpha('#10b981', 0.15)} 0%, ${alpha('#10b981', 0.05)} 100%)`,
              border: `1px solid ${alpha('#10b981', 0.2)}`,
              boxShadow: `0 8px 24px ${alpha('#10b981', 0.15)}`,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 32px ${alpha('#10b981', 0.25)}`,
              },
              transition: 'all 0.3s',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`,
                    color: '#fff',
                    boxShadow: `0 8px 24px ${alpha('#10b981', 0.4)}`,
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Estudiantes
                  </Typography>
                  <Typography variant="h5" fontWeight={900} color="#10b981">
                    {estadisticasAsignaciones?.estudiantes_usando_transporte || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.15)} 0%, ${alpha('#3b82f6', 0.05)} 100%)`,
              border: `1px solid ${alpha('#3b82f6', 0.2)}`,
              boxShadow: `0 8px 24px ${alpha('#3b82f6', 0.15)}`,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 32px ${alpha('#3b82f6', 0.25)}`,
              },
              transition: 'all 0.3s',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)`,
                    color: '#fff',
                    boxShadow: `0 8px 24px ${alpha('#3b82f6', 0.4)}`,
                  }}
                >
                  <MoneyIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Ingreso Mensual
                  </Typography>
                  <Typography variant="h6" fontWeight={900} color="#3b82f6">
                    {transporteService.formatearMonto(estadisticasAsignaciones?.ingreso_mensual_proyectado || 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${alpha('#a855f7', 0.15)} 0%, ${alpha('#a855f7', 0.05)} 100%)`,
              border: `1px solid ${alpha('#a855f7', 0.2)}`,
              boxShadow: `0 8px 24px ${alpha('#a855f7', 0.15)}`,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 32px ${alpha('#a855f7', 0.25)}`,
              },
              transition: 'all 0.3s',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, #a855f7 0%, #9333ea 100%)`,
                    color: '#fff',
                    boxShadow: `0 8px 24px ${alpha('#a855f7', 0.4)}`,
                  }}
                >
                  <TrendingIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Ocupación
                  </Typography>
                  <Typography variant="h5" fontWeight={900} color="#a855f7">
                    {(Number(estadisticasRutas?.ocupacion_promedio) || 0).toFixed(0)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contenido según tipo de reporte */}
      {tipoReporte === 'general' && (
        <Grid container spacing={3}>
          {/* Estado de Pagos */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                borderRadius: '24px',
                boxShadow: `0 8px 24px ${alpha(yellowColor, 0.1)}`,
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(yellowColor, 0.15),
                      color: yellowColor,
                    }}
                  >
                    <LocalAtmIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Estado de Pagos
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 4 }}>
                    <Card
                      sx={{
                        borderRadius: '16px',
                        background: alpha('#10b981', 0.08),
                        border: `1px solid ${alpha('#10b981', 0.2)}`,
                        textAlign: 'center',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${alpha('#10b981', 0.2)}`,
                        },
                        transition: 'all 0.3s',
                      }}
                    >
                      <CardContent>
                        <CheckCircleIcon sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
                        <Typography variant="h3" color="#10b981" fontWeight={900}>
                          {datos.pagosPorEstado.pagados}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Pagados
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Card
                      sx={{
                        borderRadius: '16px',
                        background: alpha(yellowColor, 0.08),
                        border: `1px solid ${alpha(yellowColor, 0.2)}`,
                        textAlign: 'center',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${alpha(yellowColor, 0.2)}`,
                        },
                        transition: 'all 0.3s',
                      }}
                    >
                      <CardContent>
                        <ScheduleIcon sx={{ fontSize: 40, color: yellowColor, mb: 1 }} />
                        <Typography variant="h3" color={yellowColor} fontWeight={900}>
                          {datos.pagosPorEstado.pendientes}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Pendientes
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Card
                      sx={{
                        borderRadius: '16px',
                        background: alpha('#ef4444', 0.08),
                        border: `1px solid ${alpha('#ef4444', 0.2)}`,
                        textAlign: 'center',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${alpha('#ef4444', 0.2)}`,
                        },
                        transition: 'all 0.3s',
                      }}
                    >
                      <CardContent>
                        <ErrorIcon sx={{ fontSize: 40, color: '#ef4444', mb: 1 }} />
                        <Typography variant="h3" color="#ef4444" fontWeight={900}>
                          {datos.pagosPorEstado.vencidos}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Vencidos
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Capacidad Total */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                borderRadius: '24px',
                boxShadow: `0 8px 24px ${alpha(yellowColor, 0.1)}`,
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha('#3b82f6', 0.15),
                      color: '#3b82f6',
                    }}
                  >
                    <SeatIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Capacidad de Transporte
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Capacidad Total
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {estadisticasRutas?.capacidad_total || 0} cupos
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={estadisticasRutas?.ocupacion_promedio || 0}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: alpha(yellowColor, 0.15),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: yellowColor,
                        borderRadius: 6,
                        boxShadow: `0 0 8px ${alpha(yellowColor, 0.4)}`,
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                    {Number(estadisticasRutas?.ocupacion_promedio ?? 0).toFixed(1)}% de ocupación

                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Card
                      sx={{
                        borderRadius: '16px',
                        background: alpha('#10b981', 0.08),
                        border: `1px solid ${alpha('#10b981', 0.2)}`,
                        textAlign: 'center',
                      }}
                    >
                      <CardContent>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Ocupados
                        </Typography>
                        <Typography variant="h5" fontWeight={900} color="#10b981">
                          {estadisticasRutas?.cupos_ocupados_total || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Card
                      sx={{
                        borderRadius: '16px',
                        background: alpha('#3b82f6', 0.08),
                        border: `1px solid ${alpha('#3b82f6', 0.2)}`,
                        textAlign: 'center',
                      }}
                    >
                      <CardContent>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Disponibles
                        </Typography>
                        <Typography variant="h5" fontWeight={900} color="#3b82f6">
                          {estadisticasRutas?.cupos_disponibles_total || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tipoReporte === 'rutas' && (
        <Card
          sx={{
            borderRadius: '24px',
            boxShadow: `0 8px 24px ${alpha(yellowColor, 0.1)}`,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(yellowColor, 0.15),
                  color: yellowColor,
                }}
              >
                <RouteIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Rutas con Mayor Ocupación
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            {isMobile ? (
              // Vista de cards para mobile
              <Grid container spacing={2}>
                {datos.rutasOrdenadas.map((ruta, index) => (
                  <Grid size={{ xs: 12 }} key={ruta.id}>
                    <Card
                      sx={{
                        borderRadius: '16px',
                        border: `1px solid ${alpha(yellowColor, 0.2)}`,
                        background: alpha(yellowColor, 0.05),
                        '&:hover': {
                          transform: 'translateX(4px)',
                          boxShadow: `0 4px 12px ${alpha(yellowColor, 0.2)}`,
                        },
                        transition: 'all 0.3s',
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Chip
                            label={`#${index + 1}`}
                            sx={{
                              width: 40,
                              height: 40,
                              fontWeight: 900,
                              fontSize: '1rem',
                              backgroundColor: alpha(yellowColor, 0.2),
                              color: yellowColor,
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight={700}>
                              {ruta.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ruta.zona_cobertura || 'Sin zona'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={ruta.porcentaje_ocupacion || 0}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: alpha(yellowColor, 0.2),
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: yellowColor,
                                borderRadius: 5,
                              },
                            }}
                          />
                          <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                            {(ruta.porcentaje_ocupacion || 0).toFixed(1)}% ocupación
                          </Typography>
                        </Box>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">
                              Estudiantes
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>
                              {ruta.cupos_ocupados}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">
                              Capacidad
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>
                              {ruta.capacidad_maxima}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              // Vista de tabla para desktop
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha(yellowColor, 0.05) }}>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Ranking</TableCell>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Ruta</TableCell>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Zona</TableCell>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Ocupación</TableCell>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Estudiantes</TableCell>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Capacidad</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {datos.rutasOrdenadas.map((ruta, index) => (
                      <TableRow 
                        key={ruta.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(yellowColor, 0.03),
                          },
                        }}
                      >
                        <TableCell>
                          <Chip
                            label={`#${index + 1}`}
                            size="small"
                            sx={{
                              width: 36,
                              height: 36,
                              fontWeight: 900,
                              backgroundColor: alpha(yellowColor, 0.2),
                              color: yellowColor,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {ruta.nombre}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {ruta.zona_cobertura || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <LinearProgress
                              variant="determinate"
                              value={ruta.porcentaje_ocupacion || 0}
                              sx={{
                                width: 120,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: alpha(yellowColor, 0.2),
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: yellowColor,
                                  borderRadius: 4,
                                },
                              }}
                            />
                            <Typography variant="caption" fontWeight={600} sx={{ mt: 0.5, display: 'block' }}>
                              {(ruta.porcentaje_ocupacion || 0).toFixed(1)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="#10b981">
                            {ruta.cupos_ocupados}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {ruta.capacidad_maxima}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {tipoReporte === 'pagos' && (
        <Card
          sx={{
            borderRadius: '24px',
            boxShadow: `0 8px 24px ${alpha(yellowColor, 0.1)}`,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(yellowColor, 0.15),
                  color: yellowColor,
                }}
              >
                <LocalAtmIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Resumen de Pagos por Estado
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${alpha('#10b981', 0.15)} 0%, ${alpha('#10b981', 0.05)} 100%)`,
                    border: `1px solid ${alpha('#10b981', 0.2)}`,
                    boxShadow: `0 8px 24px ${alpha('#10b981', 0.15)}`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 32px ${alpha('#10b981', 0.25)}`,
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 48, color: '#10b981', mb: 2 }} />
                    <Typography variant="h2" color="#10b981" fontWeight={900}>
                      {datos.pagosPorEstado.pagados}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Pagos Completados
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${alpha(yellowColor, 0.15)} 0%, ${alpha(yellowColor, 0.05)} 100%)`,
                    border: `1px solid ${alpha(yellowColor, 0.2)}`,
                    boxShadow: `0 8px 24px ${alpha(yellowColor, 0.15)}`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 32px ${alpha(yellowColor, 0.25)}`,
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ScheduleIcon sx={{ fontSize: 48, color: yellowColor, mb: 2 }} />
                    <Typography variant="h2" color={yellowColor} fontWeight={900}>
                      {datos.pagosPorEstado.pendientes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Pagos Pendientes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${alpha('#ef4444', 0.15)} 0%, ${alpha('#ef4444', 0.05)} 100%)`,
                    border: `1px solid ${alpha('#ef4444', 0.2)}`,
                    boxShadow: `0 8px 24px ${alpha('#ef4444', 0.15)}`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 32px ${alpha('#ef4444', 0.25)}`,
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ErrorIcon sx={{ fontSize: 48, color: '#ef4444', mb: 2 }} />
                    <Typography variant="h2" color="#ef4444" fontWeight={900}>
                      {datos.pagosPorEstado.vencidos}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Pagos Vencidos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {tipoReporte === 'ingresos' && (
        <Card
          sx={{
            borderRadius: '24px',
            boxShadow: `0 8px 24px ${alpha(yellowColor, 0.1)}`,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                sx={{
                  bgcolor: alpha('#3b82f6', 0.15),
                  color: '#3b82f6',
                }}
              >
                <MoneyIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Ingresos por Mes
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            {isMobile ? (
              // Vista de cards para mobile
              <Grid container spacing={2}>
                {Object.entries(datos.ingresosPorMes).map(([mes, monto]) => (
                  <Grid size={{ xs: 12 }} key={mes}>
                    <Card
                      sx={{
                        borderRadius: '16px',
                        border: `1px solid ${alpha('#3b82f6', 0.2)}`,
                        background: alpha('#3b82f6', 0.05),
                        '&:hover': {
                          transform: 'translateX(4px)',
                          boxShadow: `0 4px 12px ${alpha('#3b82f6', 0.2)}`,
                        },
                        transition: 'all 0.3s',
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight={700}>
                            {transporteService.getMesNombre(mes)}
                          </Typography>
                          <Typography variant="h6" fontWeight={900} color={yellowColor}>
                            {transporteService.formatearMonto(monto)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {Object.entries(datos.ingresosPorMes).length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Card
                      sx={{
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${alpha(yellowColor, 0.15)} 0%, ${alpha(yellowColor, 0.05)} 100%)`,
                        border: `2px solid ${alpha(yellowColor, 0.3)}`,
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" fontWeight={900}>
                            TOTAL
                          </Typography>
                          <Typography variant="h5" fontWeight={900} color={yellowColor}>
                            {transporteService.formatearMonto(
                              Object.values(datos.ingresosPorMes).reduce((a, b) => a + b, 0)
                            )}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {Object.entries(datos.ingresosPorMes).length === 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        No hay datos de ingresos disponibles
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            ) : (
              // Vista de tabla para desktop
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha('#3b82f6', 0.05) }}>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Mes</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Monto Recaudado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(datos.ingresosPorMes).map(([mes, monto]) => (
                      <TableRow 
                        key={mes}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha('#3b82f6', 0.03),
                          },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {transporteService.getMesNombre(mes)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={900} color={yellowColor}>
                            {transporteService.formatearMonto(monto)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    {Object.entries(datos.ingresosPorMes).length > 0 && (
                      <TableRow sx={{ backgroundColor: alpha(yellowColor, 0.1) }}>
                        <TableCell>
                          <Typography variant="body1" fontWeight={900}>
                            TOTAL
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" fontWeight={900} color={yellowColor}>
                            {transporteService.formatearMonto(
                              Object.values(datos.ingresosPorMes).reduce((a, b) => a + b, 0)
                            )}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {Object.entries(datos.ingresosPorMes).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          <Typography color="text.secondary" sx={{ py: 2 }}>
                            No hay datos de ingresos disponibles
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};  

export default ReportesTransporte;