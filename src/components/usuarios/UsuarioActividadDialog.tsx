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
  Divider,
  IconButton,
  alpha,
  useTheme,
  Slide,
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
          icon: <CheckCircleIcon sx={{ fontSize: 18 }} />,
          bgColor: alpha(theme.palette.success.main, 0.08),
          borderColor: theme.palette.success.main,
        };
      case 'fallido':
        return {
          color: 'error' as const,
          icon: <ErrorIcon sx={{ fontSize: 18 }} />,
          bgColor: alpha(theme.palette.error.main, 0.08),
          borderColor: theme.palette.error.main,
        };
      default:
        return {
          color: 'default' as const,
          icon: <InfoIcon sx={{ fontSize: 18 }} />,
          bgColor: alpha(theme.palette.grey[500], 0.05),
          borderColor: theme.palette.grey[500],
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
          borderRadius: 3,
          backgroundImage: isDark
            ? 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
            : 'none',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonIcon sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Historial de Actividad
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {usuario?.username}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <CircularProgress size={48} thickness={4} />
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Cargando actividad...
            </Typography>
          </Box>
        ) : actividades.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 8,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <InfoIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay actividad registrada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Las acciones del usuario aparecerán aquí
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 500, overflow: 'auto', px: 1 }}>
            {actividades.map((actividad, index) => {
              const config = getResultadoConfig(actividad.resultado);
              return (
                <Box key={actividad.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      backgroundColor: config.bgColor,
                      borderRadius: 2,
                      mb: 1.5,
                      border: `1px solid ${alpha(config.borderColor, 0.2)}`,
                      borderLeft: `4px solid ${config.borderColor}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateX(4px)',
                        boxShadow: `0 4px 12px ${alpha(config.borderColor, 0.15)}`,
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
                            mb: 1,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {config.icon}
                            <Typography variant="subtitle1" fontWeight={700}>
                              {actividad.accion}
                            </Typography>
                          </Box>
                          <Chip
                            label={actividad.resultado}
                            size="small"
                            color={config.color}
                            sx={{
                              fontWeight: 600,
                              textTransform: 'capitalize',
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1.5, lineHeight: 1.6 }}
                          >
                            {actividad.mensaje}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 2,
                              pt: 1.5,
                              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ComputerIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" fontWeight={500}>
                                {actividad.modulo}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {actividad.ip_address}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ScheduleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {formatearFecha(actividad.created_at)}
                              </Typography>
                            </Box>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                  {index < actividades.length - 1 && (
                    <Divider sx={{ my: 0.5, opacity: 0.3 }} />
                  )}
                </Box>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            px: 3,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}