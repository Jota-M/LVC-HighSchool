'use client';
import React from 'react';
import { Box, Typography, Button, alpha, useTheme } from '@mui/material';
import {
  School as SchoolIcon,
  MenuBook as BookIcon,
  Add as AddIcon,
  TouchApp as TouchIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';

interface EmptyStateProps {
  type: 'no-grado' | 'no-materias';
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const configs = {
    'no-grado': {
      icon: SchoolIcon,
      title: 'Selecciona un grado',
      description: 'Elige un grado del panel izquierdo para ver y gestionar su plan de estudios',
      actionText: null,
      gradient: isDark
        ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
        : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
      color: isDark ? '#facc15' : '#0288d1',
    },
    'no-materias': {
      icon: BookIcon,
      title: 'Sin materias asignadas',
      description: 'Este grado aún no tiene materias en su plan de estudios. ¡Comienza agregando algunas!',
      actionText: 'Asignar primera materia',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#10b981',
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 450,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 6,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative background elements mejorados */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          left: '5%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: alpha(config.color, 0.05),
          filter: 'blur(50px)',
          animation: 'float 8s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '33%': { transform: 'translate(30px, -30px) scale(1.1)' },
            '66%': { transform: 'translate(-20px, 20px) scale(0.9)' }
          }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: alpha(config.color, 0.04),
          filter: 'blur(40px)',
          animation: 'float 10s ease-in-out infinite reverse'
        }}
      />

      {/* Icon container mejorado */}
      <Box
        sx={{
          position: 'relative',
          mb: 4,
          animation: 'bounce 3s ease-in-out infinite',
          '@keyframes bounce': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-15px)' }
          }
        }}
      >
        <Box
          sx={{
            width: 140,
            height: 140,
            borderRadius: '24px',
            background: config.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 24px 48px ${alpha(config.color, 0.3)}`,
            position: 'relative',
            transform: 'rotate(-5deg)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'rotate(0deg) scale(1.05)',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: -4,
              borderRadius: '26px',
              background: config.gradient,
              opacity: 0.3,
              filter: 'blur(12px)',
              zIndex: -1,
            }
          }}
        >
          <Icon sx={{ 
            fontSize: 64, 
            color: 'white',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
          }} />
        </Box>

        {/* Floating indicator mejorado */}
        {type === 'no-grado' && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -15,
              right: -15,
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: theme.palette.background.paper,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 20px ${alpha(theme.palette.common.black, 0.15)}`,
              border: `3px solid ${config.color}`,
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)', boxShadow: `0 8px 20px ${alpha(theme.palette.common.black, 0.15)}` },
                '50%': { transform: 'scale(1.1)', boxShadow: `0 12px 28px ${alpha(config.color, 0.4)}` }
              }
            }}
          >
            <TouchIcon sx={{ fontSize: 28, color: config.color }} />
          </Box>
        )}
      </Box>

      {/* Text content mejorado */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          mb: 2,
          background: config.gradient,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: `0 0 40px ${alpha(config.color, 0.1)}`,
        }}
      >
        {config.title}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          maxWidth: 400,
          mb: 4,
          lineHeight: 1.7,
          fontWeight: 500,
        }}
      >
        {config.description}
      </Typography>

      {/* Action button mejorado */}
      {config.actionText && onAction && (
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowIcon />}
          onClick={onAction}
          sx={{
            borderRadius: '16px',
            px: 5,
            py: 2,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            background: config.gradient,
            boxShadow: `0 12px 28px ${alpha(config.color, 0.35)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              transition: 'left 0.5s',
            },
            '&:hover': {
              transform: 'translateY(-4px) scale(1.02)',
              boxShadow: `0 16px 36px ${alpha(config.color, 0.45)}`,
              '&::before': {
                left: '100%',
              }
            },
            '&:active': {
              transform: 'translateY(-2px) scale(0.98)',
            }
          }}
        >
          {config.actionText}
        </Button>
      )}

      {/* Helper dots decoration mejorada */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          mt: 5,
          opacity: 0.4,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: config.color,
              animation: `dot 1.6s ease-in-out ${i * 0.2}s infinite`,
              '@keyframes dot': {
                '0%, 80%, 100%': { 
                  transform: 'scale(0.8)', 
                  opacity: 0.3,
                  boxShadow: 'none',
                },
                '40%': { 
                  transform: 'scale(1.3)', 
                  opacity: 1,
                  boxShadow: `0 0 20px ${alpha(config.color, 0.6)}`,
                }
              }
            }}
          />
        ))}
      </Box>

      {/* Particle effect (decorativo) */}
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: 4,
            height: 4,
            borderRadius: '50%',
            bgcolor: config.color,
            opacity: 0,
            animation: `particle${i} ${4 + i}s ease-in-out infinite`,
            [`@keyframes particle${i}`]: {
              '0%, 100%': {
                opacity: 0,
                transform: `translate(0, 0) scale(0)`,
              },
              '50%': {
                opacity: 0.6,
                transform: `translate(${Math.cos(i * 60) * 100}px, ${Math.sin(i * 60) * 100}px) scale(1)`,
              }
            }
          }}
        />
      ))}
    </Box>
  );
};

export default EmptyState;