// src/components/reservaCupo/admin/common.tsx
import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  CircularProgress,
  useTheme,
  alpha,
  keyframes,
} from '@mui/material';

export const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

export const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  return { theme, isDark, gold, goldEnd, gradBg };
};

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.8,
        borderRadius: '18px',
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: `0 10px 22px ${alpha(color, 0.22)}`,
          borderColor: color,
        },
      }}
    >
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
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Typography>
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            mb: 0.5,
          }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export const BtnDescarga: React.FC<{
  label: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  loading: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ label, icon, color, gradient, loading, onClick, disabled }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Button
      size="medium"
      onClick={onClick}
      disabled={loading || disabled}
      startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : icon}
      sx={{
        background: gradient,
        color: '#fff',
        fontWeight: 800,
        textTransform: 'none',
        borderRadius: '12px',
        px: 3,
        py: 1.1,
        boxShadow: `0 4px 14px ${alpha(color, 0.35)}`,
        transition: 'all 0.2s',
        '&:hover': {
          background: gradient,
          filter: 'brightness(1.08)',
          transform: 'translateY(-2px)',
        },
        '&:disabled': {
          background: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
          color: 'text.disabled',
          boxShadow: 'none',
        },
      }}
    >
      {loading ? 'Generando...' : label}
    </Button>
  );
};

export const getNivelColor = (nivel?: string) => {
  const n = (nivel || '').toLowerCase();
  if (n.includes('inicial')) return '#ec4899';
  if (n.includes('primaria')) return '#10b981';
  if (n.includes('secundaria')) return '#6366f1';
  return '#0288d1';
};

export const getInitials = (nombres?: string, paterno?: string) => {
  const n = nombres ? nombres.trim()[0] : '';
  const p = paterno ? paterno.trim()[0] : '';
  return `${n}${p}`.toUpperCase() || 'E';
};

import {
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelIcon,
  WarningAmber as WarningAmberIcon,
  Close as CloseIcon,
  BookmarkAdded as BookmarkAddedIcon,
} from '@mui/icons-material';

export const getEstadoBadgeConfig = (estado: string) => {
  switch (estado) {
    case 'confirmada':
      return {
        label: 'Confirmada',
        color: '#10b981',
        bg: alpha('#10b981', 0.15),
        icon: <CheckCircleIcon sx={{ fontSize: 13, color: '#10b981 !important' }} />,
      };
    case 'no_continua':
      return {
        label: 'No Continuará',
        color: '#ef4444',
        bg: alpha('#ef4444', 0.15),
        icon: <CancelIcon sx={{ fontSize: 13, color: '#ef4444 !important' }} />,
      };
    case 'solicitud_anulacion':
      return {
        label: 'Solicitud Anulación',
        color: '#f59e0b',
        bg: alpha('#f59e0b', 0.18),
        icon: <WarningAmberIcon sx={{ fontSize: 13, color: '#f59e0b !important' }} />,
      };
    case 'anulada':
    case 'cancelada':
      return {
        label: 'Anulada / Cancelada',
        color: '#64748b',
        bg: alpha('#64748b', 0.18),
        icon: <CloseIcon sx={{ fontSize: 13, color: '#64748b !important' }} />,
      };
    default:
      return {
        label: estado || 'Registrado',
        color: '#3b82f6',
        bg: alpha('#3b82f6', 0.15),
        icon: <BookmarkAddedIcon sx={{ fontSize: 13, color: '#3b82f6 !important' }} />,
      };
  }
};
