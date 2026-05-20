// components/transporte/EmptyState.tsx
'use client';
import React from 'react';
import { Box, Typography, Button, alpha, useTheme } from '@mui/material';
import {
  DirectionsBus as BusIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface EmptyStateProps {
  type: 'no-data' | 'no-results';
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const yellowColor = isDark ? '#facc15' : '#f59e0b';

  const content = {
    'no-data': {
      icon: BusIcon,
      title: '¡Comienza creando tu primera ruta!',
      description: 'No tienes rutas de transporte registradas. Crea una para empezar a gestionar el transporte escolar.',
      actionLabel: 'Crear Primera Ruta',
      actionIcon: AddIcon,
    },
    'no-results': {
      icon: SearchIcon,
      title: 'No se encontraron resultados',
      description: 'Intenta ajustar los filtros de búsqueda o el criterio de estado para encontrar las rutas que buscas.',
      actionLabel: 'Limpiar Filtros',
      actionIcon: SearchIcon,
    },
  };

  const config = content[type];
  const Icon = config.icon;
  const ActionIcon = config.actionIcon;

  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 12,
        px: 3,
      }}
    >
      {/* Icono animado */}
      <Box
        sx={{
          display: 'inline-flex',
          p: 4,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(yellowColor, 0.15)} 0%, ${alpha(yellowColor, 0.05)} 100%)`,
          border: `2px dashed ${alpha(yellowColor, 0.3)}`,
          mb: 3,
          animation: 'pulse 2s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': {
              transform: 'scale(1)',
              opacity: 1,
            },
            '50%': {
              transform: 'scale(1.05)',
              opacity: 0.8,
            },
          },
        }}
      >
        <Icon
          sx={{
            fontSize: 80,
            color: yellowColor,
            opacity: 0.6,
          }}
        />
      </Box>

      {/* Título */}
      <Typography
        variant="h4"
        fontWeight={700}
        color="text.primary"
        gutterBottom
        sx={{ mb: 2 }}
      >
        {config.title}
      </Typography>

      {/* Descripción */}
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          maxWidth: 500,
          mx: 'auto',
          mb: 4,
          lineHeight: 1.7,
        }}
      >
        {config.description}
      </Typography>

      {/* Acción */}
      {onAction && (
        <Button
          variant="contained"
          size="large"
          startIcon={<ActionIcon />}
          onClick={onAction}
          sx={{
            background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
            color: '#000',
            fontWeight: 700,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: `0 4px 12px ${alpha(yellowColor, 0.3)}`,
            '&:hover': {
              background: `linear-gradient(135deg, #d97706 0%, #b45309 100%)`,
              transform: 'translateY(-2px)',
              boxShadow: `0 6px 16px ${alpha(yellowColor, 0.4)}`,
            },
            transition: 'all 0.2s',
          }}
        >
          {config.actionLabel}
        </Button>
      )}

      {/* Decoración adicional */}
      <Box
        sx={{
          mt: 6,
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          opacity: 0.3,
        }}
      >
        {[...Array(3)].map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: yellowColor,
              animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
              '@keyframes bounce': {
                '0%, 80%, 100%': {
                  transform: 'scale(0)',
                },
                '40%': {
                  transform: 'scale(1)',
                },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default EmptyState;