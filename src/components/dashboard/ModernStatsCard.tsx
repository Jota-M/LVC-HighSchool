// components/dashboard/ModernStatsCard.tsx
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
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { SvgIconComponent } from '@mui/icons-material';

interface ModernStatsCardProps {
  titulo: string;
  valor: number;
  activos: number;
  icon: SvgIconComponent;
  gradient: string;
  color: string;
  delay?: number;
  cambio?: number;
}

export const ModernStatsCard: React.FC<ModernStatsCardProps> = ({
  titulo,
  valor,
  activos,
  icon: Icon,
  gradient,
  color,
  delay = 0,
  cambio = 0,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const porcentajeActivos = valor > 0 ? Math.round((activos / valor) * 100) : 0;
  const isTrendingUp = cambio >= 0;

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'visible',
        borderRadius: '28px',
        background: isDark
          ? `linear-gradient(135deg, ${alpha('#1e293b', 0.4)} 0%, ${alpha('#0f172a', 0.7)} 100%)`
          : `linear-gradient(135deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha('#f8fafc', 0.9)} 100%)}`,
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
        boxShadow: isDark
          ? `0 8px 32px ${alpha('#000', 0.3)}, inset 0 1px 0 ${alpha('#fff', 0.05)}`
          : `0 8px 32px ${alpha('#000', 0.08)}, inset 0 1px 0 ${alpha('#fff', 0.8)}`,
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        animation: `floatIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both`,
        '@keyframes floatIn': {
          '0%': {
            opacity: 0,
            transform: 'translateY(40px) scale(0.9)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0) scale(1)',
          },
        },
        '&:hover': {
          transform: 'translateY(-16px) scale(1.02)',
          boxShadow: isDark
            ? `0 24px 64px ${alpha(color, 0.35)}, inset 0 1px 0 ${alpha('#fff', 0.1)}`
            : `0 24px 64px ${alpha(color, 0.25)}, inset 0 1px 0 ${alpha('#fff', 0.9)}`,
          border: `1px solid ${alpha(color, 0.3)}`,
          '& .floating-orb': {
            transform: 'scale(1.3) rotate(180deg)',
            opacity: 0.25,
          },
          '& .icon-wrapper': {
            transform: 'rotate(-10deg) scale(1.15)',
            boxShadow: `0 12px 32px ${alpha(color, 0.5)}`,
          },
          '& .stat-number': {
            transform: 'scale(1.05)',
          },
        },
      }}
    >
      {/* Orbe flotante de fondo */}
      <Box
        className="floating-orb"
        sx={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 240,
          height: 240,
          background: gradient,
          borderRadius: '50%',
          opacity: 0.12,
          filter: 'blur(60px)',
          transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: 'none',
        }}
      />

      {/* Brillo superior glassmorphism */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: `linear-gradient(180deg, ${alpha('#fff', 0.15)} 0%, transparent 100%)`,
          borderRadius: '28px 28px 0 0',
          pointerEvents: 'none',
        }}
      />

      <CardContent sx={{ p: 3.5, position: 'relative', zIndex: 1 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 700,
                  letterSpacing: 1.8,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  mb: 1.5,
                  display: 'block',
                  opacity: 0.8,
                }}
              >
                {titulo}
              </Typography>
              <Typography
                className="stat-number"
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: '3rem',
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  background: gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  transition: 'transform 0.3s ease',
                  mb: 0.5,
                }}
              >
                {valor.toLocaleString()}
              </Typography>
              {/* Cambio porcentual */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    background: isTrendingUp
                      ? alpha('#10b981', 0.15)
                      : alpha('#f59e0b', 0.15),
                  }}
                >
                  {isTrendingUp ? (
                    <TrendingUpIcon sx={{ fontSize: 16, color: '#10b981' }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      color: isTrendingUp ? '#10b981' : '#f59e0b',
                    }}
                  >
                    {Math.abs(cambio)}%
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  vs mes anterior
                </Typography>
              </Box>
            </Box>

            {/* Icono */}
            <Box
              className="icon-wrapper"
              sx={{
                width: 80,
                height: 80,
                borderRadius: '24px',
                background: gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 24px ${alpha(color, 0.35)}`,
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '24px',
                  padding: '2px',
                  background: `linear-gradient(135deg, ${alpha('#fff', 0.5)}, transparent)`,
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                },
              }}
            >
              <Icon sx={{ fontSize: 36, color: '#fff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
            </Box>
          </Box>

          {/* Progreso y estadísticas */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem' }}>
                Activos
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  color: color,
                  fontSize: '0.95rem',
                }}
              >
                {activos.toLocaleString()} ({porcentajeActivos}%)
              </Typography>
            </Box>

            {/* Barra de progreso mejorada */}
            <Box sx={{ position: 'relative' }}>
              <LinearProgress
                variant="determinate"
                value={porcentajeActivos}
                sx={{
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: isDark ? alpha(color, 0.12) : alpha(color, 0.1),
                  overflow: 'hidden',
                  '& .MuiLinearProgress-bar': {
                    background: gradient,
                    borderRadius: 2,
                    transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 0 12px ${alpha(color, 0.5)}`,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '50%',
                      background: `linear-gradient(180deg, ${alpha('#fff', 0.4)} 0%, transparent 100%)`,
                    },
                  },
                }}
              />
              {/* Punto indicador */}
              <Box
                sx={{
                  position: 'absolute',
                  right: `${100 - porcentajeActivos}%`,
                  top: '50%',
                  transform: 'translate(50%, -50%)',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#fff',
                  boxShadow: `0 0 0 4px ${alpha(color, 0.3)}, 0 4px 12px ${alpha(color, 0.5)}`,
                  transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </Box>
          </Box>

          {/* Footer con detalle */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pt: 2,
              mt: 1,
              borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>
              Inactivos: {(valor - activos).toLocaleString()}
            </Typography>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                background: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.06),
                },
              }}
            >
              <MoreVertIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};