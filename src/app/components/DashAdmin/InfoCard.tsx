'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '@/app/dashboard/theme';
import { keyframes } from '@mui/system';

interface InfoCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  subtitle?: string;
}

// Animaciones personalizadas
const fadeInScale = keyframes`
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
`;

const countUp = keyframes`
  0% { opacity: 0; transform: translateY(20px) scale(0.8); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px currentColor; }
  50% { box-shadow: 0 0 40px currentColor; }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  subtitle,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === 'dark';
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const colorMap: Record<string, { main: string; light: string; gradient: string }> = {
    primary: {
      main: colors.blueAccent[500],
      light: colors.blueAccent[400],
      gradient: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.blueAccent[400]})`,
    },
    secondary: {
      main: colors.grey[500],
      light: colors.grey[400],
      gradient: `linear-gradient(135deg, ${colors.grey[600]}, ${colors.grey[400]})`,
    },
    success: {
      main: colors.greenAccent[500],
      light: colors.greenAccent[400],
      gradient: `linear-gradient(135deg, ${colors.greenAccent[600]}, ${colors.greenAccent[400]})`,
    },
    warning: {
      main: '#facc15',
      light: '#fde047',
      gradient: 'linear-gradient(135deg, #facc15, #fde047)',
    },
    info: {
      main: colors.blueAccent[400],
      light: colors.blueAccent[300],
      gradient: `linear-gradient(135deg, ${colors.blueAccent[500]}, ${colors.blueAccent[300]})`,
    },
    error: {
      main: colors.redAccent[500],
      light: colors.redAccent[400],
      gradient: `linear-gradient(135deg, ${colors.redAccent[600]}, ${colors.redAccent[400]})`,
    },
  };

  const currentColor = colorMap[color];

  return (
    <Paper
      elevation={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        p: 3,
        borderRadius: 4,
        minWidth: 220,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
        border: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
        backdropFilter: 'blur(10px)',
        opacity: isVisible ? 1 : 0,
        animation: `${fadeInScale} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          borderColor: currentColor.main,
          boxShadow: `0 15px 40px ${currentColor.main}30`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: currentColor.gradient,
          backgroundSize: '200% 100%',
          animation: isHovered ? `${shimmer} 2s linear infinite` : 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: `linear-gradient(90deg, transparent, ${currentColor.main}15, transparent)`,
          transition: 'left 0.6s ease',
          pointerEvents: 'none',
        },
        '&:hover::after': {
          left: '100%',
        },
      }}
    >
      {/* Decoración de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${currentColor.main}15, transparent)`,
          opacity: isHovered ? 1 : 0.5,
          transition: 'all 0.5s ease',
          animation: isHovered ? `${pulse} 3s ease-in-out infinite` : 'none',
        }}
      />

      {/* Contenido textual */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          flex: 1,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: 1,
            opacity: 0.8,
          }}
        >
          {title}
        </Typography>

        <Box sx={{ position: 'relative' }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              color: currentColor.main,
              animation: `${countUp} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
              textShadow: isHovered ? `0 0 20px ${currentColor.main}40` : 'none',
              transition: 'text-shadow 0.3s ease',
            }}
          >
            {value}
          </Typography>

          {/* Línea decorativa bajo el valor */}
          <Box
            sx={{
              width: isHovered ? '100%' : '50%',
              height: 3,
              borderRadius: 2,
              background: currentColor.gradient,
              mt: 0.5,
              transition: 'width 0.4s ease',
            }}
          />
        </Box>

        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.8rem',
              fontWeight: 500,
              mt: 0.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Icono mejorado */}
      {icon && (
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ml: 2,
          }}
        >
          {/* Anillo exterior pulsante */}
          <Box
            sx={{
              position: 'absolute',
              inset: -8,
              borderRadius: '50%',
              border: `2px solid ${currentColor.main}`,
              opacity: isHovered ? 0.6 : 0,
              animation: isHovered ? `${pulse} 2s ease-in-out infinite` : 'none',
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Segundo anillo */}
          <Box
            sx={{
              position: 'absolute',
              inset: -12,
              borderRadius: '50%',
              border: `1px solid ${currentColor.main}`,
              opacity: isHovered ? 0.3 : 0,
              animation: isHovered ? `${pulse} 2s ease-in-out infinite 0.5s` : 'none',
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Contenedor del icono */}
          <Box
            sx={{
              position: 'relative',
              width: { xs: 55, md: 65 },
              height: { xs: 55, md: 65 },
              borderRadius: '50%',
              background: currentColor.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 25px ${currentColor.main}50`,
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation: isHovered ? `${float} 3s ease-in-out infinite` : 'none',
              '&:hover': {
                transform: 'rotate(360deg) scale(1.1)',
                boxShadow: `0 12px 35px ${currentColor.main}70`,
              },
            }}
          >
            {/* Brillo interno */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent)',
                opacity: isHovered ? 1 : 0.5,
                transition: 'opacity 0.3s ease',
              }}
            />

            <Box
              sx={{
                position: 'relative',
                color: '#fff',
                fontSize: { xs: '1.5rem', md: '1.8rem' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              }}
            >
              {icon}
            </Box>
          </Box>

          {/* Punto brillante */}
          <Box
            sx={{
              position: 'absolute',
              top: 5,
              right: 5,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#fff',
              opacity: isHovered ? 1 : 0,
              animation: isHovered ? `${glow} 2s ease-in-out infinite` : 'none',
              boxShadow: `0 0 10px ${currentColor.light}`,
            }}
          />
        </Box>
      )}

      {/* Badge de tendencia (opcional) */}
      {isHovered && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            background: `${currentColor.main}20`,
            border: `1px solid ${currentColor.main}40`,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            animation: `${fadeInScale} 0.3s ease forwards`,
          }}
        >
          <Box
            sx={{
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderBottom: `6px solid ${currentColor.main}`,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: currentColor.main,
              fontWeight: 'bold',
              fontSize: '0.7rem',
            }}
          >
            +12%
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default InfoCard;