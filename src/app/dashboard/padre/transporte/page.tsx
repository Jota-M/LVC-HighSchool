'use client';
// app/dashboard/padre/transporte/page.tsx
// Estado de Pagos de Transporte — vista principal
// Refactor: mismo patrón que financiero/page.tsx (header sin contenedor, ResumenPagosCards, tabla componentizada).

import React, { useState, useCallback } from 'react';
import {
    Box, Container, Typography, useTheme, alpha, Fade,
    IconButton, Tooltip, Select, MenuItem, FormControl, Skeleton,
} from '@mui/material';
import { keyframes } from '@mui/system';
import DirectionsBusRoundedIcon from '@mui/icons-material/DirectionsBusRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import { useRouter } from 'next/navigation';
import { useHijosConTransporte, useCuotasTransporteHijo, useQRFamiliarTransporte } from '@/hooks/usePadreTransportePagos';
import {
    formatMesTransporte,
    calcularProgresoTransporte,
    formatFechaPagoTransporte,
} from '@/types/padreTransportePagosTypes';
import type { HijoTransporteInfo } from '@/types/padreTransportePagosTypes';

import { ResumenPagosCards, type ResumenPagosCardData } from '@/components/pagos/ResumenPagosCards';
import { TablaCuotasVencidas } from '@/components/pagos/TablaCuotasVencidas';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

// ─── Paleta — misma lógica dual que financiero, con acento gold/ámbar ───────
const usePalette = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const gold = isDark ? '#facc15' : '#f59e0b';
    const goldEnd = isDark ? '#f59e0b' : '#d97706';
    const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
    return { isDark, gold, goldEnd, gradBg };
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
    const { isDark, gold, gradBg } = usePalette();
    const theme = useTheme();
    const errorColor = theme.palette.error.main;
    const successColor = theme.palette.success.main;
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

    const handlePagarUna = useCallback((pagoId: number) => {
        router.push(`/dashboard/padre/transporte/pagar?pago=${pagoId}`);
    }, [router]);

    const handlePagarTodasVencidas = useCallback(async () => {
        if (!hijoActivo || cuotasVencidas.length === 0) return;
        // El QR familiar exige mínimo 2 cuotas; con 1 sola redirigimos al pago individual
        if (cuotasVencidas.length === 1) {
            router.push(`/dashboard/padre/transporte/pagar?pago=${cuotasVencidas[0].pago_id}`);
            return;
        }
        await generarQRFamiliar(cuotasVencidas.map(c => c.pago_id));
        router.push('/dashboard/padre/transporte/pagar');
    }, [hijoActivo, cuotasVencidas, generarQRFamiliar, router]);

    const statsCards: ResumenPagosCardData[] = [
        {
            label: 'Cuotas Vencidas',
            valor: `Bs ${totalVencidoMonto.toFixed(2)}`,
            sub: `${totalVencidas} cuota${totalVencidas !== 1 ? 's' : ''} vencida${totalVencidas !== 1 ? 's' : ''} sin pagar`,
            icon: <WarningAmberRoundedIcon sx={{ fontSize: 20 }} />,
            color: totalVencidas > 0 ? errorColor : gold,
            urgent: totalVencidas > 0,
        },
        {
            label: 'Próxima Cuota',
            valor: proximaPendiente
                ? formatMesTransporte(proximaPendiente.mes_correspondiente)
                : totalVencidas > 0 ? '¡Regularizá!' : '¡Al día!',
            sub: proximaPendiente
                ? `Vence: ${formatFechaPagoTransporte(proximaPendiente.fecha_vencimiento)}`
                : totalVencidas > 0
                    ? `Tenés ${totalVencidas} cuota${totalVencidas !== 1 ? 's' : ''} vencida${totalVencidas !== 1 ? 's' : ''}`
                    : 'Todas las cuotas pagadas',
            icon: <CalendarMonthRoundedIcon sx={{ fontSize: 20 }} />,
            color: totalVencidas > 0 ? errorColor : gold,
        },
        {
            label: 'Total Pagado',
            valor: `Bs ${totalPagadoMonto.toFixed(2)}`,
            sub: `${resumen.pagadas} de ${resumen.total} cuotas · ${progreso}%`,
            icon: <TrendingUpRoundedIcon sx={{ fontSize: 20 }} />,
            color: successColor,
        },
    ];

    return (
        <Box sx={{ minHeight: '100vh', py: 4 }}>
            <Container maxWidth="xl">

                {/* ══ HEADER — mismo patrón que financiero/page.tsx: sin contenedor ══ */}
                <Fade in timeout={500}>
                    <Box sx={{ mb: 4 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: { xs: 'flex-start', md: 'center' },
                                flexDirection: { xs: 'column', md: 'row' },
                                gap: { xs: 2, md: 0 },
                                mb: 3,
                            }}
                        >
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <DirectionsBusRoundedIcon
                                        sx={{ color: gold, fontSize: 36, animation: `${bounce} 1.5s infinite` }}
                                    />
                                    <Typography
                                        variant="h1"
                                        sx={{
                                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                                            fontWeight: 800,
                                            background: gradBg,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            animation: 'fadeIn 1s ease-out',
                                            '@keyframes fadeIn': {
                                                from: { opacity: 0, transform: 'translateY(-10px)' },
                                                to: { opacity: 1, transform: 'translateY(0)' },
                                            },
                                        }}
                                    >
                                        Transporte Escolar
                                    </Typography>
                                </Box>

                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{
                                        fontWeight: 500,
                                        letterSpacing: 0.3,
                                        animation: 'fadeInText 1.2s ease-out',
                                        '@keyframes fadeInText': {
                                            from: { opacity: 0, transform: 'translateY(5px)' },
                                            to: { opacity: 1, transform: 'translateY(0)' },
                                        },
                                    }}
                                >
                                    Estado de cuotas y pagos de transporte de tus hijos.
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap',
                                    width: { xs: '100%', md: 'auto' },
                                    justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                }}
                            >
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
                                        px: 2.5, py: 1.5, borderRadius: '12px',
                                        background: gradBg,
                                        color: isDark ? '#000' : '#fff',
                                        fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: isDark
                                                ? '0 8px 24px rgba(250, 204, 21, 0.3)'
                                                : '0 8px 24px rgba(245, 158, 11, 0.3)',
                                        },
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <QrCode2RoundedIcon sx={{ fontSize: 18 }} />
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
                                        <RefreshRoundedIcon sx={{ fontSize: 16, color: gold }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Box>
                </Fade>

                {/* ══ STATS ══ */}
                {hijoActivo && (
                    <ResumenPagosCards cards={statsCards} isLoading={loadingCuotas} />
                )}

                {/* ══ TABLA DE VENCIDAS ══ */}
                <Fade in timeout={700}>
                    <Box>
                        <TablaCuotasVencidas
                            hijoSeleccionado={!!hijoActivo}
                            isLoading={loadingCuotas}
                            isLoadingHijos={loadingHijos}
                            cuotasVencidas={cuotasVencidas}
                            progreso={progreso}
                            totalCuotas={resumen.total}
                            totalVencidoMonto={totalVencidoMonto}
                            generandoQR={generandoFamiliar}
                            onPagarUna={handlePagarUna}
                            onPagarTodas={handlePagarTodasVencidas}
                            gold={gold}
                            gradBg={gradBg}
                        />
                    </Box>
                </Fade>

            </Container>
        </Box>
    );
}