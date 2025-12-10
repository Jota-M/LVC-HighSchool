// components/dashboard/ElegantStatsCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  useTheme,
  alpha,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { SvgIconComponent } from '@mui/icons-material';

interface ElegantStatsCardProps {
  titulo: string;
  valor: number;
  activos: number;
  icon: SvgIconComponent;
  delay?: number;
  cambio?: number;
}

export const ElegantStatsCard: React.FC<ElegantStatsCardProps> = ({
  titulo,
  valor,
  activos,
  icon: Icon,
  delay = 0,
  cambio = 0,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const porcentajeActivos = valor > 0 ? Math.round((activos / valor) * 100) : 0;
  const isTrendingUp = cambio >= 0;

  // Colores elegantes y sutiles
  const accentColor = isDark ? '#818cf8' : '#6366f1';
  const bgCard = isDark ? '#1a1a1a' : '#ffffff';
  const borderColor = isDark ? alpha('#fff', 0.06) : alpha('#000', 0.08);

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        background: bgCard,
        border: `1px solid ${borderColor}`,
        boxShadow: isDark
          ? '0 1px 3px rgba(0, 0, 0, 0.3)'
          : '0 1px 3px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s both`,
        '@keyframes fadeInUp': {
          from: {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isDark
            ? '0 12px 24px rgba(0, 0, 0, 0.4)'
            : '0 12px 24px rgba(0, 0, 0, 0.08)',
          borderColor: isDark ? alpha(accentColor, 0.4) : alpha(accentColor, 0.3),
          '& .stat-icon': {
            transform: 'scale(1.05)',
            background: isDark
              ? `linear-gradient(135deg, ${alpha(accentColor, 0.15)}, ${alpha(accentColor, 0.05)})`
              : `linear-gradient(135deg, ${alpha(accentColor, 0.1)}, ${alpha(accentColor, 0.05)})`,
          },
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  mb: 1,
                  display: 'block',
                }}
              >
                {titulo}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  fontSize: '2.25rem',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  color: 'text.primary',
                  mb: 0.5,
                }}
              >
                {valor.toLocaleString()}
              </Typography>
            </Box>

            {/* Icono minimalista */}
            <Box
              className="stat-icon"
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: isDark
                  ? alpha(accentColor, 0.08)
                  : alpha(accentColor, 0.06),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              <Icon sx={{ fontSize: 24, color: accentColor }} />
            </Box>
          </Box>

          {/* Cambio y progreso */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {isTrendingUp ? (
                  <TrendingUpIcon sx={{ fontSize: 16, color: '#10b981' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: isTrendingUp ? '#10b981' : '#f59e0b',
                  }}
                >
                  {Math.abs(cambio)}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  vs anterior
                </Typography>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                }}
              >
                {activos.toLocaleString()} activos
              </Typography>
            </Box>

            {/* Barra de progreso minimalista */}
            <LinearProgress
              variant="determinate"
              value={porcentajeActivos}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${accentColor}, ${alpha(accentColor, 0.7)})`,
                  borderRadius: 2,
                  transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                },
              }}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};