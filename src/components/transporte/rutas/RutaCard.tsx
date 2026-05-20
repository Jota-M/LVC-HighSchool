// components/transporte/RutaCard.tsx
'use client';
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  LinearProgress,
  alpha,
  useTheme,
  Tooltip,
  Stack,
  Badge,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  DirectionsBus as BusIcon,
  Place as PlaceIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocalOffer as PriceIcon,
  TrendingUp as TrendingIcon,
  EventSeat as SeatIcon,
} from '@mui/icons-material';
import type { RutaTransporte } from '@/types/transporte';
import transporteService from '@/services/transporte';

interface RutaCardProps {
  ruta: RutaTransporte;
  onView: (ruta: RutaTransporte) => void;
  onEdit: (ruta: RutaTransporte) => void;
  onDelete: (ruta: RutaTransporte) => void;
}

export const RutaCard: React.FC<RutaCardProps> = ({ ruta, onView, onEdit, onDelete }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const yellowColor = isDark ? '#facc15' : '#f59e0b';

  const porcentajeOcupacion = ruta.porcentaje_ocupacion || 0;
  const getOcupacionColor = () => {
    if (porcentajeOcupacion >= 90) return '#ef4444';
    if (porcentajeOcupacion >= 70) return '#f59e0b';
    return '#10b981';
  };
  const ocupacionColor = getOcupacionColor();

  const puedeEliminar = !ruta.estudiantes_asignados || ruta.estudiantes_asignados === 0;

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        borderRadius: '24px',
        border: `1px solid ${alpha(yellowColor, 0.15)}`,
        background: isDark
          ? `linear-gradient(135deg, ${alpha(yellowColor, 0.03)} 0%, ${alpha('#000', 0.2)} 100%)`
          : `linear-gradient(135deg, ${alpha(yellowColor, 0.02)} 0%, ${alpha('#fff', 0.8)} 100%)`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-12px) scale(1.02)',
          boxShadow: `0 20px 40px ${alpha(yellowColor, 0.25)}`,
          borderColor: yellowColor,
          '& .route-actions': {
            opacity: 1,
            transform: 'translateY(0)',
          },
          '& .route-icon': {
            transform: 'rotate(5deg) scale(1.1)',
          },
        },
      }}
      onClick={() => onView(ruta)}
    >
      {/* Decoración de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(yellowColor, 0.15)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Estado badge */}
      <Chip
        label={ruta.activo ? 'Activa' : 'Inactiva'}
        size="small"
        color={ruta.activo ? 'success' : 'error'}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 2,
          fontWeight: 800,
          fontSize: '0.7rem',
          height: 28,
          backdropFilter: 'blur(10px)',
          boxShadow: `0 4px 12px ${alpha(ruta.activo ? '#10b981' : '#ef4444', 0.3)}`,
        }}
      />

      {/* Acciones rápidas */}
      <Box
        className="route-actions"
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 2,
          display: 'flex',
          gap: 0.5,
          opacity: 0,
          transform: 'translateY(-10px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip title="Ver detalles" arrow>
          <IconButton
            size="small"
            onClick={() => onView(ruta)}
            sx={{
              backgroundColor: alpha('#3b82f6', 0.9),
              color: '#fff',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: '#3b82f6',
                transform: 'scale(1.1)',
              },
            }}
          >
            <ViewIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar" arrow>
          <IconButton
            size="small"
            onClick={() => onEdit(ruta)}
            sx={{
              backgroundColor: alpha(yellowColor, 0.9),
              color: isDark ? '#000' : '#fff',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: yellowColor,
                transform: 'scale(1.1)',
              },
            }}
          >
            <EditIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={puedeEliminar ? 'Eliminar' : 'No se puede eliminar (tiene estudiantes)'} arrow>
          <span>
            <IconButton
              size="small"
              onClick={() => onDelete(ruta)}
              disabled={!puedeEliminar}
              sx={{
                backgroundColor: alpha('#ef4444', puedeEliminar ? 0.9 : 0.3),
                color: '#fff',
                backdropFilter: 'blur(10px)',
                '&:hover': puedeEliminar ? {
                  backgroundColor: '#ef4444',
                  transform: 'scale(1.1)',
                } : {},
                '&.Mui-disabled': {
                  backgroundColor: alpha('#ef4444', 0.2),
                  color: alpha('#fff', 0.3),
                },
              }}
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* Header con icono y código */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
          <Box
            className="route-icon"
            sx={{
              width: 60,
              height: 60,
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${yellowColor} 0%, ${alpha(yellowColor, 0.7)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 16px ${alpha(yellowColor, 0.3)}`,
              transition: 'transform 0.3s ease',
            }}
          >
            <BusIcon sx={{ color: isDark ? '#000' : '#fff', fontSize: 32 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Chip
              label={ruta.codigo}
              size="small"
              sx={{
                backgroundColor: alpha(yellowColor, 0.15),
                color: yellowColor,
                fontWeight: 800,
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                mb: 1,
              }}
            />
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              {ruta.nombre}
            </Typography>
          </Box>
        </Box>

        {/* Descripción */}
        {ruta.descripcion && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2.5,
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {ruta.descripcion}
          </Typography>
        )}

        {/* Información de ubicación y horarios */}
        <Stack spacing={1.5} sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlaceIcon sx={{ fontSize: 18, color: yellowColor }} />
            <Typography variant="body2" fontWeight={600}>
              {ruta.zona_cobertura || 'Sin zona especificada'}
            </Typography>
          </Box>
          {(ruta.horario_ida || ruta.horario_retorno) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon sx={{ fontSize: 18, color: yellowColor }} />
              <Typography variant="caption" color="text.secondary">
                {ruta.horario_ida || '-'} → {ruta.horario_retorno || '-'}
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Ocupación destacada */}
        <Box
          sx={{
            p: 2,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${alpha(ocupacionColor, 0.1)} 0%, ${alpha(ocupacionColor, 0.05)} 100%)`,
            border: `1px solid ${alpha(ocupacionColor, 0.2)}`,
            mb: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SeatIcon sx={{ fontSize: 18, color: ocupacionColor }} />
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                OCUPACIÓN
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={900} color={ocupacionColor}>
              {Number(porcentajeOcupacion).toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={porcentajeOcupacion}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: alpha(ocupacionColor, 0.1),
              mb: 1,
              '& .MuiLinearProgress-bar': {
                backgroundColor: ocupacionColor,
                borderRadius: 5,
                boxShadow: `0 0 10px ${alpha(ocupacionColor, 0.5)}`,
              },
            }}
          />
          <Typography variant="caption" fontWeight={700}>
            {ruta.cupos_ocupados} de {ruta.capacidad_maxima} cupos ocupados
          </Typography>
        </Box>

        {/* Conductor */}
        {ruta.conductor_responsable && (
          <Box
            sx={{
              p: 2,
              borderRadius: '16px',
              backgroundColor: alpha(theme.palette.background.default, 0.5),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              mb: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <PersonIcon sx={{ fontSize: 16, color: yellowColor }} />
              <Typography variant="body2" fontWeight={700}>
                {ruta.conductor_responsable}
              </Typography>
            </Box>
            {ruta.telefono_conductor && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 3 }}>
                <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {ruta.telefono_conductor}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Precio */}
        <Box
          sx={{
            p: 2,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${alpha(yellowColor, 0.15)} 0%, ${alpha(yellowColor, 0.05)} 100%)`,
            border: `1px solid ${alpha(yellowColor, 0.2)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PriceIcon sx={{ fontSize: 18, color: yellowColor }} />
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              COSTO MENSUAL
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={900} color={yellowColor}>
            {transporteService.formatearMonto(ruta.costo_mensual)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RutaCard;