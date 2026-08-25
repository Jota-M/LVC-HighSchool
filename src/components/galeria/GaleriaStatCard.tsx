'use client';
// components/galeria/GaleriaStatCard.tsx

import React from 'react';
import { Paper, Box, Typography, useTheme } from '@mui/material';

interface GaleriaStatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
}

export const GaleriaStatCard: React.FC<GaleriaStatCardProps> = ({
    title,
    value,
    icon,
    color,
    subtitle,
}) => {
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
            {/* Background Icon */}
            <Box
                sx={{
                    position: 'absolute',
                    right: -10,
                    top: -10,
                    opacity: 0.08,
                    transform: 'rotate(15deg)',
                    '& svg': { fontSize: 90 },
                }}
            >
                {icon}
            </Box>

            {/* Content */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                        sx={{
                            width: 46,
                            height: 46,
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

export default GaleriaStatCard;
