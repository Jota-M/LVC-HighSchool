// src/components/preinscripciones/StatCard.tsx

import React from 'react';
import { Paper, Box, Typography, useTheme, alpha } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
  trend: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  color,
  icon,
  trend,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isPositive = trend.startsWith('+');

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
      {/* Icono decorativo de fondo */}
      <Box
        sx={{
          position: 'absolute',
          right: -10,
          top: -10,
          opacity: 0.08,
          transform: 'rotate(15deg)',
          '& svg': { fontSize: 100, color },
        }}
      >
        {icon}
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Icono + título */}
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

        {/* Valor */}
        <Typography
          variant="h3"
          sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}
        >
          {value}
        </Typography>

        {/* Subtítulo + trend */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.3,
              px: 1,
              py: 0.3,
              borderRadius: '8px',
              bgcolor: isPositive
                ? alpha('#10b981', 0.15)
                : alpha('#ef4444', 0.15),
              color: isPositive ? '#10b981' : '#ef4444',
            }}
          >
            {isPositive
              ? <TrendingUpIcon sx={{ fontSize: 14 }} />
              : <TrendingDownIcon sx={{ fontSize: 14 }} />}
            <Typography variant="caption" fontWeight={700}>
              {trend}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};