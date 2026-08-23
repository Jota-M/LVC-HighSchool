// components/egresos/ReportesEgresos.tsx
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
    Chip,
    LinearProgress,
    MenuItem,
    TextField,
    Divider,
    IconButton,
    Tooltip,
    Avatar,
    Stack,
} from '@mui/material';
import {
    PictureAsPdf as PdfIcon,
    TableChart as ExcelIcon,
    Refresh as RefreshIcon,
    TrendingDown as TrendingIcon,
    AttachMoney as MoneyIcon,
    Receipt as ReceiptIcon,
    Groups as GroupsIcon,
    AccountBalance as BankIcon,
    CreditCard as CardIcon,
    Money as CashIcon,
    QrCode as QrCodeIcon,
    Timeline as TimelineIcon,
    Assessment as AssessmentIcon,
    CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useEgresos } from '@/hooks/useEgresos';
import egresosService from '@/services/egresos';

// NOTA: a diferencia de Reportesingresos.tsx, este componente no duplica
// vista mobile/desktop (solo tabla) para mantenerlo más liviano.

export const ReportesEgresos: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const {
        resumenCategorias,
        resumenMetodosPago,
        egresosDiarios,
        estadisticas,
        loadingReportes,
        cargarResumenCategorias,
        cargarResumenMetodosPago,
        cargarEgresosDiarios,
        cargarEstadisticas,
    } = useEgresos();

    const [tipoReporte, setTipoReporte] = useState('general');
    const [fechaDesde, setFechaDesde] = useState(egresosService.obtenerFechaInicioPeriodo('mes'));
    const [fechaHasta, setFechaHasta] = useState(egresosService.obtenerFechaFinPeriodo('mes'));

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        const filtros = { fecha_desde: fechaDesde, fecha_hasta: fechaHasta };
        await Promise.all([
            cargarEstadisticas(filtros),
            cargarResumenCategorias(filtros),
            cargarResumenMetodosPago(filtros),
            cargarEgresosDiarios(filtros),
        ]);
    };

    const [exportando, setExportando] = useState(false);

    const handleExportarPDF = async () => {
        try {
            setExportando(true);
            await egresosService.exportarReporteEgresos({ fecha_desde: fechaDesde, fecha_hasta: fechaHasta, formato: 'pdf' });
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al generar el PDF');
        } finally {
            setExportando(false);
        }
    };

    const handleExportarExcel = async () => {
        try {
            setExportando(true);
            await egresosService.exportarReporteEgresos({ fecha_desde: fechaDesde, fecha_hasta: fechaHasta, formato: 'excel' });
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al generar el Excel');
        } finally {
            setExportando(false);
        }
    };

    const redColor = '#ef4444';

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
                        sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { backgroundColor: redColor, borderRadius: 4 } }}
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
                        ? `linear-gradient(135deg, ${alpha(redColor, 0.15)} 0%, ${alpha(redColor, 0.05)} 100%)`
                        : `linear-gradient(135deg, ${alpha(redColor, 0.1)} 0%, ${alpha(redColor, 0.02)} 100%)`,
                    border: `1px solid ${alpha(redColor, 0.2)}`,
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 56, height: 56, bgcolor: redColor, color: '#fff' }}>
                                <AssessmentIcon sx={{ fontSize: 28 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    Reportes de Egresos
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Análisis detallado de gastos
                                </Typography>
                            </Box>
                        </Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Tooltip title="Actualizar datos" arrow>
                                <IconButton
                                    onClick={cargarDatos}
                                    sx={{ backgroundColor: alpha(redColor, 0.1), '&:hover': { backgroundColor: alpha(redColor, 0.2) } }}
                                >
                                    <RefreshIcon sx={{ color: redColor }} />
                                </IconButton>
                            </Tooltip>
                            <Button
                                variant="contained"
                                startIcon={<PdfIcon />}
                                onClick={handleExportarPDF}
                                disabled={exportando}
                                sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', borderRadius: '12px', fontWeight: 600 }}
                            >
                                PDF
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<ExcelIcon />}
                                onClick={handleExportarExcel}
                                disabled={exportando}
                                sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', borderRadius: '12px', fontWeight: 600 }}
                            >
                                Excel
                            </Button>
                        </Stack>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Fecha Desde"
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{ startAdornment: <CalendarIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} /> }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Fecha Hasta"
                                type="date"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{ startAdornment: <CalendarIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} /> }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Tipo de Reporte"
                                value={tipoReporte}
                                onChange={(e) => setTipoReporte(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            >
                                <MenuItem value="general">📊 Reporte General</MenuItem>
                                <MenuItem value="categorias">📁 Por Categorías</MenuItem>
                                <MenuItem value="metodos">💳 Por Métodos de Pago</MenuItem>
                                <MenuItem value="diario">📅 Egresos Diarios</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={cargarDatos}
                                sx={{ background: `linear-gradient(135deg, ${redColor} 0%, #b91c1c 100%)`, color: '#fff', fontWeight: 600, borderRadius: '12px', height: '40px' }}
                            >
                                Generar
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Estadísticas Resumen */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: '20px', background: `linear-gradient(135deg, ${alpha(redColor, 0.15)} 0%, ${alpha(redColor, 0.05)} 100%)`, border: `1px solid ${alpha(redColor, 0.2)}` }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 64, height: 64, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${redColor} 0%, #b91c1c 100%)`, color: '#fff' }}>
                                    <MoneyIcon sx={{ fontSize: 32 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Total Egresos</Typography>
                                    <Typography variant="h5" fontWeight={900} color={redColor}>{egresosService.formatearMonto(estadisticas?.monto_total || 0)}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: '20px', background: `linear-gradient(135deg, ${alpha('#f97316', 0.15)} 0%, ${alpha('#f97316', 0.05)} 100%)`, border: `1px solid ${alpha('#f97316', 0.2)}` }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 64, height: 64, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff' }}>
                                    <TrendingIcon sx={{ fontSize: 32 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Promedio</Typography>
                                    <Typography variant="h5" fontWeight={900} color="#f97316">{egresosService.formatearMonto(estadisticas?.promedio_egreso || 0)}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: '20px', background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.15)} 0%, ${alpha('#3b82f6', 0.05)} 100%)`, border: `1px solid ${alpha('#3b82f6', 0.2)}` }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 64, height: 64, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff' }}>
                                    <ReceiptIcon sx={{ fontSize: 32 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Transacciones</Typography>
                                    <Typography variant="h5" fontWeight={900} color="#3b82f6">{estadisticas?.total_egresos || 0}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: '20px', background: `linear-gradient(135deg, ${alpha('#a855f7', 0.15)} 0%, ${alpha('#a855f7', 0.05)} 100%)`, border: `1px solid ${alpha('#a855f7', 0.2)}` }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 64, height: 64, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', color: '#fff' }}>
                                    <GroupsIcon sx={{ fontSize: 32 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Docentes Pagados</Typography>
                                    <Typography variant="h5" fontWeight={900} color="#a855f7">{estadisticas?.docentes_pagados || 0}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Reporte General */}
            {tipoReporte === 'general' && (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ borderRadius: '24px', height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar sx={{ bgcolor: alpha(redColor, 0.15), color: redColor }}><TimelineIcon /></Avatar>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Top 5 Categorías</Typography>
                                </Box>
                                <Divider sx={{ mb: 3 }} />
                                {egresosService.obtenerTop5Categorias(resumenCategorias).map((cat, index) => (
                                    <Box key={index} sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip label={index + 1} size="small" sx={{ width: 28, height: 28, fontWeight: 900, backgroundColor: alpha(redColor, 0.15), color: redColor }} />
                                                <Typography variant="body2" fontWeight={600}>{egresosService.getCategoriaEgresoLabel(cat.categoria)}</Typography>
                                            </Box>
                                            <Typography variant="body2" fontWeight={900} color={redColor}>{egresosService.formatearMonto(cat.monto_neto)}</Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(cat.monto_neto / (estadisticas?.monto_total || 1)) * 100}
                                            sx={{ height: 8, borderRadius: 4, backgroundColor: alpha(redColor, 0.15), '& .MuiLinearProgress-bar': { backgroundColor: redColor } }}
                                        />
                                    </Box>
                                ))}
                                {resumenCategorias.length === 0 && (
                                    <Typography color="text.secondary" textAlign="center" sx={{ py: 2 }}>Sin datos para el período</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ borderRadius: '24px', height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar sx={{ bgcolor: alpha('#3b82f6', 0.15), color: '#3b82f6' }}><BankIcon /></Avatar>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Métodos de Pago</Typography>
                                </Box>
                                <Divider sx={{ mb: 3 }} />
                                {resumenMetodosPago.map((metodo, index) => {
                                    const color = getMetodoPagoColor(metodo.metodo_pago);
                                    const porcentaje = (metodo.total_monto / (estadisticas?.monto_total || 1)) * 100;
                                    return (
                                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, mb: 1.5, borderRadius: '14px', backgroundColor: alpha(color, 0.08) }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ color }}>{getMetodoPagoIcon(metodo.metodo_pago)}</Box>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={700}>{egresosService.getMetodoPagoLabel(metodo.metodo_pago)}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{metodo.cantidad_transacciones} transacciones</Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="body1" fontWeight={900} color={color}>{egresosService.formatearMonto(metodo.total_monto)}</Typography>
                                                <Chip label={`${porcentaje.toFixed(1)}%`} size="small" sx={{ backgroundColor: alpha(color, 0.2), color, fontWeight: 800 }} />
                                            </Box>
                                        </Box>
                                    );
                                })}
                                {resumenMetodosPago.length === 0 && (
                                    <Typography color="text.secondary" textAlign="center" sx={{ py: 2 }}>Sin datos para el período</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Por Categorías */}
            {tipoReporte === 'categorias' && (
                <Card sx={{ borderRadius: '24px' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Avatar sx={{ bgcolor: alpha(redColor, 0.15), color: redColor }}><TimelineIcon /></Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Egresos por Categoría</Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: alpha(redColor, 0.05) }}>
                                        <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Categoría</TableCell>
                                        <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Tipo</TableCell>
                                        <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Transacciones</TableCell>
                                        <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Monto Total</TableCell>
                                        <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Promedio</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {resumenCategorias.map((cat, index) => (
                                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: alpha(redColor, 0.03) } }}>
                                            <TableCell>
                                                <Chip
                                                    label={egresosService.getCategoriaEgresoLabel(cat.categoria)}
                                                    size="small"
                                                    sx={{ backgroundColor: alpha(egresosService.getCategoriaColor(cat.categoria), 0.15), color: egresosService.getCategoriaColor(cat.categoria), fontWeight: 700 }}
                                                />
                                            </TableCell>
                                            <TableCell><Typography variant="body2" fontWeight={600}>{cat.tipo_egreso}</Typography></TableCell>
                                            <TableCell><Typography variant="body2" fontWeight={600}>{cat.cantidad_transacciones}</Typography></TableCell>
                                            <TableCell><Typography variant="body2" fontWeight={900} color={redColor}>{egresosService.formatearMonto(cat.monto_neto)}</Typography></TableCell>
                                            <TableCell><Typography variant="body2" fontWeight={600}>{egresosService.formatearMonto(cat.promedio_egreso)}</Typography></TableCell>
                                        </TableRow>
                                    ))}
                                    {resumenCategorias.length === 0 && (
                                        <TableRow><TableCell colSpan={5} align="center"><Typography color="text.secondary" sx={{ py: 2 }}>Sin datos para el período</Typography></TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* Por Métodos de Pago */}
            {tipoReporte === 'metodos' && (
                <Card sx={{ borderRadius: '24px' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Avatar sx={{ bgcolor: alpha('#3b82f6', 0.15), color: '#3b82f6' }}><BankIcon /></Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Egresos por Método de Pago</Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
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
                                            <TableRow key={index} sx={{ '&:hover': { backgroundColor: alpha(color, 0.03) } }}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {getMetodoPagoIcon(metodo.metodo_pago)}
                                                        <Typography variant="body2" fontWeight={700}>{egresosService.getMetodoPagoLabel(metodo.metodo_pago)}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell><Typography variant="body2" fontWeight={600}>{metodo.cantidad_transacciones}</Typography></TableCell>
                                                <TableCell><Typography variant="body2" fontWeight={900} color={color}>{egresosService.formatearMonto(metodo.total_monto)}</Typography></TableCell>
                                                <TableCell><Chip label={`${porcentaje.toFixed(1)}%`} size="small" sx={{ backgroundColor: alpha(color, 0.2), color, fontWeight: 800 }} /></TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {resumenMetodosPago.length === 0 && (
                                        <TableRow><TableCell colSpan={4} align="center"><Typography color="text.secondary" sx={{ py: 2 }}>Sin datos para el período</Typography></TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* Egresos Diarios */}
            {tipoReporte === 'diario' && (
                <Card sx={{ borderRadius: '24px' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Avatar sx={{ bgcolor: alpha('#a855f7', 0.15), color: '#a855f7' }}><CalendarIcon /></Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Egresos Diarios</Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
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
                                    {egresosDiarios.map((dia, index) => (
                                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: alpha('#a855f7', 0.03) } }}>
                                            <TableCell><Typography variant="body2" fontWeight={700}>{egresosService.formatearFecha(dia.fecha)}</Typography></TableCell>
                                            <TableCell><Chip label={dia.cantidad_transacciones} size="small" sx={{ backgroundColor: alpha('#a855f7', 0.15), color: '#a855f7', fontWeight: 700 }} /></TableCell>
                                            <TableCell><Typography variant="body2" fontWeight={900} color={redColor}>{egresosService.formatearMonto(dia.total_monto)}</Typography></TableCell>
                                        </TableRow>
                                    ))}
                                    {egresosDiarios.length === 0 && (
                                        <TableRow><TableCell colSpan={3} align="center"><Typography color="text.secondary" sx={{ py: 2 }}>No hay datos para el período seleccionado</Typography></TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default ReportesEgresos;