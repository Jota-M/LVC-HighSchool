'use client';
// components/galeria/GaleriaImageViewer.tsx

import React from 'react';
import {
    Dialog,
    DialogContent,
    IconButton,
    Box,
    Typography,
    Chip,
    Stack,
    alpha,
    useTheme,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import ReorderRoundedIcon from '@mui/icons-material/ReorderRounded';
import type { FotoGaleria } from '@/types/galeriaTypes';

interface GaleriaImageViewerProps {
    foto: FotoGaleria | null;
    open: boolean;
    onClose: () => void;
}

export const GaleriaImageViewer: React.FC<GaleriaImageViewerProps> = ({
    foto,
    open,
    onClose,
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const brand = isDark ? '#facc15' : '#0288d1';

    if (!foto) return null;

    // Check vigencia
    const hoy = new Date().toISOString().split('T')[0];
    const vigenteHoy =
        foto.activo &&
        (!foto.fecha_inicio || foto.fecha_inicio <= hoy) &&
        (!foto.fecha_fin || foto.fecha_fin >= hoy);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    overflow: 'hidden',
                    bgcolor: isDark ? '#080d24' : '#ffffff',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                },
            }}
        >
            <Box sx={{ position: 'relative', bgcolor: '#000', display: 'flex', justifyContent: 'center' }}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 2,
                        color: '#fff',
                        bgcolor: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                    }}
                >
                    <CloseRoundedIcon />
                </IconButton>

                <Box
                    component="img"
                    src={foto.imagen_url}
                    alt={foto.titulo}
                    sx={{
                        maxHeight: '65vh',
                        width: '100%',
                        objectFit: 'contain',
                    }}
                />
            </Box>

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    <Box>
                        <Typography variant="h5" fontWeight={800} gutterBottom>
                            {foto.titulo}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                            <Chip
                                label={foto.activo ? 'Activo' : 'Inactivo'}
                                size="small"
                                color={foto.activo ? 'success' : 'error'}
                                sx={{ fontWeight: 700 }}
                            />
                            {vigenteHoy ? (
                                <Chip
                                    label="Vigente hoy"
                                    size="small"
                                    color="info"
                                    sx={{ fontWeight: 700 }}
                                />
                            ) : foto.fecha_fin && foto.fecha_fin < hoy ? (
                                <Chip
                                    label="Vencida"
                                    size="small"
                                    sx={{ bgcolor: alpha('#ef4444', 0.15), color: '#ef4444', fontWeight: 700 }}
                                />
                            ) : foto.fecha_inicio && foto.fecha_inicio > hoy ? (
                                <Chip
                                    label="Programada"
                                    size="small"
                                    sx={{ bgcolor: alpha('#f59e0b', 0.15), color: '#f59e0b', fontWeight: 700 }}
                                />
                            ) : null}
                            <Chip
                                icon={<ReorderRoundedIcon sx={{ fontSize: 16 }} />}
                                label={`Orden: ${foto.orden}`}
                                size="small"
                                sx={{ bgcolor: alpha(brand, 0.1), color: brand, fontWeight: 700 }}
                            />
                        </Stack>
                    </Box>
                </Box>

                <Stack spacing={1.5} sx={{ pt: 1, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                            Vigencia:{' '}
                            <strong>
                                {foto.fecha_inicio || foto.fecha_fin
                                    ? `${foto.fecha_inicio || 'Siempre'} hasta ${foto.fecha_fin || 'Indefinido'}`
                                    : 'Sin restricción (Siempre visible)'}
                            </strong>
                        </Typography>
                    </Box>

                    {foto.creado_por_username && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonOutlineRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                Registrado por: <strong>{foto.creado_por_username}</strong>
                            </Typography>
                        </Box>
                    )}
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default GaleriaImageViewer;
