'use client';
// components/pagos/ResumenPagosCards.tsx
// KPI cards del módulo financiero — estilo plano con borde superior de color,
// alineado al design system del sistema (sin glow ni decoraciones circulares).

import React from 'react';
import { Box, Typography, Chip, Skeleton, alpha, useTheme } from '@mui/material';
import { keyframes } from '@mui/system';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export interface ResumenPagosCardData {
    label: string;
    valor: string;
    sub: string;
    icon: React.ReactNode;
    color: string;
    urgent?: boolean;
}

const StatCard: React.FC<ResumenPagosCardData & { delay: number; isDark: boolean }> = ({
    label, valor, sub, icon, color, urgent, delay, isDark,
}) => (
    <Box sx={{
        p: 2.5, borderRadius: '16px',
        bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
        border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
        borderTop: `3px solid ${color}`,
        animation: `${fadeUp} 0.35s ease-out ${delay}s both`,
    }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box sx={{
                width: 36, height: 36, borderRadius: '10px',
                bgcolor: alpha(color, isDark ? 0.15 : 0.1),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color,
            }}>
                {icon}
            </Box>
            {urgent && (
                <Chip label="URGENTE" size="small"
                    sx={{ height: 18, fontSize: 9, fontWeight: 900, bgcolor: alpha(color, 0.12), color, borderRadius: 1.5 }} />
            )}
        </Box>

        <Typography variant="h4" fontWeight={900} sx={{ color, lineHeight: 1, mb: 0.5 }}>
            {valor}
        </Typography>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.25, fontSize: 13 }}>
            {label}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
            {sub}
        </Typography>
    </Box>
);

export const ResumenPagosCards: React.FC<{
    cards: ResumenPagosCardData[];
    isLoading: boolean;
}> = ({ cards, isLoading }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: `repeat(${cards.length || 3}, 1fr)` },
            gap: 2, mb: 3,
        }}>
            {isLoading
                ? Array.from({ length: cards.length || 3 }).map((_, i) => (
                    <Skeleton key={i} variant="rounded" height={112} sx={{ borderRadius: '16px' }} />
                ))
                : cards.map((c, i) => (
                    <StatCard key={c.label} {...c} delay={i * 0.05} isDark={isDark} />
                ))}
        </Box>
    );
};

export default ResumenPagosCards;