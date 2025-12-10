'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  alpha,
  useTheme,
  Slide,
  Zoom,
  Fade,
  keyframes,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Inbox as InboxIcon,
} from '@mui/icons-material';
import usuariosService, { Usuario } from '../../services/usuariosService';

interface Actividad {
  id: number;
  accion: string;
  modulo: string;
  resultado: string;
  mensaje: string;
  created_at: string;
  ip_address: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  usuario: Usuario | null;
}

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

export default function UsuarioActividadDialog({ open, onClose, usuario }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(false);
  const [actividades, setActividades] = useState<Actividad[]>([]);

  useEffect(() => {
    if (open && usuario) {
      cargarActividad();
    }
  }, [open, usuario]);

  const cargarActividad = async () => {
    if (!usuario) return;

    setLoading(true);
    try {
      const response = await usuariosService.obtenerActividad(usuario.id, 50);
      setActividades(response.data.actividad);
    } catch (err) {
      console.error('Error al cargar actividad:', err);
    } finally {
      setLoading(false);
    }
  };

  const getResultadoConfig = (resultado: string) => {
    switch (resultado) {
      case 'exitoso':
        return {
          color: 'success' as const,
          icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
          bgColor: alpha(theme.palette.success.main, 0.12),
          borderColor: theme.palette.success.main,
          label: 'Exitoso',
        };
      case 'fallido':
        return {
          color: 'error' as const,
          icon: <ErrorIcon sx={{ fontSize: 20 }} />,
          bgColor: alpha(theme.palette.error.main, 0.12),
          borderColor: theme.palette.error.main,
          label: 'Fallido',
        };
      default:
        return {
          color: 'default' as const,
          icon: <InfoIcon sx={{ fontSize: 20 }} />,
          bgColor: alpha(theme.palette.grey[500], 0.08),
          borderColor: theme.palette.grey[500],
          label: 'Info',
        };
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    const esHoy = date.toDateString() === hoy.toDateString();
    const esAyer = date.toDateString() === ayer.toDateString();

    const hora = date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    if (esHoy) return `Hoy a las ${hora}`;
    if (esAyer) return `Ayer a las ${hora}`;
    
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' } as any}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 100px rgba(156, 39, 176, 0.1)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        },
      }}
    >
      {/* Header Ultra Moderno */}
      <DialogTitle
        sx={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          pt: 2.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.dark, 0.08)} 100%)`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
            animation: `${shimmer} 2s infinite`,
            backgroundSize: '1000px 100%',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Zoom in={open} style={{ transitionDelay: '100ms' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                animation: `${float} 3s ease-in-out infinite`,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: -2,
                  borderRadius: 2.5,
                  padding: '2px',
                  background: `linear-gradient(135deg, ${alpha('#fff', 0.4)}, transparent)`,
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                },
              }}
            >
              <HistoryIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
          </Zoom>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Historial de Actividad
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {usuario?.username} • {actividades.length} registros
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose} 
          size="small"
          sx={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'rotate(90deg) scale(1.1)',
              bgcolor: alpha(theme.palette.error.main, 0.15),
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 0, py: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
            <CircularProgress 
              size={64} 
              thickness={4}
              sx={{
                color: theme.palette.primary.main,
                animation: `${pulse} 1.5s ease-in-out infinite`,
              }}
            />
            <Typography color="text.secondary" sx={{ mt: 3, fontWeight: 600 }}>
              Cargando actividad...
            </Typography>
          </Box>
        ) : actividades.length === 0 ? (
          <Fade in timeout={600}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 10,
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.dark, 0.08)})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  animation: `${float} 3s ease-in-out infinite`,
                  border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <InboxIcon sx={{ fontSize: 56, color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="h6" fontWeight={700} color="text.secondary" gutterBottom>
                No hay actividad registrada
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 300 }}>
                Las acciones del usuario aparecerán aquí cuando realice actividades en el sistema
              </Typography>
            </Box>
          </Fade>
        ) : (
          <Box sx={{ position: 'relative', px: 3 }}>
            {/* Timeline Line */}
            <Box
              sx={{
                position: 'absolute',
                left: 48,
                top: 0,
                bottom: 0,
                width: '3px',
                background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.6)}, ${alpha(theme.palette.primary.main, 0.2)}, transparent)`,
                borderRadius: '3px',
              }}
            />

            <List sx={{ position: 'relative' }}>
              {actividades.map((actividad, index) => {
                const config = getResultadoConfig(actividad.resultado);
                return (
                  <Zoom 
                    in 
                    key={actividad.id}
                    style={{ 
                      transitionDelay: `${index * 50}ms`,
                    }}
                  >
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        mb: 2.5,
                        pl: 0,
                        animation: `${slideIn} 0.4s ease-out`,
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'backwards',
                      }}
                    >
                      {/* Timeline Dot */}
                      <Box
                        sx={{
                          position: 'relative',
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${config.borderColor}, ${alpha(config.borderColor, 0.7)})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          flexShrink: 0,
                          boxShadow: `0 4px 16px ${alpha(config.borderColor, 0.4)}`,
                          border: `3px solid ${theme.palette.background.paper}`,
                          zIndex: 1,
                          transition: 'all 0.3s',
                          '&:hover': {
                            transform: 'scale(1.15)',
                            boxShadow: `0 8px 24px ${alpha(config.borderColor, 0.6)}`,
                          },
                        }}
                      >
                        {config.icon}
                      </Box>

                      {/* Content Card */}
                      <Box
                        sx={{
                          flex: 1,
                          backgroundColor: config.bgColor,
                          borderRadius: 3,
                          p: 2.5,
                          border: `2px solid ${alpha(config.borderColor, 0.3)}`,
                          borderLeft: `4px solid ${config.borderColor}`,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateX(8px) translateY(-4px)',
                            boxShadow: `0 12px 32px ${alpha(config.borderColor, 0.25)}`,
                            borderColor: config.borderColor,
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: `linear-gradient(90deg, ${config.borderColor}, transparent)`,
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 1.5,
                                flexWrap: 'wrap',
                                gap: 1,
                              }}
                            >
                              <Typography 
                                variant="h6" 
                                fontWeight={800}
                                sx={{
                                  background: `linear-gradient(135deg, ${config.borderColor}, ${alpha(config.borderColor, 0.7)})`,
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                }}
                              >
                                {actividad.accion}
                              </Typography>
                              <Chip
                                label={config.label}
                                size="small"
                                color={config.color}
                                sx={{
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  fontSize: '0.7rem',
                                  letterSpacing: '0.5px',
                                  boxShadow: `0 2px 8px ${alpha(config.borderColor, 0.3)}`,
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography
                                variant="body2"
                                color="text.primary"
                                sx={{ mb: 2, lineHeight: 1.7, fontWeight: 500 }}
                              >
                                {actividad.mensaje}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: 2,
                                  pt: 2,
                                  borderTop: `1px solid ${alpha(config.borderColor, 0.2)}`,
                                }}
                              >
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 0.75,
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                  }}
                                >
                                  <ComputerIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                                  <Typography variant="caption" fontWeight={600}>
                                    {actividad.modulo}
                                  </Typography>
                                </Box>
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 0.75,
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.info.main, 0.08),
                                  }}
                                >
                                  <LocationOnIcon sx={{ fontSize: 16, color: theme.palette.info.main }} />
                                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                                    {actividad.ip_address}
                                  </Typography>
                                </Box>
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 0.75,
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.warning.main, 0.08),
                                  }}
                                >
                                  <ScheduleIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />
                                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                                    {formatearFecha(actividad.created_at)}
                                  </Typography>
                                </Box>
                              </Box>
                            </>
                          }
                        />
                      </Box>
                    </ListItem>
                  </Zoom>
                );
              })}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          size="large"
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 3,
            px: 4,
            py: 1.5,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
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
              boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.6)}`,
              '&::before': {
                left: '100%',
              },
            },
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}