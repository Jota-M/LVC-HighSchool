// components/dashboard/StatsCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  LinearProgress,
  useTheme,
  alpha,
  Stack,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { SvgIconComponent } from '@mui/icons-material';

interface StatsCardProps {
  titulo: string;
  valor: number;
  activos: number;
  icon: SvgIconComponent;
  gradient: string;
  color: string;
  delay?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  titulo,
  valor,
  activos,
  icon: Icon,
  gradient,
  color,
  delay = 0,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const porcentajeActivos = valor > 0 ? Math.round((activos / valor) * 100) : 0;
  const isTrendingUp = porcentajeActivos >= 80;

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '24px',
        background: isDark
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: isDark ? alpha(color, 0.2) : alpha(color, 0.1),
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `fadeInUp 0.6s ease-out ${delay}s both`,
        '@keyframes fadeInUp': {
          from: {
            opacity: 0,
            transform: 'translateY(30px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        '&:hover': {
          transform: 'translateY(-12px) scale(1.02)',
          boxShadow: isDark
            ? `0 24px 48px ${alpha(color, 0.25)}`
            : `0 24px 48px ${alpha(color, 0.2)}`,
          borderColor: color,
          '& .icon-container': {
            transform: 'rotate(10deg) scale(1.1)',
          },
          '& .stats-background': {
            transform: 'scale(1.2) rotate(10deg)',
            opacity: 0.15,
          },
        },
      }}
    >
      {/* Fondo decorativo */}
      <Box
        className="stats-background"
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          background: gradient,
          borderRadius: '50%',
          opacity: 0.08,
          transition: 'all 0.6s ease',
          pointerEvents: 'none',
        }}
      />

      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Stack spacing={2.5}>
          {/* Header con ícono */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  display: 'block',
                  mb: 1,
                }}
              >
                {titulo}
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: '2.5rem',
                  background: gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {valor.toLocaleString()}
              </Typography>
            </Box>

            <Avatar
              className="icon-container"
              sx={{
                width: 64,
                height: 64,
                background: gradient,
                boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
                transition: 'all 0.4s ease',
              }}
            >
              <Icon sx={{ fontSize: 32, color: '#fff' }} />
            </Avatar>
          </Box>

          {/* Progreso y estadísticas */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {isTrendingUp ? (
                  <TrendingUpIcon sx={{ fontSize: 18, color: '#10b981' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: isTrendingUp ? '#10b981' : '#f59e0b',
                  }}
                >
                  {activos.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  activos
                </Typography>
              </Box>

              <Chip
                label={`${porcentajeActivos}%`}
                size="small"
                sx={{
                  height: 24,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  background: alpha(color, 0.1),
                  color: color,
                  border: `1px solid ${alpha(color, 0.2)}`,
                }}
              />
            </Box>

            <LinearProgress
              variant="determinate"
              value={porcentajeActivos}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: isDark ? alpha(color, 0.1) : alpha(color, 0.08),
                '& .MuiLinearProgress-bar': {
                  background: gradient,
                  borderRadius: 4,
                  transition: 'transform 1s ease',
                },
              }}
            />
          </Box>

          {/* Detalle inferior */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              pt: 1,
              borderTop: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Total registrados
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: color }}>
              {(valor - activos).toLocaleString()} inactivos
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};