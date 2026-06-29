// components/pagos/AjusteCostoModal.tsx
'use client';
import React, { useEffect, useState } from 'react';
import {
    Box,
    Dialog,
    DialogContent,
    Typography,
    Button,
    TextField,
    Alert,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    CircularProgress,
    useTheme,
    alpha,
    Grid,
} from '@mui/material';
import {
    PriceChange as PriceChangeIcon,
    Close as CloseIcon,
    ArrowBack as ArrowBackIcon,
    CheckCircleOutline as CheckIcon,
} from '@mui/icons-material';
import pagosService from '@/services/pagos';
import { usePagos } from '@/hooks/usePagos';

interface AjusteCostoModalProps {
    open: boolean;
    onClose: () => void;
    periodoAcademicoId: number;
    periodoNombre: string;
    nivelAcademicoId: number;
    nivelNombre: string;
    montoBaseActual: number;
    onAplicado?: () => void;
}

type Step = 'filtros' | 'preview';
const STEPS = ['Filtros', 'Vista previa'];

export const AjusteCostoModal: React.FC<AjusteCostoModalProps> = ({
    open,
    onClose,
    periodoAcademicoId,
    periodoNombre,
    nivelAcademicoId,
    nivelNombre,
    montoBaseActual,
    onAplicado,
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // ── tokens ──────────────────────────────────────────────────────────────
    const brand = isDark ? '#facc15' : '#0288d1';
    const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
    const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
    const bgModal = isDark ? '#09101dff' : '#ffffff';
    const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
    const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
    const R = '14px';

    const fieldSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: R,
            background: bgField,
            '& fieldset': { borderColor: borderField, borderRadius: R },
            '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
            '&.Mui-focused fieldset': { borderColor: brand, borderWidth: '1.5px', borderRadius: R },
            '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}`, borderRadius: R },
        },
        '& .MuiInputLabel-root': { color: 'text.secondary' },
        '& .MuiInputLabel-root.Mui-focused': { color: brand },
    };

    // ── state ────────────────────────────────────────────────────────────────
    const [step, setStep] = useState<Step>('filtros');
    const [nuevoMonto, setNuevoMonto] = useState(montoBaseActual.toString());
    const [fechaCorte, setFechaCorte] = useState(new Date().toISOString().slice(0, 10));
    const [error, setError] = useState<string | null>(null);

    const activeStepIndex = step === 'filtros' ? 0 : 1;

    const {
        previsualizarAjusteCosto,
        aplicarAjusteCosto,
        loadingAjusteCosto,
        ajustePreview,
        limpiarAjustePreview,
    } = usePagos();

    useEffect(() => {
        if (open) {
            setStep('filtros');
            setNuevoMonto(montoBaseActual.toString());
            setFechaCorte(new Date().toISOString().slice(0, 10));
            setError(null);
            limpiarAjustePreview();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, montoBaseActual]);

    const handleClose = () => {
        setStep('filtros');
        setError(null);
        limpiarAjustePreview();
        onClose();
    };

    const filtrosActuales = () => ({
        periodo_academico_id: periodoAcademicoId,
        nivel_academico_id: nivelAcademicoId,
        nuevo_monto_base: parseFloat(nuevoMonto),
        fecha_corte: fechaCorte,
    });

    const handlePrevisualizar = async () => {
        setError(null);
        const monto = parseFloat(nuevoMonto);
        if (!monto || monto <= 0) { setError('El nuevo monto debe ser mayor a 0'); return; }
        try {
            await previsualizarAjusteCosto(filtrosActuales());
            setStep('preview');
        } catch (err: any) {
            setError(err.message || 'Error al previsualizar el ajuste');
        }
    };

    const handleAplicar = async () => {
        setError(null);
        try {
            await aplicarAjusteCosto(filtrosActuales());
            onAplicado?.();
            handleClose();
        } catch (err: any) {
            setError(err.message || 'Error al aplicar el ajuste');
        }
    };

    const resumen = ajustePreview?.resumen;
    const detalle = ajustePreview?.detalle ?? [];

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '20px !important',
                    overflow: 'hidden',
                    background: bgModal,
                    border: `1.5px solid ${brandBorder}`,
                    boxShadow: isDark
                        ? `0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)`
                        : `0 32px 64px rgba(0,0,0,0.18)`,
                },
            }}
        >
            {/* ── HEADER ── */}
            <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box>
                        <Typography sx={{
                            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                            textTransform: 'uppercase', color: alpha(brand, 0.7), mb: 0.4,
                        }}>
                            Paso {activeStepIndex + 1} de {STEPS.length} · {STEPS[activeStepIndex]}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Box sx={{
                                width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                                background: alpha(brand, 0.15),
                                border: `1px solid ${alpha(brand, 0.3)}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <PriceChangeIcon sx={{ color: brand, fontSize: 18 }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                                    Ajustar costo
                                </Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: alpha(theme.palette.text.primary, 0.45), mt: 0.2 }}>
                                    {nivelNombre} · {periodoNombre}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box
                        onClick={handleClose}
                        sx={{
                            width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${borderField}`,
                            color: 'text.secondary',
                            transition: 'all 0.15s',
                            '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 16 }} />
                    </Box>
                </Box>

                {/* barra de progreso */}
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                    {STEPS.map((_, i) => (
                        <Box key={i} sx={{
                            flex: 1, height: 3, borderRadius: 2,
                            background: i <= activeStepIndex ? brand : alpha(brand, 0.18),
                            transition: 'background 0.3s',
                        }} />
                    ))}
                </Box>
            </Box>

            {/* ── BODY ── */}
            <DialogContent sx={{ px: 3, py: 3 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: R }}>
                        {error}
                    </Alert>
                )}

                {/* PASO 1 — Filtros */}
                {step === 'filtros' && (
                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12 }}>
                            <Alert
                                severity="info"
                                sx={{
                                    borderRadius: R,
                                    background: alpha(brand, 0.08),
                                    color: brand,
                                    border: `1px solid ${alpha(brand, 0.2)}`,
                                    '& .MuiAlert-icon': { color: brand },
                                }}
                            >
                                Este ajuste solo modifica cuotas <strong>no vencidas</strong> de alumnos
                                ya matriculados. Las vencidas o pagadas nunca se tocan.
                            </Alert>
                        </Grid>

                        {/* Contexto del ajuste */}
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{
                                p: 1.75, borderRadius: R,
                                background: alpha(brand, 0.08),
                                border: `1px solid ${alpha(brand, 0.2)}`,
                                display: 'flex', alignItems: 'center', gap: 1.25,
                            }}>
                                <CheckIcon sx={{ color: brand, fontSize: 20, flexShrink: 0 }} />
                                <Box>
                                    <Typography variant="body2" fontWeight={700} sx={{ color: brand }}>
                                        {nivelNombre}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: alpha(brand, 0.7) }}>
                                        {periodoNombre} · Monto vigente: {pagosService.formatearMonto(montoBaseActual)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Campos */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Nuevo monto mensual"
                                type="number"
                                value={nuevoMonto}
                                onChange={(e) => setNuevoMonto(e.target.value)}
                                inputProps={{ step: '0.01', min: '0' }}
                                helperText="Se respeta el % de beca de cada matrícula"
                                sx={fieldSx}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Fecha de corte"
                                type="date"
                                value={fechaCorte}
                                onChange={(e) => setFechaCorte(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                helperText="Cuotas con vencimiento desde esta fecha"
                                sx={fieldSx}
                            />
                        </Grid>
                    </Grid>
                )}

                {/* PASO 2 — Preview */}
                {step === 'preview' && resumen && (
                    <Box>
                        {resumen.total_cuotas === 0 ? (
                            <Alert severity="warning" sx={{ borderRadius: R }}>
                                No hay cuotas no vencidas que coincidan con estos filtros.
                            </Alert>
                        ) : (
                            <>
                                {/* Tarjetas resumen */}
                                <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                                    {[
                                        { label: 'Cuotas afectadas', value: resumen.total_cuotas.toString() },
                                        { label: 'Alumnos afectados', value: resumen.total_estudiantes.toString() },
                                        { label: 'Diferencia total', value: pagosService.formatearMonto(resumen.diferencia_total), accent: resumen.diferencia_total >= 0 ? '#10b981' : '#ef4444' },
                                        { label: 'Quedan saldadas', value: resumen.cuotas_que_quedan_saldadas.toString(), accent: '#10b981' },
                                    ].map(({ label, value, accent }) => (
                                        <Box key={label} flex={1} minWidth={130} sx={{
                                            p: 2, borderRadius: R,
                                            background: bgField,
                                            border: `1px solid ${borderField}`,
                                            textAlign: 'center',
                                        }}>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {label}
                                            </Typography>
                                            <Typography variant="h6" fontWeight={700} color={accent || 'text.primary'}>
                                                {value}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Tabla */}
                                <Box sx={{
                                    maxHeight: 320, overflow: 'auto',
                                    borderRadius: R,
                                    border: `1px solid ${borderField}`,
                                }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Alumno</TableCell>
                                                <TableCell>Cuota</TableCell>
                                                <TableCell align="right">Actual</TableCell>
                                                <TableCell align="right">Nuevo</TableCell>
                                                <TableCell align="right">Saldo nuevo</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {detalle.map((item) => (
                                                <TableRow key={item.mensualidad_id} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {item.apellidos}, {item.nombres}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {item.grado} · {item.paralelo}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">{item.mes_correspondiente}</Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2" color="text.secondary">
                                                            {pagosService.formatearMonto(item.monto_actual)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2" fontWeight={700}>
                                                            {pagosService.formatearMonto(item.monto_nuevo)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {item.queda_saldado ? (
                                                            <Chip
                                                                label="Queda saldada"
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: alpha('#10b981', 0.1),
                                                                    color: '#10b981',
                                                                    fontWeight: 600,
                                                                }}
                                                            />
                                                        ) : (
                                                            <Typography variant="body2">
                                                                {pagosService.formatearMonto(item.saldo_nuevo)}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </>
                        )}
                    </Box>
                )}
            </DialogContent>

            {/* ── FOOTER ── */}
            <Box sx={{
                px: 3, pb: 3, pt: 2,
                display: 'flex', alignItems: 'center', gap: 1,
                borderTop: `1px solid ${borderField}`,
            }}>
                {step === 'preview' && (
                    <Button
                        onClick={() => setStep('filtros')}
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            borderRadius: '10px', color: 'text.secondary',
                            border: `1px solid ${borderField}`, px: 2,
                            textTransform: 'none', fontWeight: 600,
                            '&:hover': { borderColor: brand, color: brand, background: alpha(brand, 0.06) },
                        }}
                    >
                        Atrás
                    </Button>
                )}

                <Box sx={{ flex: 1 }} />

                <Button
                    onClick={handleClose}
                    sx={{
                        borderRadius: '10px', color: 'text.secondary', px: 2,
                        textTransform: 'none', fontWeight: 600,
                        '&:hover': { background: 'rgba(255,255,255,0.05)' },
                    }}
                >
                    Cancelar
                </Button>

                {step === 'filtros' ? (
                    <Button
                        variant="contained"
                        onClick={handlePrevisualizar}
                        disabled={loadingAjusteCosto}
                        sx={{
                            borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
                            background: brand, color: isDark ? '#000' : '#fff',
                            boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
                            '&:hover': { background: isDark ? '#eab308' : '#01579b', boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
                            '&.Mui-disabled': { opacity: 0.4, background: brand, color: isDark ? '#000' : '#fff' },
                        }}
                    >
                        {loadingAjusteCosto
                            ? <CircularProgress size={18} color="inherit" />
                            : 'Previsualizar impacto'}
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        onClick={handleAplicar}
                        disabled={loadingAjusteCosto || !resumen || resumen.total_cuotas === 0}
                        sx={{
                            borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
                            background: brand, color: isDark ? '#000' : '#fff',
                            boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
                            '&:hover': { background: isDark ? '#eab308' : '#01579b', boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
                            '&.Mui-disabled': { opacity: 0.4, background: brand, color: isDark ? '#000' : '#fff' },
                        }}
                    >
                        {loadingAjusteCosto
                            ? <CircularProgress size={18} color="inherit" />
                            : `Aplicar a ${resumen?.total_cuotas ?? 0} cuota(s)`}
                    </Button>
                )}
            </Box>
        </Dialog>
    );
};

export default AjusteCostoModal;