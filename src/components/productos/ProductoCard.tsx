'use client';
// components/productos/ProductoCard.tsx

import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    alpha,
    useTheme,
} from '@mui/material';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import CheckroomRoundedIcon from '@mui/icons-material/CheckroomRounded';
import SellRoundedIcon from '@mui/icons-material/SellRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import { CATEGORIAS_PRODUCTO, type Producto } from '@/types/productos';

interface ProductoCardProps {
    producto: Producto;
    onEdit: (producto: Producto) => void;
    onDelete: (producto: Producto) => void;
    /** Abre el menú contextual (⋮) — mismo patrón que el kebab de Estudiantes */
    onMenuOpen: (event: React.MouseEvent<HTMLElement>, producto: Producto) => void;
    /** Abre el diálogo de "Agregar variante" — solo se muestra si tiene_variantes */
    onAddVariante?: (producto: Producto) => void;
}

export const ProductoCard: React.FC<ProductoCardProps> = ({ producto, onEdit, onDelete, onMenuOpen, onAddVariante }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const brand = isDark ? '#facc15' : '#0288d1';

    const stockTotal = producto.variantes?.reduce((sum, v) => sum + v.stock_disponible, 0) ?? 0;

    return (
        <Card
            sx={{
                height: '100%',
                borderRadius: '20px',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'visible',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 24px ${alpha(brand, 0.2)}`,
                    borderColor: brand,
                },
            }}
            onClick={() => onEdit(producto)}
        >
            {/* Badge de estado */}
            <Chip
                label={producto.activo ? 'Activo' : 'Inactivo'}
                size="small"
                color={producto.activo ? 'success' : 'error'}
                sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1, fontWeight: 700, fontSize: '0.7rem' }}
            />

            {/* Menú de acciones */}
            <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onMenuOpen(e, producto); }}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                    '&:hover': { backgroundColor: alpha(brand, 0.2) },
                }}
            >
                <MoreVertRoundedIcon fontSize="small" />
            </IconButton>

            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                {/* Foto circular, mismo tratamiento que el Avatar de Estudiantes */}
                <Box
                    sx={{
                        width: 90,
                        height: 90,
                        borderRadius: '50%',
                        margin: '0 auto 16px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isDark ? '#facc15' : '#0288d1',
                        color: isDark ? '#000' : '#fff',
                        border: `4px solid ${alpha(brand, 0.2)}`,
                        boxShadow: `0 8px 16px ${alpha(brand, 0.3)}`,
                    }}
                >
                    {producto.foto_url ? (
                        <Box
                            component="img"
                            src={producto.foto_url}
                            alt={producto.nombre}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <CheckroomRoundedIcon sx={{ fontSize: 36 }} />
                    )}
                </Box>

                {/* Nombre */}
                <Typography variant="h6" fontWeight={800} noWrap gutterBottom>
                    {producto.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {CATEGORIAS_PRODUCTO[producto.categoria]}
                </Typography>

                {/* Código */}
                <Chip
                    label={producto.codigo}
                    size="small"
                    sx={{
                        mt: 1,
                        mb: 2,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        backgroundColor: alpha(brand, 0.1),
                        color: brand,
                    }}
                />

                {/* Botones de acción directos */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
                    <Tooltip title="Editar">
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); onEdit(producto); }}
                            sx={{
                                backgroundColor: alpha(brand, 0.1),
                                '&:hover': { backgroundColor: alpha(brand, 0.2) },
                            }}
                        >
                            <EditRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    {producto.tiene_variantes && onAddVariante && (
                        <Tooltip title="Agregar variante / stock">
                            <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); onAddVariante(producto); }}
                                sx={{
                                    backgroundColor: alpha('#10b981', 0.1),
                                    color: '#10b981',
                                    '&:hover': { backgroundColor: alpha('#10b981', 0.2) },
                                }}
                            >
                                <AddBoxRoundedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}

                    <Tooltip title="Eliminar">
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); onDelete(producto); }}
                            sx={{
                                backgroundColor: alpha('#ef4444', 0.1),
                                color: '#ef4444',
                                '&:hover': { backgroundColor: alpha('#ef4444', 0.2) },
                            }}
                        >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Información adicional, mismo patrón que CI/edad/género de Estudiantes */}
                <Box
                    sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        textAlign: 'left',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SellRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" fontWeight={700} sx={{ color: brand }}>
                            Bs {Number(producto.precio_base).toFixed(2)}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Inventory2RoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" noWrap fontWeight={!producto.tiene_variantes ? 700 : 400}>
                            {producto.tiene_variantes
                                ? `${producto.variantes?.length ?? 0} variantes · ${stockTotal} en stock`
                                : `${stockTotal} en stock (Sin variantes)`}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProductoCard;