// components/ingresos/ReportesIngresos.tsx
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
  TrendingUp as TrendingIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  Money as CashIcon,
  QrCode as QrCodeIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useIngresos } from '@/hooks/Useingresos';
import ingresosService from '@/services/ingresos';

export const ReportesIngresos: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    resumenCategorias,
    resumenMetodosPago,
    ingresosDiarios,
    estadisticas,
    loadingReportes,
    cargarResumenCategorias,
    cargarResumenMetodosPago,
    cargarIngresosDiarios,
    cargarEstadisticas,
  } = useIngresos();

  const [tipoReporte, setTipoReporte] = useState('general');
  const [fechaDesde, setFechaDesde] = useState(ingresosService.obtenerFechaInicioPeriodo('mes'));
  const [fechaHasta, setFechaHasta] = useState(ingresosService.obtenerFechaFinPeriodo('mes'));

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const filtros = {
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
    };
    
    await Promise.all([
      cargarEstadisticas(filtros),
      cargarResumenCategorias(filtros),
      cargarResumenMetodosPago(filtros),
      cargarIngresosDiarios(filtros),
    ]);
  };

  const [exportando, setExportando] = useState(false);

  const handleExportarPDF = async () => {
    try {
      setExportando(true);
      await ingresosService.exportarReporteIngresos({
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        formato: 'pdf',
      });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al generar el PDF de ingresos');
    } finally {
      setExportando(false);
    }
  };

  const handleExportarExcel = async () => {
    try {
      setExportando(true);
      await ingresosService.exportarReporteIngresos({
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        formato: 'excel',
      });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al generar el Excel de ingresos');
    } finally {
      setExportando(false);
    }
  };

  const yellowColor = isDark ? '#facc15' : '#f59e0b';

  const getMetodoPagoIcon = (metodo: string) => {
    switch (metodo) {
      case 'efectivo': return <CashIcon />;
      case 'transferencia': return <BankIcon />;
      case 'qr': return <QrCodeIcon />;
      case 'tarjeta': return <CardIcon />;
      default: return <MoneyIcon />;
    }
  };

  const getMetodoPagoColor = (metodo: string) => {
    switch (metodo) {
      case 'efectivo': return '#10b981';
      case 'transferencia': return '#3b82f6';
      case 'qr': return '#a855f7';
      case 'tarjeta': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  if (loadingReportes) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Box sx={{ width: '100%', maxWidth: 500 }}>
          <Typography variant="h6" align="center" gutterBottom color="text.secondary">
            Cargando reportes...
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
                <AssessmentIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Reportes Financieros
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Análisis detallado de ingresos
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
                disabled={exportando}
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
                disabled={exportando}
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

          <Grid container spacing={2}>
            <Grid size={{xs:12, sm:6, md:3}}>
              <TextField
                fullWidth
                size="small"
                label="Fecha Desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
            <Grid size={{xs:12, sm:6, md:3}}>
              <TextField
                fullWidth
                size="small"
                label="Fecha Hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
            <Grid size={{xs:12, sm:6, md:4}}>
              <TextField
                select
                fullWidth
                size="small"
                label="Tipo de Reporte"
                value={tipoReporte}
                onChange={(e) => setTipoReporte(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                <MenuItem value="general">📊 Reporte General</MenuItem>
                <MenuItem value="categorias">📁 Por Categorías</MenuItem>
                <MenuItem value="metodos">💳 Por Métodos de Pago</MenuItem>
                <MenuItem value="diario">📅 Ingresos Diarios</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{xs:12, sm:6, md:2}}>
              <Button
                fullWidth
                variant="contained"
                onClick={cargarDatos}
                sx={{
                  background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
                  color: '#000',
                  fontWeight: 600,
                  borderRadius: '12px',
                  height: '40px',
                  boxShadow: `0 4px 12px ${alpha(yellowColor, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 20px ${alpha(yellowColor, 0.4)}`,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                Generar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Estadísticas Resumen */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{xs:12, sm:6, md:3}}>
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
                    color: '#000',
                    boxShadow: `0 8px 24px ${alpha(yellowColor, 0.4)}`,
                  }}
                >
                  <MoneyIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Total Ingresos
                  </Typography>
                  <Typography variant="h5" fontWeight={900} color={yellowColor}>
                    {ingresosService.formatearMonto(estadisticas?.monto_total || 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs:12, sm:6, md:3}}>
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
                  <TrendingIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Promedio
                  </Typography>
                  <Typography variant="h5" fontWeight={900} color="#10b981">
                    {ingresosService.formatearMonto(estadisticas?.promedio_ingreso || 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs:12, sm:6, md:3}}>
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
                  <ReceiptIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Transacciones
                  </Typography>
                  <Typography variant="h5" fontWeight={900} color="#3b82f6">
                    {estadisticas?.total_ingresos || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs:12, sm:6, md:3}}>
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
                  <PeopleIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Estudiantes
                  </Typography>
                  <Typography variant="h5" fontWeight={900} color="#a855f7">
                    {estadisticas?.estudiantes_que_pagaron || 0}
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
          <Grid size={{xs:12, md:6}}>
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
                    <TimelineIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Top 5 Categorías
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                {ingresosService.obtenerTop5Categorias(resumenCategorias).map((cat, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={index + 1}
                          size="small"
                          sx={{
                            width: 28,
                            height: 28,
                            fontWeight: 900,
                            backgroundColor: alpha(yellowColor, 0.15),
                            color: yellowColor,
                            fontSize: '0.75rem',
                          }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {ingresosService.getCategoriaIngresoLabel(cat.categoria)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={900} color={yellowColor}>
                        {ingresosService.formatearMonto(cat.monto_neto)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(cat.monto_neto / (estadisticas?.monto_total || 1)) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(yellowColor, 0.15),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: yellowColor,
                          borderRadius: 4,
                          boxShadow: `0 0 8px ${alpha(yellowColor, 0.4)}`,
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {((cat.monto_neto / (estadisticas?.monto_total || 1)) * 100).toFixed(1)}% del total
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{xs:12, md:6}}>
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
                    <CardIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Métodos de Pago
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  {resumenMetodosPago.map((metodo, index) => {
                    const color = getMetodoPagoColor(metodo.metodo_pago);
                    return (
                      <Grid size={{xs:12}} key={index}>
                        <Card
                          sx={{
                            borderRadius: '16px',
                            background: alpha(color, 0.08),
                            border: `1px solid ${alpha(color, 0.2)}`,
                            '&:hover': {
                              transform: 'translateX(4px)',
                              boxShadow: `0 4px 12px ${alpha(color, 0.2)}`,
                            },
                            transition: 'all 0.3s',
                          }}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    bgcolor: alpha(color, 0.15),
                                    color: color,
                                  }}
                                >
                                  {getMetodoPagoIcon(metodo.metodo_pago)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={700}>
                                    {ingresosService.getMetodoPagoLabel(metodo.metodo_pago)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {metodo.cantidad_transacciones} transacciones
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography variant="h6" fontWeight={900} color={color}>
                                {ingresosService.formatearMonto(metodo.total_monto)}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tipoReporte === 'categorias' && (
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
                <TimelineIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Detalle por Categorías
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            {isMobile ? (
              // Vista de cards para mobile
              <Grid container spacing={2}>
                {resumenCategorias.map((cat, index) => (
                  <Grid size={{xs:12}} key={index}>
                    <Card
                      sx={{
                        borderRadius: '16px',
                        border: `1px solid ${alpha(ingresosService.getCategoriaColor(cat.categoria), 0.2)}`,
                        background: alpha(ingresosService.getCategoriaColor(cat.categoria), 0.05),
                      }}
                    >
                      <CardContent>
                        <Box sx={{ mb: 2 }}>
                          <Chip
                            label={ingresosService.getCategoriaIngresoLabel(cat.categoria)}
                            sx={{
                              backgroundColor: alpha(ingresosService.getCategoriaColor(cat.categoria), 0.2),
                              color: ingresosService.getCategoriaColor(cat.categoria),
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                        <Grid container spacing={2}>
                          <Grid size={{xs:6}}>
                            <Typography variant="caption" color="text.secondary">
                              Transacciones
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>
                              {cat.cantidad_transacciones}
                            </Typography>
                          </Grid>
                          <Grid size={{xs:6}}>
                            <Typography variant="caption" color="text.secondary">
                              Monto Neto
                            </Typography>
                            <Typography variant="h6" fontWeight={900} color={yellowColor}>
                              {ingresosService.formatearMonto(cat.monto_neto)}
                            </Typography>
                          </Grid>
                          <Grid size={{xs:6}}>
                            <Typography variant="caption" color="text.secondary">
                              Descuentos
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="success.main">
                              -{ingresosService.formatearMonto(cat.total_descuentos)}
                            </Typography>
                          </Grid>
                          <Grid size={{xs:6}}>
                            <Typography variant="caption" color="text.secondary">
                              Recargos
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="error">
                              +{ingresosService.formatearMonto(cat.total_recargos)}
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
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Categoría</TableCell>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Transacciones</TableCell>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Monto Bruto</TableCell>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Descuentos</TableCell>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Recargos</TableCell>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Monto Neto</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resumenCategorias.map((cat, index) => (
                      <TableRow 
                        key={index}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(yellowColor, 0.03),
                          },
                        }}
                      >
                        <TableCell>
                          <Chip
                            label={ingresosService.getCategoriaIngresoLabel(cat.categoria)}
                            size="small"
                            sx={{
                              backgroundColor: alpha(ingresosService.getCategoriaColor(cat.categoria), 0.2),
                              color: ingresosService.getCategoriaColor(cat.categoria),
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {cat.cantidad_transacciones}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {ingresosService.formatearMonto(cat.monto_bruto)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            {ingresosService.formatearMonto(cat.total_descuentos)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="error">
                            {ingresosService.formatearMonto(cat.total_recargos)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={900} color={yellowColor}>
                            {ingresosService.formatearMonto(cat.monto_neto)}
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

      {tipoReporte === 'metodos' && (
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
                <CardIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Detalle por Métodos de Pago
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            {isMobile ? (
              // Vista de cards para mobile
              <Grid container spacing={2}>
                {resumenMetodosPago.map((metodo, index) => {
                  const porcentaje = (metodo.total_monto / (estadisticas?.monto_total || 1)) * 100;
                  const color = getMetodoPagoColor(metodo.metodo_pago);
                  
                  return (
                    <Grid size={{xs:12}} key={index}>
                      <Card
                        sx={{
                          borderRadius: '16px',
                          border: `1px solid ${alpha(color, 0.2)}`,
                          background: alpha(color, 0.05),
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: alpha(color, 0.15),
                                color: color,
                              }}
                            >
                              {getMetodoPagoIcon(metodo.metodo_pago)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight={700}>
                                {ingresosService.getMetodoPagoLabel(metodo.metodo_pago)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {metodo.cantidad_transacciones} transacciones
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight={900} color={color}>
                              {ingresosService.formatearMonto(metodo.total_monto)}
                            </Typography>
                            <Chip
                              label={`${porcentaje.toFixed(1)}%`}
                              size="small"
                              sx={{
                                backgroundColor: alpha(color, 0.2),
                                color: color,
                                fontWeight: 800,
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              // Vista de tabla para desktop
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha('#3b82f6', 0.05) }}>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Método de Pago</TableCell>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Cantidad</TableCell>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Monto Total</TableCell>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Porcentaje</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resumenMetodosPago.map((metodo, index) => {
                      const porcentaje = (metodo.total_monto / (estadisticas?.monto_total || 1)) * 100;
                      const color = getMetodoPagoColor(metodo.metodo_pago);
                      
                      return (
                        <TableRow 
                          key={index}
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha(color, 0.03),
                            },
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getMetodoPagoIcon(metodo.metodo_pago)}
                              <Typography variant="body2" fontWeight={700}>
                                {ingresosService.getMetodoPagoLabel(metodo.metodo_pago)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {metodo.cantidad_transacciones}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={900} color={color}>
                              {ingresosService.formatearMonto(metodo.total_monto)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${porcentaje.toFixed(1)}%`}
                              size="small"
                              sx={{
                                backgroundColor: alpha(color, 0.2),
                                color: color,
                                fontWeight: 800,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {tipoReporte === 'diario' && (
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
                  bgcolor: alpha('#a855f7', 0.15),
                  color: '#a855f7',
                }}
              >
                <CalendarIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Ingresos Diarios
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            {isMobile ? (
              // Vista de cards para mobile
              <Grid container spacing={2}>
                {ingresosDiarios.map((dia, index) => (
                  <Grid size={{xs:12}} key={index}>
                    <Card
                      sx={{
                        borderRadius: '16px',
                        border: `1px solid ${alpha('#a855f7', 0.2)}`,
                        background: alpha('#a855f7', 0.05),
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" fontWeight={700}>
                            {ingresosService.formatearFecha(dia.fecha)}
                          </Typography>
                          <Chip
                            label={`${dia.cantidad_transacciones} txn`}
                            size="small"
                            sx={{
                              backgroundColor: alpha('#a855f7', 0.15),
                              color: '#a855f7',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                        <Typography variant="h6" fontWeight={900} color={yellowColor}>
                          {ingresosService.formatearMonto(dia.total_monto)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {ingresosDiarios.length === 0 && (
                  <Grid size={{xs:12}}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        No hay datos para el período seleccionado
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
                    <TableRow sx={{ backgroundColor: alpha('#a855f7', 0.05) }}>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Transacciones</TableCell>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ingresosDiarios.map((dia, index) => (
                      <TableRow 
                        key={index}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha('#a855f7', 0.03),
                          },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {ingresosService.formatearFecha(dia.fecha)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={dia.cantidad_transacciones}
                            size="small"
                            sx={{
                              backgroundColor: alpha('#a855f7', 0.15),
                              color: '#a855f7',
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={900} color={yellowColor}>
                            {ingresosService.formatearMonto(dia.total_monto)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    {ingresosDiarios.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography color="text.secondary" sx={{ py: 2 }}>
                            No hay datos para el período seleccionado
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

export default ReportesIngresos;