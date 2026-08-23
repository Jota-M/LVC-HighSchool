// components/financiero/ReportesFinancieros.tsx
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
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    AccountBalanceWallet as WalletIcon,
    Assessment as AssessmentIcon,
    CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useIngresos } from '@/hooks/Useingresos';
import { useEgresos } from '@/hooks/useEgresos';
import ingresosService from '@/services/ingresos';
import egresosService from '@/services/egresos';
import financieroService from '@/services/financiero';

// Reporte propio del Balance General: combina estadísticas de useIngresos +
// useEgresos. No reutiliza ReportesIngresos.tsx (ese queda como el reporte
// específico dentro de /dashboard/ingresos).

export const ReportesFinancieros: React.FC = () => {
    const theme = useTheme();

    const {
        estadisticas: estadisticasIngresos,
        ingresosDiarios,
        loadingReportes: loadingIngresos,
        cargarEstadisticas: cargarEstadisticasIngresos,
        cargarIngresosDiarios,
    } = useIngresos();

    const {
        estadisticas: estadisticasEgresos,
        egresosDiarios,
        loadingReportes: loadingEgresos,
        cargarEstadisticas: cargarEstadisticasEgresos,
        cargarEgresosDiarios,
    } = useEgresos();

    const [fechaDesde, setFechaDesde] = useState(ingresosService.obtenerFechaInicioPeriodo('mes'));
    const [fechaHasta, setFechaHasta] = useState(ingresosService.obtenerFechaFinPeriodo('mes'));
    const [exportando, setExportando] = useState(false);

    const greenColor = '#10b981';
    const redColor = '#ef4444';

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        const filtros = { fecha_desde: fechaDesde, fecha_hasta: fechaHasta };
        await Promise.all([
            cargarEstadisticasIngresos(filtros),
            cargarIngresosDiarios(filtros),
            cargarEstadisticasEgresos(filtros),
            cargarEgresosDiarios(filtros),
        ]);
    };

    const handleExportarPDF = async () => {
        try {
            setExportando(true);
            await financieroService.exportarBalance({ fecha_desde: fechaDesde, fecha_hasta: fechaHasta, formato: 'pdf' });
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al generar el PDF');
        } finally {
            setExportando(false);
        }
    };

    const handleExportarExcel = async () => {
        try {
            setExportando(true);
            await financieroService.exportarBalance({ fecha_desde: fechaDesde, fecha_hasta: fechaHasta, formato: 'excel' });
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al generar el Excel');
        } finally {
            setExportando(false);
        }
    };

    const loading = loadingIngresos || loadingEgresos;
    const totalIngresos = estadisticasIngresos?.monto_total || 0;
    const totalEgresos = estadisticasEgresos?.monto_total || 0;
    const utilidadNeta = totalIngresos - totalEgresos;
    const margenPorcentaje = totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0;

    // Combina ambos diarios por fecha para la tabla comparativa
    const fechasSet = new Set([
        ...ingresosDiarios.map((d) => d.fecha),
        ...egresosDiarios.map((d) => d.fecha),
    ]);
    const diarioCombinado = Array.from(fechasSet)
        .map((fecha) => {
            const ing = ingresosDiarios.find((d) => d.fecha === fecha)?.total_monto || 0;
            const egr = egresosDiarios.find((d) => d.fecha === fecha)?.total_monto || 0;
            return { fecha, ingresos: ing, egresos: egr, neto: ing - egr };
        })
        .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <Box sx={{ width: '100%', maxWidth: 500 }}>
                    <Typography variant="h6" align="center" gutterBottom color="text.secondary">
                        Cargando reportes...
                    </Typography>
                    <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
                </Box>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Card sx={{ mb: 3, borderRadius: '24px', border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.mode === 'dark' ? '#facc15' : '#f59e0b', color: '#000' }}>
                                <AssessmentIcon sx={{ fontSize: 28 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>Reporte Financiero General</Typography>
                                <Typography variant="caption" color="text.secondary">Ingresos vs. Egresos del período</Typography>
                            </Box>
                        </Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Tooltip title="Actualizar datos" arrow>
                                <IconButton onClick={cargarDatos} sx={{ backgroundColor: alpha(theme.palette.text.primary, 0.06) }}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                            <Button variant="contained" startIcon={<PdfIcon />} onClick={handleExportarPDF} disabled={exportando} sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', borderRadius: '12px', fontWeight: 600 }}>
                                PDF
                            </Button>
                            <Button variant="contained" startIcon={<ExcelIcon />} onClick={handleExportarExcel} disabled={exportando} sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', borderRadius: '12px', fontWeight: 600 }}>
                                Excel
                            </Button>
                        </Stack>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
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
                        <Grid size={{ xs: 12, sm: 6 }}>
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
                        <Grid size={{ xs: 12 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={cargarDatos}
                                sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#000', fontWeight: 600, borderRadius: '12px', height: '40px' }}
                            >
                                Generar Reporte
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Estadísticas resumen */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ borderRadius: '20px', background: `linear-gradient(135deg, ${alpha(greenColor, 0.15)} 0%, ${alpha(greenColor, 0.05)} 100%)`, border: `1px solid ${alpha(greenColor, 0.2)}` }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 64, height: 64, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${greenColor} 0%, #059669 100%)`, color: '#fff' }}>
                                    <TrendingUpIcon sx={{ fontSize: 32 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Ingresos</Typography>
                                    <Typography variant="h5" fontWeight={900} color={greenColor}>{ingresosService.formatearMonto(totalIngresos)}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ borderRadius: '20px', background: `linear-gradient(135deg, ${alpha(redColor, 0.15)} 0%, ${alpha(redColor, 0.05)} 100%)`, border: `1px solid ${alpha(redColor, 0.2)}` }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 64, height: 64, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${redColor} 0%, #b91c1c 100%)`, color: '#fff' }}>
                                    <TrendingDownIcon sx={{ fontSize: 32 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Egresos</Typography>
                                    <Typography variant="h5" fontWeight={900} color={redColor}>{egresosService.formatearMonto(totalEgresos)}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ borderRadius: '20px', background: `linear-gradient(135deg, ${alpha(utilidadNeta >= 0 ? greenColor : redColor, 0.15)} 0%, ${alpha(utilidadNeta >= 0 ? greenColor : redColor, 0.05)} 100%)`, border: `1px solid ${alpha(utilidadNeta >= 0 ? greenColor : redColor, 0.2)}` }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 64, height: 64, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${utilidadNeta >= 0 ? greenColor : redColor} 0%, ${utilidadNeta >= 0 ? '#059669' : '#b91c1c'} 100%)`, color: '#fff' }}>
                                    <WalletIcon sx={{ fontSize: 32 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Utilidad Neta</Typography>
                                    <Typography variant="h5" fontWeight={900} color={utilidadNeta >= 0 ? greenColor : redColor}>{ingresosService.formatearMonto(utilidadNeta)}</Typography>
                                    <Typography variant="caption" color="text.secondary">Margen: {margenPorcentaje.toFixed(1)}%</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabla comparativa diaria */}
            <Card sx={{ borderRadius: '24px' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Avatar sx={{ bgcolor: alpha('#a855f7', 0.15), color: '#a855f7' }}><CalendarIcon /></Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Comparativa Diaria — Ingresos vs. Egresos</Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: alpha('#a855f7', 0.05) }}>
                                    <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Fecha</TableCell>
                                    <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Ingresos</TableCell>
                                    <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Egresos</TableCell>
                                    <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Neto</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {diarioCombinado.map((dia, index) => (
                                    <TableRow key={index} sx={{ '&:hover': { backgroundColor: alpha('#a855f7', 0.03) } }}>
                                        <TableCell><Typography variant="body2" fontWeight={700}>{ingresosService.formatearFecha(dia.fecha)}</Typography></TableCell>
                                        <TableCell><Typography variant="body2" fontWeight={700} color={greenColor}>{ingresosService.formatearMonto(dia.ingresos)}</Typography></TableCell>
                                        <TableCell><Typography variant="body2" fontWeight={700} color={redColor}>{egresosService.formatearMonto(dia.egresos)}</Typography></TableCell>
                                        <TableCell>
                                            <Chip
                                                label={ingresosService.formatearMonto(dia.neto)}
                                                size="small"
                                                sx={{
                                                    backgroundColor: alpha(dia.neto >= 0 ? greenColor : redColor, 0.15),
                                                    color: dia.neto >= 0 ? greenColor : redColor,
                                                    fontWeight: 800,
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {diarioCombinado.length === 0 && (
                                    <TableRow><TableCell colSpan={4} align="center"><Typography color="text.secondary" sx={{ py: 2 }}>No hay datos para el período seleccionado</Typography></TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ReportesFinancieros;