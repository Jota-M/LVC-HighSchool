'use client';
import React from 'react';
import { Box, Typography, Button, alpha, useTheme } from '@mui/material';
import {
  School as SchoolIcon,
  MenuBook as BookIcon,
  Add as AddIcon,
  TouchApp as TouchIcon
} from '@mui/icons-material';

interface EmptyStateProps {
  type: 'no-grado' | 'no-materias';
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  const theme = useTheme();

  const configs = {
    'no-grado': {
      icon: SchoolIcon,
      title: 'Selecciona un grado',
      description: 'Elige un grado del panel izquierdo para ver y gestionar su plan de estudios',
      actionText: null,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
    },
    'no-materias': {
      icon: BookIcon,
      title: 'Sin materias asignadas',
      description: 'Este grado aún no tiene materias en su plan de estudios. ¡Comienza agregando algunas!',
      actionText: 'Asignar primera materia',
      gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.info.main})`
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: alpha(theme.palette.primary.main, 0.03),
          filter: 'blur(40px)',
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0) scale(1)' },
            '50%': { transform: 'translateY(-20px) scale(1.1)' }
          }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '15%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: alpha(theme.palette.secondary.main, 0.03),
          filter: 'blur(30px)',
          animation: 'float 8s ease-in-out infinite reverse'
        }}
      />

      {/* Icon container with animation */}
      <Box
        sx={{
          position: 'relative',
          mb: 3,
          animation: 'bounce 2s ease-in-out infinite',
          '@keyframes bounce': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' }
          }
        }}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: 4,
            background: config.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: -3,
              borderRadius: 5,
              background: config.gradient,
              opacity: 0.3,
              filter: 'blur(10px)'
            }
          }}
        >
          <Icon sx={{ fontSize: 56, color: 'white' }} />
        </Box>

        {/* Floating indicator */}
        {type === 'no-grado' && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -10,
              right: -10,
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' }
              }
            }}
          >
            <TouchIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          </Box>
        )}
      </Box>

      {/* Text content */}
      <Typography
        variant="h5"
        fontWeight="700"
        sx={{
          mb: 1,
          background: config.gradient,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        {config.title}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          maxWidth: 350,
          mb: 3,
          lineHeight: 1.6
        }}
      >
        {config.description}
      </Typography>

      {/* Action button */}
      {config.actionText && onAction && (
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={onAction}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            background: config.gradient,
            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`
            }
          }}
        >
          {config.actionText}
        </Button>
      )}

      {/* Helper dots decoration */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mt: 4,
          opacity: 0.5
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'text.disabled',
              animation: `dot 1.4s ease-in-out ${i * 0.2}s infinite`,
              '@keyframes dot': {
                '0%, 80%, 100%': { transform: 'scale(1)', opacity: 0.4 },
                '40%': { transform: 'scale(1.2)', opacity: 1 }
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default EmptyState;