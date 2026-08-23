'use client';
// components/productos/CarritoDrawer.tsx
// Drawer del carrito de compras del padre.

import React from 'react';
import {
    Box, Drawer, Typography, IconButton, Divider,
    Button, CircularProgress, Stack, useTheme, alpha,
} from '@mui/material';
import { keyframes } from '@mui/system';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import type { ItemPedido } from '@/types/productos';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

interface CarritoDrawerProps {
    open: boolean;
    onClose: () => void;
    items: ItemPedido[];
    total: number;
    creandoPedido: boolean;
    onQuitarItem: (varianteId: number) => void;
    onActualizarCantidad: (varianteId: number, cantidad: number) => void;
    onCheckout: () => void;
}

export const CarritoDrawer: React.FC<CarritoDrawerProps> = ({
    open,
    onClose,
    items,
    total,
    creandoPedido,
    onQuitarItem,
    onActualizarCantidad,
    onCheckout,
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const gold = isDark ? '#facc15' : '#0288d1';
    const goldDeep = isDark ? '#f59e0b' : '#01579b';
    const gradient = `linear-gradient(135deg, ${gold} 0%, ${goldDeep} 100%)`;

    // Mismo negro neutro (sin tinte azul) que usan las cards de producto.
    const drawerBg = isDark ? '#0f0f0f' : '#ffffff';
    const itemBg = isDark ? '#1a1a1a' : '#f6f7f9';

    const cantidadTotal = items.reduce((acc, it) => acc + it.cantidad, 0);

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { borderRadius: '20px 0 0 20px', bgcolor: drawerBg, backgroundImage: 'none' } }}
        >
            <Box sx={{ width: { xs: '100vw', sm: 400 }, display: 'flex', flexDirection: 'column', height: '100%' }}>

                {/* ── Header ────────────────────────────────────── */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5, pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 38, height: 38, borderRadius: '11px',
                            background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 4px 14px ${alpha(gold, 0.35)}`,
                        }}>
                            <ShoppingCartRoundedIcon sx={{ fontSize: 19, color: isDark ? '#000' : '#fff' }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={900} lineHeight={1.1}>Tu carrito</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {items.length === 0 ? 'Vacío' : `${cantidadTotal} producto${cantidadTotal === 1 ? '' : 's'}`}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        sx={{ bgcolor: itemBg, '&:hover': { bgcolor: alpha(gold, 0.15) } }}
                    >
                        <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Divider sx={{ opacity: 0.6 }} />

                {/* ── Items ─────────────────────────────────────── */}
                {items.length === 0 ? (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, px: 4 }}>
                        <Box sx={{
                            width: 76, height: 76, borderRadius: '50%',
                            bgcolor: itemBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <ShoppingBagRoundedIcon sx={{ fontSize: 34, color: 'text.disabled' }} />
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography fontWeight={700} sx={{ mb: 0.5 }}>Tu carrito está vacío</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Agregá productos del catálogo para armar tu pedido.
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Stack spacing={1.25} sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2 }}>
                        {items.map((item: ItemPedido, idx: number) => (
                            <Box
                                key={item.producto_variante_id}
                                sx={{
                                    borderRadius: '14px',
                                    bgcolor: itemBg,
                                    p: 1.5,
                                    animation: `${fadeUp} 0.25s ease-out ${idx * 0.03}s both`,
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="body2" fontWeight={700} noWrap>
                                            {item.producto_nombre}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {[item.talla, item.color].filter(Boolean).join(' · ') || 'Única'}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={() => onQuitarItem(item.producto_variante_id)}
                                        sx={{
                                            color: 'text.disabled', flexShrink: 0,
                                            '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.1) },
                                        }}
                                    >
                                        <DeleteOutlineRoundedIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.25 }}>
                                    <Box sx={{
                                        display: 'flex', alignItems: 'center', gap: 0.5,
                                        bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
                                        borderRadius: '10px', p: 0.4,
                                    }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => onActualizarCantidad(item.producto_variante_id, item.cantidad - 1)}
                                            sx={{ width: 26, height: 26, bgcolor: isDark ? '#0f0f0f' : '#fff' }}
                                        >
                                            <RemoveRoundedIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                        <Typography variant="body2" fontWeight={800} sx={{ width: 22, textAlign: 'center' }}>
                                            {item.cantidad}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={() => onActualizarCantidad(item.producto_variante_id, item.cantidad + 1)}
                                            sx={{ width: 26, height: 26, bgcolor: isDark ? '#0f0f0f' : '#fff' }}
                                        >
                                            <AddRoundedIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    </Box>
                                    <Typography fontWeight={800} sx={{ color: gold }}>
                                        Bs {((item.precio_unitario ?? 0) * item.cantidad).toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                )}

                {/* ── Resumen + checkout ──────────────────────────── */}
                <Box sx={{ p: 2.5, pt: 2 }}>
                    <Divider sx={{ mb: 2, opacity: 0.6 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography variant="body2" color="text.secondary">
                            Subtotal ({cantidadTotal} producto{cantidadTotal === 1 ? '' : 's'})
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>Bs {total.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography fontWeight={800} sx={{ fontSize: '1.05rem' }}>Total</Typography>
                        <Typography fontWeight={900} sx={{ color: gold, fontSize: '1.15rem' }}>Bs {total.toFixed(2)}</Typography>
                    </Box>
                    <Button
                        fullWidth
                        disabled={items.length === 0 || creandoPedido}
                        onClick={onCheckout}
                        endIcon={!creandoPedido && items.length > 0 ? <ArrowForwardRoundedIcon /> : null}
                        sx={{
                            borderRadius: '13px', fontWeight: 800, py: 1.4, textTransform: 'none', fontSize: '0.95rem',
                            background: gradient, color: isDark ? '#000' : '#fff',
                            transition: 'all 0.2s',
                            '&:hover': { boxShadow: `0 8px 22px ${alpha(gold, 0.4)}` },
                            '&.Mui-disabled': { background: itemBg, color: 'text.disabled' },
                        }}
                    >
                        {creandoPedido
                            ? <CircularProgress size={20} sx={{ color: isDark ? '#000' : '#fff' }} />
                            : 'Confirmar pedido'}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default CarritoDrawer;