'use client';
// app/dashboard/padre/productos/pagar/[pedidoId]/page.tsx
// Pantalla de pago QR para pedidos creados desde el catálogo libre.
// Mismos tokens de color y lenguaje visual que ProductoCard / CarritoDrawer /
// ModalAsignarEstudiante: negro neutro sin tinte azul, gradiente dorado/azul,
// cards planas con borde sutil (nada de glass/shimmer).

import React, { useEffect } from 'react';
import {
    Box, Container, Typography, Fade, useTheme, alpha,
    CircularProgress, Chip, Tooltip, Stack,
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
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded';

import { useRouter, useParams } from 'next/navigation';
import { useQRPagoProducto } from '@/hooks/usePadreProductos';
import { formatFechaPedido } from '@/types/productos';

// ─── Animaciones ────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const scanLine = keyframes`
  0%   { top: 8%; }
  50%  { top: 88%; }
  100% { top: 8%; }
`;
const pulseRing = keyframes`
  0%   { transform: scale(1);   opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 0; }
`;
const successPop = keyframes`
  0%   { transform: scale(0.5); opacity: 0; }
  70%  { transform: scale(1.08); }
  100% { transform: scale(1);   opacity: 1; }
`;

const usePalette = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    // Mismos tokens que ProductoCard / CarritoDrawer / ModalAsignarEstudiante
    const gold = isDark ? '#facc15' : '#0288d1';
    const goldDeep = isDark ? '#f59e0b' : '#01579b';
    const gradient = `linear-gradient(135deg, ${gold} 0%, ${goldDeep} 100%)`;
    const cardBg = isDark ? '#131313' : '#ffffff';
    const itemBg = isDark ? '#1a1a1a' : '#f6f7f9';
    const borderCol = isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08);
    return { isDark, gold, goldDeep, gradient, cardBg, itemBg, borderCol };
};

interface PasoProps {
    num: number;
    icon: React.ReactNode;
    titulo: string;
    detalle: string;
    gradient: string;
    isDark: boolean;
    itemBg: string;
    delay?: number;
}

const Paso: React.FC<PasoProps> = ({ num, icon, titulo, detalle, gradient, isDark, itemBg, delay = 0 }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, animation: `${fadeUp} 0.4s ease-out ${delay}s both` }}>
        <Box sx={{
            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
            background: gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 900, color: isDark ? '#000' : '#fff',
        }}>
            {num}
        </Box>
        <Box sx={{
            width: 32, height: 32, borderRadius: '9px', flexShrink: 0,
            bgcolor: itemBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13, lineHeight: 1.3 }}>
                {titulo}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12, lineHeight: 1.3 }}>
                {detalle}
            </Typography>
        </Box>
    </Box>
);

export default function PagarPedidoLibrePage() {
    const { isDark, gold, gradient, cardBg, itemBg, borderCol } = usePalette();
    const router = useRouter();
    const params = useParams();
    const pedidoId = Number(params.pedidoId);

    const { qrData, pagado, isGenerando, isVerificando, generarQR, verificarEstado } = useQRPagoProducto(pedidoId || null);

    const handleDescargarQR = () => {
        if (!qrData?.imagenQr) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${qrData.imagenQr}`;
        link.download = `qr-pago-pedido-${pedidoId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (pagado) {
            const timer = setTimeout(() => {
                router.push('/dashboard/padre/productos');
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [pagado, router]);

    // ── Estado: PAGADO ──
    if (pagado) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Container maxWidth="sm">
                    <Fade in timeout={500}>
                        <Box sx={{
                            textAlign: 'center', animation: `${fadeUp} 0.5s ease-out`,
                            p: 4, borderRadius: '24px',
                            bgcolor: cardBg,
                            border: `1px solid ${borderCol}`,
                        }}>
                            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                                {[1, 2].map((i) => (
                                    <Box key={i} sx={{
                                        position: 'absolute', inset: -i * 14, borderRadius: '50%',
                                        border: `2px solid ${alpha('#10b981', 0.3 / i)}`,
                                        animation: `${pulseRing} ${1 + i * 0.3}s ease-out infinite`,
                                        animationDelay: `${i * 0.2}s`,
                                    }} />
                                ))}
                                <Box sx={{
                                    width: 92, height: 92, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 10px 32px rgba(16,185,129,0.4)',
                                    animation: `${successPop} 0.5s cubic-bezier(0.175,0.885,0.32,1.275)`,
                                }}>
                                    <CheckCircleRoundedIcon sx={{ fontSize: 48, color: '#fff' }} />
                                </Box>
                            </Box>

                            <Typography variant="h5" fontWeight={900} sx={{ color: '#10b981', mb: 1 }}>
                                ¡Pago confirmado!
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Tu pedido fue pagado exitosamente.
                            </Typography>
                            {qrData && (
                                <Typography variant="h5" fontWeight={900} sx={{ color: '#10b981', mb: 3 }}>
                                    Bs {parseFloat(String(qrData.monto)).toFixed(2)}
                                </Typography>
                            )}

                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 3 }}>
                                Redirigiendo en unos segundos…
                            </Typography>

                            <Box
                                onClick={() => router.push('/dashboard/padre/productos')}
                                sx={{
                                    display: 'inline-flex', alignItems: 'center', gap: 1,
                                    px: 3, py: 1.2, borderRadius: '13px',
                                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                                    color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                                    boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
                                    transition: 'opacity 0.15s',
                                    '&:hover': { opacity: 0.9 },
                                }}
                            >
                                Volver a la tienda
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh' }}>
            <Container maxWidth="lg">
                <Box sx={{ pt: 3, pb: 6 }}>

                    {/* ── Volver ────────────────────────────────── */}
                    <Fade in timeout={300}>
                        <Box
                            onClick={() => router.push('/dashboard/padre/productos')}
                            sx={{
                                display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2,
                                cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
                                transition: 'color 0.15s',
                                '&:hover': { color: gold },
                            }}
                        >
                            <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
                            Volver a la tienda
                        </Box>
                    </Fade>

                    {/* ── Header del pedido (ancho completo) ──────── */}
                    <Fade in timeout={400}>
                        <Box sx={{
                            p: 2.5, borderRadius: '20px', mb: 2.5,
                            bgcolor: cardBg,
                            border: `1px solid ${borderCol}`,
                            borderLeft: `4px solid ${gold}`,
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                    width: 48, height: 48, borderRadius: '13px', background: gradient,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: `0 4px 14px ${alpha(gold, 0.35)}`,
                                }}>
                                    <QrCode2RoundedIcon sx={{ fontSize: 24, color: isDark ? '#000' : '#fff' }} />
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography
                                        sx={{
                                            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
                                            textTransform: 'uppercase', color: alpha(gold, 0.8), mb: 0.2,
                                        }}
                                    >
                                        Pago con QR
                                    </Typography>
                                    <Typography variant="body2" fontWeight={700} noWrap>
                                        {qrData?.estudiante || 'Compra general'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Escaneá el código QR para realizar el pago
                                    </Typography>
                                </Box>

                                {qrData && (
                                    <>
                                        <Box sx={{ width: '1px', alignSelf: 'stretch', bgcolor: borderCol, mx: 0.5, flexShrink: 0 }} />
                                        <Box sx={{ textAlign: 'right', flexShrink: 0, pl: 1 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.2 }}>
                                                Monto a pagar
                                            </Typography>
                                            <Typography variant="h5" fontWeight={900} sx={{ color: gold, lineHeight: 1 }}>
                                                Bs {parseFloat(String(qrData.monto)).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Fade>

                    {/* ── Grid: QR (izquierda) + instrucciones (derecha, sticky en desktop) ── */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' },
                            gap: 2.5,
                            alignItems: 'start',
                        }}
                    >
                        {/* ── Tarjeta del QR ───────────────────────── */}
                        <Fade in timeout={500}>
                            <Box sx={{
                                borderRadius: '20px', overflow: 'hidden',
                                bgcolor: cardBg,
                                border: `1px solid ${borderCol}`,
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, minHeight: 340 }}>

                                    {isGenerando && (
                                        <Box sx={{ textAlign: 'center', animation: `${fadeUp} 0.3s ease-out` }}>
                                            <CircularProgress size={44} sx={{ color: gold, mb: 2 }} />
                                            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                                Generando tu QR…
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled">
                                                Conectando con el banco
                                            </Typography>
                                        </Box>
                                    )}

                                    {!isGenerando && qrData && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: `${fadeUp} 0.4s ease-out` }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                                                <KeyboardDoubleArrowRightRoundedIcon sx={{ fontSize: 16, color: alpha(gold, 0.6), transform: 'rotate(180deg)' }} />
                                                <Typography variant="body2" fontWeight={800} sx={{ letterSpacing: 0.3 }}>
                                                    Escaneá con tu app bancaria
                                                </Typography>
                                                <KeyboardDoubleArrowRightRoundedIcon sx={{ fontSize: 16, color: alpha(gold, 0.6) }} />
                                            </Box>
                                            <Box sx={{ position: 'relative' }}>
                                                <Box sx={{
                                                    position: 'relative', p: 2, borderRadius: '18px', background: '#fff',
                                                    boxShadow: `0 0 0 1.5px ${alpha(gold, 0.35)}`,
                                                }}>
                                                    {[
                                                        { top: -2, left: -2, borderTop: `3px solid ${gold}`, borderLeft: `3px solid ${gold}` },
                                                        { top: -2, right: -2, borderTop: `3px solid ${gold}`, borderRight: `3px solid ${gold}` },
                                                        { bottom: -2, left: -2, borderBottom: `3px solid ${gold}`, borderLeft: `3px solid ${gold}` },
                                                        { bottom: -2, right: -2, borderBottom: `3px solid ${gold}`, borderRight: `3px solid ${gold}` },
                                                    ].map((corner, i) => (
                                                        <Box key={i} sx={{ position: 'absolute', width: 18, height: 18, borderRadius: 0.5, ...corner }} />
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
                                                        borderRadius: 2,
                                                    }} />
                                                </Box>
                                            </Box>

                                            {qrData.bancoDestino && (
                                                <Box sx={{ mt: 2 }}>
                                                    <Chip
                                                        icon={<AccountBalanceRoundedIcon sx={{ fontSize: '14px !important' }} />}
                                                        label={qrData.bancoDestino}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 700, fontSize: 11,
                                                            bgcolor: alpha(gold, 0.1),
                                                            color: gold,
                                                            border: `1px solid ${alpha(gold, 0.25)}`,
                                                        }}
                                                    />
                                                </Box>
                                            )}

                                            <Box
                                                onClick={handleDescargarQR}
                                                sx={{
                                                    mt: 2, display: 'inline-flex', alignItems: 'center', gap: 0.7,
                                                    px: 2, py: 0.8, borderRadius: '10px', cursor: 'pointer',
                                                    border: `1.5px solid ${borderCol}`,
                                                    color: 'text.secondary', fontWeight: 700, fontSize: 12,
                                                    transition: 'all 0.15s',
                                                    '&:hover': { borderColor: alpha(gold, 0.4), color: gold, bgcolor: alpha(gold, 0.06) },
                                                }}
                                            >
                                                <DownloadRoundedIcon sx={{ fontSize: 16 }} />
                                                Descargar QR
                                            </Box>
                                        </Box>
                                    )}

                                    {!isGenerando && !qrData && (
                                        <Box sx={{ textAlign: 'center', animation: `${fadeUp} 0.3s ease-out` }}>
                                            <QrCode2RoundedIcon sx={{ fontSize: 44, color: alpha(gold, 0.35), mb: 1.5 }} />
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
                                                    px: 2.5, py: 1, borderRadius: '11px',
                                                    background: gradient, color: isDark ? '#000' : '#fff',
                                                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                                                    transition: 'opacity 0.15s',
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
                                        px: 2.5, py: 1.5,
                                        borderTop: `1px solid ${borderCol}`,
                                        bgcolor: itemBg,
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
                                                    px: 1.5, py: 0.6, borderRadius: '9px',
                                                    border: `1.5px solid ${alpha(gold, 0.4)}`,
                                                    color: gold,
                                                    bgcolor: alpha(gold, 0.06),
                                                    fontWeight: 700, fontSize: 11, cursor: 'pointer',
                                                    transition: 'all 0.15s',
                                                    '&:hover': { bgcolor: alpha(gold, 0.15) },
                                                }}
                                            >
                                                {isVerificando ? (
                                                    <CircularProgress size={12} sx={{ color: gold }} />
                                                ) : (
                                                    <VerifiedRoundedIcon sx={{ fontSize: 14 }} />
                                                )}
                                                Verificar pago
                                            </Box>
                                        </Tooltip>
                                    </Box>
                                )}
                            </Box>
                        </Fade>

                        {/* ── Instrucciones (columna derecha, sticky en desktop) ── */}
                        {qrData && !isGenerando && (
                            <Fade in timeout={600}>
                                <Box sx={{
                                    p: 2.5, borderRadius: '18px',
                                    bgcolor: cardBg,
                                    border: `1px solid ${borderCol}`,
                                    animation: `${fadeUp} 0.5s ease-out 0.15s both`,
                                    position: { md: 'sticky' },
                                    top: { md: 24 },
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                                        <Box sx={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            bgcolor: alpha(gold, 0.12),
                                            border: `1.5px solid ${alpha(gold, 0.3)}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <PhoneAndroidRoundedIcon sx={{ fontSize: 14, color: gold }} />
                                        </Box>
                                        <Typography variant="body2" fontWeight={800}
                                            sx={{ color: 'text.primary', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            ¿Cómo pagar?
                                        </Typography>
                                    </Box>

                                    <Stack spacing={1.75}>
                                        <Paso
                                            num={1} icon={<PhoneAndroidRoundedIcon sx={{ fontSize: 16, color: gold }} />}
                                            titulo="Abrí la app de tu banco" detalle="en tu celular"
                                            gradient={gradient} isDark={isDark} itemBg={itemBg} delay={0.2}
                                        />
                                        <Paso
                                            num={2} icon={<QrCodeScannerRoundedIcon sx={{ fontSize: 16, color: gold }} />}
                                            titulo="Buscá la opción" detalle='"Pagar con QR" o "Escanear QR"'
                                            gradient={gradient} isDark={isDark} itemBg={itemBg} delay={0.28}
                                        />
                                        <Paso
                                            num={3} icon={<PhotoCameraRoundedIcon sx={{ fontSize: 16, color: gold }} />}
                                            titulo="Apuntá la cámara al código QR" detalle="de la pantalla"
                                            gradient={gradient} isDark={isDark} itemBg={itemBg} delay={0.36}
                                        />
                                        <Paso
                                            num={4} icon={<CheckRoundedIcon sx={{ fontSize: 18, color: gold }} />}
                                            titulo="Confirmá el monto" detalle="y finalizá el pago en tu app"
                                            gradient={gradient} isDark={isDark} itemBg={itemBg} delay={0.44}
                                        />
                                        <Paso
                                            num={5} icon={<SyncRoundedIcon sx={{ fontSize: 16, color: gold }} />}
                                            titulo="Esta pantalla se actualizará" detalle="automáticamente al confirmar"
                                            gradient={gradient} isDark={isDark} itemBg={itemBg} delay={0.52}
                                        />
                                    </Stack>

                                    <Box sx={{
                                        mt: 2.5, p: 1.75, borderRadius: '13px',
                                        bgcolor: alpha(gold, 0.06),
                                        border: `1px solid ${alpha(gold, 0.18)}`,
                                        display: 'flex', alignItems: 'flex-start', gap: 1.25,
                                    }}>
                                        <Box sx={{
                                            width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                                            bgcolor: alpha(gold, 0.15),
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <InfoOutlinedIcon sx={{ fontSize: 14, color: gold }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 12.5, mb: 0.2 }}>
                                                El QR es de un solo uso.
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11.5, lineHeight: 1.5 }}>
                                                Una vez pagado no podrá ser utilizado nuevamente. Si cerrás esta pantalla
                                                podés volver a entrar y el QR seguirá activo hasta su vencimiento.
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Fade>
                        )}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}