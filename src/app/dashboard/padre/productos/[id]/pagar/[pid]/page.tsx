'use client';
// app/dashboard/padre/productos/[id]/pagar/[pid]/page.tsx
// [id] = estudianteId, [pid] = pedidoProductoId

import React, { useEffect } from 'react';
import {
    Box, Container, Typography, Fade, useTheme, alpha,
    CircularProgress, Chip, IconButton, Tooltip, Stack,
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import PhoneAndroidRoundedIcon from '@mui/icons-material/PhoneAndroidRounded';

import { useRouter, useParams } from 'next/navigation';
import { useQRPagoProducto } from '@/hooks/usePadreProductos';
import { formatFechaPedido } from '@/types/productos';

// ─── Animaciones (idénticas a la página de mensualidad) ────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const shimmer = keyframes`
  0%   { background-position: -1000px 0; }
  100% { background-position:  1000px 0; }
`;
const scanLine = keyframes`
  0%   { top: 8%; }
  50%  { top: 88%; }
  100% { top: 8%; }
`;
const pulseRing = keyframes`
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(1.6); opacity: 0; }
`;
const successPop = keyframes`
  0%   { transform: scale(0.5); opacity: 0; }
  70%  { transform: scale(1.1); }
  100% { transform: scale(1);   opacity: 1; }
`;
const bounceSlow = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
`;

const usePalette = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const gold = isDark ? '#facc15' : '#f59e0b';
    const goldEnd = isDark ? '#f59e0b' : '#d97706';
    const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
    return { isDark, gold, goldEnd, gradBg };
};

interface PasoProps {
    num: number;
    texto: string;
    accent: string;
    isDark: boolean;
    delay?: number;
}

const Paso: React.FC<PasoProps> = ({
    num, texto, accent, isDark, delay = 0,
}) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, animation: `${fadeUp} 0.4s ease-out ${delay}s both` }}>
        <Box sx={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${accent}, ${alpha(accent, 0.7)})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 3px 10px ${alpha(accent, 0.4)}`,
            fontSize: 12, fontWeight: 900, color: isDark ? '#000' : '#fff',
        }}>
            {num}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, fontWeight: 500 }}>
            {texto}
        </Typography>
    </Box>
);

export default function PagarPedidoProductoPage() {
    const { isDark, gold, gradBg } = usePalette();
    const router = useRouter();
    const params = useParams();

    const estudianteId = Number(params.id);
    const pedidoId = Number(params.pid);

    const { qrData, pagado, isGenerando, isVerificando, generarQR, verificarEstado } = useQRPagoProducto(pedidoId || null);

    useEffect(() => {
        if (pagado) {
            const timer = setTimeout(() => {
                router.push(`/dashboard/padre/productos/${estudianteId}`);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [pagado, estudianteId, router]);

    // ── Estado: PAGADO ──
    if (pagado) {
        return (
            <Box sx={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDark
                    ? 'radial-gradient(circle at center, rgba(16,185,129,0.08), transparent 60%)'
                    : 'radial-gradient(circle at center, rgba(16,185,129,0.05), transparent 60%)',
            }}>
                <Container maxWidth="sm">
                    <Fade in timeout={500}>
                        <Box sx={{ textAlign: 'center', animation: `${fadeUp} 0.5s ease-out` }}>
                            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                                {[1, 2, 3].map((i) => (
                                    <Box key={i} sx={{
                                        position: 'absolute', inset: -i * 16, borderRadius: '50%',
                                        border: `2px solid ${alpha('#10b981', 0.3 / i)}`,
                                        animation: `${pulseRing} ${1 + i * 0.3}s ease-out infinite`,
                                        animationDelay: `${i * 0.2}s`,
                                    }} />
                                ))}
                                <Box sx={{
                                    width: 100, height: 100, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 12px 40px rgba(16,185,129,0.5)',
                                    animation: `${successPop} 0.5s cubic-bezier(0.175,0.885,0.32,1.275)`,
                                }}>
                                    <CheckCircleRoundedIcon sx={{ fontSize: 52, color: '#fff' }} />
                                </Box>
                            </Box>

                            <Typography variant="h4" fontWeight={900} sx={{ color: '#10b981', mb: 1 }}>
                                ¡Pago Confirmado!
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                Tu pedido para <strong>{qrData?.estudiante}</strong> fue pagado exitosamente.
                            </Typography>
                            {qrData && (
                                <Typography variant="h5" fontWeight={900} sx={{ color: '#10b981', mb: 3 }}>
                                    Bs {parseFloat(String(qrData.monto)).toFixed(2)}
                                </Typography>
                            )}

                            <Typography variant="caption" color="text.disabled">
                                Redirigiendo en unos segundos...
                            </Typography>

                            <Box sx={{ mt: 3 }}>
                                <Box
                                    onClick={() => router.push(`/dashboard/padre/productos/${estudianteId}`)}
                                    sx={{
                                        display: 'inline-flex', alignItems: 'center', gap: 1,
                                        px: 3, py: 1.2, borderRadius: '14px',
                                        background: 'linear-gradient(135deg, #10b981, #34d399)',
                                        color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                                        boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
                                        '&:hover': { opacity: 0.9 },
                                    }}
                                >
                                    Ver mis pedidos
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: isDark
                ? 'radial-gradient(circle at top, rgba(250,204,21,0.05), transparent 50%)'
                : 'radial-gradient(circle at top, rgba(245,158,11,0.04), transparent 50%)',
        }}>
            <Container maxWidth="sm" disableGutters>
                <Box sx={{ pt: 3, pb: 6 }}>

                    <Fade in timeout={300}>
                        <Box
                            onClick={() => router.push(`/dashboard/padre/productos/${estudianteId}`)}
                            sx={{
                                display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2,
                                cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
                                transition: 'color 0.15s',
                                '&:hover': { color: isDark ? gold : '#d97706' },
                            }}
                        >
                            <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
                            Volver a mis pedidos
                        </Box>
                    </Fade>

                    <Fade in timeout={400}>
                        <Box sx={{
                            p: 3, borderRadius: '24px', mb: 3,
                            background: isDark
                                ? 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))'
                                : '#fff',
                            border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
                            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.06)',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <Box sx={{
                                position: 'absolute', inset: 0,
                                background: `linear-gradient(90deg, transparent, ${alpha('#fff', isDark ? 0.03 : 0.08)}, transparent)`,
                                backgroundSize: '1000px 100%',
                                animation: `${shimmer} 4s linear infinite`,
                                pointerEvents: 'none',
                            }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
                                <Box sx={{
                                    width: 52, height: 52, borderRadius: '16px', background: gradBg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 6px 20px ${alpha(gold, 0.4)}`,
                                    animation: `${bounceSlow} 2.5s ease-in-out infinite`,
                                }}>
                                    <QrCode2RoundedIcon sx={{ fontSize: 28, color: isDark ? '#000' : '#fff' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight={900} sx={{
                                        background: gradBg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2,
                                    }}>
                                        Pago con QR
                                    </Typography>
                                    {qrData && (
                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                            {qrData.estudiante}
                                        </Typography>
                                    )}
                                </Box>

                                {qrData && (
                                    <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                                        <Typography variant="h5" fontWeight={900} sx={{ color: isDark ? gold : '#d97706', lineHeight: 1 }}>
                                            Bs {parseFloat(String(qrData.monto)).toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                                            a pagar
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Fade>

                    <Fade in timeout={500}>
                        <Box sx={{
                            borderRadius: '24px', mb: 3,
                            background: isDark
                                ? 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))'
                                : '#fff',
                            border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
                            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.06)',
                            overflow: 'hidden',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, minHeight: 320, position: 'relative' }}>

                                {isGenerando && (
                                    <Box sx={{ textAlign: 'center', animation: `${fadeUp} 0.3s ease-out` }}>
                                        <CircularProgress size={48} sx={{ color: isDark ? gold : '#d97706', mb: 2 }} />
                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                            Generando tu QR...
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled">
                                            Conectando con el banco
                                        </Typography>
                                    </Box>
                                )}

                                {!isGenerando && qrData && (
                                    <Box sx={{ position: 'relative', animation: `${fadeUp} 0.4s ease-out` }}>
                                        <Box sx={{
                                            position: 'relative', p: 2, borderRadius: '20px', background: '#fff',
                                            boxShadow: `0 8px 32px ${alpha(gold, 0.2)}, 0 0 0 3px ${alpha(gold, 0.2)}`,
                                        }}>
                                            {[
                                                { top: -2, left: -2, borderTop: `3px solid ${gold}`, borderLeft: `3px solid ${gold}` },
                                                { top: -2, right: -2, borderTop: `3px solid ${gold}`, borderRight: `3px solid ${gold}` },
                                                { bottom: -2, left: -2, borderBottom: `3px solid ${gold}`, borderLeft: `3px solid ${gold}` },
                                                { bottom: -2, right: -2, borderBottom: `3px solid ${gold}`, borderRight: `3px solid ${gold}` },
                                            ].map((corner, i) => (
                                                <Box key={i} sx={{ position: 'absolute', width: 20, height: 20, borderRadius: 0.5, ...corner }} />
                                            ))}

                                            <Box
                                                component="img"
                                                src={`data:image/png;base64,${qrData.imagenQr}`}
                                                alt="Código QR de pago"
                                                sx={{ width: 220, height: 220, display: 'block', imageRendering: 'pixelated' }}
                                            />

                                            <Box sx={{
                                                position: 'absolute', left: 8, right: 8, height: 2,
                                                background: `linear-gradient(90deg, transparent, ${alpha(gold, 0.8)}, transparent)`,
                                                animation: `${scanLine} 2.5s ease-in-out infinite`,
                                                borderRadius: 2, boxShadow: `0 0 8px ${alpha(gold, 0.6)}`,
                                            }} />
                                        </Box>

                                        {qrData.bancoDestino && (
                                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                                <Chip
                                                    icon={<AccountBalanceRoundedIcon sx={{ fontSize: '14px !important' }} />}
                                                    label={qrData.bancoDestino}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700, fontSize: 11,
                                                        bgcolor: isDark ? alpha(gold, 0.1) : alpha(gold, 0.08),
                                                        color: isDark ? gold : '#d97706',
                                                        border: `1px solid ${alpha(gold, 0.3)}`,
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                )}

                                {!isGenerando && !qrData && (
                                    <Box sx={{ textAlign: 'center', animation: `${fadeUp} 0.3s ease-out` }}>
                                        <QrCode2RoundedIcon sx={{ fontSize: 48, color: alpha(gold, 0.3), mb: 1.5 }} />
                                        <Typography variant="body1" fontWeight={700} color="text.secondary" sx={{ mb: 0.5 }}>
                                            No se pudo generar el QR
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled" sx={{ mb: 2, display: 'block' }}>
                                            Verificá tu conexión e intentá de nuevo
                                        </Typography>
                                        <Box
                                            onClick={generarQR}
                                            sx={{
                                                display: 'inline-flex', alignItems: 'center', gap: 0.8,
                                                px: 2.5, py: 1, borderRadius: '12px',
                                                background: gradBg, color: isDark ? '#000' : '#fff',
                                                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                                                '&:hover': { opacity: 0.88 },
                                            }}
                                        >
                                            <RefreshRoundedIcon sx={{ fontSize: 16 }} />
                                            Reintentar
                                        </Box>
                                    </Box>
                                )}
                            </Box>

                            {qrData && !isGenerando && (
                                <Box sx={{
                                    px: 3, py: 2,
                                    borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
                                    bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8f9fa', 0.5),
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5,
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                        <AccessTimeRoundedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: 11 }}>
                                            Vence: {formatFechaPedido(qrData.qr_expiracion)}
                                        </Typography>
                                    </Box>

                                    <Tooltip title="Verificar si ya se pagó">
                                        <Box
                                            onClick={verificarEstado}
                                            sx={{
                                                display: 'flex', alignItems: 'center', gap: 0.6,
                                                px: 1.5, py: 0.6, borderRadius: '10px',
                                                border: `1.5px solid ${alpha(gold, 0.4)}`,
                                                color: isDark ? gold : '#d97706',
                                                bgcolor: isDark ? alpha(gold, 0.06) : alpha(gold, 0.04),
                                                fontWeight: 700, fontSize: 11, cursor: 'pointer',
                                                transition: 'all 0.15s',
                                                '&:hover': { bgcolor: isDark ? alpha(gold, 0.15) : alpha(gold, 0.1) },
                                            }}
                                        >
                                            {isVerificando ? (
                                                <CircularProgress size={12} sx={{ color: isDark ? gold : '#d97706' }} />
                                            ) : (
                                                <RefreshRoundedIcon sx={{ fontSize: 13 }} />
                                            )}
                                            Verificar
                                        </Box>
                                    </Tooltip>
                                </Box>
                            )}
                        </Box>
                    </Fade>

                    {qrData && !isGenerando && (
                        <Fade in timeout={600}>
                            <Box sx={{
                                p: 3, borderRadius: '20px',
                                background: isDark
                                    ? 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))'
                                    : alpha(gold, 0.04),
                                border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha(gold, 0.2)}`,
                                animation: `${fadeUp} 0.5s ease-out 0.2s both`,
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <PhoneAndroidRoundedIcon sx={{ fontSize: 16, color: isDark ? gold : '#d97706' }} />
                                    <Typography variant="caption" fontWeight={800}
                                        sx={{ color: isDark ? gold : '#d97706', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        ¿Cómo pagar?
                                    </Typography>
                                </Box>

                                <Stack spacing={1.5}>
                                    <Paso num={1} texto="Abrí la app de tu banco en tu celular" accent={isDark ? gold : '#d97706'} isDark={isDark} delay={0.3} />
                                    <Paso num={2} texto='Buscá la opción "Pagar con QR" o "Escanear QR"' accent={isDark ? gold : '#d97706'} isDark={isDark} delay={0.4} />
                                    <Paso num={3} texto="Apuntá la cámara al código QR de la pantalla" accent={isDark ? gold : '#d97706'} isDark={isDark} delay={0.5} />
                                    <Paso num={4} texto="Confirmá el monto y finalizá el pago en tu app" accent={isDark ? gold : '#d97706'} isDark={isDark} delay={0.6} />
                                    <Paso num={5} texto="Esta pantalla se actualizará automáticamente al confirmar" accent={isDark ? gold : '#d97706'} isDark={isDark} delay={0.7} />
                                </Stack>

                                <Box sx={{
                                    mt: 2, pt: 2,
                                    borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha(gold, 0.15)}`,
                                    display: 'flex', alignItems: 'flex-start', gap: 1,
                                }}>
                                    <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled', mt: 0.2, flexShrink: 0 }} />
                                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11, lineHeight: 1.5 }}>
                                        El QR es de un solo uso. Una vez pagado no podrá ser utilizado nuevamente.
                                        Si cerrás esta pantalla podés volver a entrar y el QR seguirá activo hasta su vencimiento.
                                    </Typography>
                                </Box>
                            </Box>
                        </Fade>
                    )}

                </Box>
            </Container>
        </Box>
    );
}