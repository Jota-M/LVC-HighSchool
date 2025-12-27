// components/cursosVacacionales/InscripcionesRecientes.tsx
'use client';
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  Skeleton,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PersonAdd,
  CheckCircle,
  HourglassEmpty,
  School,
  Visibility,
  Circle,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import cursoVacacionalService from '@/services/cursoVacacionalService';
import { InscripcionVacacional, EstadoInscripcionVacacional } from '@/types/cursoVacacionalTypes';
import { useRouter } from 'next/navigation';

import { es } from 'date-fns/locale';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

interface InscripcionesRecientesProps {
  periodoId: number;
}

export const InscripcionesRecientes: React.FC<InscripcionesRecientesProps> = ({ periodoId }) => {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';

  // Query para obtener inscripciones recientes
  const { data: inscripciones, isLoading } = useQuery<InscripcionVacacional[]>({
    queryKey: ['inscripciones-recientes', periodoId],
    queryFn: async () => {
      const response = await cursoVacacionalService.inscripciones.listar({
        periodo_vacacional_id: periodoId,
        limit: 10,
        page: 1,
      });
      return response.inscripciones.slice(0, 8);
    },
    enabled: !!periodoId,
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });

  const getEstadoConfig = (estado: EstadoInscripcionVacacional) => {
    const configs = {
      pendiente: {
        color: '#f59e0b',
        label: 'Pendiente',
        icon: <HourglassEmpty sx={{ fontSize: 18 }} />,
      },
      pago_verificado: {
        color: '#3b82f6',
        label: 'Verificado',
        icon: <CheckCircle sx={{ fontSize: 18 }} />,
      },
      activo: {
        color: '#10b981',
        label: 'Activo',
        icon: <School sx={{ fontSize: 18 }} />,
      },
      completado: {
        color: '#8b5cf6',
        label: 'Completado',
        icon: <CheckCircle sx={{ fontSize: 18 }} />,
      },
      retirado: {
        color: '#6b7280',
        label: 'Retirado',
        icon: <Circle sx={{ fontSize: 18 }} />,
      },
      rechazado: {
        color: '#ef4444',
        label: 'Rechazado',
        icon: <Circle sx={{ fontSize: 18 }} />,
      },
    };
    return configs[estado] || configs.pendiente;
  };

  const formatTiempo = (fecha: string) => {
    try {
      return formatDistanceToNow(new Date(fecha), { 
        addSuffix: true,
        locale: es 
      });
    } catch {
      return 'Hace un momento';
    }
  };

  const getInitials = (nombres: string, apellido: string) => {
    return `${nombres.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const handleVerInscripcion = (inscripcionId: number) => {
    router.push(`/dashboard/CursosVacacionales/inscripciones/${inscripcionId}`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: '20px',
        background: isDark
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: alpha('#10b981', 0.1),
              color: '#10b981',
            }}
          >
            <PersonAdd />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Inscripciones Recientes
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Últimas 8 inscripciones
            </Typography>
          </Box>
          {!isLoading && inscripciones && inscripciones.length > 0 && (
            <Chip
              label={`${inscripciones.length} nuevas`}
              size="small"
              sx={{
                bgcolor: alpha('#10b981', 0.1),
                color: '#10b981',
                fontWeight: 600,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.7 },
                },
              }}
            />
          )}
        </Box>

        {isLoading ? (
          <List sx={{ maxHeight: 500, overflow: 'auto' }}>
            {[...Array(8)].map((_, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Skeleton variant="circular" width={40} height={40} />
                </ListItemAvatar>
                <ListItemText
                  primary={<Skeleton width="60%" />}
                  secondary={<Skeleton width="40%" />}
                />
              </ListItem>
            ))}
          </List>
        ) : !inscripciones || inscripciones.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
            }}
          >
            <PersonAdd sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">
              No hay inscripciones aún
            </Typography>
          </Box>
        ) : (
          <List 
            sx={{ 
              p: 0,
              maxHeight: 500,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: isDark ? alpha('#fff', 0.2) : alpha('#000', 0.2),
                borderRadius: '10px',
                '&:hover': {
                  background: isDark ? alpha('#fff', 0.3) : alpha('#000', 0.3),
                },
              },
            }}
          >
            {inscripciones.map((inscripcion) => {
              const estadoConfig = getEstadoConfig(inscripcion.estado);
              return (
                <ListItem
                  key={inscripcion.id}
                  sx={{
                    borderRadius: '12px',
                    mb: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                    },
                  }}
                  secondaryAction={
                    <Tooltip title="Ver detalles">
                      <IconButton
                        edge="end"
                        onClick={() => handleVerInscripcion(inscripcion.id)}
                        sx={{
                          color: isDark ? '#facc15' : '#0288d1',
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: alpha(estadoConfig.color, 0.1),
                        color: estadoConfig.color,
                        fontWeight: 700,
                        fontSize: '0.875rem',
                      }}
                    >
                      {getInitials(inscripcion.nombres, inscripcion.apellido_paterno)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {inscripcion.nombres} {inscripcion.apellido_paterno}
                        </Typography>
                        <Chip
                          icon={estadoConfig.icon}
                          label={estadoConfig.label}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            bgcolor: alpha(estadoConfig.color, 0.1),
                            color: estadoConfig.color,
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              fontSize: 14,
                              color: estadoConfig.color,
                            },
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {inscripcion.curso_nombre || 'Curso no especificado'}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: isDark ? '#94a3b8' : '#64748b',
                            fontSize: '0.7rem',
                          }}
                        >
                          {formatTiempo(inscripcion.created_at)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};