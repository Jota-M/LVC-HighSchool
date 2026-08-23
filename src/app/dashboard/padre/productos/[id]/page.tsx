'use client';
// app/dashboard/padre/productos/[id]/page.tsx
// [id] = estudianteId

import React, { useState } from 'react';
import {
    Box, Container, Typography, Fade, useTheme, alpha, Card, CardContent,
    Chip, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress,
    Divider, IconButton, Badge, Drawer, Stack,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';

import { useCatalogoProductos, useCarritoProductos, usePedidosHijo } from '@/hooks/usePadreProductos';
import { CATEGORIAS_PRODUCTO, ESTADO_PEDIDO_CONFIG, type Producto, type ProductoVariante, type PedidoProducto, type ItemPedido } from '@/types/productos';

export default function CatalogoProductosPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const gold = isDark ? '#facc15' : '#0288d1';
    const router = useRouter();
    const params = useParams();
    const estudianteId = Number(params.id);

    const { productos, loading } = useCatalogoProductos();
    const { items, agregarItem, quitarItem, actualizarCantidad, vaciarCarrito, total } = useCarritoProductos();
    const { pedidos, crearPedido } = usePedidosHijo(estudianteId);

    const [carritoAbierto, setCarritoAbierto] = useState(false);
    const [creandoPedido, setCreandoPedido] = useState(false);
    const [seleccion, setSeleccion] = useState<Record<number, number>>({}); // producto_id -> variante_id elegida

    const handleAgregarAlCarrito = (producto: Producto) => {
        const varianteId = seleccion[producto.id] ?? producto.variantes?.[0]?.id;
        const variante = producto.variantes?.find((v: ProductoVariante) => v.id === varianteId);

        if (!variante) {
            toast.error('Elegí una talla/color antes de agregar');
            return;
        }
        if (variante.stock_disponible <= 0) {
            toast.error('Sin stock disponible para esa variante');
            return;
        }

        agregarItem({
            producto_variante_id: variante.id,
            cantidad: 1,
            producto_nombre: producto.nombre,
            talla: variante.talla,
            color: variante.color,
            precio_unitario: variante.precio ?? producto.precio_base,
        });
        toast.success(`${producto.nombre} agregado al carrito`);
    };

    const handleCrearPedido = async () => {
        if (items.length === 0) return;
        setCreandoPedido(true);
        try {
            const pedido = await crearPedido(items);
            vaciarCarrito();
            setCarritoAbierto(false);
            toast.success('Pedido creado. Ahora podés pagarlo.');
            router.push(`/dashboard/padre/productos/${estudianteId}/pagar/${pedido.id}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'No se pudo crear el pedido');
        } finally {
            setCreandoPedido(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', pb: 8 }}>
            <Container maxWidth="md" disableGutters sx={{ pt: 3, px: 2 }}>
                {/* Header */}
                <Fade in timeout={300}>
                    <Box
                        onClick={() => router.push('/dashboard/padre/home')}
                        sx={{
                            display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2,
                            cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
                        }}
                    >
                        <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
                        Volver
                    </Box>
                </Fade>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5" fontWeight={900}>
                        Uniformes y deportivos
                    </Typography>

                    <Badge badgeContent={items.length} color="warning">
                        <IconButton
                            onClick={() => setCarritoAbierto(true)}
                            sx={{ bgcolor: alpha(gold, 0.1), '&:hover': { bgcolor: alpha(gold, 0.2) } }}
                        >
                            <ShoppingCartRoundedIcon sx={{ color: gold }} />
                        </IconButton>
                    </Badge>
                </Box>

                {/* Pedidos pendientes de pago, si hay */}
                {pedidos.filter((p: PedidoProducto) => p.estado === 'pendiente_pago').length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                            Pedidos pendientes de pago
                        </Typography>
                        <Stack spacing={1}>
                            {pedidos.filter((p: PedidoProducto) => p.estado === 'pendiente_pago').map((pedido: PedidoProducto) => {
                                const cfg = ESTADO_PEDIDO_CONFIG[pedido.estado];
                                return (
                                    <Card key={pedido.id} variant="outlined" sx={{ borderRadius: '14px' }}>
                                        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: '12px !important' }}>
                                            <Box>
                                                <Typography variant="body2" fontWeight={700}>{pedido.codigo_pedido}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Bs {Number(pedido.monto_total).toFixed(2)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bgColor, color: cfg.color, fontWeight: 700 }} />
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    startIcon={<QrCode2RoundedIcon />}
                                                    onClick={() => router.push(`/dashboard/padre/productos/${estudianteId}/pagar/${pedido.id}`)}
                                                >
                                                    Pagar
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Stack>
                    </Box>
                )}

                {/* Catálogo */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress sx={{ color: gold }} />
                    </Box>
                ) : productos.length === 0 ? (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
                        No hay productos disponibles por el momento.
                    </Typography>
                ) : (
                    <Stack spacing={2}>
                        {productos.map((producto: Producto) => {
                            const varianteSeleccionada = producto.variantes?.find((v: ProductoVariante) => v.id === seleccion[producto.id]) ?? producto.variantes?.[0];
                            const tieneStock = varianteSeleccionada ? varianteSeleccionada.stock_disponible > 0 : false;

                            return (
                                <Card key={producto.id} variant="outlined" sx={{ borderRadius: '16px' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 1 }}>
                                            {producto.foto_url && (
                                                <Box
                                                    component="img"
                                                    src={producto.foto_url}
                                                    alt={producto.nombre}
                                                    sx={{ width: 72, height: 72, borderRadius: '12px', objectFit: 'cover', flexShrink: 0, border: `1px solid ${alpha('#000', 0.08)}` }}
                                                />
                                            )}
                                            <Box sx={{ flex: 1 }}>
                                                <Chip label={CATEGORIAS_PRODUCTO[producto.categoria]} size="small" sx={{ mb: 0.5, fontWeight: 700 }} />
                                                <Typography variant="subtitle1" fontWeight={800}>{producto.nombre}</Typography>
                                                {producto.descripcion && (
                                                    <Typography variant="body2" color="text.secondary">{producto.descripcion}</Typography>
                                                )}
                                                {!producto.tiene_variantes && (
                                                    <Typography variant="caption" fontWeight={700} color={tieneStock ? 'success.main' : 'error.main'} sx={{ display: 'block', mt: 0.5 }}>
                                                        {tieneStock ? `Stock disponible: ${varianteSeleccionada?.stock_disponible}` : 'Agotado (sin stock)'}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Typography variant="h6" fontWeight={900} sx={{ color: gold, whiteSpace: 'nowrap' }}>
                                                Bs {Number(varianteSeleccionada?.precio ?? producto.precio_base).toFixed(2)}
                                            </Typography>
                                        </Box>

                                        {producto.tiene_variantes && producto.variantes && producto.variantes.length > 0 && (
                                            <FormControl size="small" sx={{ minWidth: 160, mb: 1.5 }}>
                                                <InputLabel>Talla / Color</InputLabel>
                                                <Select
                                                    label="Talla / Color"
                                                    value={seleccion[producto.id] ?? producto.variantes[0]?.id ?? ''}
                                                    onChange={(e: any) => setSeleccion((prev: Record<number, number>) => ({ ...prev, [producto.id]: Number(e.target.value) }))}
                                                >
                                                    {producto.variantes.map((v: ProductoVariante) => (
                                                        <MenuItem key={v.id} value={v.id} disabled={v.stock_disponible <= 0}>
                                                            {[v.talla, v.color].filter(Boolean).join(' - ') || 'Única'}
                                                            {v.stock_disponible <= 0 ? ' (sin stock)' : ''}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}

                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<AddRoundedIcon />}
                                            onClick={() => handleAgregarAlCarrito(producto)}
                                            disabled={!tieneStock}
                                        >
                                            {!tieneStock ? 'Agotado' : 'Agregar al carrito'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Stack>
                )}
            </Container>

            {/* Carrito (Drawer) */}
            <Drawer anchor="right" open={carritoAbierto} onClose={() => setCarritoAbierto(false)}>
                <Box sx={{ width: 340, p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" fontWeight={900}>Tu carrito</Typography>
                        <IconButton onClick={() => setCarritoAbierto(false)}><CloseRoundedIcon /></IconButton>
                    </Box>

                    {items.length === 0 ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                            Todavía no agregaste productos.
                        </Typography>
                    ) : (
                        <Stack spacing={1.5} sx={{ flex: 1, overflowY: 'auto' }}>
                            {items.map((item: ItemPedido) => (
                                <Card key={item.producto_variante_id} variant="outlined" sx={{ borderRadius: '12px' }}>
                                    <CardContent sx={{ py: '10px !important' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box>
                                                <Typography variant="body2" fontWeight={700}>{item.producto_nombre}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {[item.talla, item.color].filter(Boolean).join(' - ') || 'Única'}
                                                </Typography>
                                            </Box>
                                            <IconButton size="small" onClick={() => quitarItem(item.producto_variante_id)}>
                                                <DeleteOutlineRoundedIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <IconButton size="small" onClick={() => actualizarCantidad(item.producto_variante_id, item.cantidad - 1)}>-</IconButton>
                                                <Typography variant="body2" fontWeight={700}>{item.cantidad}</Typography>
                                                <IconButton size="small" onClick={() => actualizarCantidad(item.producto_variante_id, item.cantidad + 1)}>+</IconButton>
                                            </Box>
                                            <Typography variant="body2" fontWeight={800}>
                                                Bs {((item.precio_unitario ?? 0) * item.cantidad).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    )}

                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography fontWeight={800}>Total</Typography>
                        <Typography fontWeight={900} sx={{ color: gold }}>Bs {total.toFixed(2)}</Typography>
                    </Box>
                    <Button
                        fullWidth
                        variant="contained"
                        disabled={items.length === 0 || creandoPedido}
                        onClick={handleCrearPedido}
                    >
                        {creandoPedido ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Confirmar pedido'}
                    </Button>
                </Box>
            </Drawer>
        </Box>
    );
}