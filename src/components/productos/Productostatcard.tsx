'use client';
// components/productos/ProductoStatCard.tsx

import React from 'react';
import { Paper, Box, Typography, useTheme } from '@mui/material';

interface ProductoStatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
}

export const ProductoStatCard: React.FC<ProductoStatCardProps> = ({ title, value, icon, color, subtitle }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: '20px',
                background: isDark
                    ? `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`
                    : `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
                border: `2px solid ${color}30`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px ${color}20`,
                    borderColor: `${color}60`,
                },
            }}
        >
            {/* Icono de fondo */}
            <Box
                sx={{
                    position: 'absolute',
                    right: -10,
                    top: -10,
                    opacity: 0.1,
                    transform: 'rotate(15deg)',
                    '& svg': { fontSize: 100 },
                }}
            >
                {icon}
            </Box>

            {/* Contenido */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `${color}20`,
                            '& svg': { fontSize: 24, color },
                        }}
                    >
                        {icon}
                    </Box>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                        }}
                    >
                        {title}
                    </Typography>
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                    {value}
                </Typography>

                {subtitle && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

export default ProductoStatCard;