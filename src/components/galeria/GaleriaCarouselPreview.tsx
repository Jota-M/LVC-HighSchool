'use client';
// components/galeria/GaleriaCarouselPreview.tsx

import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Chip,
    alpha,
    useTheme,
    CircularProgress,
} from '@mui/material';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import CollectionsBookmarkRoundedIcon from '@mui/icons-material/CollectionsBookmarkRounded';
import ViewCarouselRoundedIcon from '@mui/icons-material/ViewCarouselRounded';
import type { FotoGaleria } from '@/types/galeriaTypes';

interface GaleriaCarouselPreviewProps {
    fotos: FotoGaleria[];
    loading?: boolean;
}

export const GaleriaCarouselPreview: React.FC<GaleriaCarouselPreviewProps> = ({
    fotos,
    loading = false,
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const brand = isDark ? '#facc15' : '#0288d1';

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (fotos.length <= 1 || isHovered) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % fotos.length);
        }, 4500);
        return () => clearInterval(interval);
    }, [fotos.length, isHovered]);

    if (loading) {
        return (
            <Paper
                sx={{
                    p: 6,
                    borderRadius: '24px',
                    textAlign: 'center',
                    bgcolor: isDark ? alpha('#0a1128', 0.6) : '#ffffff',
                }}
            >
                <CircularProgress sx={{ color: brand, mb: 2 }} />
                <Typography color="text.secondary">Cargando carrusel de fotos vigentes...</Typography>
            </Paper>
        );
    }

    if (fotos.length === 0) {
        return (
            <Paper
                sx={{
                    p: 6,
                    borderRadius: '24px',
                    textAlign: 'center',
                    border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
                    bgcolor: isDark ? alpha('#0a1128', 0.4) : '#ffffff',
                }}
            >
                <CollectionsBookmarkRoundedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    No hay fotos vigentes actualmente
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                    Las fotos vigentes son aquellas que están marcadas como <strong>Activas</strong> y cuya fecha
                    está dentro del rango actual (o sin límite de fechas).
                </Typography>
            </Paper>
        );
    }

    const currentFoto = fotos[currentIndex] || fotos[0];

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + fotos.length) % fotos.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % fotos.length);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ViewCarouselRoundedIcon sx={{ color: brand }} />
                    <Typography variant="subtitle1" fontWeight={800}>
                        Vista Previa: Carrusel Público Institucional ({fotos.length} fotos vigentes)
                    </Typography>
                </Box>
                <Chip
                    label={`Slide ${currentIndex + 1} de ${fotos.length}`}
                    size="small"
                    sx={{ bgcolor: alpha(brand, 0.1), color: brand, fontWeight: 700 }}
                />
            </Box>

            <Paper
                elevation={0}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                sx={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: { xs: '65%', sm: '42%' }, // Responsive Aspect Ratio
                    borderRadius: '24px',
                    overflow: 'hidden',
                    bgcolor: '#000',
                    border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                }}
            >
                {/* Imagen del Slide */}
                <Box
                    component="img"
                    key={currentFoto.id}
                    src={currentFoto.imagen_url}
                    alt={currentFoto.titulo}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        animation: 'fadeCarousel 0.6s ease-in-out',
                        '@keyframes fadeCarousel': {
                            from: { opacity: 0.4 },
                            to: { opacity: 1 },
                        },
                    }}
                />

                {/* Overlay degradado inferior */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: { xs: 2.5, sm: 4 },
                        pt: { xs: 4, sm: 8 },
                        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%)',
                        color: '#fff',
                        zIndex: 2,
                    }}
                >
                    <Typography
                        variant="h5"
                        fontWeight={800}
                        sx={{
                            fontSize: { xs: '1.1rem', sm: '1.5rem' },
                            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                            mb: 0.5,
                        }}
                    >
                        {currentFoto.titulo}
                    </Typography>

                    {currentFoto.fecha_inicio || currentFoto.fecha_fin ? (
                        <Typography
                            variant="caption"
                            sx={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
                        >
                            Vigente:{' '}
                            {currentFoto.fecha_inicio && currentFoto.fecha_fin
                                ? `Del ${currentFoto.fecha_inicio} al ${currentFoto.fecha_fin}`
                                : currentFoto.fecha_inicio
                                    ? `Desde ${currentFoto.fecha_inicio}`
                                    : `Hasta ${currentFoto.fecha_fin}`}
                        </Typography>
                    ) : (
                        <Typography
                            variant="caption"
                            sx={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
                        >
                            Vigente de forma continua
                        </Typography>
                    )}
                </Box>

                {/* Flechas de navegación */}
                {fotos.length > 1 && (
                    <>
                        <IconButton
                            onClick={handlePrev}
                            sx={{
                                position: 'absolute',
                                left: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 3,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: '#fff',
                                backdropFilter: 'blur(8px)',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                            }}
                        >
                            <ArrowBackIosNewRoundedIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                            onClick={handleNext}
                            sx={{
                                position: 'absolute',
                                right: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 3,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: '#fff',
                                backdropFilter: 'blur(8px)',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                            }}
                        >
                            <ArrowForwardIosRoundedIcon fontSize="small" />
                        </IconButton>
                    </>
                )}

                {/* Indicadores de bolitas */}
                {fotos.length > 1 && (
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 12,
                            right: 24,
                            zIndex: 3,
                            display: 'flex',
                            gap: 0.8,
                        }}
                    >
                        {fotos.map((_, idx) => (
                            <Box
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                sx={{
                                    width: idx === currentIndex ? 24 : 8,
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: idx === currentIndex ? brand : 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        ))}
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default GaleriaCarouselPreview;
