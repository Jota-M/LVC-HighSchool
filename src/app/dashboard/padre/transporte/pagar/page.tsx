'use client';
// app/dashboard/padre/transporte/pagar/page.tsx
// Pagar Online (Transporte) — pago individual + pago familiar (multi-hijo o multi-cuota)
// Restyle: mismo lenguaje visual que transporte/page.tsx y financiero/pagar/page.tsx
// (header sin contenedor, tarjetas planas sin shimmer/glow, bordes sutiles).

import React, { useState, useCallback, useEffect } from 'react';
import {
    Box, Container, Typography, useTheme, alpha, Fade, Checkbox,
    Chip, Skeleton, IconButton, Tooltip, CircularProgress, Avatar,
} from '@mui/material';
import { keyframes } from '@mui/system';
import DirectionsBusRoundedIcon from '@mui/icons-material/DirectionsBusRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

import { useRouter, useSearchParams } from 'next/navigation';
import {
    useHijosConTransporte,
    useCuotasTransporteHijo,
    useQRPagoTransporte,
    useQRFamiliarTransporte,
} from '@/hooks/usePadreTransportePagos';
import { MESES_LABELS, formatMesTransporte, formatFechaPagoTransporte } from '@/types/padreTransportePagosTypes';
import type { CuotaTransporteHijo, HijoTransporteInfo } from '@/types/padreTransportePagosTypes';

// ─── Animaciones ───────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;
const pulse = (color: string) => keyframes`
  0%, 100% { box-shadow: 0 0 0 0 ${alpha(color, 0.35)}; }
  50%       { box-shadow: 0 0 0 7px ${alpha(color, 0)}; }
`;
const scanLine = keyframes`
  0%   { top: 0%; }
  100% { top: 100%; }
`;
const successPop = keyframes`
  0%   { transform: scale(0.5); opacity: 0; }
  70%  { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
`;
const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

// ─── Paleta ────────────────────────────────────────────────────────────────
const usePalette = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const gold = isDark ? '#facc15' : '#f59e0b';
    const goldEnd = isDark ? '#f59e0b' : '#d97706';
    const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
    return { isDark, gold, goldEnd, gradBg };
};

// ─── Countdown ────────────────────────────────────────────────────────────
const QRCountdown: React.FC<{ expiracion: string; isDark: boolean; gold: string }> = ({
    expiracion, isDark, gold,
}) => {
    const [segundos, setSegundos] = useState(0);
    useEffect(() => {
        const calcular = () => {
            const diff = Math.max(0, Math.floor((new Date(expiracion).getTime() - Date.now()) / 1000));
            setSegundos(diff);
        };
        calcular();
        const iv = setInterval(calcular, 1000);
        return () => clearInterval(iv);
    }, [expiracion]);
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    const urgente = segundos < 300;
    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 1.5, py: 0.6, borderRadius: '10px',
            bgcolor: urgente ? alpha('#ef4444', isDark ? 0.15 : 0.08) : alpha(gold, isDark ? 0.12 : 0.08),
            border: `1px solid ${urgente ? alpha('#ef4444', 0.3) : alpha(gold, 0.25)}`,
        }}>
            <AccessTimeRoundedIcon sx={{ fontSize: 14, color: urgente ? '#ef4444' : gold }} />
            <Typography variant="caption" fontWeight={800} sx={{ color: urgente ? '#ef4444' : gold, fontFamily: 'monospace', fontSize: 13 }}>
                {String(horas).padStart(2, '0')}:{String(minutos).padStart(2, '0')}:{String(segs).padStart(2, '0')}
            </Typography>
        </Box>
    );
};

// ─── Card cuota seleccionable ──────────────────────────────────────────────
const CuotaCard: React.FC<{
    cuota: CuotaTransporteHijo; selected: boolean; onToggle: () => void;
    disabled: boolean; isDark: boolean; gold: string; index: number;
    nombreHijo?: string; // solo en modo familiar
}> = ({ cuota, selected, onToggle, disabled, isDark, gold, index, nombreHijo }) => {
    const esVencido = cuota.estado === 'vencido';
    const mesLabel = formatMesTransporte(cuota.mes_correspondiente);
    const accent = esVencido ? '#ef4444' : gold;
    return (
        <Box
            onClick={() => !disabled && onToggle()}
            sx={{
                display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: '14px',
                border: `1.5px solid ${selected ? alpha(accent, 0.5) : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
                borderLeft: `3px solid ${selected ? accent : 'transparent'}`,
                bgcolor: selected ? alpha(accent, isDark ? 0.07 : 0.04) : isDark ? alpha('#fff', 0.02) : '#fafafa',
                cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
                transition: 'all 0.15s', animation: `${fadeUp} 0.3s ease-out ${index * 0.04}s both`,
                '&:hover': !disabled ? { border: `1.5px solid ${alpha(accent, 0.4)}` } : {},
            }}
        >
            <Checkbox
                checked={selected} disabled={disabled} onChange={onToggle}
                onClick={e => e.stopPropagation()}
                sx={{ p: 0, color: isDark ? alpha('#fff', 0.2) : alpha('#000', 0.15), '&.Mui-checked': { color: accent } }}
            />
            <Box sx={{
                width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
                bgcolor: alpha(accent, isDark ? 0.16 : 0.1),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: accent,
            }}>
                <DirectionsBusRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={800} sx={{ fontSize: 14 }}>
                    {nombreHijo ? `${nombreHijo} — ` : ''}Transporte {mesLabel}
                </Typography>
                <Typography variant="caption" sx={{ color: esVencido ? '#ef4444' : 'text.disabled', fontSize: 11, fontWeight: 600 }}>
                    {esVencido ? '⚠ Vencida · ' : ''}Vence: {formatFechaPagoTransporte(cuota.fecha_vencimiento)}
                </Typography>
            </Box>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography variant="body2" fontWeight={900} sx={{ fontSize: 15, color: accent }}>
                    Bs {parseFloat(String(cuota.monto_final)).toFixed(2)}
                </Typography>
                {cuota.monto_recargo > 0 && (
                    <Typography variant="caption" sx={{ color: '#ef4444', fontSize: 10, fontWeight: 700 }}>
                        + Bs {parseFloat(String(cuota.monto_recargo)).toFixed(2)} mora
                    </Typography>
                )}
            </Box>
            <Chip
                label={esVencido ? 'Vencida' : 'Pendiente'} size="small"
                sx={{
                    height: 20, fontSize: 10, fontWeight: 800, flexShrink: 0,
                    bgcolor: alpha(accent, isDark ? 0.15 : 0.08), color: accent, borderRadius: 1.5,
                }}
            />
        </Box>
    );
};

// ─── Panel QR (reutilizado en ambos modos) ────────────────────────────────
const PanelQR: React.FC<{
    qrData: any; estadoQR: any; pagado: boolean; isGenerando: boolean; isCancelando: boolean;
    onCancelar: () => void; onVerificar?: () => void;
    isDark: boolean; gold: string; gradBg: string; totalMonto: number; mesesLabel: string;
}> = ({ qrData, estadoQR, pagado, isGenerando, isCancelando, onCancelar, onVerificar, isDark, gold, gradBg, totalMonto, mesesLabel }) => {

    if (pagado) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }}>
            <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: alpha('#10b981', isDark ? 0.15 : 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', animation: `${successPop} 0.5s ease-out both` }}>
                <CheckCircleRoundedIcon sx={{ fontSize: 40, color: '#10b981' }} />
            </Box>
            <Typography variant="h6" fontWeight={900} sx={{ color: '#10b981' }}>¡Pago Confirmado!</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>{mesesLabel} — Bs {totalMonto.toFixed(2)}</Typography>
        </Box>
    );

    if (isGenerando) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
            <Box sx={{ animation: `${spin} 1s linear infinite` }}>
                <QrCode2RoundedIcon sx={{ fontSize: 44, color: gold, opacity: 0.6 }} />
            </Box>
            <Typography variant="body2" fontWeight={700} color="text.secondary">Generando QR...</Typography>
        </Box>
    );

    if (!qrData) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1.5 }}>
            <QrCode2RoundedIcon sx={{ fontSize: 52, color: alpha(gold, 0.3) }} />
            <Typography variant="body2" fontWeight={700} color="text.secondary">Seleccioná las cuotas y generá el QR</Typography>
            <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', px: 2 }}>El QR se conecta directamente con tu banco para procesar el pago de forma segura</Typography>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative', p: 1.5, borderRadius: '16px', bgcolor: '#fff', border: `1.5px solid ${alpha(gold, 0.3)}`, overflow: 'hidden' }}>
                <img src={`data:image/png;base64,${qrData.imagenQr}`} alt="QR de pago" style={{ width: 200, height: 200, display: 'block', borderRadius: 8 }} />
                <Box sx={{ position: 'absolute', left: 12, right: 12, height: 2, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, animation: `${scanLine} 2s ease-in-out infinite`, opacity: 0.7 }} />
            </Box>
            {qrData.qr_expiracion && <QRCountdown expiracion={qrData.qr_expiracion} isDark={isDark} gold={gold} />}
            {qrData.bancoDestino && (
                <Box sx={{ width: '100%', p: 1.5, borderRadius: '12px', bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03), border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}` }}>
                    <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 10 }}>BANCO DESTINO</Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ fontSize: 13 }}>{qrData.bancoDestino}</Typography>
                    {qrData.cuentaDestino && <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>Cuenta: {qrData.cuentaDestino}</Typography>}
                </Box>
            )}
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 10 }}>MONTO A PAGAR</Typography>
                <Typography variant="h5" fontWeight={900} sx={{ background: gradBg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Bs {totalMonto.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>{mesesLabel}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.8, borderRadius: '10px', bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03) }}>
                <CircularProgress size={12} sx={{ color: gold }} />
                <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 11 }}>Esperando confirmación del banco...</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                {onVerificar && (
                    <Box onClick={onVerificar} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6, py: 1, borderRadius: '10px', border: `1.5px solid ${alpha(gold, 0.4)}`, color: gold, fontWeight: 700, fontSize: 12, cursor: 'pointer', '&:hover': { bgcolor: alpha(gold, 0.05) } }}>
                        <RefreshRoundedIcon sx={{ fontSize: 14 }} />Verificar
                    </Box>
                )}
                <Box onClick={!isCancelando ? onCancelar : undefined} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6, py: 1, borderRadius: '10px', border: `1.5px solid ${alpha('#ef4444', 0.3)}`, color: '#ef4444', fontWeight: 700, fontSize: 12, cursor: isCancelando ? 'not-allowed' : 'pointer', opacity: isCancelando ? 0.6 : 1, '&:hover': { bgcolor: alpha('#ef4444', 0.05) } }}>
                    <CancelRoundedIcon sx={{ fontSize: 14 }} />
                    {isCancelando ? 'Cancelando...' : 'Cancelar QR'}
                </Box>
            </Box>
        </Box>
    );
};

// ─── Toggle de modo ────────────────────────────────────────────────────────
const ModoToggle: React.FC<{
    modo: 'individual' | 'familiar';
    onChange: (m: 'individual' | 'familiar') => void;
    tieneMultiplesHijos: boolean;
    isDark: boolean; gold: string;
}> = ({ modo, onChange, tieneMultiplesHijos, isDark, gold }) => {
    if (!tieneMultiplesHijos) return null;
    return (
        <Box sx={{ display: 'flex', gap: 0.5, p: 0.5, borderRadius: '12px', bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04), border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}` }}>
            {([
                { value: 'individual', icon: <PersonRoundedIcon sx={{ fontSize: 15 }} />, label: 'Un hijo' },
                { value: 'familiar', icon: <PeopleRoundedIcon sx={{ fontSize: 15 }} />, label: 'Familiar' },
            ] as const).map(opt => {
                const activo = modo === opt.value;
                return (
                    <Box
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 0.8,
                            px: 1.5, py: 0.75, borderRadius: '9px', cursor: 'pointer',
                            transition: 'all 0.15s',
                            bgcolor: activo ? alpha(gold, isDark ? 0.15 : 0.1) : 'transparent',
                            color: activo ? gold : 'text.secondary',
                            fontWeight: activo ? 800 : 600, fontSize: 13,
                            '&:hover': !activo ? { bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03) } : {},
                        }}
                    >
                        {opt.icon}
                        <Typography variant="caption" fontWeight="inherit" sx={{ fontSize: 12 }}>
                            {opt.label}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
};

// ─── Hook para cuotas de todos los hijos (modo familiar) ──────────────────
const useCuotasFamiliares = (hijos: HijoTransporteInfo[]) => {
    const [cuotasPorHijo, setCuotasPorHijo] = useState<Record<number, CuotaTransporteHijo[]>>({});
    const [isLoading, setIsLoading] = useState(false);

    const cargar = useCallback(async () => {
        if (hijos.length === 0) return;
        setIsLoading(true);
        try {
            const { getCuotasTransporteHijo } = await import('@/services/padreTransportePagosService');
            const resultados = await Promise.all(
                hijos.map(async h => {
                    try {
                        const data = await getCuotasTransporteHijo(h.estudiante_id);
                        return { estudiante_id: h.estudiante_id, cuotas: data.cuotas };
                    } catch {
                        return { estudiante_id: h.estudiante_id, cuotas: [] };
                    }
                })
            );
            const mapa: Record<number, CuotaTransporteHijo[]> = {};
            for (const r of resultados) mapa[r.estudiante_id] = r.cuotas;
            setCuotasPorHijo(mapa);
        } finally {
            setIsLoading(false);
        }
    }, [hijos.map(h => h.estudiante_id).join(',')]);

    useEffect(() => { cargar(); }, [cargar]);

    return { cuotasPorHijo, isLoading, refrescar: cargar };
};

// ─── Vista modo familiar ──────────────────────────────────────────────────
const VistaFamiliar: React.FC<{
    hijos: HijoTransporteInfo[];
    isDark: boolean; gold: string; gradBg: string;
    hayQRActivo: boolean;
    seleccionadas: Set<number>;
    onToggle: (id: number) => void;
}> = ({ hijos, isDark, gold, gradBg, hayQRActivo, seleccionadas, onToggle }) => {
    const { cuotasPorHijo, isLoading } = useCuotasFamiliares(hijos);

    if (isLoading) return (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: '14px' }} />)}
        </Box>
    );

    const hijosConPendientes = hijos.filter(h => {
        const cuotas = cuotasPorHijo[h.estudiante_id] ?? [];
        return cuotas.some(c => c.estado === 'vencido' || c.estado === 'pendiente');
    });

    if (hijosConPendientes.length === 0) return (
        <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 52, color: '#10b981', mb: 1.5, opacity: 0.7 }} />
            <Typography variant="body1" fontWeight={800} color="text.secondary">¡Toda la familia al día!</Typography>
            <Typography variant="caption" color="text.disabled">No hay cuotas de transporte pendientes</Typography>
        </Box>
    );

    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {hijos.map(hijo => {
                const cuotas = cuotasPorHijo[hijo.estudiante_id] ?? [];
                const pagables = cuotas.filter(c => c.estado === 'vencido' || c.estado === 'pendiente');
                if (pagables.length === 0) return null;

                const iniciales = `${hijo.nombres.charAt(0)}${hijo.apellidos.charAt(0)}`.toUpperCase();
                const vencidas = pagables.filter(c => c.estado === 'vencido');
                const pendientes = pagables.filter(c => c.estado === 'pendiente');
                const seleccionadasDeEsteHijo = pagables.filter(c => seleccionadas.has(c.pago_id)).length;

                return (
                    <Box key={hijo.estudiante_id}>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5,
                            px: 1, py: 0.75, borderRadius: '10px',
                            bgcolor: isDark ? alpha(gold, 0.06) : alpha(gold, 0.04),
                            border: `1px solid ${alpha(gold, 0.15)}`,
                        }}>
                            <Avatar sx={{ width: 30, height: 30, fontSize: '0.7rem', fontWeight: 800, background: gradBg, color: isDark ? '#000' : '#fff' }}>
                                {iniciales}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                                    {hijo.nombres.split(' ')[0]} {hijo.apellidos.split(' ')[0]}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                                    {hijo.ruta_nombre}
                                </Typography>
                            </Box>
                            {seleccionadasDeEsteHijo > 0 && (
                                <Chip
                                    label={`${seleccionadasDeEsteHijo} seleccionada${seleccionadasDeEsteHijo > 1 ? 's' : ''}`}
                                    size="small"
                                    sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: alpha(gold, 0.15), color: gold, borderRadius: 1.5 }}
                                />
                            )}
                        </Box>

                        {vencidas.length > 0 && (
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="caption" fontWeight={800} sx={{ color: '#ef4444', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.75, display: 'block', px: 0.5 }}>
                                    ⚠ Vencidas
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {vencidas.map((c, i) => (
                                        <CuotaCard
                                            key={c.pago_id} cuota={c} index={i}
                                            selected={seleccionadas.has(c.pago_id)}
                                            onToggle={() => onToggle(c.pago_id)}
                                            disabled={hayQRActivo} isDark={isDark} gold={gold}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {pendientes.length > 0 && (
                            <Box>
                                <Typography variant="caption" fontWeight={800} sx={{ color: gold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.75, display: 'block', px: 0.5 }}>
                                    Pendientes
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {pendientes.map((c, i) => (
                                        <CuotaCard
                                            key={c.pago_id} cuota={c} index={i}
                                            selected={seleccionadas.has(c.pago_id)}
                                            onToggle={() => onToggle(c.pago_id)}
                                            disabled={hayQRActivo} isDark={isDark} gold={gold}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
};

// ─── Página principal ──────────────────────────────────────────────────────
export default function PagarTransporteOnlinePage() {
    const { isDark, gold, gradBg } = usePalette();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pagoParam = searchParams.get('pago');

    // ── Datos base ──
    const { hijos, isLoading: loadingHijos } = useHijosConTransporte();
    const [hijoActivo, setHijoActivo] = useState<HijoTransporteInfo | null>(null);

    // ── Modo: individual | familiar ──
    const [modo, setModo] = useState<'individual' | 'familiar'>('individual');
    const tieneMultiplesHijos = hijos.length > 1;

    useEffect(() => {
        if (hijos.length > 0 && !hijoActivo) setHijoActivo(hijos[0]);
    }, [hijos]);

    // ── Datos modo individual ──
    const { cuotas, isLoading: loadingCuotas } =
        useCuotasTransporteHijo(modo === 'individual' ? (hijoActivo?.estudiante_id ?? null) : null);

    const pagables = cuotas.filter(c => c.estado === 'vencido' || c.estado === 'pendiente');

    // ── Selección (compartido entre modos) ──
    const [seleccionadas, setSeleccionadas] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (modo === 'individual') {
            if (pagables.length === 0) return;
            if (pagoParam) {
                const id = parseInt(pagoParam);
                if (!isNaN(id)) setSeleccionadas(new Set([id]));
            } else {
                setSeleccionadas(new Set(pagables.filter(c => c.estado === 'vencido').map(c => c.pago_id)));
            }
        } else {
            setSeleccionadas(new Set());
        }
    }, [cuotas.length, pagoParam, modo]);

    useEffect(() => { setSeleccionadas(new Set()); }, [modo]);

    const toggleSeleccion = useCallback((id: number) => {
        setSeleccionadas(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const seleccionarTodas = useCallback(() => {
        if (seleccionadas.size === pagables.length) setSeleccionadas(new Set());
        else setSeleccionadas(new Set(pagables.map(c => c.pago_id)));
    }, [pagables, seleccionadas.size]);

    // ── Cálculos individual ──
    const cuotasSeleccionadas = pagables.filter(c => seleccionadas.has(c.pago_id));
    const totalMontoInd = cuotasSeleccionadas.reduce((acc, c) => acc + parseFloat(String(c.monto_final)), 0);
    const mesesLabelInd = cuotasSeleccionadas.map(c => MESES_LABELS[c.mes_correspondiente] ?? c.mes_correspondiente).join(', ');

    // ── Hooks QR ──
    const pagoIdIndividual = cuotasSeleccionadas.length === 1 ? cuotasSeleccionadas[0].pago_id : null;

    const {
        qrData: qrIndividual, estadoQR: estadoIndividual, pagado: pagadoIndividual,
        isGenerando: generandoIndividual, isCancelando: cancelandoIndividual,
        generarQR: generarIndividual, cancelarQR: cancelarIndividual, verificarEstado,
    } = useQRPagoTransporte(pagoIdIndividual, false);

    const {
        qrData: qrFamiliar, estadoQR: estadoFamiliar, pagado: pagadoFamiliar,
        isGenerando: generandoFamiliar, isCancelando: cancelandoFamiliar,
        generarQR: generarFamiliarQR, cancelarQR: cancelarFamiliar,
        verificarEstado: verificarFamiliar, resetear: resetearFamiliar,
    } = useQRFamiliarTransporte();

    // ── Estado unificado ──
    const esIndividual = cuotasSeleccionadas.length === 1;
    const qrData = esIndividual ? qrIndividual : qrFamiliar;
    const estadoQR = esIndividual ? estadoIndividual : estadoFamiliar;
    const pagado = esIndividual ? pagadoIndividual : pagadoFamiliar;
    const isGenerando = esIndividual ? generandoIndividual : generandoFamiliar;
    const isCancelando = esIndividual ? cancelandoIndividual : cancelandoFamiliar;
    const verificarQR = esIndividual ? verificarEstado : verificarFamiliar;

    const totalMonto = modo === 'familiar'
        ? (qrFamiliar?.monto_total ?? 0)
        : totalMontoInd;

    const mesesLabel = modo === 'familiar'
        ? (qrFamiliar
            ? qrFamiliar.hijos.map(h => `${h.nombres.split(' ')[0]}: ${h.meses.map(m => MESES_LABELS[m] ?? m).join(', ')}`).join(' | ')
            : `${seleccionadas.size} cuotas familiares`)
        : mesesLabelInd;

    const hayQRActivo = !!qrData && !pagado;
    const puedeGenerar = modo === 'familiar' ? seleccionadas.size >= 2 : cuotasSeleccionadas.length > 0;

    // ── Handlers ──
    const handleGenerarQR = useCallback(async () => {
        if (!puedeGenerar) return;

        if (modo === 'familiar') {
            resetearFamiliar();
            await generarFamiliarQR(Array.from(seleccionadas));
        } else {
            if (cuotasSeleccionadas.length === 1) {
                await generarIndividual();
            } else {
                resetearFamiliar();
                await generarFamiliarQR(cuotasSeleccionadas.map(c => c.pago_id));
            }
        }
    }, [modo, puedeGenerar, seleccionadas, cuotasSeleccionadas, generarFamiliarQR, generarIndividual, resetearFamiliar]);

    const handleCancelar = useCallback(async () => {
        if (esIndividual) await cancelarIndividual();
        else await cancelarFamiliar();
    }, [esIndividual, cancelarIndividual, cancelarFamiliar]);

    const handleCambioModo = useCallback((nuevoModo: 'individual' | 'familiar') => {
        if (hayQRActivo) handleCancelar();
        setModo(nuevoModo);
    }, [hayQRActivo, handleCancelar]);

    useEffect(() => {
        if (pagado) {
            const timer = setTimeout(() => router.push('/dashboard/padre/transporte'), 3000);
            return () => clearTimeout(timer);
        }
    }, [pagado, router]);

    const labelBotonGenerar = () => {
        if (isGenerando) return null;
        if (modo === 'familiar') {
            if (seleccionadas.size < 2) return 'Seleccioná al menos 2 cuotas';
            return `Generar QR familiar · ${seleccionadas.size} cuotas`;
        }
        if (cuotasSeleccionadas.length === 0) return 'Seleccioná al menos una cuota';
        return `Generar QR · Bs ${totalMontoInd.toFixed(2)}`;
    };

    return (
        <Box sx={{ minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">

                {/* ══ HEADER — mismo patrón que transporte/page.tsx: sin contenedor ══ */}
                <Fade in timeout={500}>
                    <Box sx={{ mb: 4 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: { xs: 'flex-start', md: 'center' },
                                flexDirection: { xs: 'column', md: 'row' },
                                gap: { xs: 2, md: 0 },
                                mb: 2,
                            }}
                        >
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Tooltip title="Volver">
                                        <IconButton
                                            onClick={() => router.push('/dashboard/padre/transporte')}
                                            size="small"
                                            sx={{
                                                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                                                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                                                borderRadius: '10px', mr: 0.5,
                                            }}
                                        >
                                            <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <QrCode2RoundedIcon
                                        sx={{ color: gold, fontSize: 32, animation: `${bounce} 1.5s infinite` }}
                                    />
                                    <Typography
                                        variant="h1"
                                        sx={{
                                            fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' },
                                            fontWeight: 800,
                                            background: gradBg,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        Pagar Transporte
                                    </Typography>
                                </Box>

                                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.3, ml: { xs: 0, md: 6.5 } }}>
                                    Generá un QR y pagá desde la app de tu banco.
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap',
                                    width: { xs: '100%', md: 'auto' },
                                    justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                }}
                            >
                                <ModoToggle
                                    modo={modo}
                                    onChange={handleCambioModo}
                                    tieneMultiplesHijos={tieneMultiplesHijos}
                                    isDark={isDark}
                                    gold={gold}
                                />

                                {modo === 'individual' && hijoActivo && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, borderRadius: '12px', bgcolor: isDark ? alpha('#fff', 0.04) : alpha(gold, 0.05), border: `1px solid ${alpha(gold, 0.2)}` }}>
                                        <Box sx={{ width: 28, height: 28, borderRadius: '9px', background: gradBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: isDark ? '#000' : '#fff', flexShrink: 0 }}>
                                            {hijoActivo.nombres.charAt(0)}{hijoActivo.apellidos.charAt(0)}
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight={800} sx={{ fontSize: 13, lineHeight: 1.2 }}>{hijoActivo.nombres} {hijoActivo.apellidos}</Typography>
                                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>{hijoActivo.ruta_nombre}</Typography>
                                        </Box>
                                    </Box>
                                )}

                                {modo === 'familiar' && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: '12px', bgcolor: isDark ? alpha(gold, 0.1) : alpha(gold, 0.06), border: `1px solid ${alpha(gold, 0.3)}` }}>
                                        <PeopleRoundedIcon sx={{ fontSize: 16, color: gold }} />
                                        <Typography variant="caption" fontWeight={800} sx={{ color: gold, fontSize: 12 }}>
                                            {hijos.length} hijos · Pago familiar
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Selector de hijo — solo modo individual con múltiples hijos */}
                        {modo === 'individual' && tieneMultiplesHijos && (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: { xs: 0, md: 6.5 } }}>
                                {hijos.map(hijo => {
                                    const activo = hijoActivo?.estudiante_id === hijo.estudiante_id;
                                    return (
                                        <Box
                                            key={hijo.estudiante_id}
                                            onClick={() => { if (!hayQRActivo) { setHijoActivo(hijo); setSeleccionadas(new Set()); } }}
                                            sx={{
                                                display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75,
                                                borderRadius: '10px', cursor: hayQRActivo ? 'not-allowed' : 'pointer',
                                                border: `1.5px solid ${activo ? alpha(gold, 0.5) : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                                                bgcolor: activo ? alpha(gold, isDark ? 0.12 : 0.07) : 'transparent',
                                                opacity: hayQRActivo && !activo ? 0.5 : 1,
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <Avatar sx={{ width: 22, height: 22, fontSize: '0.6rem', fontWeight: 800, background: activo ? gradBg : alpha(gold, 0.2), color: activo ? (isDark ? '#000' : '#fff') : gold }}>
                                                {hijo.nombres.charAt(0)}{hijo.apellidos.charAt(0)}
                                            </Avatar>
                                            <Typography variant="caption" fontWeight={activo ? 800 : 600} sx={{ color: activo ? gold : 'text.secondary', fontSize: 12 }}>
                                                {hijo.nombres.split(' ')[0]}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </Fade>

                {/* ══ CUERPO ══ */}
                <Fade in timeout={700}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 380px' }, gap: 2.5, alignItems: 'start' }}>

                        {/* ── COLUMNA IZQUIERDA ── */}
                        <Box sx={{
                            borderRadius: '16px',
                            bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
                            border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
                            overflow: 'hidden',
                        }}>

                            <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    {modo === 'familiar'
                                        ? <PeopleRoundedIcon sx={{ fontSize: 17, color: gold }} />
                                        : <DirectionsBusRoundedIcon sx={{ fontSize: 17, color: gold }} />
                                    }
                                    <Typography variant="subtitle2" fontWeight={800}>
                                        {modo === 'familiar' ? 'Seleccioná cuotas de tus hijos' : 'Seleccioná las cuotas a pagar'}
                                    </Typography>
                                    {seleccionadas.size > 0 && (
                                        <Chip
                                            label={`${seleccionadas.size} seleccionada${seleccionadas.size > 1 ? 's' : ''}`}
                                            size="small"
                                            sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: alpha(gold, isDark ? 0.12 : 0.08), color: gold, borderRadius: 1.5 }}
                                        />
                                    )}
                                </Box>

                                {modo === 'individual' && !loadingCuotas && pagables.length > 0 && !hayQRActivo && (
                                    <Box onClick={seleccionarTodas} sx={{ fontSize: 12, fontWeight: 700, color: gold, cursor: 'pointer', '&:hover': { opacity: 0.7 } }}>
                                        {seleccionadas.size === pagables.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                                    </Box>
                                )}

                                {modo === 'familiar' && !hayQRActivo && (
                                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                                        Mínimo 2 cuotas
                                    </Typography>
                                )}
                            </Box>

                            {modo === 'individual' ? (
                                <>
                                    {(loadingHijos || loadingCuotas) && (
                                        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: '14px' }} />)}
                                        </Box>
                                    )}
                                    {!loadingCuotas && pagables.length === 0 && (
                                        <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
                                            <CheckCircleRoundedIcon sx={{ fontSize: 52, color: '#10b981', mb: 1.5, opacity: 0.7 }} />
                                            <Typography variant="body1" fontWeight={800} color="text.secondary">¡Estás al día!</Typography>
                                            <Typography variant="caption" color="text.disabled">No tenés cuotas de transporte pendientes de pago</Typography>
                                        </Box>
                                    )}
                                    {!loadingCuotas && pagables.length > 0 && (
                                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            {pagables.filter(c => c.estado === 'vencido').length > 0 && (
                                                <Box>
                                                    <Typography variant="caption" fontWeight={800} sx={{ color: '#ef4444', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, mb: 1, display: 'block', px: 0.5 }}>⚠ Vencidas</Typography>
                                                    {pagables.filter(c => c.estado === 'vencido').map((c, i) => (
                                                        <Box key={c.pago_id} sx={{ mb: 1 }}>
                                                            <CuotaCard cuota={c} selected={seleccionadas.has(c.pago_id)} onToggle={() => toggleSeleccion(c.pago_id)} disabled={hayQRActivo} isDark={isDark} gold={gold} index={i} />
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}
                                            {pagables.filter(c => c.estado === 'pendiente').length > 0 && (
                                                <Box>
                                                    <Typography variant="caption" fontWeight={800} sx={{ color: gold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, mb: 1, display: 'block', px: 0.5 }}>Pendientes</Typography>
                                                    {pagables.filter(c => c.estado === 'pendiente').map((c, i) => (
                                                        <Box key={c.pago_id} sx={{ mb: 1 }}>
                                                            <CuotaCard cuota={c} selected={seleccionadas.has(c.pago_id)} onToggle={() => toggleSeleccion(c.pago_id)} disabled={hayQRActivo} isDark={isDark} gold={gold} index={i} />
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                </>
                            ) : (
                                <VistaFamiliar
                                    hijos={hijos}
                                    isDark={isDark} gold={gold} gradBg={gradBg}
                                    hayQRActivo={hayQRActivo}
                                    seleccionadas={seleccionadas}
                                    onToggle={toggleSeleccion}
                                />
                            )}

                            {seleccionadas.size > 0 && (
                                <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 10 }}>
                                            {seleccionadas.size} CUOTA{seleccionadas.size !== 1 ? 'S' : ''} SELECCIONADA{seleccionadas.size !== 1 ? 'S' : ''}
                                            {modo === 'familiar' && ' · FAMILIAR'}
                                        </Typography>
                                        {modo === 'individual' && (
                                            <Typography variant="h6" fontWeight={900} sx={{ background: gradBg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                                                Bs {totalMontoInd.toFixed(2)}
                                            </Typography>
                                        )}
                                        {modo === 'familiar' && seleccionadas.size < 2 && (
                                            <Typography variant="caption" sx={{ color: gold, fontSize: 11, fontWeight: 600 }}>
                                                Necesitás al menos 2 para el QR familiar
                                            </Typography>
                                        )}
                                    </Box>
                                    {modo === 'individual' && (
                                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11, maxWidth: 160, textAlign: 'right' }}>{mesesLabelInd}</Typography>
                                    )}
                                    {modo === 'familiar' && seleccionadas.size >= 2 && (
                                        <Chip label="Listo para pagar" size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700, bgcolor: alpha('#10b981', 0.12), color: '#10b981', borderRadius: 1.5 }} />
                                    )}
                                </Box>
                            )}
                        </Box>

                        {/* ── COLUMNA DERECHA: QR ── */}
                        <Box sx={{
                            borderRadius: '16px',
                            bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
                            border: `1px solid ${pagado ? alpha('#10b981', 0.3) : qrData ? alpha(gold, 0.25) : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
                            overflow: 'hidden', position: { md: 'sticky' }, top: { md: 24 },
                        }}>
                            <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <QrCode2RoundedIcon sx={{ fontSize: 17, color: pagado ? '#10b981' : gold }} />
                                <Typography variant="subtitle2" fontWeight={800}>
                                    {pagado ? 'Pago Confirmado' : modo === 'familiar' ? 'QR Familiar' : 'Código QR de Pago'}
                                </Typography>
                                {qrData && !pagado && (
                                    <Chip label="ACTIVO" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 900, bgcolor: alpha('#10b981', 0.12), color: '#10b981', borderRadius: 1.5, animation: `${pulse('#10b981')} 2.5s ease-in-out infinite` }} />
                                )}
                                {modo === 'familiar' && !qrData && !pagado && (
                                    <Chip label="MULTI-HIJO" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 900, bgcolor: alpha(gold, 0.12), color: gold, borderRadius: 1.5 }} />
                                )}
                            </Box>

                            <Box sx={{ p: 3 }}>
                                <PanelQR
                                    qrData={qrData} estadoQR={estadoQR} pagado={pagado}
                                    isGenerando={isGenerando} isCancelando={isCancelando}
                                    onCancelar={handleCancelar}
                                    onVerificar={verificarQR}
                                    isDark={isDark} gold={gold} gradBg={gradBg}
                                    totalMonto={totalMonto} mesesLabel={mesesLabel}
                                />

                                {!qrData && !pagado && (
                                    <Box
                                        onClick={puedeGenerar && !isGenerando ? handleGenerarQR : undefined}
                                        sx={{
                                            mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                                            py: 1.5, borderRadius: '12px',
                                            background: puedeGenerar ? gradBg : isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                                            color: puedeGenerar ? (isDark ? '#000' : '#fff') : 'text.disabled',
                                            fontWeight: 800, fontSize: 14,
                                            cursor: puedeGenerar && !isGenerando ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.2s',
                                            '&:hover': puedeGenerar && !isGenerando ? {
                                                transform: 'translateY(-1px)',
                                                boxShadow: isDark ? '0 8px 24px rgba(250, 204, 21, 0.3)' : '0 8px 24px rgba(245, 158, 11, 0.3)',
                                            } : {},
                                        }}
                                    >
                                        {isGenerando ? (
                                            <><CircularProgress size={16} sx={{ color: 'inherit' }} />Generando...</>
                                        ) : (
                                            <>{modo === 'familiar' ? <PeopleRoundedIcon sx={{ fontSize: 18 }} /> : <QrCode2RoundedIcon sx={{ fontSize: 18 }} />}{labelBotonGenerar()}</>
                                        )}
                                    </Box>
                                )}

                                {!qrData && !pagado && !isGenerando && (
                                    <Box sx={{ mt: 2 }}>
                                        {(modo === 'familiar' ? [
                                            { n: '1', t: 'Seleccioná cuotas de distintos hijos' },
                                            { n: '2', t: 'Mínimo 2 cuotas para el QR familiar' },
                                            { n: '3', t: 'Presioná "Generar QR familiar"' },
                                            { n: '4', t: 'Escaneá y pagá todo junto desde tu banco' },
                                        ] : [
                                            { n: '1', t: 'Seleccioná las cuotas a pagar' },
                                            { n: '2', t: 'Presioná "Generar QR"' },
                                            { n: '3', t: 'Abrí la app de tu banco' },
                                            { n: '4', t: 'Escaneá el QR y confirmá el pago' },
                                        ]).map(step => (
                                            <Box key={step.n} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                                <Box sx={{ width: 22, height: 22, borderRadius: '7px', flexShrink: 0, bgcolor: alpha(gold, isDark ? 0.12 : 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: gold }}>
                                                    {step.n}
                                                </Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: 12 }}>{step.t}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Box>

                    </Box>
                </Fade>

            </Container>
        </Box>
    );
}