'use client';
// app/dashboard/padre/transporte/page.tsx
// Estado de Pagos de Transporte — vista principal

import React, { useState, useCallback } from 'react';
import {
    Box, Container, Typography, useTheme, alpha, Fade,
    LinearProgress, Chip, Skeleton, IconButton, Tooltip,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Select, MenuItem, FormControl,
} from '@mui/material';
import { keyframes } from '@mui/system';
import DirectionsBusRoundedIcon from '@mui/icons-material/DirectionsBusRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

import { useRouter } from 'next/navigation';
import { useHijosConTransporte, useCuotasTransporteHijo, useQRFamiliarTransporte } from '@/hooks/usePadreTransportePagos';
import {
    ESTADO_CUOTA_TRANSPORTE_CONFIG,
    MESES_LABELS,
    calcularProgresoTransporte,
    formatFechaPagoTransporte,
    puedePagarTransporte,
} from '@/types/padreTransportePagosTypes';
import type { HijoTransporteInfo, CuotaTransporteHijo } from '@/types/padreTransportePagosTypes';

// ─── Animaciones ──────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const shimmer = keyframes`
  0%   { background-position: -1000px 0; }
  100% { background-position:  1000px 0; }
`;
const pulseGold = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(245,158,11,0); }
`;
const pulseRed = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
`;
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
`;

// ─── Paleta ───────────────────────────────────────────────────────────────────
const usePalette = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const gold = isDark ? '#facc15' : '#f59e0b';
    const goldEnd = isDark ? '#f59e0b' : '#d97706';
    const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
    return { isDark, gold, goldEnd, gradBg };
};

// ─── Card de resumen ──────────────────────────────────────────────────────────
const ResumenCard: React.FC<{
    label: string;
    valor: string;
    sub: string;
    icon: React.ReactNode;
    color: string;
    delay?: number;
    isDark: boolean;
    urgent?: boolean;
}> = ({ label, valor, sub, icon, color, delay = 0, isDark, urgent }) => (
    <Box sx={{
        p: 2.5, borderRadius: '20px',
        bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
        border: `1.5px solid ${urgent ? alpha(color, 0.4) : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
        boxShadow: urgent
            ? `0 0 0 0 ${alpha(color, 0.3)}, 0 4px 20px ${alpha(color, 0.1)}`
            : isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)',
        animation: `${fadeUp} 0.4s ease-out ${delay}s both`,
        position: 'relative', overflow: 'hidden',
        ...(urgent && { animation: `${fadeUp} 0.4s ease-out ${delay}s both, ${pulseGold} 2s ease-in-out infinite` }),
    }}>
        <Box sx={{
            position: 'absolute', top: -20, right: -20,
            width: 80, height: 80, borderRadius: '50%',
            bgcolor: alpha(color, isDark ? 0.08 : 0.06),
            pointerEvents: 'none',
        }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box sx={{
                width: 40, height: 40, borderRadius: '12px',
                bgcolor: alpha(color, isDark ? 0.15 : 0.1),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color,
            }}>
                {icon}
            </Box>
            {urgent && (
                <Chip label="URGENTE" size="small"
                    sx={{ height: 18, fontSize: 9, fontWeight: 900, bgcolor: alpha(color, 0.15), color, borderRadius: 1.5 }} />
            )}
        </Box>

        <Typography variant="h4" fontWeight={900} sx={{ color, lineHeight: 1, mb: 0.5 }}>
            {valor}
        </Typography>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.25, fontSize: 13 }}>
            {label}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
            {sub}
        </Typography>
    </Box>
);

// ─── Fila de cuota en la tabla ────────────────────────────────────────────────
const FilaCuota: React.FC<{
    cuota: CuotaTransporteHijo;
    index: number;
    onPagar: () => void;
    isDark: boolean;
    gold: string;
    gradBg: string;
}> = ({ cuota, index, onPagar, isDark, gold, gradBg }) => {
    const cfg = ESTADO_CUOTA_TRANSPORTE_CONFIG[cuota.estado];
    const mesLabel = MESES_LABELS[cuota.mes_correspondiente] ?? cuota.mes_correspondiente;
    const puedeP = puedePagarTransporte(cuota);
    const esPagado = cuota.estado === 'pagado';
    const esVencido = cuota.estado === 'vencido';

    return (
        <TableRow
            sx={{
                animation: `${slideIn} 0.3s ease-out ${index * 0.04}s both`,
                bgcolor: esVencido
                    ? isDark ? alpha('#ef4444', 0.05) : alpha('#ef4444', 0.02)
                    : esPagado
                        ? isDark ? alpha('#10b981', 0.04) : alpha('#10b981', 0.02)
                        : 'transparent',
                '&:hover': { bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02) },
                transition: 'background 0.15s',
            }}
        >
            {/* Concepto */}
            <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 32, height: 32, borderRadius: '10px', flexShrink: 0,
                        background: esPagado
                            ? 'linear-gradient(135deg, #10b981, #34d399)'
                            : esVencido
                                ? 'linear-gradient(135deg, #ef4444, #f87171)'
                                : gradBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isDark && !esPagado && !esVencido ? '#000' : '#fff',
                    }}>
                        {esPagado ? <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> : <DirectionsBusRoundedIcon sx={{ fontSize: 16 }} />}
                    </Box>
                    <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                            Transporte {mesLabel}
                        </Typography>
                        {cuota.fecha_pago && (
                            <Typography variant="caption" sx={{ color: '#10b981', fontSize: 10, fontWeight: 600 }}>
                                Pagado el {formatFechaPagoTransporte(cuota.fecha_pago)}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </TableCell>

            {/* Monto */}
            <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}` }}>
                <Typography variant="body2" fontWeight={800} sx={{
                    color: esPagado ? '#10b981' : esVencido ? '#ef4444' : isDark ? gold : '#d97706',
                    fontSize: 14,
                }}>
                    Bs {parseFloat(String(cuota.monto_final)).toFixed(2)}
                </Typography>
                {cuota.monto_recargo > 0 && (
                    <Typography variant="caption" sx={{ color: '#ef4444', fontSize: 10, fontWeight: 700 }}>
                        + Bs {parseFloat(String(cuota.monto_recargo)).toFixed(2)} mora
                    </Typography>
                )}
            </TableCell>

            {/* Vencimiento */}
            <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}` }}>
                <Typography variant="caption" fontWeight={600}
                    sx={{ color: esVencido ? '#ef4444' : 'text.secondary', fontSize: 12 }}>
                    {formatFechaPagoTransporte(cuota.fecha_vencimiento)}
                </Typography>
                {esVencido && (
                    <Typography variant="caption" sx={{ color: '#ef4444', fontSize: 10, display: 'block', fontWeight: 700 }}>
                        ⚠ VENCIDO
                    </Typography>
                )}
            </TableCell>

            {/* Estado */}
            <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}` }}>
                <Chip
                    label={cfg.label}
                    size="small"
                    sx={{
                        height: 22, fontSize: 11, fontWeight: 800,
                        bgcolor: isDark ? alpha(cfg.color, 0.15) : alpha(cfg.color, 0.1),
                        color: cfg.color, borderRadius: 1.5,
                    }}
                />
            </TableCell>

            {/* Acción */}
            <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}` }}>
                {puedeP && (
                    <Box
                        onClick={onPagar}
                        sx={{
                            display: 'inline-flex', alignItems: 'center', gap: 0.6,
                            px: 1.5, py: 0.6, borderRadius: '10px',
                            background: esVencido
                                ? 'linear-gradient(135deg, #ef4444, #f87171)'
                                : gradBg,
                            color: '#fff',
                            fontWeight: 800, fontSize: 11, cursor: 'pointer',
                            boxShadow: esVencido
                                ? '0 2px 8px rgba(239,68,68,0.3)'
                                : `0 2px 8px ${alpha(gold, 0.3)}`,
                            transition: 'opacity 0.15s, transform 0.15s',
                            '&:hover': { opacity: 0.88, transform: 'scale(1.04)' },
                        }}
                    >
                        <QrCode2RoundedIcon sx={{ fontSize: 13 }} />
                        Pagar
                    </Box>
                )}
                {cuota.tiene_qr_activo && !puedeP && (
                    <Chip label="QR activo" size="small"
                        sx={{
                            height: 20, fontSize: 10, fontWeight: 700,
                            bgcolor: isDark ? alpha(gold, 0.1) : alpha(gold, 0.08),
                            color: isDark ? gold : '#d97706',
                            border: `1px solid ${alpha(gold, 0.3)}`,
                            borderRadius: 1.5,
                        }}
                    />
                )}
                {esPagado && (
                    <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#10b981' }} />
                )}
            </TableCell>
        </TableRow>
    );
};

// ─── Selector de hijo ─────────────────────────────────────────────────────────
const SelectorHijo: React.FC<{
    hijos: HijoTransporteInfo[];
    hijoActivo: HijoTransporteInfo | null;
    onChange: (h: HijoTransporteInfo) => void;
    isLoading: boolean;
    isDark: boolean;
    gold: string;
    gradBg: string;
}> = ({ hijos, hijoActivo, onChange, isLoading, isDark, gold, gradBg }) => {
    if (isLoading) return (
        <Skeleton variant="rounded" height={56} sx={{ borderRadius: '16px', width: 320 }} />
    );

    if (hijos.length === 1) return (
        <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            px: 2, py: 1.2, borderRadius: '14px',
            bgcolor: isDark ? alpha('#fff', 0.05) : alpha(gold, 0.06),
            border: `1.5px solid ${alpha(gold, 0.3)}`,
        }}>
            <Box sx={{
                width: 32, height: 32, borderRadius: '10px',
                background: gradBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 900, color: isDark ? '#000' : '#fff',
            }}>
                {hijos[0].nombres.charAt(0)}{hijos[0].apellidos.charAt(0)}
            </Box>
            <Box>
                <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                    {hijos[0].nombres} {hijos[0].apellidos}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                    {hijos[0].ruta_nombre}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <FormControl size="small">
            <Select
                value={hijoActivo?.estudiante_id ?? ''}
                onChange={e => {
                    const hijo = hijos.find(h => h.estudiante_id === Number(e.target.value));
                    if (hijo) onChange(hijo);
                }}
                IconComponent={KeyboardArrowDownRoundedIcon}
                renderValue={() => hijoActivo ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
                            background: gradBg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 900, color: isDark ? '#000' : '#fff',
                        }}>
                            {hijoActivo.nombres.charAt(0)}{hijoActivo.apellidos.charAt(0)}
                        </Box>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                            {hijoActivo.nombres} {hijoActivo.apellidos}
                        </Typography>
                    </Box>
                ) : <Typography variant="body2">Seleccioná un hijo</Typography>}
                sx={{
                    borderRadius: '14px', minWidth: 260,
                    bgcolor: isDark ? alpha('#fff', 0.04) : '#fff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(gold, 0.3) },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: gold },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: gold },
                }}
            >
                {hijos.map(h => (
                    <MenuItem key={h.estudiante_id} value={h.estudiante_id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                            <Box sx={{
                                width: 30, height: 30, borderRadius: '9px', flexShrink: 0,
                                background: gradBg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 900, color: isDark ? '#000' : '#fff',
                            }}>
                                {h.nombres.charAt(0)}{h.apellidos.charAt(0)}
                            </Box>
                            <Box>
                                <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                                    {h.nombres} {h.apellidos}
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                                    {h.ruta_nombre} · {h.cuotas_pendientes} pendiente(s)
                                </Typography>
                            </Box>
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

// ─── Página principal ─────────────────────────────────────────────────────────
export default function EstadoPagosTransportePage() {
    const { isDark, gold, goldEnd, gradBg } = usePalette();
    const router = useRouter();

    const { hijos, isLoading: loadingHijos, refrescar } = useHijosConTransporte();
    const [hijoActivo, setHijoActivo] = useState<HijoTransporteInfo | null>(null);

    React.useEffect(() => {
        if (hijos.length > 0 && !hijoActivo) {
            setHijoActivo(hijos[0]);
        }
    }, [hijos]);

    const { cuotas, resumen, isLoading: loadingCuotas, refrescar: refrescarCuotas } =
        useCuotasTransporteHijo(hijoActivo?.estudiante_id ?? null);

    // Hook para QR familiar (pagar todas las vencidas de una)
    const { generarQR: generarQRFamiliar, isGenerando: generandoFamiliar } = useQRFamiliarTransporte();

    const progreso = calcularProgresoTransporte(resumen);
    const proximaPendiente = cuotas.find(c => c.estado === 'pendiente');
    const cuotasVencidas = cuotas.filter(c => c.estado === 'vencido');
    const totalVencidas = cuotasVencidas.length;
    const totalVencidoMonto = cuotasVencidas.reduce(
        (sum, c) => sum + parseFloat(String(c.monto_final)), 0
    );
    const totalPagadoMonto = cuotas
        .filter(c => c.estado === 'pagado')
        .reduce((sum, c) => sum + parseFloat(String(c.monto_pagado ?? c.monto_final)), 0);

    const handleRefrescar = useCallback(() => {
        refrescar();
        refrescarCuotas();
    }, [refrescar, refrescarCuotas]);

    const handlePagarTodasVencidas = useCallback(async () => {
        if (!hijoActivo || cuotasVencidas.length === 0) return;
        // El QR familiar/múltiple exige mínimo 2 cuotas; con 1 sola redirigimos al pago individual
        if (cuotasVencidas.length === 1) {
            router.push(`/dashboard/padre/transporte/pagar?pago=${cuotasVencidas[0].pago_id}`);
            return;
        }
        await generarQRFamiliar(cuotasVencidas.map(c => c.pago_id));
        router.push('/dashboard/padre/transporte/pagar');
    }, [hijoActivo, cuotasVencidas, generarQRFamiliar, router]);

    return (
        <Box sx={{
            minHeight: '100vh',
            background: isDark
                ? 'radial-gradient(ellipse at top right, rgba(250,204,21,0.05) 0%, transparent 50%)'
                : 'radial-gradient(ellipse at top right, rgba(245,158,11,0.04) 0%, transparent 50%)',
        }}>
            <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, sm: 3 } }}>
                <Box sx={{ pt: 3, pb: 6 }}>

                    {/* ══ HEADER ══ */}
                    <Fade in timeout={400}>
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{
                                p: { xs: 2.5, sm: 3.5 }, borderRadius: '24px',
                                background: isDark
                                    ? 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))'
                                    : '#fff',
                                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
                                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)',
                                position: 'relative', overflow: 'hidden',
                            }}>
                                {/* Shimmer */}
                                <Box sx={{
                                    position: 'absolute', inset: 0,
                                    background: `linear-gradient(90deg, transparent, ${alpha('#fff', isDark ? 0.02 : 0.06)}, transparent)`,
                                    backgroundSize: '1000px 100%',
                                    animation: `${shimmer} 4s linear infinite`,
                                    pointerEvents: 'none',
                                }} />

                                <Box sx={{
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
                                    position: 'relative', zIndex: 1,
                                }}>
                                    {/* Título */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            width: 52, height: 52, borderRadius: '16px',
                                            background: gradBg,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: `0 6px 20px ${alpha(gold, 0.4)}`,
                                            flexShrink: 0,
                                        }}>
                                            <DirectionsBusRoundedIcon sx={{ fontSize: 26, color: isDark ? '#000' : '#fff' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h5" fontWeight={900} sx={{
                                                background: gradBg,
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                letterSpacing: -0.3, lineHeight: 1.2,
                                            }}>
                                                Transporte Escolar
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                Estado de cuotas y pagos de transporte
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Acciones */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                        <SelectorHijo
                                            hijos={hijos}
                                            hijoActivo={hijoActivo}
                                            onChange={setHijoActivo}
                                            isLoading={loadingHijos}
                                            isDark={isDark}
                                            gold={gold}
                                            gradBg={gradBg}
                                        />

                                        <Box
                                            onClick={() => router.push('/dashboard/padre/transporte/pagar')}
                                            sx={{
                                                display: 'flex', alignItems: 'center', gap: 0.8,
                                                px: 2, py: 1, borderRadius: '12px',
                                                background: gradBg,
                                                color: isDark ? '#000' : '#fff',
                                                fontWeight: 800, fontSize: 13, cursor: 'pointer',
                                                boxShadow: `0 4px 14px ${alpha(gold, 0.4)}`,
                                                transition: 'opacity 0.15s, transform 0.15s',
                                                '&:hover': { opacity: 0.88, transform: 'translateY(-1px)' },
                                            }}
                                        >
                                            <QrCode2RoundedIcon sx={{ fontSize: 16 }} />
                                            Pagar Online
                                        </Box>

                                        <Tooltip title="Actualizar">
                                            <IconButton
                                                onClick={handleRefrescar}
                                                size="small"
                                                sx={{
                                                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                                                    border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                                                    borderRadius: '10px',
                                                    '&:hover': { bgcolor: isDark ? alpha(gold, 0.15) : alpha(gold, 0.08), transform: 'rotate(180deg)' },
                                                    transition: 'all 0.3s',
                                                }}
                                            >
                                                <RefreshRoundedIcon sx={{ fontSize: 16, color: isDark ? gold : '#d97706' }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>

                    {/* ══ CARDS DE RESUMEN ══ */}
                    {hijoActivo && (
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
                            gap: 2, mb: 3,
                        }}>
                            {loadingCuotas ? (
                                [1, 2, 3].map(i => (
                                    <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: '20px' }} />
                                ))
                            ) : (
                                <>
                                    <ResumenCard
                                        label="Cuotas Vencidas"
                                        valor={`Bs ${totalVencidoMonto.toFixed(2)}`}
                                        sub={`${totalVencidas} cuota${totalVencidas !== 1 ? 's' : ''} vencida${totalVencidas !== 1 ? 's' : ''} sin pagar`}
                                        icon={<WarningAmberRoundedIcon sx={{ fontSize: 20 }} />}
                                        color={totalVencidas > 0 ? '#ef4444' : gold}
                                        delay={0}
                                        isDark={isDark}
                                        urgent={totalVencidas > 0}
                                    />

                                    <ResumenCard
                                        label="Próxima Cuota"
                                        valor={proximaPendiente
                                            ? `${MESES_LABELS[proximaPendiente.mes_correspondiente]}`
                                            : totalVencidas > 0 ? '¡Regularizá!' : '¡Al día!'}
                                        sub={proximaPendiente
                                            ? `Vence: ${formatFechaPagoTransporte(proximaPendiente.fecha_vencimiento)}`
                                            : totalVencidas > 0
                                                ? `Tenés ${totalVencidas} cuota${totalVencidas !== 1 ? 's' : ''} vencida${totalVencidas !== 1 ? 's' : ''}`
                                                : 'Todas las cuotas pagadas'}
                                        icon={<CalendarMonthRoundedIcon sx={{ fontSize: 20 }} />}
                                        color={totalVencidas > 0 ? '#ef4444' : gold}
                                        delay={0.05}
                                        isDark={isDark}
                                    />

                                    <ResumenCard
                                        label="Total Pagado"
                                        valor={`Bs ${totalPagadoMonto.toFixed(2)}`}
                                        sub={`${resumen.pagadas} de ${resumen.total} cuotas · ${progreso}%`}
                                        icon={<TrendingUpRoundedIcon sx={{ fontSize: 20 }} />}
                                        color="#10b981"
                                        delay={0.1}
                                        isDark={isDark}
                                    />
                                </>
                            )}
                        </Box>
                    )}

                    {/* ══ TABLA: SOLO CUOTAS VENCIDAS ══ */}
                    <Fade in timeout={500}>
                        <Box sx={{
                            borderRadius: '20px',
                            background: isDark
                                ? 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))'
                                : '#fff',
                            border: `1px solid ${hijoActivo && totalVencidas > 0
                                ? alpha('#ef4444', 0.25)
                                : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)
                                }`,
                            boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.05)',
                            overflow: 'hidden',
                        }}>

                            {/* Header tabla */}
                            <Box sx={{
                                px: 3, py: 2,
                                borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                bgcolor: isDark
                                    ? (totalVencidas > 0 ? alpha('#ef4444', 0.06) : alpha('#fff', 0.02))
                                    : (totalVencidas > 0 ? alpha('#ef4444', 0.03) : alpha('#f8f9fa', 0.5)),
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <WarningAmberRoundedIcon sx={{
                                        fontSize: 18,
                                        color: totalVencidas > 0 ? '#ef4444' : isDark ? gold : '#d97706',
                                    }} />
                                    <Typography variant="subtitle2" fontWeight={800}>
                                        Cuotas Vencidas
                                    </Typography>
                                    {hijoActivo && !loadingCuotas && (
                                        <Chip
                                            label={totalVencidas > 0
                                                ? `${totalVencidas} vencida${totalVencidas !== 1 ? 's' : ''}`
                                                : 'Al día'}
                                            size="small"
                                            sx={{
                                                height: 20, fontSize: 10, fontWeight: 700,
                                                bgcolor: totalVencidas > 0
                                                    ? isDark ? alpha('#ef4444', 0.15) : alpha('#ef4444', 0.08)
                                                    : isDark ? alpha('#10b981', 0.15) : alpha('#10b981', 0.08),
                                                color: totalVencidas > 0 ? '#ef4444' : '#10b981',
                                                borderRadius: 1.5,
                                            }}
                                        />
                                    )}
                                </Box>

                                {/* Barra de progreso */}
                                {hijoActivo && !loadingCuotas && resumen.total > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 200 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={progreso}
                                            sx={{
                                                flex: 1, height: 6, borderRadius: 3,
                                                bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06),
                                                '& .MuiLinearProgress-bar': {
                                                    background: progreso === 100
                                                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                                                        : gradBg,
                                                    borderRadius: 3,
                                                },
                                            }}
                                        />
                                        <Typography variant="caption" fontWeight={900}
                                            sx={{ color: progreso === 100 ? '#10b981' : isDark ? gold : '#d97706', fontSize: 12, minWidth: 36 }}>
                                            {progreso}%
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Sin hijo con transporte */}
                            {!hijoActivo && !loadingHijos && (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <SchoolRoundedIcon sx={{ fontSize: 48, color: alpha(gold, 0.3), mb: 1.5 }} />
                                    <Typography variant="body1" fontWeight={700} color="text.secondary">
                                        Ninguno de tus hijos tiene transporte asignado
                                    </Typography>
                                </Box>
                            )}

                            {/* Loading */}
                            {(loadingHijos || loadingCuotas) && (
                                <Box sx={{ p: 3 }}>
                                    {[1, 2, 3].map(i => (
                                        <Box key={i} sx={{ display: 'flex', gap: 2, mb: 1.5, alignItems: 'center' }}>
                                            <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '10px', flexShrink: 0 }} />
                                            <Skeleton variant="rounded" height={20} sx={{ flex: 1, borderRadius: 2 }} />
                                            <Skeleton variant="rounded" width={80} height={20} sx={{ borderRadius: 2 }} />
                                            <Skeleton variant="rounded" width={60} height={20} sx={{ borderRadius: 2 }} />
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* ¡Al día! — sin vencidas */}
                            {hijoActivo && !loadingCuotas && totalVencidas === 0 && (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <CheckCircleRoundedIcon sx={{ fontSize: 52, color: '#10b981', mb: 1.5, opacity: 0.7 }} />
                                    <Typography variant="body1" fontWeight={800} color="text.secondary" sx={{ mb: 0.5 }}>
                                        ¡Estás al día!
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">
                                        No tenés cuotas de transporte vencidas pendientes de pago
                                    </Typography>
                                </Box>
                            )}

                            {/* Tabla solo con vencidas */}
                            {hijoActivo && !loadingCuotas && totalVencidas > 0 && (
                                <>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{
                                                    '& th': {
                                                        fontWeight: 800, fontSize: 11,
                                                        color: 'text.disabled',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 0.5,
                                                        bgcolor: isDark ? alpha('#ef4444', 0.04) : alpha('#ef4444', 0.02),
                                                        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                                                        py: 1.25,
                                                    },
                                                }}>
                                                    <TableCell>Concepto</TableCell>
                                                    <TableCell>Monto</TableCell>
                                                    <TableCell>Fecha Vence</TableCell>
                                                    <TableCell>Estado</TableCell>
                                                    <TableCell>Acción</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {cuotasVencidas.map((c, i) => (
                                                    <FilaCuota
                                                        key={c.pago_id}
                                                        cuota={c}
                                                        index={i}
                                                        isDark={isDark}
                                                        gold={gold}
                                                        gradBg={gradBg}
                                                        onPagar={() => router.push(
                                                            `/dashboard/padre/transporte/pagar?pago=${c.pago_id}`
                                                        )}
                                                    />
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    {/* Footer: total vencido + botón pagar todas */}
                                    <Box sx={{
                                        px: 3, py: 2,
                                        borderTop: `1px solid ${isDark ? alpha('#ef4444', 0.12) : alpha('#ef4444', 0.08)}`,
                                        bgcolor: isDark ? alpha('#ef4444', 0.04) : alpha('#ef4444', 0.02),
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        flexWrap: 'wrap', gap: 2,
                                    }}>
                                        {/* Resumen numérico */}
                                        <Box sx={{ display: 'flex', gap: 3 }}>
                                            <Box>
                                                <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 10 }}>
                                                    VENCIDAS
                                                </Typography>
                                                <Typography variant="h6" fontWeight={900} sx={{ color: '#ef4444', lineHeight: 1 }}>
                                                    {totalVencidas}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 10 }}>
                                                    TOTAL VENCIDO
                                                </Typography>
                                                <Typography variant="h6" fontWeight={900} sx={{ color: '#ef4444', lineHeight: 1 }}>
                                                    Bs {totalVencidoMonto.toFixed(2)}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Botón pagar todas las vencidas */}
                                        <Box
                                            onClick={!generandoFamiliar ? handlePagarTodasVencidas : undefined}
                                            sx={{
                                                display: 'flex', alignItems: 'center', gap: 0.8,
                                                px: 2.5, py: 1, borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #ef4444, #f87171)',
                                                color: '#fff',
                                                fontWeight: 800, fontSize: 13,
                                                cursor: generandoFamiliar ? 'not-allowed' : 'pointer',
                                                opacity: generandoFamiliar ? 0.7 : 1,
                                                boxShadow: '0 3px 14px rgba(239,68,68,0.35)',
                                                animation: !generandoFamiliar ? `${pulseRed} 2.5s ease-in-out infinite` : 'none',
                                                transition: 'opacity 0.15s, transform 0.15s',
                                                '&:hover': { opacity: generandoFamiliar ? 0.7 : 0.88, transform: generandoFamiliar ? 'none' : 'translateY(-1px)' },
                                            }}
                                        >
                                            <QrCode2RoundedIcon sx={{ fontSize: 15 }} />
                                            {generandoFamiliar
                                                ? 'Generando QR...'
                                                : `Pagar ${totalVencidas} vencida${totalVencidas !== 1 ? 's' : ''} — Bs ${totalVencidoMonto.toFixed(2)}`}
                                        </Box>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Fade>

                </Box>
            </Container>
        </Box>
    );
}