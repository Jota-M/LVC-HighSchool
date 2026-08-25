'use client';
// components/galeria/GaleriaCard.tsx

import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    Switch,
    FormControlLabel,
    alpha,
    useTheme,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import ReorderRoundedIcon from '@mui/icons-material/ReorderRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import type { FotoGaleria } from '@/types/galeriaTypes';

interface GaleriaCardProps {
    foto: FotoGaleria;
    onEdit: (foto: FotoGaleria) => void;
    onDelete: (foto: FotoGaleria) => void;
    onToggleActivo: (foto: FotoGaleria) => void;
    onPreview: (foto: FotoGaleria) => void;
}

export const GaleriaCard: React.FC<GaleriaCardProps> = ({
    foto,
    onEdit,
    onDelete,
    onToggleActivo,
    onPreview,
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const brand = isDark ? '#facc15' : '#0288d1';

    const hoy = new Date().toISOString().split('T')[0];
    const vigenteHoy =
        foto.activo &&
        (!foto.fecha_inicio || foto.fecha_inicio <= hoy) &&
        (!foto.fecha_fin || foto.fecha_fin >= hoy);

    const esVencida = Boolean(foto.fecha_fin && foto.fecha_fin < hoy);
    const esFutura = Boolean(foto.fecha_inicio && foto.fecha_inicio > hoy);

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '20px',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                bgcolor: isDark ? alpha('#0a1128', 0.6) : '#ffffff',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 16px 32px ${alpha(brand, 0.18)}`,
                    borderColor: alpha(brand, 0.4),
                },
            }}
        >
            {/* Imagen del Banner con Overlay */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '56.25%', // 16:9 Aspect Ratio
                    overflow: 'hidden',
                    bgcolor: isDark ? '#020518' : '#f0f4f8',
                    cursor: 'pointer',
                }}
                onClick={() => onPreview(foto)}
            >
                <Box
                    component="img"
                    src={foto.imagen_url}
                    alt={foto.titulo}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                        filter: foto.activo ? 'none' : 'grayscale(80%) opacity(70%)',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        },
                    }}
                />

                {/* Badges superiores sobre la imagen */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        display: 'flex',
                        gap: 0.8,
                        flexWrap: 'wrap',
                        zIndex: 2,
                    }}
                >
                    <Chip
                        label={foto.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={foto.activo ? 'success' : 'default'}
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            backdropFilter: 'blur(8px)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                    />

                    {foto.activo && vigenteHoy && (
                        <Chip
                            label="Vigente"
                            size="small"
                            color="info"
                            sx={{
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            }}
                        />
                    )}

                    {esVencida && (
                        <Chip
                            label="Vencida"
                            size="small"
                            sx={{
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                bgcolor: '#ef4444',
                                color: '#fff',
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            }}
                        />
                    )}

                    {esFutura && (
                        <Chip
                            label="Programada"
                            size="small"
                            sx={{
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                bgcolor: '#f59e0b',
                                color: '#000',
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            }}
                        />
                    )}
                </Box>

                {/* Badge de Orden */}
                <Chip
                    icon={<ReorderRoundedIcon sx={{ fontSize: '14px !important', color: '#fff !important' }} />}
                    label={`Orden: ${foto.orden}`}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 2,
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        bgcolor: 'rgba(0,0,0,0.65)',
                        color: '#fff',
                        backdropFilter: 'blur(8px)',
                    }}
                />

                {/* Hover overlay para vista previa */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        zIndex: 2,
                        opacity: 0.9,
                    }}
                >
                    <Tooltip title="Ver en tamaño completo">
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onPreview(foto);
                            }}
                            sx={{
                                bgcolor: 'rgba(0,0,0,0.6)',
                                color: '#fff',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' },
                            }}
                        >
                            <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Contenido de la Card */}
            <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                    <Typography
                        variant="h6"
                        fontWeight={800}
                        sx={{
                            fontSize: '1rem',
                            lineHeight: 1.3,
                            mb: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {foto.titulo}
                    </Typography>

                    {/* Fechas de vigencia */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CalendarTodayRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {foto.fecha_inicio || foto.fecha_fin
                                ? `${foto.fecha_inicio || 'Inicio'} → ${foto.fecha_fin || 'Sin límite'}`
                                : 'Siempre vigente'}
                        </Typography>
                    </Box>

                    {/* Usuario que registró */}
                    {foto.creado_por_username && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <PersonOutlineRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary" noWrap>
                                Por: <strong>{foto.creado_por_username}</strong>
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Acciones y Switch de Activo */}
                <Box
                    sx={{
                        pt: 1.5,
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                checked={foto.activo}
                                onChange={() => onToggleActivo(foto)}
                                color="success"
                            />
                        }
                        label={
                            <Typography variant="caption" fontWeight={600} color={foto.activo ? 'success.main' : 'text.disabled'}>
                                {foto.activo ? 'Visible' : 'Oculto'}
                            </Typography>
                        }
                        sx={{ m: 0 }}
                    />

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Editar detalles / Cambiar foto">
                            <IconButton
                                size="small"
                                onClick={() => onEdit(foto)}
                                sx={{
                                    backgroundColor: alpha(brand, 0.1),
                                    color: brand,
                                    '&:hover': { backgroundColor: alpha(brand, 0.2) },
                                }}
                            >
                                <EditRoundedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar foto">
                            <IconButton
                                size="small"
                                onClick={() => onDelete(foto)}
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
                </Box>
            </CardContent>
        </Card>
    );
};

export default GaleriaCard;
