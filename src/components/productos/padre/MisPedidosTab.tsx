'use client';
// components/productos/padre/MisPedidosTab.tsx
// Pestaña de historial y gestión de pedidos de productos para el padre.
// Muestra pedidos pendientes con botón directo a pago QR y el historial completo.

import React, { useState, useMemo } from 'react';
import {
    Box, Typography, Card, CardContent, Button, Chip, Stack,
    Fade, useTheme, alpha, CircularProgress, IconButton, Tooltip,
    Avatar, Divider, Collapse,
} from '@mui/material';
import { keyframes } from '@mui/system';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import { useRouter } from 'next/navigation';

import type { PedidoProducto, EstadoPedidoProducto, PedidoProductoDetalle } from '@/types/productos';
import { formatFechaPedido } from '@/types/productos';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.92); }
`;

type FiltroEstado = 'todos' | 'pendiente_pago' | 'pagado' | 'entregado' | 'expirado';

interface MisPedidosTabProps {
    pedidos: PedidoProducto[];
    loading: boolean;
    onRecargar: () => void;
    onIrATienda?: () => void;
}

export const MisPedidosTab: React.FC<MisPedidosTabProps> = ({
    pedidos,
    loading,
    onRecargar,
    onIrATienda,
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const gold = isDark ? '#facc15' : '#0288d1';
    const goldDeep = isDark ? '#f59e0b' : '#01579b';
    const goldSoft = alpha(gold, isDark ? 0.15 : 0.1);
    const gradient = `linear-gradient(135deg, ${gold} 0%, ${goldDeep} 100%)`;
    const cardBg = isDark ? '#131313' : '#ffffff';

    const router = useRouter();
    const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
    const [expandidos, setExpandidos] = useState<Record<number, boolean>>({});

    const toggleExpandir = (id: number) => {
        setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Contadores por estado
    const contadores = useMemo(() => {
        const c = { todos: pedidos.length, pendiente_pago: 0, pagado: 0, entregado: 0, expirado: 0 };
        pedidos.forEach(p => {
            if (p.estado in c) {
                c[p.estado as keyof typeof c]++;
            }
        });
        return c;
    }, [pedidos]);

    // Filtrar pedidos
    const pedidosFiltrados = useMemo(() => {
        if (filtroEstado === 'todos') return pedidos;
        return pedidos.filter(p => p.estado === filtroEstado);
    }, [pedidos, filtroEstado]);

    const getEstadoInfo = (estado: EstadoPedidoProducto) => {
        switch (estado) {
            case 'pendiente_pago':
                return {
                    label: 'Pendiente de pago',
                    color: isDark ? '#f87171' : '#dc2626',
                    bgColor: isDark ? alpha('#f87171', 0.15) : alpha('#dc2626', 0.08),
                    borderColor: isDark ? alpha('#f87171', 0.4) : alpha('#dc2626', 0.3),
                    icon: <HourglassTopRoundedIcon sx={{ fontSize: 16 }} />,
                };
            case 'pagado':
                return {
                    label: 'Pagado',
                    color: isDark ? '#34d399' : '#059669',
                    bgColor: isDark ? alpha('#34d399', 0.15) : alpha('#059669', 0.08),
                    borderColor: isDark ? alpha('#34d399', 0.4) : alpha('#059669', 0.3),
                    icon: <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />,
                };
            case 'entregado':
                return {
                    label: 'Entregado',
                    color: isDark ? '#60a5fa' : '#2563eb',
                    bgColor: isDark ? alpha('#60a5fa', 0.15) : alpha('#2563eb', 0.08),
                    borderColor: isDark ? alpha('#60a5fa', 0.4) : alpha('#2563eb', 0.3),
                    icon: <LocalShippingRoundedIcon sx={{ fontSize: 16 }} />,
                };
            case 'expirado':
                return {
                    label: 'Expirado',
                    color: theme.palette.text.disabled,
                    bgColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                    borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                    icon: <CancelRoundedIcon sx={{ fontSize: 16 }} />,
                };
            case 'cancelado':
                return {
                    label: 'Cancelado',
                    color: theme.palette.text.disabled,
                    bgColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                    borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                    icon: <CancelRoundedIcon sx={{ fontSize: 16 }} />,
                };
            default:
                return {
                    label: estado,
                    color: theme.palette.text.secondary,
                    bgColor: 'transparent',
                    borderColor: alpha('#000', 0.1),
                    icon: null,
                };
        }
    };

    const FILTROS_BOTONES: { id: FiltroEstado; label: string; count: number }[] = [
        { id: 'todos', label: 'Todos', count: contadores.todos },
        { id: 'pendiente_pago', label: 'Pendientes', count: contadores.pendiente_pago },
        { id: 'pagado', label: 'Pagados', count: contadores.pagado },
        { id: 'entregado', label: 'Entregados', count: contadores.entregado },
        { id: 'expirado', label: 'Expirados', count: contadores.expirado },
    ];

    return (
        <Box sx={{ width: '100%' }}>
            {/* ── Sub-barra de filtros por estado ── */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        gap: 0.8,
                        p: 0.8,
                        borderRadius: '16px',
                        background: gradient,
                        overflowX: 'auto',
                        '&::-webkit-scrollbar': { display: 'none' },
                        maxWidth: '100%',
                    }}
                >
                    {FILTROS_BOTONES.map(f => {
                        const activo = filtroEstado === f.id;
                        return (
                            <Box
                                key={f.id}
                                onClick={() => setFiltroEstado(f.id)}
                                sx={{
                                    px: 2,
                                    py: 0.8,
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    color: '#fff',
                                    bgcolor: activo ? alpha('#000', isDark ? 0.35 : 0.25) : 'transparent',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.8,
                                    '&:hover': { bgcolor: alpha('#000', isDark ? 0.2 : 0.12) },
                                }}
                            >
                                <span>{f.label}</span>
                                {f.count > 0 && (
                                    <Box
                                        sx={{
                                            px: 0.8,
                                            py: 0.1,
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            bgcolor: activo ? alpha('#fff', 0.25) : alpha('#fff', 0.15),
                                            color: '#fff',
                                        }}
                                    >
                                        {f.count}
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Box>

                <Tooltip title="Actualizar lista de pedidos">
                    <IconButton
                        onClick={onRecargar}
                        disabled={loading}
                        sx={{
                            bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                            '&:hover': { bgcolor: goldSoft },
                        }}
                    >
                        <RefreshRoundedIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* ── Contenido de Pedidos ── */}
            {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 10 }}>
                    <CircularProgress sx={{ color: gold }} />
                    <Typography variant="body2" color="text.secondary">Cargando tus pedidos…</Typography>
                </Box>
            ) : pedidosFiltrados.length === 0 ? (
                <Fade in timeout={400}>
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 8,
                            px: 3,
                            borderRadius: '24px',
                            border: `1.5px dashed ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                            bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
                        }}
                    >
                        <Box
                            sx={{
                                width: 72,
                                height: 72,
                                borderRadius: '20px',
                                mx: 'auto',
                                mb: 2,
                                bgcolor: goldSoft,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <ReceiptLongRoundedIcon sx={{ color: gold, fontSize: 34 }} />
                        </Box>
                        <Typography fontWeight={800} variant="h6" sx={{ mb: 0.5 }}>
                            {filtroEstado === 'todos'
                                ? 'No tenés pedidos registrados'
                                : `No hay pedidos con estado "${getEstadoInfo(filtroEstado as EstadoPedidoProducto).label}"`}
                        </Typography>
                        <Typography color="text.secondary" variant="body2" sx={{ mb: 3, maxWidth: 420, mx: 'auto' }}>
                            {filtroEstado === 'todos'
                                ? 'Los pedidos que realices en la tienda escolar aparecerán aquí para que puedas pagarlos y seguir su estado.'
                                : 'Cambiá el filtro para ver tus otros pedidos o visitá la tienda.'}
                        </Typography>
                        {onIrATienda && (
                            <Button
                                variant="contained"
                                startIcon={<ShoppingBagRoundedIcon />}
                                onClick={onIrATienda}
                                sx={{
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    background: gradient,
                                    color: isDark ? '#000' : '#fff',
                                    boxShadow: `0 4px 14px ${alpha(gold, 0.35)}`,
                                    textTransform: 'none',
                                    px: 3,
                                }}
                            >
                                Ir a la tienda
                            </Button>
                        )}
                    </Box>
                </Fade>
            ) : (
                <Stack spacing={2}>
                    {pedidosFiltrados.map((pedido, idx) => {
                        const st = getEstadoInfo(pedido.estado);
                        const isPendiente = pedido.estado === 'pendiente_pago';
                        const expandido = expandidos[pedido.id] ?? isPendiente;
                        const items = (pedido.detalle as PedidoProductoDetalle[] | undefined) ?? [];
                        const cantidadItems = items.reduce((acc, it) => acc + (it.cantidad || 0), 0);

                        return (
                            <Card
                                key={pedido.id}
                                elevation={0}
                                sx={{
                                    borderRadius: '20px',
                                    bgcolor: cardBg,
                                    border: `1.5px solid ${isPendiente ? st.borderColor : (isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08))}`,
                                    boxShadow: isPendiente
                                        ? `0 6px 24px ${alpha(st.color, isDark ? 0.18 : 0.1)}`
                                        : (isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.04)'),
                                    transition: 'all 0.25s ease',
                                    animation: `${fadeUp} 0.35s ease-out ${idx * 0.04}s both`,
                                    '&:hover': {
                                        borderColor: isPendiente ? st.color : alpha(gold, 0.4),
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                                    {/* ── Fila Superior: Código + Estado + Fecha ── */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: { xs: 'flex-start', sm: 'center' },
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            gap: 1.5,
                                            mb: 2,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                            <Box
                                                sx={{
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: '10px',
                                                    bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
                                                    border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
                                                }}
                                            >
                                                <Typography variant="caption" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
                                                    {pedido.codigo_pedido}
                                                </Typography>
                                            </Box>

                                            <Chip
                                                icon={st.icon || undefined}
                                                label={st.label}
                                                size="small"
                                                sx={{
                                                    fontWeight: 800,
                                                    fontSize: '0.75rem',
                                                    color: st.color,
                                                    bgcolor: st.bgColor,
                                                    border: `1px solid ${st.borderColor}`,
                                                    '& .MuiChip-icon': { color: 'inherit' },
                                                }}
                                            />

                                            {isPendiente && (
                                                <Box
                                                    sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        bgcolor: st.color,
                                                        animation: `${pulse} 1.5s infinite`,
                                                    }}
                                                />
                                            )}
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: 'text.secondary' }}>
                                            <AccessTimeRoundedIcon sx={{ fontSize: 15 }} />
                                            <Typography variant="caption" fontWeight={600}>
                                                {formatFechaPedido(pedido.fecha_pedido)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* ── Fila Central: Destinatario + Resumen de items ── */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: { xs: 'flex-start', md: 'center' },
                                            flexDirection: { xs: 'column', md: 'row' },
                                            gap: 2,
                                            p: 1.8,
                                            borderRadius: '16px',
                                            bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                                            border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
                                            mb: 2,
                                        }}
                                    >
                                        {/* Destinatario */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar
                                                sx={{
                                                    width: 42,
                                                    height: 42,
                                                    bgcolor: pedido.nombres ? alpha(gold, 0.2) : alpha('#64748b', 0.2),
                                                    color: pedido.nombres ? gold : '#64748b',
                                                    fontWeight: 800,
                                                    fontSize: 15,
                                                }}
                                            >
                                                {pedido.nombres ? (
                                                    `${pedido.nombres.charAt(0)}${pedido.apellidos?.charAt(0) || ''}`
                                                ) : (
                                                    <PersonRoundedIcon sx={{ fontSize: 22 }} />
                                                )}
                                            </Avatar>

                                            <Box>
                                                <Typography variant="body2" fontWeight={800}>
                                                    {pedido.nombres ? `${pedido.nombres} ${pedido.apellidos}` : 'Compra general'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                    {pedido.nombres ? 'Asignado a estudiante' : 'Uso personal / sin asignar'}
                                                    {cantidadItems > 0 && ` · ${cantidadItems} producto${cantidadItems > 1 ? 's' : ''}`}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Monto Total & Toggle de detalle */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' }, justifyContent: 'space-between' }}>
                                            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                                                    Total a pagar
                                                </Typography>
                                                <Typography variant="h6" fontWeight={900} sx={{ color: gold, lineHeight: 1.1 }}>
                                                    Bs {Number(pedido.monto_total).toFixed(2)}
                                                </Typography>
                                            </Box>

                                            {items.length > 0 && (
                                                <Button
                                                    size="small"
                                                    onClick={() => toggleExpandir(pedido.id)}
                                                    endIcon={
                                                        <ExpandMoreRoundedIcon
                                                            sx={{
                                                                transform: expandido ? 'rotate(180deg)' : 'rotate(0)',
                                                                transition: 'transform 0.2s',
                                                            }}
                                                        />
                                                    }
                                                    sx={{
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        fontSize: '0.8rem',
                                                        color: 'text.secondary',
                                                    }}
                                                >
                                                    {expandido ? 'Ocultar' : 'Ver'} productos
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>

                                    {/* ── Desglose de productos (Colapsable) ── */}
                                    {items.length > 0 && (
                                        <Collapse in={expandido}>
                                            <Box sx={{ mb: 2, pl: 0.5, pr: 0.5 }}>
                                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
                                                    Artículos en este pedido
                                                </Typography>
                                                <Stack spacing={1}>
                                                    {items.map((item, itIdx) => (
                                                        <Box
                                                            key={item.id || itIdx}
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                py: 0.8,
                                                                px: 1.5,
                                                                borderRadius: '12px',
                                                                bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                                                <Box
                                                                    sx={{
                                                                        px: 0.9,
                                                                        py: 0.2,
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 800,
                                                                        bgcolor: goldSoft,
                                                                        color: gold,
                                                                    }}
                                                                >
                                                                    {item.cantidad}x
                                                                </Box>
                                                                <Box>
                                                                    <Typography variant="body2" fontWeight={700}>
                                                                        {item.producto_nombre}
                                                                    </Typography>
                                                                    {(item.talla || item.color) && (
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {[item.talla ? `Talla: ${item.talla}` : null, item.color ? `Color: ${item.color}` : null].filter(Boolean).join(' · ')}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </Box>

                                                            <Typography variant="body2" fontWeight={700}>
                                                                Bs {Number(item.subtotal || (item.precio_unitario * item.cantidad)).toFixed(2)}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </Box>
                                        </Collapse>
                                    )}

                                    {/* ── Fila Inferior: Botones de Acción ── */}
                                    <Divider sx={{ my: 1.5, borderColor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06) }} />

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: 1.5,
                                        }}
                                    >
                                        <Box>
                                            {isPendiente && pedido.fecha_limite_pago && (
                                                <Typography variant="caption" color="error.main" fontWeight={600}>
                                                    Límite de pago: {formatFechaPedido(pedido.fecha_limite_pago)}
                                                </Typography>
                                            )}
                                            {pedido.estado === 'pagado' && (
                                                <Typography variant="caption" color="success.main" fontWeight={600}>
                                                    Pago confirmado · Listo para retiro en administración
                                                </Typography>
                                            )}
                                            {pedido.estado === 'entregado' && (
                                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                    {pedido.entregado_en ? `Entregado el ${formatFechaPedido(pedido.entregado_en)}` : 'Pedido entregado'}
                                                </Typography>
                                            )}
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1.2, ml: 'auto' }}>
                                            {isPendiente ? (
                                                <Button
                                                    variant="contained"
                                                    size="medium"
                                                    startIcon={<QrCode2RoundedIcon />}
                                                    onClick={() => router.push(`/dashboard/padre/productos/pagar/${pedido.id}`)}
                                                    sx={{
                                                        borderRadius: '12px',
                                                        fontWeight: 800,
                                                        px: 2.5,
                                                        py: 1,
                                                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                        color: '#fff',
                                                        boxShadow: '0 4px 16px rgba(220, 38, 38, 0.35)',
                                                        textTransform: 'none',
                                                        fontSize: '0.9rem',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                                            transform: 'translateY(-1px)',
                                                        },
                                                    }}
                                                >
                                                    Pagar con QR
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => router.push(`/dashboard/padre/productos/pagar/${pedido.id}`)}
                                                    sx={{
                                                        borderRadius: '10px',
                                                        fontWeight: 700,
                                                        textTransform: 'none',
                                                        borderColor: isDark ? alpha('#fff', 0.2) : alpha('#000', 0.2),
                                                        color: 'text.secondary',
                                                        '&:hover': {
                                                            borderColor: gold,
                                                            color: gold,
                                                            bgcolor: goldSoft,
                                                        },
                                                    }}
                                                >
                                                    Ver detalle / QR
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
};
