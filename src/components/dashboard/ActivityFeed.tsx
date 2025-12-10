// components/dashboard/ActivityFeed.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  useTheme,
  alpha,
  Stack,
  IconButton,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { ActividadReciente } from '@/types/dashboardTypes';

interface ActivityFeedProps {
  actividades: ActividadReciente[];
  loading?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ actividades, loading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    return `Hace ${days} d`;
  };

  const getModuloColor = (modulo: string) => {
    const colores: Record<string, string> = {
      estudiante: '#3b82f6',
      docente: '#8b5cf6',
      usuario: '#10b981',
      matricula: '#f59e0b',
      periodo_academico: '#ec4899',
    };
    return colores[modulo] || '#6b7280';
  };

  return (
    <Card
      sx={{
        borderRadius: '24px',
        background: isDark
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            pb: 2,
            background: isDark
              ? alpha('#facc15', 0.05)
              : alpha('#0288d1', 0.05),
            borderBottom: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.01em',
                }}
              >
                Actividad Reciente
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Últimas {actividades.length} acciones del sistema
              </Typography>
            </Box>
            <IconButton size="small">
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Lista de actividades */}
        <List sx={{ p: 0, flex: 1, overflow: 'auto' }}>
          {actividades.length > 0 ? (
            actividades.map((item, index) => {
              const Icon = getIconoActividad(item.accion);
              const moduloColor = getModuloColor(item.modulo);

              return (
                <React.Fragment key={item.id}>
                  <ListItem
                    sx={{
                      px: 3,
                      py: 2,
                      transition: 'all 0.2s ease',
                      animation: `slideInRight 0.4s ease-out ${index * 0.05}s both`,
                      '@keyframes slideInRight': {
                        from: {
                          opacity: 0,
                          transform: 'translateX(-20px)',
                        },
                        to: {
                          opacity: 1,
                          transform: 'translateX(0)',
                        },
                      },
                      '&:hover': {
                        backgroundColor: isDark
                          ? alpha('#fff', 0.03)
                          : alpha('#000', 0.02),
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          background:
                            item.resultado === 'exitoso'
                              ? 'linear-gradient(135deg, #34d399 0%, #059669 100%)'
                              : 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
                          boxShadow:
                            item.resultado === 'exitoso'
                              ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                              : '0 4px 12px rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        <Icon />
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      sx={{ ml: 2 }}
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: 'text.primary',
                              flex: 1,
                            }}
                          >
                            {item.mensaje}
                          </Typography>
                          <Chip
                            size="small"
                            label={item.resultado}
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background:
                                item.resultado === 'exitoso'
                                  ? alpha('#10b981', 0.1)
                                  : alpha('#ef4444', 0.1),
                              color: item.resultado === 'exitoso' ? '#10b981' : '#ef4444',
                              border: `1px solid ${
                                item.resultado === 'exitoso'
                                  ? alpha('#10b981', 0.2)
                                  : alpha('#ef4444', 0.2)
                              }`,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                              {item.username}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>
                              {formatFecha(item.created_at)}
                            </Typography>
                          </Box>
                        </Stack>
                      }
                    />
                  </ListItem>
                  {index < actividades.length - 1 && (
                    <Divider
                      sx={{
                        mx: 3,
                        borderColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                      }}
                    />
                  )}
                </React.Fragment>
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
                py: 6,
              }}
            >
              <ErrorIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                No hay actividad reciente
              </Typography>
            </Box>
          )}
        </List>
      </CardContent>
    </Card>
  );
};