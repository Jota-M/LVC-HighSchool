// components/dashboard/ModernActivityFeed.tsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  List,
  ListItem,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Stack,
  IconButton,
  ButtonGroup,
  Button,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ActividadReciente } from '@/types/dashboardTypes';

interface ModernActivityFeedProps {
  actividades: ActividadReciente[];
  loading?: boolean;
}

export const ModernActivityFeed: React.FC<ModernActivityFeedProps> = ({ actividades, loading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [filter, setFilter] = useState<'all' | 'exitoso' | 'fallido'>('all');

  const getIconoActividad = (accion: string) => {
    const iconos: Record<string, any> = {
      crear: PersonAddIcon,
      actualizar: EditIcon,
      eliminar: DeleteIcon,
      login: CheckCircleIcon,
    };
    for (const [key, Icon] of Object.entries(iconos)) {
      if (accion.toLowerCase().includes(key)) return Icon;
    }
    return VisibilityIcon;
  };

  const formatFecha = (fecha: string) => {
    const diff = Date.now() - new Date(fecha).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Justo ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const actividadesFiltradas =
    filter === 'all' ? actividades : actividades.filter((a) => a.resultado === filter);

  return (
    <Card
      sx={{
        borderRadius: '28px',
        background: isDark
          ? `linear-gradient(135deg, ${alpha('#1e293b', 0.4)} 0%, ${alpha('#0f172a', 0.7)} 100%)`
          : `linear-gradient(135deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha('#f8fafc', 0.9)} 100%)`,
        backdropFilter: 'blur(40px) saturate(180%)',
        border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
        boxShadow: isDark
          ? `0 8px 32px ${alpha('#000', 0.3)}, inset 0 1px 0 ${alpha('#fff', 0.05)}`
          : `0 8px 32px ${alpha('#000', 0.08)}, inset 0 1px 0 ${alpha('#fff', 0.8)}`,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header Premium */}
        <Box
          sx={{
            p: 3,
            background: isDark
              ? `linear-gradient(135deg, ${alpha('#facc15', 0.08)} 0%, ${alpha('#f59e0b', 0.04)} 100%)`
              : `linear-gradient(135deg, ${alpha('#0288d1', 0.08)} 0%, ${alpha('#01579b', 0.04)} 100%)`,
            borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                }}
              >
                Actividad en Tiempo Real
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {actividadesFiltradas.length} eventos registrados
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                sx={{
                  background: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                  '&:hover': { background: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.06) },
                }}
              >
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  background: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                  '&:hover': { background: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.06) },
                }}
              >
                <FilterIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>
          </Box>

          {/* Filtros */}
          <ButtonGroup size="small" fullWidth>
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'contained' : 'outlined'}
              sx={{
                borderRadius: '12px 0 0 12px',
                textTransform: 'none',
                fontWeight: 700,
                ...(filter === 'all' && {
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                }),
              }}
            >
              Todos
            </Button>
            <Button
              onClick={() => setFilter('exitoso')}
              variant={filter === 'exitoso' ? 'contained' : 'outlined'}
              sx={{
                borderRadius: 0,
                textTransform: 'none',
                fontWeight: 700,
                ...(filter === 'exitoso' && {
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                }),
              }}
            >
              Exitosos
            </Button>
            <Button
              onClick={() => setFilter('fallido')}
              variant={filter === 'fallido' ? 'contained' : 'outlined'}
              sx={{
                borderRadius: '0 12px 12px 0',
                textTransform: 'none',
                fontWeight: 700,
                ...(filter === 'fallido' && {
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                }),
              }}
            >
              Fallidos
            </Button>
          </ButtonGroup>
        </Box>

        {/* Lista de actividades */}
        <List sx={{ p: 0, flex: 1, overflow: 'auto' }}>
          {actividadesFiltradas.length > 0 ? (
            actividadesFiltradas.map((item, index) => {
              const Icon = getIconoActividad(item.accion);

              return (
                <ListItem
                  key={item.id}
                  sx={{
                    px: 3,
                    py: 2.5,
                    borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    animation: `slideInRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.08}s both`,
                    '@keyframes slideInRight': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateX(-30px)',
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateX(0)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.02),
                      transform: 'translateX(8px)',
                      '& .activity-avatar': {
                        transform: 'scale(1.15) rotate(10deg)',
                        boxShadow:
                          item.resultado === 'exitoso'
                            ? '0 8px 24px rgba(16, 185, 129, 0.5)'
                            : '0 8px 24px rgba(239, 68, 68, 0.5)',
                      },
                      '& .activity-time': {
                        transform: 'scale(1.1)',
                      },
                    },
                  }}
                >
                  {/* Avatar con efecto */}
                  <Avatar
                    className="activity-avatar"
                    sx={{
                      width: 52,
                      height: 52,
                      mr: 2,
                      background:
                        item.resultado === 'exitoso'
                          ? 'linear-gradient(135deg, #34d399 0%, #059669 100%)'
                          : 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
                      boxShadow:
                        item.resultado === 'exitoso'
                          ? '0 4px 16px rgba(16, 185, 129, 0.35)'
                          : '0 4px 16px rgba(239, 68, 68, 0.35)',
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -2,
                        borderRadius: '50%',
                        background:
                          item.resultado === 'exitoso'
                            ? 'linear-gradient(135deg, #34d399, #059669)'
                            : 'linear-gradient(135deg, #f87171, #dc2626)',
                        opacity: 0.3,
                        filter: 'blur(8px)',
                      },
                    }}
                  >
                    <Icon sx={{ fontSize: 24, color: '#fff' }} />
                  </Avatar>

                  {/* Contenido */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.mensaje}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip
                        label={item.modulo}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                          textTransform: 'capitalize',
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {item.username}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Tiempo */}
                  <Box
                    className="activity-time"
                    sx={{
                      ml: 2,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      background: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                      }}
                    >
                      {formatFecha(item.created_at)}
                    </Typography>
                  </Box>
                </ListItem>
              );
            })
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                py: 8,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: isDark
                    ? `linear-gradient(135deg, ${alpha('#facc15', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`
                    : `linear-gradient(135deg, ${alpha('#0288d1', 0.1)} 0%, ${alpha('#01579b', 0.05)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                No hay actividad reciente
              </Typography>
            </Box>
          )}
        </List>
      </CardContent>
    </Card>
  );
};