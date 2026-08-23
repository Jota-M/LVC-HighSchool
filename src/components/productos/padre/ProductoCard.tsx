'use client';
// components/productos/ProductoCard.tsx
// Card de producto, estilo "product card" editorial: foto portrait,
// botón de favorito, y un FAB circular flotante para agregar al carrito.

import React, { useState } from 'react';
import {
    Box, Card, Typography, Select, MenuItem, FormControl, IconButton,
    useTheme, alpha,
} from '@mui/material';
import { keyframes } from '@mui/system';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import CheckroomRoundedIcon from '@mui/icons-material/CheckroomRounded';
import type { Producto, ProductoVariante, CategoriaProducto } from '@/types/productos';
import { CATEGORIAS_PRODUCTO } from '@/types/productos';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

interface ProductoCardProps {
    producto: Producto;
    varianteSeleccionadaId?: number;
    onCambiarVariante: (productoId: number, varianteId: number) => void;
    onAgregar: (producto: Producto) => void;
    delayIndex?: number;
}

export const ProductoCard: React.FC<ProductoCardProps> = ({
    producto,
    varianteSeleccionadaId,
    onCambiarVariante,
    onAgregar,
    delayIndex = 0,
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const gold = isDark ? '#facc15' : '#0288d1';
    const goldDeep = isDark ? '#f59e0b' : '#01579b';
    const gradient = `linear-gradient(135deg, ${gold} 0%, ${goldDeep} 100%)`;
    // Negro neutro (sin tinte azul) — el mismo valor se usa en la card, el panel
    // de la imagen y el degradado de fundido, así no queda ninguna costura visible.
    const cardBg = isDark ? '#131313' : '#ffffff';

    const [favorito, setFavorito] = useState(false);

    const varianteSeleccionada =
        producto.variantes?.find((v: ProductoVariante) => v.id === varianteSeleccionadaId) ??
        producto.variantes?.[0];
    const tieneStock = varianteSeleccionada ? varianteSeleccionada.stock_disponible > 0 : false;
    const stockBajo = tieneStock && (varianteSeleccionada?.stock_disponible ?? 0) <= 5;

    return (
        <Card
            sx={{
                width: '100%',
                borderRadius: '22px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: cardBg,
                backgroundImage: 'none',
                opacity: tieneStock ? 1 : 0.65,
                animation: `${fadeUp} 0.35s ease-out ${delayIndex * 0.04}s both`,
                border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                boxShadow: isDark ? '0 4px 18px rgba(0,0,0,0.45)' : '0 4px 18px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isDark ? `0 14px 30px ${alpha(gold, 0.18)}` : `0 14px 30px ${alpha(gold, 0.16)}`,
                },
                '&:hover .producto-img': {
                    transform: 'scale(1.05)',
                },
            }}
        >
            {/* ── Imagen (portrait) ────────────────────────────── */}
            <Box
                sx={{
                    position: 'relative', width: '100%', aspectRatio: '4 / 5',
                    overflow: 'hidden',
                    bgcolor: cardBg,
                }}
            >
                {producto.foto_url ? (
                    <Box
                        component="img"
                        className="producto-img"
                        src={producto.foto_url}
                        alt={producto.nombre}
                        sx={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            transition: 'transform 0.35s ease',
                        }}
                    />
                ) : (
                    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckroomRoundedIcon sx={{ color: gold, fontSize: 48, opacity: 0.5 }} />
                    </Box>
                )}

                {/* Degradado de fundido: la foto se disuelve en el fondo de la card,
                    sin línea divisoria entre imagen y texto */}
                <Box
                    sx={{
                        position: 'absolute', left: 0, right: 0, bottom: 0, height: '42%',
                        background: `linear-gradient(to bottom, ${alpha(cardBg, 0)} 0%, ${alpha(cardBg, 0.55)} 55%, ${cardBg} 100%)`,
                        pointerEvents: 'none',
                    }}
                />

                {/* Favorito */}
                <IconButton
                    size="small"
                    onClick={() => setFavorito(f => !f)}
                    sx={{
                        position: 'absolute', top: 10, left: 10,
                        width: 30, height: 30,
                        bgcolor: isDark ? alpha('#000', 0.45) : alpha('#fff', 0.85),
                        backdropFilter: 'blur(4px)',
                        '&:hover': { bgcolor: isDark ? alpha('#000', 0.6) : alpha('#fff', 0.95) },
                    }}
                >
                    {favorito
                        ? <FavoriteRoundedIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                        : <FavoriteBorderRoundedIcon sx={{ fontSize: 16, color: isDark ? '#fff' : '#374151' }} />}
                </IconButton>

                {/* Badge: categoría o estado de stock */}
                {!tieneStock ? (
                    <Box sx={{
                        position: 'absolute', top: 10, right: 10,
                        px: 1, py: 0.4, borderRadius: '8px',
                        bgcolor: '#dc2626', color: '#fff',
                        fontSize: 10, fontWeight: 800, letterSpacing: 0.3,
                    }}>
                        AGOTADO
                    </Box>
                ) : stockBajo ? (
                    <Box sx={{
                        position: 'absolute', top: 10, right: 10,
                        px: 1, py: 0.4, borderRadius: '8px',
                        bgcolor: isDark ? alpha('#000', 0.5) : alpha('#fff', 0.85),
                        color: isDark ? '#f87171' : '#dc2626',
                        fontSize: 10, fontWeight: 800, letterSpacing: 0.3,
                    }}>
                        QUEDAN {varianteSeleccionada?.stock_disponible}
                    </Box>
                ) : (
                    <Box sx={{
                        position: 'absolute', top: 10, right: 10,
                        px: 1, py: 0.4, borderRadius: '8px',
                        bgcolor: isDark ? alpha('#000', 0.45) : alpha('#fff', 0.85),
                        color: isDark ? alpha('#fff', 0.75) : alpha('#000', 0.6),
                        fontSize: 10, fontWeight: 800, letterSpacing: 0.4,
                        backdropFilter: 'blur(4px)',
                    }}>
                        {CATEGORIAS_PRODUCTO[producto.categoria as CategoriaProducto].toUpperCase()}
                    </Box>
                )}
            </Box>

            {/* ── Info ──────────────────────────────────────── */}
            <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
                {/* FAB de agregar, superpuesto al límite foto/contenido */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: '-22px', mb: 0.5, position: 'relative', zIndex: 2 }}>
                    <IconButton
                        onClick={() => onAgregar(producto)}
                        disabled={!tieneStock}
                        sx={{
                            width: 44, height: 44,
                            background: tieneStock ? gradient : (isDark ? '#3a3a3a' : '#d1d5db'),
                            color: tieneStock ? (isDark ? '#000' : '#fff') : (isDark ? '#777' : '#9ca3af'),
                            boxShadow: tieneStock ? `0 6px 16px ${alpha(gold, 0.4)}` : 'none',
                            border: `3px solid ${cardBg}`,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                background: tieneStock ? gradient : undefined,
                                transform: tieneStock ? 'scale(1.08)' : 'none',
                                boxShadow: tieneStock ? `0 8px 20px ${alpha(gold, 0.5)}` : 'none',
                            },
                        }}
                    >
                        <AddRoundedIcon />
                    </IconButton>
                </Box>

                <Typography
                    fontWeight={800}
                    sx={{
                        fontSize: '0.85rem', letterSpacing: 0.3, textTransform: 'uppercase',
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                        mb: 0.5,
                    }}
                    title={producto.nombre}
                >
                    {producto.nombre}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.75 }}>
                    <Typography fontWeight={900} sx={{ color: gold, fontSize: '1.15rem' }}>
                        {Number(varianteSeleccionada?.precio ?? producto.precio_base).toFixed(2)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
                        Bs
                    </Typography>
                </Box>

                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                        mb: producto.tiene_variantes ? 1 : 0,
                    }}
                >
                    {producto.descripcion || (tieneStock ? `${varianteSeleccionada?.stock_disponible ?? ''} disponibles`.trim() : 'Sin stock')}
                </Typography>

                {/* Selector de variante */}
                {producto.tiene_variantes && producto.variantes && producto.variantes.length > 0 && (
                    <FormControl size="small" fullWidth>
                        <Select
                            value={varianteSeleccionadaId ?? producto.variantes[0]?.id ?? ''}
                            onChange={(e: any) => onCambiarVariante(producto.id, Number(e.target.value))}
                            sx={{ borderRadius: '9px', fontSize: '0.8rem', '& .MuiSelect-select': { py: 0.85 } }}
                        >
                            {producto.variantes.map((v: ProductoVariante) => (
                                <MenuItem key={v.id} value={v.id} disabled={v.stock_disponible <= 0} sx={{ fontSize: '0.85rem' }}>
                                    {[v.talla, v.color].filter(Boolean).join(' - ') || 'Única'}
                                    {v.stock_disponible <= 0 ? ' (sin stock)' : ` · ${v.stock_disponible} disp.`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Box>
        </Card>
    );
};

export default ProductoCard;