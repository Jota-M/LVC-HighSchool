'use client';
// components/pagos/TablaCuotasVencidas.tsx
// Tabla de cuotas de transporte vencidas (desktop/tablet) + vista de cards apiladas (mobile).
// Mismo patrón que TablaMensualidadesVencidas: theme.palette.error/success, sin glow ni decoraciones circulares.

import React from 'react';
import {
    Box, Typography, Chip, LinearProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    alpha, useTheme, useMediaQuery,
} from '@mui/material';
import { keyframes } from '@mui/system';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import DirectionsBusRoundedIcon from '@mui/icons-material/DirectionsBusRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

import {
    ESTADO_CUOTA_TRANSPORTE_CONFIG,
    formatMesTransporte,
    formatFechaPagoTransporte,
    puedePagarTransporte,
} from '@/types/padreTransportePagosTypes';
import type { CuotaTransporteHijo } from '@/types/padreTransportePagosTypes';

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const pulse = (color: string) => keyframes`
  0%, 100% { box-shadow: 0 0 0 0 ${alpha(color, 0.35)}; }
  50%       { box-shadow: 0 0 0 7px ${alpha(color, 0)}; }
`;

interface FilaCommonProps {
    cuota: CuotaTransporteHijo;
    onPagar: () => void;
    isDark: boolean;
    gold: string;
    gradBg: string;
    errorColor: string;
    successColor: string;
}

// ─── Fila de tabla (desktop/tablet ≥ sm) ─────────────────────────────────────
const FilaCuota: React.FC<FilaCommonProps & { index: number }> = ({
    cuota, index, onPagar, isDark, gold, gradBg, errorColor, successColor,
}) => {
    const cfg = ESTADO_CUOTA_TRANSPORTE_CONFIG[cuota.estado];
    const mesLabel = formatMesTransporte(cuota.mes_correspondiente);
    const puedeP = puedePagarTransporte(cuota);
    const esPagado = cuota.estado === 'pagado';
    const esVencido = cuota.estado === 'vencido';
    const rowAccent = esVencido ? errorColor : esPagado ? successColor : 'transparent';
    const montoColor = esPagado ? successColor : esVencido ? errorColor : gold;

    return (
        <TableRow
            sx={{
                animation: `${slideIn} 0.25s ease-out ${index * 0.04}s both`,
                borderLeft: `3px solid ${rowAccent}`,
                '&:hover': { bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015) },
                transition: 'background 0.15s',
            }}
        >
            <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 30, height: 30, borderRadius: '9px', flexShrink: 0,
                        bgcolor: alpha(montoColor, isDark ? 0.16 : 0.1),
                        color: montoColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {esPagado ? <CheckCircleRoundedIcon sx={{ fontSize: 15 }} /> : <DirectionsBusRoundedIcon sx={{ fontSize: 15 }} />}
                    </Box>
                    <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                            Transporte {mesLabel}
                        </Typography>
                        {cuota.fecha_pago && (
                            <Typography variant="caption" sx={{ color: successColor, fontSize: 10, fontWeight: 600 }}>
                                Pagado el {formatFechaPagoTransporte(cuota.fecha_pago)}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </TableCell>

            <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}` }}>
                <Typography variant="body2" fontWeight={800} sx={{ color: montoColor, fontSize: 14 }}>
                    Bs {parseFloat(String(cuota.monto_final)).toFixed(2)}
                </Typography>
                {cuota.monto_recargo > 0 && (
                    <Typography variant="caption" sx={{ color: errorColor, fontSize: 10, fontWeight: 700 }}>
                        + Bs {parseFloat(String(cuota.monto_recargo)).toFixed(2)} mora
                    </Typography>
                )}
            </TableCell>

            <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}` }}>
                <Typography variant="caption" fontWeight={600} sx={{ color: esVencido ? errorColor : 'text.secondary', fontSize: 12 }}>
                    {formatFechaPagoTransporte(cuota.fecha_vencimiento)}
                </Typography>
                {esVencido && (
                    <Typography variant="caption" sx={{ color: errorColor, fontSize: 10, display: 'block', fontWeight: 700 }}>
                        ⚠ VENCIDO
                    </Typography>
                )}
            </TableCell>

            <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}` }}>
                <Chip label={cfg.label} size="small" sx={{
                    height: 22, fontSize: 11, fontWeight: 800,
                    bgcolor: alpha(cfg.color, isDark ? 0.15 : 0.1), color: cfg.color, borderRadius: 1.5,
                }} />
            </TableCell>

            <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}` }}>
                {puedeP && (
                    <Box onClick={onPagar} sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.6,
                        px: 1.5, py: 0.6, borderRadius: '10px',
                        background: esVencido ? `linear-gradient(135deg, ${errorColor}, ${alpha(errorColor, 0.75)})` : gradBg,
                        color: esVencido ? '#fff' : isDark ? '#000' : '#fff',
                        fontWeight: 800, fontSize: 11, cursor: 'pointer',
                        transition: 'opacity 0.15s, transform 0.15s',
                        '&:hover': { opacity: 0.88, transform: 'scale(1.04)' },
                    }}>
                        <QrCode2RoundedIcon sx={{ fontSize: 13 }} />
                        Pagar
                    </Box>
                )}
                {cuota.tiene_qr_activo && !puedeP && (
                    <Chip label="QR activo" size="small" sx={{
                        height: 20, fontSize: 10, fontWeight: 700,
                        bgcolor: alpha(gold, isDark ? 0.12 : 0.08), color: gold,
                        border: `1px solid ${alpha(gold, 0.3)}`, borderRadius: 1.5,
                    }} />
                )}
                {esPagado && <CheckCircleRoundedIcon sx={{ fontSize: 18, color: successColor }} />}
            </TableCell>
        </TableRow>
    );
};

// ─── Card apilada (mobile < sm) ──────────────────────────────────────────────
const CardCuota: React.FC<FilaCommonProps & { index: number }> = ({
    cuota, index, onPagar, isDark, gold, gradBg, errorColor, successColor,
}) => {
    const cfg = ESTADO_CUOTA_TRANSPORTE_CONFIG[cuota.estado];
    const mesLabel = formatMesTransporte(cuota.mes_correspondiente);
    const puedeP = puedePagarTransporte(cuota);
    const esPagado = cuota.estado === 'pagado';
    const esVencido = cuota.estado === 'vencido';
    const accent = esVencido ? errorColor : esPagado ? successColor : gold;

    return (
        <Box sx={{
            p: 2, borderRadius: '14px',
            bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
            border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
            borderLeft: `3px solid ${accent}`,
            animation: `${fadeUp} 0.3s ease-out ${index * 0.05}s both`,
        }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Box sx={{
                        width: 28, height: 28, borderRadius: '9px', flexShrink: 0,
                        bgcolor: alpha(accent, isDark ? 0.16 : 0.1), color: accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {esPagado ? <CheckCircleRoundedIcon sx={{ fontSize: 14 }} /> : <DirectionsBusRoundedIcon sx={{ fontSize: 14 }} />}
                    </Box>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13.5 }}>
                        Transporte {mesLabel}
                    </Typography>
                </Box>
                <Chip label={cfg.label} size="small" sx={{
                    height: 20, fontSize: 10, fontWeight: 800,
                    bgcolor: alpha(cfg.color, isDark ? 0.15 : 0.1), color: cfg.color, borderRadius: 1.5,
                }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: puedeP ? 1.5 : 0 }}>
                <Box>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, display: 'block' }}>
                        Vence
                    </Typography>
                    <Typography variant="caption" fontWeight={600} sx={{ color: esVencido ? errorColor : 'text.secondary', fontSize: 12 }}>
                        {formatFechaPagoTransporte(cuota.fecha_vencimiento)}
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body1" fontWeight={800} sx={{ color: esPagado ? successColor : esVencido ? errorColor : gold }}>
                        Bs {parseFloat(String(cuota.monto_final)).toFixed(2)}
                    </Typography>
                    {cuota.monto_recargo > 0 && (
                        <Typography variant="caption" sx={{ color: errorColor, fontSize: 10, fontWeight: 700 }}>
                            + Bs {parseFloat(String(cuota.monto_recargo)).toFixed(2)} mora
                        </Typography>
                    )}
                </Box>
            </Box>

            {puedeP && (
                <Box onClick={onPagar} sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6,
                    py: 1, borderRadius: '10px', width: '100%',
                    background: esVencido ? `linear-gradient(135deg, ${errorColor}, ${alpha(errorColor, 0.75)})` : gradBg,
                    color: esVencido ? '#fff' : isDark ? '#000' : '#fff',
                    fontWeight: 800, fontSize: 12, cursor: 'pointer',
                }}>
                    <QrCode2RoundedIcon sx={{ fontSize: 14 }} />
                    Pagar esta cuota
                </Box>
            )}
            {cuota.tiene_qr_activo && !puedeP && (
                <Chip label="QR activo" size="small" sx={{
                    height: 20, fontSize: 10, fontWeight: 700, mt: 0.5,
                    bgcolor: alpha(gold, isDark ? 0.12 : 0.08), color: gold,
                    border: `1px solid ${alpha(gold, 0.3)}`, borderRadius: 1.5,
                }} />
            )}
        </Box>
    );
};

export interface TablaCuotasVencidasProps {
    hijoSeleccionado: boolean;
    isLoading: boolean;
    isLoadingHijos: boolean;
    cuotasVencidas: CuotaTransporteHijo[];
    progreso: number;
    totalCuotas: number;
    totalVencidoMonto: number;
    generandoQR: boolean;
    onPagarUna: (pagoId: number) => void;
    onPagarTodas: () => void;
    gold: string;
    gradBg: string;
}

export const TablaCuotasVencidas: React.FC<TablaCuotasVencidasProps> = ({
    hijoSeleccionado, isLoading, isLoadingHijos, cuotasVencidas,
    progreso, totalCuotas, totalVencidoMonto, generandoQR,
    onPagarUna, onPagarTodas, gold, gradBg,
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const errorColor = theme.palette.error.main;
    const successColor = theme.palette.success.main;
    const totalVencidas = cuotasVencidas.length;

    return (
        <Box sx={{
            borderRadius: '16px',
            bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
            border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
            overflow: 'hidden',
        }}>
            {/* Header */}
            <Box sx={{
                px: { xs: 2, sm: 3 }, py: 2,
                borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <WarningAmberRoundedIcon sx={{ fontSize: 18, color: totalVencidas > 0 ? errorColor : gold }} />
                    <Typography variant="subtitle2" fontWeight={800}>
                        Cuotas de Transporte Vencidas
                    </Typography>
                    {hijoSeleccionado && !isLoading && (
                        <Chip
                            label={totalVencidas > 0 ? `${totalVencidas} vencida${totalVencidas !== 1 ? 's' : ''}` : 'Al día'}
                            size="small"
                            sx={{
                                height: 20, fontSize: 10, fontWeight: 700,
                                bgcolor: alpha(totalVencidas > 0 ? errorColor : successColor, isDark ? 0.15 : 0.08),
                                color: totalVencidas > 0 ? errorColor : successColor,
                                borderRadius: 1.5,
                            }}
                        />
                    )}
                </Box>

                {hijoSeleccionado && !isLoading && totalCuotas > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: { xs: '100%', sm: 200 } }}>
                        <LinearProgress
                            variant="determinate"
                            value={progreso}
                            sx={{
                                flex: 1, height: 6, borderRadius: 3,
                                bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06),
                                '& .MuiLinearProgress-bar': {
                                    background: progreso === 100 ? `linear-gradient(90deg, ${successColor}, ${alpha(successColor, 0.7)})` : gradBg,
                                    borderRadius: 3,
                                },
                            }}
                        />
                        <Typography variant="caption" fontWeight={900}
                            sx={{ color: progreso === 100 ? successColor : gold, fontSize: 12, minWidth: 36 }}>
                            {progreso}%
                        </Typography>
                    </Box>
                )}
            </Box>

            {!hijoSeleccionado && !isLoadingHijos && (
                <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
                    <SchoolRoundedIcon sx={{ fontSize: 48, color: alpha(gold, 0.3), mb: 1.5 }} />
                    <Typography variant="body1" fontWeight={700} color="text.secondary">
                        Ninguno de tus hijos tiene transporte asignado
                    </Typography>
                </Box>
            )}

            {hijoSeleccionado && !isLoading && totalVencidas === 0 && (
                <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 52, color: successColor, mb: 1.5, opacity: 0.7 }} />
                    <Typography variant="body1" fontWeight={800} color="text.secondary" sx={{ mb: 0.5 }}>
                        ¡Estás al día!
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                        No tenés cuotas de transporte vencidas pendientes de pago
                    </Typography>
                </Box>
            )}

            {hijoSeleccionado && !isLoading && totalVencidas > 0 && (
                <>
                    {/* Desktop / tablet: tabla */}
                    {!isMobile && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{
                                        '& th': {
                                            fontWeight: 800, fontSize: 11, color: 'text.disabled',
                                            textTransform: 'uppercase', letterSpacing: 0.5,
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
                                            errorColor={errorColor}
                                            successColor={successColor}
                                            onPagar={() => onPagarUna(c.pago_id)}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Mobile: cards apiladas */}
                    {isMobile && (
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {cuotasVencidas.map((c, i) => (
                                <CardCuota
                                    key={c.pago_id}
                                    cuota={c}
                                    index={i}
                                    isDark={isDark}
                                    gold={gold}
                                    gradBg={gradBg}
                                    errorColor={errorColor}
                                    successColor={successColor}
                                    onPagar={() => onPagarUna(c.pago_id)}
                                />
                            ))}
                        </Box>
                    )}

                    {/* Footer: total vencido + botón pagar todas */}
                    <Box sx={{
                        px: { xs: 2, sm: 3 }, py: 2,
                        borderTop: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2,
                    }}>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                            <Box>
                                <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 10 }}>
                                    VENCIDAS
                                </Typography>
                                <Typography variant="h6" fontWeight={900} sx={{ color: errorColor, lineHeight: 1 }}>
                                    {totalVencidas}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 10 }}>
                                    TOTAL VENCIDO
                                </Typography>
                                <Typography variant="h6" fontWeight={900} sx={{ color: errorColor, lineHeight: 1 }}>
                                    Bs {totalVencidoMonto.toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>

                        <Box
                            onClick={!generandoQR ? onPagarTodas : undefined}
                            sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8,
                                px: 2.5, py: 1, borderRadius: '12px', width: { xs: '100%', sm: 'auto' },
                                background: `linear-gradient(135deg, ${errorColor}, ${alpha(errorColor, 0.75)})`,
                                color: '#fff', fontWeight: 800, fontSize: 13,
                                cursor: generandoQR ? 'not-allowed' : 'pointer',
                                opacity: generandoQR ? 0.7 : 1,
                                animation: !generandoQR ? `${pulse(errorColor)} 2.5s ease-in-out infinite` : 'none',
                                transition: 'opacity 0.15s, transform 0.15s',
                                '&:hover': { opacity: generandoQR ? 0.7 : 0.88, transform: generandoQR ? 'none' : 'translateY(-1px)' },
                            }}
                        >
                            <QrCode2RoundedIcon sx={{ fontSize: 15 }} />
                            {generandoQR ? 'Generando QR...' : `Pagar ${totalVencidas} vencida${totalVencidas !== 1 ? 's' : ''} — Bs ${totalVencidoMonto.toFixed(2)}`}
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default TablaCuotasVencidas;